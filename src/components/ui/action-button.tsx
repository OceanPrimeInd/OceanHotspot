"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button, ButtonProps } from "@/components/ui/button";
import { Loader2, Check, AlertCircle } from "lucide-react";

type ActionState = "idle" | "loading" | "success" | "error";

interface ActionButtonProps extends Omit<ButtonProps, "onClick" | "onError"> {
  onClick?: () => Promise<void> | void;
  loadingText?: string;
  successText?: string;
  errorText?: string;
  resetDelay?: number;
  showSuccessIcon?: boolean;
  showErrorIcon?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      className,
      children,
      onClick,
      loadingText,
      successText,
      errorText,
      resetDelay = 2000,
      showSuccessIcon = true,
      showErrorIcon = true,
      onSuccess,
      onError,
      disabled,
      ...props
    },
    ref
  ) => {
    const [state, setState] = React.useState<ActionState>("idle");

    const handleClick = async () => {
      if (state === "loading" || !onClick) return;

      setState("loading");

      try {
        await onClick();
        setState("success");
        onSuccess?.();

        // Reset to idle after delay
        setTimeout(() => setState("idle"), resetDelay);
      } catch (error) {
        setState("error");
        onError?.(error as Error);

        // Reset to idle after delay
        setTimeout(() => setState("idle"), resetDelay);
      }
    };

    const getContent = () => {
      switch (state) {
        case "loading":
          return (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {loadingText || children}
            </>
          );
        case "success":
          return (
            <>
              {showSuccessIcon && (
                <Check className="mr-2 h-4 w-4 animate-success-pop" />
              )}
              {successText || children}
            </>
          );
        case "error":
          return (
            <>
              {showErrorIcon && (
                <AlertCircle className="mr-2 h-4 w-4 animate-shake" />
              )}
              {errorText || children}
            </>
          );
        default:
          return children;
      }
    };

    const getStateStyles = () => {
      switch (state) {
        case "success":
          return "bg-green-500 hover:bg-green-600 text-white";
        case "error":
          return "bg-destructive hover:bg-destructive/90 text-destructive-foreground";
        default:
          return "";
      }
    };

    return (
      <Button
        ref={ref}
        className={cn(
          "transition-all duration-200",
          getStateStyles(),
          className
        )}
        onClick={handleClick}
        disabled={disabled || state === "loading"}
        {...props}
      >
        {getContent()}
      </Button>
    );
  }
);
ActionButton.displayName = "ActionButton";

export { ActionButton };
