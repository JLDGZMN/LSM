import { BookOpenText, Bookmark, Building2, ScrollText } from "lucide-react";

const highlights = [
  {
    icon: BookOpenText,
    title: "Curated Collections",
    description: "Surface borrowing, catalog, and member records with a calm, scholarly interface.",
  },
  {
    icon: Building2,
    title: "Campus-Ready",
    description: "Designed for librarians, faculty, and students moving quickly through daily tasks.",
  },
  {
    icon: ScrollText,
    title: "Better-Auth Ready",
    description: "The structure is prepared for real authentication flows, validation, and protected routes.",
  },
];

export function LibraryBranding() {
  return (
    <aside className="relative hidden min-h-[720px] overflow-hidden rounded-[32px] border border-white/60 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(244,238,228,0.8)_40%,_rgba(216,226,220,0.55)_100%)] p-8 text-[var(--color-foreground)] shadow-[0_28px_100px_rgba(90,77,58,0.12)] lg:flex lg:flex-col lg:justify-between">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(155,132,97,0.08),transparent_35%,rgba(43,89,74,0.08))]" />
      <div className="relative space-y-8">
        <div className="inline-flex items-center gap-3 rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium shadow-sm backdrop-blur">
          <span className="flex size-9 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
            <Bookmark className="size-4" />
          </span>
          Library System Management
        </div>
        <div className="space-y-5">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
            Academic Access Portal
          </p>
          <h2 className="max-w-lg text-4xl font-semibold leading-tight tracking-tight">
            Welcome to a quieter, more refined way to manage your library.
          </h2>
          <p className="max-w-xl text-base leading-7 text-[var(--color-muted-foreground)]">
            A thoughtful sign-in experience for circulation teams, students, and
            faculty. Balanced spacing, subtle tone, and trustworthy interaction
            patterns keep the focus on access and stewardship.
          </p>
        </div>
      </div>

      <div className="relative space-y-4">
        {highlights.map(({ description, icon: Icon, title }) => (
          <div
            key={title}
            className="rounded-2xl border border-white/70 bg-white/70 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.08)] backdrop-blur"
          >
            <div className="mb-3 flex size-11 items-center justify-center rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              <Icon className="size-5" />
            </div>
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
              {description}
            </p>
          </div>
        ))}
      </div>
    </aside>
  );
}
