import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Bell, BookOpen, ChevronLeft, TriangleAlert } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { auth } from "@/lib/auth";
import {
  getNotificationSnapshot,
  type NotificationItem,
} from "@/lib/library-data";

export const metadata: Metadata = {
  title: "Notifications | Library System Management",
  description: "Operational alerts for low stock, unavailable books, and overdue borrowings.",
};

function formatNotificationDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recent";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function notificationToneClasses(item: NotificationItem) {
  if (item.tone === "danger") {
    return "border-rose-300/70 bg-rose-50/80 text-rose-900";
  }

  if (item.tone === "warning") {
    return "border-amber-300/70 bg-amber-50/85 text-amber-900";
  }

  return "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[var(--color-foreground)]";
}

export default async function NotificationsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const notifications = await getNotificationSnapshot();

  return (
    <main className="min-h-screen bg-[var(--color-canvas)] px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 text-sm font-semibold text-[var(--color-foreground)] shadow-sm transition hover:bg-[var(--color-muted)]"
          >
            <ChevronLeft className="size-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignOutButton className="h-10 rounded-full px-5 text-sm font-semibold" />
          </div>
        </div>

        <section className="rounded-[30px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/92 p-6 shadow-[0_24px_70px_rgba(63,32,18,0.1)] sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[color:var(--color-border)]/70 pb-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
                Library Alerts
              </p>
              <h1 className="font-[family:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-5xl">
                Notifications
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--color-muted-foreground)]">
                Review inventory and circulation alerts that need librarian attention.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-[24px] border border-[color:var(--color-border)] bg-[color:var(--color-surface-strong)] px-4 py-3 shadow-sm">
              <div className="rounded-full bg-[var(--color-primary-soft)] p-2 text-[var(--color-primary)]">
                <Bell className="size-5" />
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
                  Open Alerts
                </p>
                <p className="font-[family:var(--font-display)] text-3xl font-semibold text-[var(--color-foreground)]">
                  {notifications.total}
                </p>
              </div>
            </div>
          </div>

          {notifications.items.length ? (
            <div className="mt-6 grid gap-4">
              {notifications.items.map((item) => (
                <article
                  key={item.id}
                  className={`rounded-[26px] border p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] ${notificationToneClasses(item)}`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 rounded-full bg-white/75 p-2 text-current shadow-sm">
                        {item.category === "inventory" ? (
                          <BookOpen className="size-4" />
                        ) : (
                          <TriangleAlert className="size-4" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70">
                          {item.category === "inventory" ? "Inventory" : "Circulation"}
                        </p>
                        <h2 className="text-lg font-semibold">{item.title}</h2>
                        <p className="max-w-3xl text-sm leading-6 opacity-90">{item.message}</p>
                      </div>
                    </div>

                    <div className="min-w-[150px] space-y-3 text-right">
                      <p className="text-xs font-medium opacity-70">
                        {formatNotificationDate(item.createdAt)}
                      </p>
                      <Link
                        href={item.href}
                        className="inline-flex h-10 items-center justify-center rounded-full border border-current/15 bg-white/75 px-4 text-sm font-semibold transition hover:bg-white"
                      >
                        Review in Dashboard
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-[26px] border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface-strong)]/70 px-6 py-12 text-center">
              <Bell className="mx-auto size-10 text-[var(--color-primary)]" />
              <h2 className="mt-4 text-xl font-semibold text-[var(--color-foreground)]">
                No active alerts
              </h2>
              <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--color-muted-foreground)]">
                Low stock books, unavailable items, and overdue borrowings will appear here once
                they need action.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
