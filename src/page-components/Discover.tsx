// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { getPlaceholderSvg } from "@/lib/productPlaceholders";
import {
  Loader2,
  Send,
  Sparkles,
  ArrowRight,
  Package,
} from "lucide-react";

type DiscoveryProduct = {
  id: string;
  title: string;
  price: number;
  currency: string;
  image_url: string | null;
  description: string | null;
  domain_category: string | null;
};

type UserMessage = { role: "user"; content: string };
type AssistantMessage = {
  role: "assistant";
  content: string;
  products?: DiscoveryProduct[];
};
type Message = UserMessage | AssistantMessage;

/** Same-origin route — live catalog search only (no LLM product invention). */
const CHAT_URL = "/api/discovery";

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

  const askDiscovery = async (userMessages: Message[]) => {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: userMessages }),
    });

    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
      throw new Error(data.error || "Failed to connect to AI assistant");
    }

    return {
      reply: data.reply as string,
      products: (data.products || []) as DiscoveryProduct[],
    };
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: UserMessage = { role: "user", content: messageText };
    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const { reply, products } = await askDiscovery(newMessages);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: reply,
          products,
        };
        return updated;
      });
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "I'm having trouble connecting right now. Please try again in a moment.";
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: errorMessage,
          products: [],
        };
        return updated;
      });
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

  const suggestedQuestions = [
    "Bilge pump for a motor yacht",
    "Chartplotter for the helm",
    "Engine service kit",
  ];

  return (
    <Layout>
      <div className="container max-w-4xl py-4">
        <div className="animate-slide-up">
          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary mb-3">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-headline mb-1">
              Find products
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
             We search live listings on Ocean Hotspot — no redirects to other websites.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
            <div
              ref={messagesContainerRef}
              className={`overflow-y-auto p-6 space-y-4 ${messages.length > 0 ? "h-[min(450px,calc(100vh-360px))]" : ""}`}
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center text-center pt-4">
                  <h3 className="font-semibold text-headline mb-2">
                    How can I help you today?
                  </h3>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {msg.role === "assistant" && msg.content === "" ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Searching live listings…</span>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      )}
                    </div>
                    {msg.role === "assistant" && msg.products && msg.products.length > 0 && (
                      <ul className="mt-3 w-full max-w-md space-y-2">
                        {msg.products.map((product) => (
                          <li key={product.id}>
                            <Link
                              href={`/product/${product.id}`}
                              className="flex gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/40 transition"
                            >
                              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                                <Image
                                  src={product.image_url || getPlaceholderSvg(product.title)}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium line-clamp-2">{product.title}</p>
                                <p className="text-sm text-primary font-semibold mt-0.5">
                                  {formatPrice(product.currency, product.price)}
                                </p>
                                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                  <Package className="h-3 w-3" />
                                  Live listing · ID {product.id.slice(0, 8)}…
                                </p>
                              </div>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border p-4 bg-muted/30 shrink-0">
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

          <div className="mt-4 space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              To order, contact Ocean Hotspot — we handle payment and supplier dispatch.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="o42Primary" asChild>
                <Link href="/contact">Contact us to buy</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/browse">
                  Browse catalogue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Discover;
