"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  const cards = [
    { h: 180, cls: "w-[220px] rotate-[-14deg]" },
    { h: 140, cls: "w-[190px] rotate-[10deg]" },
    { h: 220, cls: "w-[260px] rotate-[-8deg]" },
    { h: 160, cls: "w-[210px] rotate-[16deg]" },
    { h: 200, cls: "w-[240px] rotate-[-12deg]" },
    { h: 150, cls: "w-[180px] rotate-[8deg]" },
  ];

  return (
    <>
      <div
        className="min-h-dvh bg-slate-950 text-slate-200 antialiased selection:bg-indigo-500 selection:text-white"
        style={{
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
        }}
      >
        <div className="relative min-h-dvh overflow-hidden">
          {/* animated gradient bg */}
          <div className="pointer-events-none absolute inset-0 z-0 animate-gradient-xy bg-[linear-gradient(45deg,#0f172a,#312e81,#581c87,#1e3a8a,#0f172a)]" />

          {/* overlay */}
          <div className="pointer-events-none absolute inset-0 z-0 bg-black/35" />

          {/* grid */}
          <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:56px_56px]" />

          {/* floating cards background */}
          <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden opacity-30">
            <div className="absolute left-[12%] top-[-10%] hidden h-[140%] md:block">
              <div className="animate-scroll-y-up flex flex-col gap-8">
                {[...cards, ...cards].map((card, i) => (
                  <div
                    key={`left-${i}`}
                    className={`rounded-[28px] border border-white/10 bg-indigo-950/30 shadow-[0_10px_80px_rgba(0,0,0,0.35)] backdrop-blur-[2px] ${card.cls}`}
                    style={{ height: `${card.h}px` }}
                  >
                    <div className="p-4">
                      <div className="mb-4 flex items-center gap-2 opacity-70">
                        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                      </div>
                      <div className="space-y-3">
                        <div className="h-3 w-2/3 rounded-full bg-white/10" />
                        <div className="h-3 w-1/2 rounded-full bg-white/10" />
                        <div className="mt-5 h-16 rounded-2xl bg-white/5" />
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <div className="h-8 rounded-xl bg-white/5" />
                          <div className="h-8 rounded-xl bg-white/5" />
                          <div className="h-8 rounded-xl bg-white/5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute right-[10%] top-[-15%] hidden h-[145%] md:block">
              <div className="animate-scroll-y-down flex flex-col gap-8">
                {[...cards, ...cards].map((card, i) => (
                  <div
                    key={`right-${i}`}
                    className={`rounded-[28px] border border-white/10 bg-indigo-950/30 shadow-[0_10px_80px_rgba(0,0,0,0.35)] backdrop-blur-[2px] ${card.cls}`}
                    style={{ height: `${card.h}px` }}
                  >
                    <div className="p-4">
                      <div className="mb-4 flex items-center gap-2 opacity-70">
                        <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                        <span className="h-2.5 w-2.5 rounded-full bg-white/10" />
                      </div>
                      <div className="space-y-3">
                        <div className="h-3 w-2/3 rounded-full bg-white/10" />
                        <div className="h-3 w-1/2 rounded-full bg-white/10" />
                        <div className="mt-5 h-16 rounded-2xl bg-white/5" />
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="h-8 rounded-xl bg-white/5" />
                          <div className="h-8 rounded-xl bg-white/5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <main className="relative z-10 flex min-h-dvh items-center justify-center px-6 py-10">
            <div className="w-full max-w-md">
              {/* logo */}
              <div className="mb-6 flex justify-center">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-white opacity-90"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 2L20 7V17L12 22L4 17V7L12 2Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        opacity="0.9"
                      />
                      <path
                        d="M12 6.5L16.5 9.1V14.9L12 17.5L7.5 14.9V9.1L12 6.5Z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        opacity="0.55"
                      />
                    </svg>
                  </div>

                  <div className="leading-tight">
                    <div className="text-[18px] font-semibold text-white">
                      Webraketa<span className="text-indigo-300">.cz</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* card */}
              <div className="rounded-[34px] border border-white/10 bg-white/[0.08] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
                <h1 className="text-4xl font-semibold tracking-tight text-white">
                  Vítejte zpět
                </h1>

                <p className="mt-3 text-lg text-slate-300/75">
                  Přihlaste se a pokračujte tam, kde jste skončili.
                </p>

                <form onSubmit={onSubmit} className="mt-8 space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-slate-300/70">
                      Email
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400/70">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4 7.5l8 5 8-5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M5.5 6.5h13A1.5 1.5 0 0 1 20 8v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16V8a1.5 1.5 0 0 1 1.5-1.5Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            opacity="0.8"
                          />
                        </svg>
                      </div>

                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="vas@email.cz"
                        type="email"
                        autoComplete="email"
                        required
                        className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950/45 pl-12 pr-4 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.14em] text-slate-300/70">
                      Heslo
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400/70">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7 11V8.5a5 5 0 0 1 10 0V11"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                          />
                          <path
                            d="M6.5 11h11A1.5 1.5 0 0 1 19 12.5v6A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-6A1.5 1.5 0 0 1 6.5 11Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            opacity="0.85"
                          />
                          <path
                            d="M12 15v2"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            opacity="0.85"
                          />
                        </svg>
                      </div>

                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                        className="h-14 w-full rounded-2xl border border-white/10 bg-slate-950/45 pl-12 pr-4 text-white outline-none placeholder:text-slate-500 focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-400/20"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative h-14 w-full overflow-hidden rounded-full bg-gradient-to-r from-indigo-400 via-violet-500 to-blue-500 text-base font-semibold text-white shadow-[0_12px_36px_rgba(99,102,241,0.35)] transition hover:scale-[0.995] hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span className="relative inline-flex items-center justify-center gap-2">
                      {loading ? "Přihlašuji..." : "Přihlásit"}
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="transition group-hover:translate-x-0.5"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5 12h12"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d="M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </button>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300/70">
                    {error ? (
                      <span className="text-red-300">{error}</span>
                    ) : (
                      <>
                        <span className="font-medium text-slate-200">Tip:</span>{" "}
                        Přihlaste se stejnými údaji, které jste dostali od
                        Webraketa.cz.
                      </>
                    )}
                  </div>

                  <div className="border-t border-white/10 pt-5 text-sm text-slate-300/70">
                    Zapomněli jste heslo?
                    <br />
                    Nemáte účet? Kontaktujte podporu:{" "}
                    <a
                      href="mailto:podpora@webraketa.cz"
                      className="font-medium text-white underline decoration-white/20 underline-offset-4 transition hover:decoration-white/50"
                    >
                      podpora@webraketa.cz
                    </a>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs text-slate-400/70">
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                      Zabezpečeno
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400/80" />
                      Klientská zóna Webraketa
                    </div>
                  </div>
                </form>
              </div>

              <div className="mt-7 flex justify-center">
                <a
                  href="https://webraketa.cz"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-medium text-white/90 backdrop-blur-xl transition hover:bg-white/[0.1]"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Zpět na homepage
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient-xy {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 16s ease infinite;
        }

        @keyframes scroll-y-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        @keyframes scroll-y-down {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }

        .animate-scroll-y-up {
          animation: scroll-y-up 52s linear infinite;
        }

        .animate-scroll-y-down {
          animation: scroll-y-down 52s linear infinite;
        }
      `}</style>
    </>
  );
}