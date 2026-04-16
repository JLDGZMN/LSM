"use client";

import { Eye, EyeOff } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface PasswordFieldProps extends Omit<React.ComponentProps<typeof Input>, "type"> {
  label: string;
  error?: string;
  hint?: string;
}

export function PasswordField({
  className,
  error,
  hint,
  id,
  label,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = React.useState(false);
  const errorId = error && id ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {hint ? (
          <span className="text-xs font-medium text-[var(--color-muted-foreground)]">
            {hint}
          </span>
        ) : null}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={cn(
            "pr-11",
            error &&
              "border-[color:var(--color-danger)] bg-rose-50/40 focus-visible:ring-[var(--color-danger)]",
            className,
          )}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 size-9 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </Button>
      </div>
      {error ? (
        <p id={errorId} className="text-xs font-medium text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
