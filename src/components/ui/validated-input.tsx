// @ts-nocheck
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, AlertCircle } from "lucide-react";

export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

export interface ValidatedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  rules?: ValidationRule[];
  showValidIcon?: boolean;
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  onValidationChange?: (isValid: boolean, errors: string[]) => void;
}

// Common validation rules
export const validationRules = {
  required: (message = "This field is required"): ValidationRule => ({
    validate: (value) => value.trim().length > 0,
    message,
  }),
  email: (message = "Please enter a valid email address"): ValidationRule => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),
  minLength: (min: number, message?: string): ValidationRule => ({
    validate: (value) => value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),
  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: (value) => value.length <= max,
    message: message || `Must be no more than ${max} characters`,
  }),
  phone: (message = "Please enter a valid phone number"): ValidationRule => ({
    validate: (value) => !value || /^[\d\s\-+()]{7,}$/.test(value),
    message,
  }),
  url: (message = "Please enter a valid URL"): ValidationRule => ({
    validate: (value) => {
      if (!value) return true;
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: (value) => regex.test(value),
    message,
  }),
};

const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  (
    {
      className,
      type,
      label,
      helperText,
      rules = [],
      showValidIcon = true,
      validateOnBlur = true,
      validateOnChange = false,
      onValidationChange,
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState(
      (props.value as string) || (props.defaultValue as string) || ""
    );
    const [errors, setErrors] = React.useState<string[]>([]);
    const [touched, setTouched] = React.useState(false);
    const [isValid, setIsValid] = React.useState(false);

    const validate = React.useCallback(
      (val: string) => {
        const newErrors: string[] = [];
        let valid = true;

        for (const rule of rules) {
          if (!rule.validate(val)) {
            newErrors.push(rule.message);
            valid = false;
          }
        }

        setErrors(newErrors);
        setIsValid(valid && val.length > 0);
        onValidationChange?.(valid, newErrors);

        return valid;
      },
      [rules, onValidationChange]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      props.onChange?.(e);

      if (validateOnChange || touched) {
        validate(newValue);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      if (validateOnBlur) {
        validate(e.target.value);
      }
      props.onBlur?.(e);
    };

    const hasError = touched && errors.length > 0;
    const showSuccess = touched && isValid && showValidIcon;

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={props.id}
            className="text-sm font-medium text-foreground"
          >
            {label}
            {rules.some((r) => r.message.includes("required")) && (
              <span className="text-destructive ml-1">*</span>
            )}
          </label>
        )}
        <div className="relative">
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
              hasError &&
                "border-destructive focus-visible:ring-destructive/50 pr-10",
              showSuccess && "border-green-500 focus-visible:ring-green-500/50 pr-10",
              !hasError && !showSuccess && "border-input",
              className
            )}
            ref={ref}
            value={props.value !== undefined ? props.value : value}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
            }
            {...props}
          />
          {/* Validation icon */}
          {(hasError || showSuccess) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {hasError ? (
                <AlertCircle className="h-4 w-4 text-destructive animate-in fade-in-0 zoom-in-50" />
              ) : (
                <Check className="h-4 w-4 text-green-500 animate-in fade-in-0 zoom-in-50" />
              )}
            </div>
          )}
        </div>
        {/* Error messages */}
        {hasError && (
          <div id={`${props.id}-error`} className="space-y-1">
            {errors.map((error, index) => (
              <p
                key={index}
                className="text-sm text-destructive animate-in slide-in-from-top-1 fade-in-0"
              >
                {error}
              </p>
            ))}
          </div>
        )}
        {/* Helper text */}
        {helperText && !hasError && (
          <p id={`${props.id}-helper`} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
ValidatedInput.displayName = "ValidatedInput";

export { ValidatedInput };
