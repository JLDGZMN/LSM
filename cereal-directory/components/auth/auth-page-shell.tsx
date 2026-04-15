import { AuthForm } from "@/components/auth/auth-form";

type AuthMode = "signin" | "signup";

interface AuthPageShellProps {
  mode: AuthMode;
}

export function AuthPageShell({ mode }: AuthPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-canvas)] px-6 py-10 sm:px-8 lg:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(239,232,220,0.95),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(210,224,219,0.7),_transparent_24%),linear-gradient(180deg,_rgba(248,246,242,0.98),_rgba(241,236,228,0.98))]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center justify-center">
        <section className="flex w-full items-center justify-center">
          <div className="w-full max-w-xl space-y-6">
            <div className="space-y-2 text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
                <span className="font-black text-[#7b1113]">PUP</span>{" "}
                <span className="font-medium">Library System Management</span>
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
                {mode === "signin"
                  ? "Secure access for your library system"
                  : "Create your library system account"}
              </h1>
            </div>
            <AuthForm initialMode={mode} />
          </div>
        </section>
      </div>
    </main>
  );
}
