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

            <div className="relative flex h-full flex-col justify-between text-white">
              <div className="space-y-6 p-10 pb-8">
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

              <div className="relative mt-auto overflow-hidden border-t border-white/12">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('/pup-land.jpeg')" }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(88,10,15,0.72),rgba(99,12,18,0.9)_45%,rgba(70,8,12,0.96))]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.08))]" />

                <footer className="relative flex min-h-[150px] w-full flex-col items-center justify-end px-10 pb-1 pt-8 text-center">
                  <div className="rounded-full border border-white/24 bg-white/6 p-1.5 shadow-[0_10px_20px_rgba(25,8,8,0.16)] backdrop-blur-sm">
                    <img
                      src="/pup-logo.png"
                      alt="Polytechnic University of the Philippines logo"
                      className="h-14 w-14 rounded-full object-cover sm:h-16 sm:w-16"
                    />
                  </div>
                  <p className="mt-2 font-serif text-[1.7rem] italic tracking-[0.04em] text-white/95">
                    Mula Sa 'Yo, Para sa Bayan
                  </p>
                  <p className="mt-2 max-w-xl text-xs leading-5 text-white/78">
                    A. Mabini Campus, Anonas Street, Sta. Mesa, Manila, Philippines 1016
                  </p>
                  <p className="mt-0.5 max-w-xl text-xs leading-5 text-white/78">
                    Phone: (+63 2) 5335-1PUP (5335-1787) or 5335-1777
                  </p>
                </footer>
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
