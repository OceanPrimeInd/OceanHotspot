"use client";

import { useEffect, useState } from "react";
import { useGlobalKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

// Detect OS for displaying correct modifier key
const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);

function formatKey(key: string, ctrlKey?: boolean, altKey?: boolean, shiftKey?: boolean) {
  const parts: string[] = [];

  if (ctrlKey) {
    parts.push(isMac ? "⌘" : "Ctrl");
  }
  if (altKey) {
    parts.push(isMac ? "⌥" : "Alt");
  }
  if (shiftKey) {
    parts.push(isMac ? "⇧" : "Shift");
  }

  // Format special keys
  const keyDisplay = {
    Escape: "Esc",
    "/": "/",
  }[key] || key.toUpperCase();

  parts.push(keyDisplay);

  return parts;
}

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const shortcuts = useGlobalKeyboardShortcuts();

  // Listen for ? key to show shortcuts dialog
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "?" &&
        event.shiftKey &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, typeof shortcuts>
  );

  return (
    <>
      {children}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-1"
                    >
                      <span className="text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {formatKey(
                          shortcut.key,
                          shortcut.ctrlKey,
                          shortcut.altKey,
                          shortcut.shiftKey
                        ).map((k, i) => (
                          <kbd
                            key={i}
                            className="px-2 py-1 text-xs font-medium bg-muted border border-border rounded shadow-sm"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Help hint */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Press <kbd className="px-1.5 py-0.5 text-xs bg-muted border border-border rounded">?</kbd> anytime to show this dialog
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
