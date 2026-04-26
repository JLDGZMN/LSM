import type { ReactNode } from "react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";

export function LegalDocument({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[var(--color-canvas)] px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-5xl justify-end">
        <ThemeToggle />
      </div>
      <div className="mx-auto mt-4 max-w-5xl rounded-[32px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/92 p-8 shadow-[0_28px_80px_rgba(15,23,42,0.14)] backdrop-blur sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[color:var(--color-border)]/70 pb-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
              Library Governance
            </p>
            <h1 className="font-[family:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-5xl">
              {title}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-[var(--color-muted-foreground)]">
              {summary}
            </p>
          </div>
          <Link
            href="/sign-in"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-strong)] px-5 text-sm font-semibold text-[var(--color-foreground)] shadow-sm transition hover:bg-[var(--color-muted)]"
          >
            Back to Sign In
          </Link>
        </div>

        <div className="prose prose-neutral mt-8 max-w-none text-[var(--color-foreground)]">
          {children}
        </div>
      </div>
    </main>
  );
}
