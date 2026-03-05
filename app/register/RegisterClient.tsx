"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";

export default function RegisterClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ PLAN / BILLING z URL: /register?plan=start&billing=subscription
  const plan = searchParams.get("plan") ?? "start";
  const billing = searchParams.get("billing") ?? "subscription";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (password.length < 6) {
      setError("Heslo musí mít alespoň 6 znaků.");
      return;
    }

    if (password !== password2) {
      setError("Hesla se neshodují.");
      return;
    }

    setLoading(true);

    const supabase = getSupabaseBrowserClient();

    // ✅ DEMO registrace bez potvrzování emailu (Confirm email musí být vypnuté v Supabase)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    // ✅ pokud už máme user id, uložíme výběr balíčku do profiles
    const userId = data.user?.id;

    if (userId) {
      const { error: upsertError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          email,
          plan,
          billing_type: billing,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (upsertError) {
        console.error("profiles upsert error:", upsertError);
        setInfo(
          "Účet je vytvořen, ale nepodařilo se uložit vybraný balíček. Napište prosím na podpora@webraketa.cz."
        );
      }
    }

    setLoading(false);

    // ✅ DEMO: rovnou na onboarding
    router.push("/onboarding");
    router.refresh();
  };

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-200 antialiased">
      <div className="relative min-h-dvh overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-violet-600/20 blur-[6rem]" />
        <div className="pointer-events-none absolute top-10 right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-blue-600/15 blur-[7rem]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />

        <header className="relative z-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-xl">
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
            <section className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-xl">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />
                KLIENTSKÁ ZÓNA
              </div>

              <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Registrace do klientské zóny
              </h1>

              <p className="mt-4 max-w-xl text-zinc-400">
                Vytvořte si účet a získáte přístup k přehledu zakázky, podkladům a dalším
                funkcím.
              </p>

              <div className="mt-6 max-w-xl rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl">
                <div className="text-xs uppercase tracking-wide text-zinc-400">
                  Vybraný balíček
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm font-medium text-white/90">
                    {plan.toUpperCase()}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm font-medium text-white/70">
                    {billing === "subscription" ? "Měsíční předplatné" : "Jednorázově"}
                  </span>
                </div>
              </div>
            </section>

            <section className="lg:col-span-6">
              <div className="mx-auto w-full max-w-md">
                <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl">
                  <h2 className="text-2xl font-semibold text-white">Vytvořit účet</h2>
                  <p className="mt-2 text-sm text-zinc-400">
                    Zadejte email a heslo. DEMO režim: po registraci půjdete rovnou do onboardingu.
                  </p>

                  <form onSubmit={onSubmit} className="mt-6 space-y-5">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Email
                      </label>
                      <div className="relative mt-2">
                        <input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="vas@email.cz"
                          type="email"
                          autoComplete="email"
                          required
                          className="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Heslo
                      </label>
                      <div className="relative mt-2">
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          required
                          className="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                      <p className="mt-2 text-xs text-zinc-500">Minimálně 6 znaků.</p>
                    </div>

                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                        Potvrzení hesla
                      </label>
                      <div className="relative mt-2">
                        <input
                          type="password"
                          value={password2}
                          onChange={(e) => setPassword2(e.target.value)}
                          placeholder="••••••••"
                          autoComplete="new-password"
                          required
                          className="w-full rounded-xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full overflow-hidden rounded-full bg-gradient-to-r from-violet-500 to-blue-500 py-3 font-semibold text-white shadow-[0_12px_40px_-18px_rgba(139,92,246,0.7)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {loading ? "Vytvářím účet…" : "Vytvořit účet"}
                    </button>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400">
                      {error ? (
                        <span className="text-red-300">{error}</span>
                      ) : info ? (
                        <span className="text-emerald-300">{info}</span>
                      ) : (
                        <>
                          <span className="font-medium text-zinc-300">Tip:</span>{" "}
                          Pokud se něco pokazí, napište na{" "}
                          <a
                            href="mailto:podpora@webraketa.cz"
                            className="font-medium text-white/90 underline decoration-white/20 underline-offset-4 hover:decoration-white/50"
                          >
                            podpora@webraketa.cz
                          </a>
                          .
                        </>
                      )}
                    </div>

                    <div className="text-sm text-zinc-400">
                      Už máte účet?{" "}
                      <a
                        href="/login"
                        className="font-medium text-white/90 underline decoration-white/20 underline-offset-4 hover:decoration-white/50"
                      >
                        Přihlásit se
                      </a>
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