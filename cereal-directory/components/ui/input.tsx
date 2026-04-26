import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-strong)]/88 px-3 py-2 text-sm text-[var(--color-foreground)] shadow-[0_1px_2px_rgba(15,23,42,0.06)] transition duration-200 placeholder:text-[var(--color-muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--color-background)] disabled:bg-[color:var(--color-surface-muted)] disabled:text-[var(--color-muted-foreground)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";

export { Input };
