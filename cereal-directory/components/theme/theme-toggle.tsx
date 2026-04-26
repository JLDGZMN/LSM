"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

function getThemeFromDocument(): Theme {
  if (typeof document === "undefined") {
    return "light";
  }

  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = React.useState<Theme>("light");

  React.useEffect(() => {
    setTheme(getThemeFromDocument());
  }, []);

  const toggleTheme = React.useCallback(() => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("library-theme", nextTheme);
    setTheme(nextTheme);
  }, [theme]);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        "h-10 w-10 rounded-full bg-[color:var(--color-surface)]/88 shadow-sm",
        className,
      )}
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {theme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
    </Button>
  );
}
