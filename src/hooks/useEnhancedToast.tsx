"use client";

import { useToast } from "@/hooks/use-toast";

type ToastType = "success" | "error" | "warning" | "info";

interface EnhancedToastOptions {
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

export function useEnhancedToast() {
  const { toast } = useToast();

  const showToast = ({
    title,
    description,
    type = "info",
    duration,
  }: EnhancedToastOptions) => {
    const variants: Record<ToastType, "default" | "destructive"> = {
      success: "default",
      error: "destructive",
      warning: "default",
      info: "default",
    };

    const prefixes: Record<ToastType, string> = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ",
    };

    toast({
      title: `${prefixes[type]} ${title}`,
      description,
      duration,
      variant: variants[type],
    });
  };

  return {
    success: (title: string, description?: string) =>
      showToast({ title, description, type: "success" }),
    error: (title: string, description?: string) =>
      showToast({ title, description, type: "error" }),
    warning: (title: string, description?: string) =>
      showToast({ title, description, type: "warning" }),
    info: (title: string, description?: string) =>
      showToast({ title, description, type: "info" }),
    custom: showToast,
  };
}
