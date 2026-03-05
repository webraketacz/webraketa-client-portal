"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

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

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-200 antialiased">
      {/* Background */}
      <div className="relative min-h-dvh overflow-hidden">
        {/* Glow */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-violet-600/20 blur-[6rem]" />
        <div className="pointer-events-none absolute top-10 right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-blue-600/15 blur-[7rem]" />

        {/* Grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />

        {/* Header */}
        <header className="relative z-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-xl">
                {/* icon */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="opacity-90"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L20 7V17L12 22L4 17V7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    opacity="0.9"
                  />
                  <path
                    d="M12 6.5L16.5 9.1V14.9L12 17.5L7.5 14.9V9.1L12 6.5Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    opacity="0.55"
                  />
                </svg>
              </div>

              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-white">Webraketa.cz</span>
                <span className="text-xs text-zinc-400">Klientská zóna</span>
              </div>
            </div>

            <a
              href="https://webraketa.cz"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-xl transition hover:bg-white/[0.10]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="opacity-90"
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
        </header>

        <main className="relative z-10">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-14 lg:grid-cols-12 lg:py-20">
            {/* LEFT */}
            <section className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-xl">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />
                KLIENTSKÁ ZÓNA
              </div>

              <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Přihlášení do klientské zóny
              </h1>

              <p className="mt-4 max-w-xl text-zinc-400">
                Zadejte přihlašovací údaje a pokračujte do dashboardu.
              </p>

              <div className="mt-10 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="opacity-90"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 1.8l8 3.2v6.6c0 5.1-3.4 9.6-8 10.6-4.6-1-8-5.5-8-10.6V5l8-3.2Z"
                          stroke="currentColor"
                          strokeWidth="1.7"
                        />
                        <path
                          d="M9.6 12.1l1.7 1.8 3.4-3.8"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity="0.9"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Bezpečné přihlášení</div>
                      <p className="mt-1 text-sm text-zinc-400">
                        Šifrovaný přenos, moderní zabezpečení a čisté rozhraní.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-xl">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="opacity-90"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 7h10v10H7V7Z"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          opacity="0.9"
                        />
                        <path
                          d="M4 4h6M4 4v6M20 4h-6M20 4v6M4 20h6M4 20v-6M20 20h-6M20 20v-6"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          strokeLinecap="round"
                          opacity="0.55"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">Vše na jednom místě</div>
                      <p className="mt-1 text-sm text-zinc-400">
                        Stav zakázky, fakturace a komunikace přehledně v dashboardu.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* RIGHT CARD */}
            <section className="lg:col-span-6">
              <div className="mx-auto w-full max-w-md">
                <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl">
                  <h2 className="text-2xl font-semibold text-white">Vítejte zpět</h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    Přihlaste se a pokračujte tam, kde jste skončili.
                  </p>

                  <form onSubmit={onSubmit} className="mt-6 space-y-5">
                    {/* EMAIL */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Email
                      </label>

                      <div className="relative mt-2">
                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">
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
                          className="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-10 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                    </div>

                    {/* PASSWORD */}
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Heslo
                      </label>

                      <div className="relative mt-2">
                        <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">
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
                          className="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-10 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                    </div>

                    {/* BUTTON */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-violet-500 to-blue-500 py-3 font-semibold text-white shadow-[0_12px_40px_-18px_rgba(139,92,246,0.7)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      <span className="relative inline-flex items-center justify-center gap-2">
                        {loading ? "Přihlašuji…" : "Přihlásit"}
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          className="opacity-90 transition group-hover:translate-x-0.5"
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

                    {/* INFO / ERROR BOX */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400">
                      {error ? (
                        <span className="text-red-300">{error}</span>
                      ) : (
                        <>
                          <span className="font-medium text-zinc-300">Tip:</span>{" "}
                          Přihlaste se stejnými údaji, které jste dostali od Webraketa.cz.
                        </>
                      )}
                    </div>

                    {/* FORGOT */}
                    <div className="text-sm text-zinc-400">
                      Zapomněli jste heslo?{" "}
                      <a
                        href="mailto:podpora@webraketa.cz"
                        className="font-medium text-white/90 underline decoration-white/20 underline-offset-4 hover:decoration-white/50"
                      >
                        podpora@webraketa.cz
                      </a>
                    </div>

                    {/* FOOTER MINI */}
                    <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                        Zabezpečeno
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400/70" />
                        Klientská zóna Webraketa
                      </div>
                    </div>
                  </form>
                </div>

                <div className="mt-6 text-center text-xs text-zinc-500">
                  © 2026 Webraketa.cz · Všechna práva vyhrazena
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}