// @ts-nocheck
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getSellerNavItems } from "@/config/sellerNavItems";
import {
  Loader2,
  MessageSquare,
  Send,
  User,
  Package,
  ChevronLeft,
} from "lucide-react";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  product_id: string | null;
}

interface Conversation {
  conversation_id: string;
  other_user_id: string;
  other_user_name: string | null;
  other_user_email: string | null;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  product_title: string | null;
}

const SellerMessages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .select(`
        conversation_id,
        sender_id,
        recipient_id,
        content,
        is_read,
        created_at,
        product_id,
        products(title)
      `)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching messages:", error);
      setLoading(false);
      return;
    }

    // Group by conversation
    const conversationMap = new Map<string, Conversation>();
    
    for (const msg of data || []) {
      const convId = msg.conversation_id;
      const otherUserId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
      
      if (!conversationMap.has(convId)) {
        conversationMap.set(convId, {
          conversation_id: convId,
          other_user_id: otherUserId,
          other_user_name: null,
          other_user_email: null,
          last_message: msg.content,
          last_message_at: msg.created_at,
          unread_count: 0,
          product_title: (msg.products as { title: string } | null)?.title || null,
        });
      }
      
      if (!msg.is_read && msg.recipient_id === user.id) {
        const conv = conversationMap.get(convId)!;
        conv.unread_count++;
      }
    }

    setConversations(Array.from(conversationMap.values()));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (profile && !profile.is_seller) {
      router.push("/seller/onboarding");
      return;
    }

    if (profile?.is_seller) {
      fetchConversations();
    }
  }, [user, profile, authLoading, router, fetchConversations]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.sender_id === user.id || newMsg.recipient_id === user.id) {
            fetchConversations();
            if (selectedConversation === newMsg.conversation_id) {
              setMessages((prev) => [...prev, newMsg]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedConversation, fetchConversations]);

  const loadConversation = async (conversationId: string) => {
    setSelectedConversation(conversationId);
    
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
      
      // Mark as read
      await supabase
        .from("messages")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("conversation_id", conversationId)
        .eq("recipient_id", user!.id);
      
      fetchConversations();
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    const conversation = conversations.find(c => c.conversation_id === selectedConversation);
    if (!conversation) return;

    setSending(true);

    const { error } = await supabase
      .from("messages")
      .insert({
        conversation_id: selectedConversation,
        sender_id: user.id,
        recipient_id: conversation.other_user_id,
        content: newMessage.trim(),
      });

    setSending(false);

    if (error) {
      toast({ title: "Error", description: "Failed to send message.", variant: "destructive" });
    } else {
      setNewMessage("");
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  if (authLoading || loading) {
    return (
      <DashboardLayout 
        sidebarItems={getSellerNavItems({ messages: totalUnread })} 
        sidebarTitle="Seller Dashboard"
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      sidebarItems={getSellerNavItems({ messages: totalUnread })} 
      sidebarTitle="Seller Dashboard"
    >
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <p className="text-base text-muted-foreground">
            Direct messages from customers
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <div className={`rounded-xl border border-border bg-card overflow-hidden ${selectedConversation ? 'hidden lg:block' : ''}`}>
            <div className="p-4 border-b border-border bg-muted/30">
              <h2 className="font-semibold text-foreground">Conversations</h2>
            </div>
            <div className="overflow-y-auto h-[calc(100%-60px)]">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-base text-muted-foreground">No messages yet</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.conversation_id}
                    onClick={() => loadConversation(conv.conversation_id)}
                    className={`w-full p-4 text-left border-b border-border hover:bg-muted/50 transition-colors ${
                      selectedConversation === conv.conversation_id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-base text-foreground truncate">
                            {conv.other_user_name || conv.other_user_email || "Customer"}
                          </p>
                          {conv.unread_count > 0 && (
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                              {conv.unread_count}
                            </span>
                          )}
                        </div>
                        {conv.product_title && (
                          <p className="text-sm text-primary flex items-center gap-1 mt-0.5">
                            <Package className="h-3 w-3" />
                            {conv.product_title}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conv.last_message}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Thread */}
          <div className={`lg:col-span-2 rounded-xl border border-border bg-card overflow-hidden flex flex-col ${!selectedConversation ? 'hidden lg:flex' : ''}`}>
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="lg:hidden p-1 hover:bg-muted rounded"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-base text-foreground">
                      {conversations.find(c => c.conversation_id === selectedConversation)?.other_user_name || "Customer"}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender_id === user!.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.sender_id === user!.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-base">{msg.content}</p>
                        <p className={`text-xs mt-1 ${
                          msg.sender_id === user!.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          {new Date(msg.created_at).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={2}
                      className="resize-none text-base"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="px-4"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-base text-muted-foreground">Select a conversation</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SellerMessages;
