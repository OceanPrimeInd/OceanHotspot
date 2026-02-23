"use client";

import { useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

interface ShortcutDefinition {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
  category: string;
}

// Global shortcuts available throughout the app
export function useGlobalKeyboardShortcuts() {
  const router = useRouter();

  const shortcuts: ShortcutDefinition[] = useMemo(() => [
    {
      key: "k",
      ctrlKey: true,
      action: () => {
        // Focus the search input if it exists
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="looking for"]'
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      },
      description: "Focus search",
      category: "Navigation",
    },
    {
      key: "/",
      action: () => {
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="looking for"]'
        );
        if (searchInput && document.activeElement?.tagName !== "INPUT") {
          searchInput.focus();
        }
      },
      description: "Quick search",
      category: "Navigation",
    },
    {
      key: "h",
      altKey: true,
      action: () => router.push("/"),
      description: "Go to home",
      category: "Navigation",
    },
    {
      key: "b",
      altKey: true,
      action: () => router.push("/browse"),
      description: "Browse products",
      category: "Navigation",
    },
    {
      key: "c",
      altKey: true,
      action: () => router.push("/cart"),
      description: "View cart",
      category: "Navigation",
    },
    {
      key: "Escape",
      action: () => {
        // Close any open modals, sheets, or dropdowns
        const closeButton = document.querySelector<HTMLButtonElement>(
          '[data-state="open"] [aria-label="Close"]'
        );
        if (closeButton) {
          closeButton.click();
        } else {
          // Blur current element
          (document.activeElement as HTMLElement)?.blur();
        }
      },
      description: "Close/Cancel",
      category: "General",
    },
  ], [router]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs (except for specific shortcuts)
      const isTyping =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        (document.activeElement as HTMLElement)?.isContentEditable;

      if (!event.key) return;

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey
          ? event.ctrlKey || event.metaKey
          : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey;

        // Special handling for shortcuts that work even when typing
        const worksDuringTyping =
          shortcut.key === "Escape" ||
          (shortcut.ctrlKey && shortcut.key === "k");

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          if (!isTyping || worksDuringTyping) {
            event.preventDefault();
            shortcut.action();
            return;
          }
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

// Hook for custom keyboard shortcuts
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    altKey?: boolean;
    enabled?: boolean;
  } = {}
) {
  const { ctrlKey, metaKey, shiftKey, altKey, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const isTyping =
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA";

      if (isTyping && key !== "Escape") return;
      if (!event.key) return;

      const keyMatch = event.key.toLowerCase() === key.toLowerCase();
      const ctrlMatch = ctrlKey ? event.ctrlKey : metaKey ? event.metaKey : true;
      const shiftMatch = shiftKey ? event.shiftKey : !event.shiftKey;
      const altMatch = altKey ? event.altKey : !event.altKey;

      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, ctrlKey, metaKey, shiftKey, altKey, enabled]);
}
