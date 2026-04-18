import { AuthForm } from "@/components/auth/auth-form";

type AuthMode = "signin" | "signup";

interface AuthPageShellProps {
  mode: AuthMode;
}

export function AuthPageShell({ mode }: AuthPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-canvas)] px-6 py-8 sm:px-8 lg:px-10">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,243,235,0.84),rgba(243,235,223,0.92))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(123,17,19,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(43,89,74,0.14),transparent_22%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-[34px] border border-white/70 bg-white/40 shadow-[0_30px_90px_rgba(63,32,18,0.16)] backdrop-blur xl:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.92fr)]">
          <div className="relative hidden min-h-[780px] overflow-hidden xl:block">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/pup-land.jpeg')" }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(76,9,12,0.82),rgba(76,9,12,0.54)_42%,rgba(17,33,28,0.42)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,241,214,0.22),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.14))]" />

            <div className="relative flex h-full flex-col justify-between p-10 text-white">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/88">
                  PUP Main Campus
                </div>
                <div className="max-w-xl space-y-5">
                  <p className="text-base font-semibold uppercase tracking-[0.22em] text-[#f4d9d9]">
                    Polytechnic University of the Philippines
                  </p>
                  <h1 className="text-5xl font-semibold uppercase leading-[1.05] tracking-[0.14em] text-white">
                    Library System Management
                  </h1>
                  <p className="max-w-lg text-lg leading-8 text-white/82">
                    A focused workspace for collection records, circulation activity, and member access across the campus library system.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[30px] border border-white/18 bg-[linear-gradient(180deg,rgba(103,10,18,0.84),rgba(89,10,17,0.94))] shadow-[0_24px_60px_rgba(25,8,8,0.24)]">
                <div className="border-b border-white/12 px-6 py-5 text-center">
                  <p className="font-serif text-[2rem] italic tracking-[0.04em] text-white/92">
                    "Mula Sa 'Yo, Para sa Bayan"
                  </p>
                </div>
                <div className="grid gap-5 px-6 py-5 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                      Campus Address
                    </p>
                    <p className="mt-3 text-base leading-7 text-white/88">
                      A. Mabini Campus, Anonas Street, Sta. Mesa, Manila, Philippines 1016
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                      Contact Information
                    </p>
                    <p className="mt-3 text-base leading-7 text-white/88">
                      (+63 2) 5335-1787 / 5335-1777
                    </p>
                    <p className="mt-1 text-base leading-7 text-white/88">
                      inquire@pup.edu.ph
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10 xl:min-h-[780px]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,251,245,0.94),rgba(247,239,228,0.92))]" />
            <div className="absolute inset-0 xl:bg-[radial-gradient(circle_at_top_left,rgba(123,17,19,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(43,89,74,0.1),transparent_22%)]" />

            <div className="relative w-full max-w-xl space-y-5">
              <div className="space-y-3 text-center xl:hidden">
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
                  {mode === "signin"
                    ? "Secure access for your library system"
                    : "Create your library system account"}
                </h1>
              </div>
              <div className="hidden space-y-2 xl:block">
                <h2 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
                  {mode === "signin"
                    ? "Secure access for your library system"
                    : "Create your library system account"}
                </h2>
              </div>
              <AuthForm initialMode={mode} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
