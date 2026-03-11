"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PreparingPage() {
  const router = useRouter();

  useEffect(() => {
    const redirectTimeout = setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 60000);

    return () => {
      clearTimeout(redirectTimeout);
    };
  }, [router]);

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 antialiased">
      <div className="relative min-h-dvh overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-violet-600/20 blur-[6rem]" />
        <div className="pointer-events-none absolute top-10 right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-blue-600/15 blur-[7rem]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />

        <div className="relative z-10 mx-auto flex min-h-dvh max-w-7xl items-center px-6 py-12">
          <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left */}
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl md:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />
                PŘÍPRAVA NÁVRHU WEBU
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="relative flex h-14 w-14 items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-md animate-pulse" />
                  <div className="h-10 w-10 rounded-full border-2 border-violet-400/40 border-t-violet-400 animate-spin" />
                </div>

                <div>
                  <div className="text-sm uppercase tracking-[0.18em] text-zinc-500">
                    Stav zakázky
                  </div>
                  <div className="mt-1 text-lg font-semibold text-white">
                    Váš web se připravuje
                  </div>
                </div>
              </div>

              <h1 className="mt-8 text-4xl font-semibold leading-tight text-white md:text-5xl">
                Děkujeme, vaše zadání jsme úspěšně přijali
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                Náš tým nyní připravuje první návrh vašeho webu. Jakmile bude návrh hotový,
                obdržíte oznámení a vše uvidíte ve své klientské zóně.
              </p>

              <div className="mt-8 rounded-3xl border border-white/10 bg-zinc-950/40 p-6">
                <div className="text-sm font-medium text-white">
                  Co se bude dít teď:
                </div>

                <div className="mt-4 space-y-3 text-sm leading-7 text-zinc-400">
                  <p>
                    • Náš tým projde vaše zadání, podklady a preferovaný styl.
                  </p>
                  <p>
                    • Připravíme první návrh webu, obvykle do 48 hodin.
                  </p>
                  <p>
                    • Jakmile bude návrh připraven, dostanete oznámení.
                  </p>
                  <p>
                    • Pokud budeme potřebovat doplnit informace, spojíme se s vámi telefonicky.
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">
                    Telefonický kontakt
                  </div>
                  <div className="mt-2 text-base font-medium text-white">
                    777 777 777
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    Pokud s vámi budeme potřebovat projít detaily, ozveme se vám z tohoto čísla.
                  </p>
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">
                    Klientská zóna
                  </div>
                  <div className="mt-2 text-base font-medium text-white">
                    Přehled prací a další kroky
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    V mezičase můžete pokračovat do klientské zóny, kde uvidíte průběh prací a vše
                    důležité.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => {
                    router.push("/dashboard");
                    router.refresh();
                  }}
                  className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_-18px_rgba(139,92,246,0.7)] transition hover:opacity-95"
                >
                  Pokračovat do klientské zóny
                </button>

                <a
                  href="mailto:podpora@webraketa.cz"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-6 py-3 text-sm font-medium text-white/90 transition hover:bg-white/[0.10]"
                >
                  Kontaktovat podporu
                </a>
              </div>

              <p className="mt-5 text-xs text-zinc-500">
                Automatické přesměrování do klientské zóny proběhne přibližně za 1 minutu.
              </p>
            </div>

            {/* Right */}
            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.03] p-8 backdrop-blur-xl md:p-10">
              <div className="rounded-3xl border border-white/10 bg-zinc-950/40 p-6">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Co bude následovat
                </div>

                <div className="mt-6 space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-sm font-semibold text-violet-300">
                      1
                    </div>
                    <div>
                      <div className="text-base font-semibold text-white">
                        Připravíme první návrh
                      </div>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">
                        Náš tým zpracuje vaše zadání, styl a podklady do prvního návrhu webu.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-sm font-semibold text-violet-300">
                      2
                    </div>
                    <div>
                      <div className="text-base font-semibold text-white">
                        Dostanete oznámení
                      </div>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">
                        Jakmile bude návrh připraven, uvidíte ho v klientské zóně a dáme vám vědět.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-sm font-semibold text-violet-300">
                      3
                    </div>
                    <div>
                      <div className="text-base font-semibold text-white">
                        Potvrdíte návrh
                      </div>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">
                        Po schválení návrhu se posuneme do další fáze realizace a dokončení webu.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-violet-400/30 bg-violet-500/10 text-sm font-semibold text-violet-300">
                      4
                    </div>
                    <div>
                      <div className="text-base font-semibold text-white">
                        Ověření platební karty
                      </div>
                      <p className="mt-1 text-sm leading-6 text-zinc-400">
                        Ověření platební karty proběhne před tímto krokem, jakmile bude potřeba
                        navázat na další fázi služby.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  Podpora
                </div>
                <div className="mt-2 text-base font-medium text-white">
                  Máte dotaz? Jsme tu pro vás.
                </div>

                <div className="mt-4 space-y-2 text-sm text-zinc-400">
                  <div>Email: podpora@webraketa.cz</div>
                  <div>Telefon: 777 777 777</div>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  Důležité
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Tato obrazovka slouží jako potvrzení, že jsme vaše zadání přijali. Návrh webu
                  nebude vygenerován okamžitě — připravuje ho náš tým.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}