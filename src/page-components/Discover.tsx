// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Loader2, 
  Send, 
  Sparkles, 
  Anchor, 
  Ship, 
  Search,
  ArrowRight
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const SUPABASE_KEY = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();
const CHAT_URL = SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/ai-discovery` : "";

const STARTER_PROMPTS = [
  { icon: Ship, text: "I need equipment for my sailboat" },
  { icon: Anchor, text: "What safety gear do you recommend?" },
  { icon: Search, text: "Looking for electric outboard motors" },
];

const Discover = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractDeltaText = (payload: any): string => {
    const openAiDelta = payload?.choices?.[0]?.delta?.content;
    if (typeof openAiDelta === "string" && openAiDelta.length > 0) {
      return openAiDelta;
    }

    const geminiParts = payload?.candidates?.[0]?.content?.parts;
    if (Array.isArray(geminiParts)) {
      const text = geminiParts
        .map((part: { text?: string }) => part?.text)
        .filter(Boolean)
        .join("");
      if (text) return text;
    }

    const geminiText = payload?.candidates?.[0]?.content?.text;
    if (typeof geminiText === "string" && geminiText.length > 0) {
      return geminiText;
    }

    return "";
  };

  const streamChat = async (userMessages: Message[]) => {
    if (!CHAT_URL || !SUPABASE_KEY) {
      throw new Error("Missing Supabase environment variables. Check your .env file.");
    }

    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_KEY}`,
        apikey: SUPABASE_KEY,
      },
      body: JSON.stringify({ messages: userMessages }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.error || "Failed to connect to AI assistant");
    }

    if (!resp.body) throw new Error("No response body");

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let assistantContent = "";

    // Add initial empty assistant message
    setMessages(prev => [...prev, { role: "assistant", content: "" }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = extractDeltaText(parsed);
          if (content) {
            assistantContent += content;
            setMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = { role: "assistant", content: assistantContent };
              return updated;
            });
          }
        } catch {
          // Incomplete JSON, put it back
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      await streamChat(newMessages);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
      setMessages(prev => [
        ...prev,
        { 
          role: "assistant", 
          content: errorMessage,
        }
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <div className="animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-4">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-headline mb-2">
              AI Discovery Assistant
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Tell me about your maritime needs and I'll help you find the perfect products and services.
            </p>
          </div>

          {/* Chat Container */}
          <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
            {/* Messages Area */}
            <div ref={messagesContainerRef} className="h-[450px] overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Anchor className="h-12 w-12 text-primary/30 mb-4" />
                  <h3 className="font-semibold text-headline mb-2">
                    How can I help you today?
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                    Ask me about maritime products, equipment recommendations, or tell me about your vessel and needs.
                  </p>
                  
                  {/* Starter Prompts */}
                  <div className="flex flex-wrap gap-2 justify-center">
                    {STARTER_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(prompt.text)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-background hover:bg-muted transition-colors text-sm"
                      >
                        <prompt.icon className="h-4 w-4 text-primary" />
                        {prompt.text}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.role === "assistant" && msg.content === "" ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-4 bg-muted/30">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about products, equipment, or your needs..."
                  className="flex-1 h-12"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  variant="o42Primary"
                  size="icon"
                  className="h-12 w-12"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Browse CTA */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Want to browse all products?
            </p>
            <Button variant="outline" asChild>
              <Link href="/browse">
                Browse Catalog
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Discover;
