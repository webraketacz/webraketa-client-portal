"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

const QUICK_PROMPTS = [
  "Web pro prémiový autoservis a detailing studio",
  "Minimalistický web pro soukromou kliniku",
  "Luxusní realitní kancelář pro prémiové nemovitosti",
  "Moderní startup landing page s produktem a pricingem",
];

export default function AiLandingPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const canContinue = useMemo(() => prompt.trim().length >= 12, [prompt]);

  function startGenerating(customPrompt?: string) {
    const finalPrompt = (customPrompt ?? prompt).trim();
    if (!finalPrompt) return;

    sessionStorage.setItem("ai_webgen_prompt", finalPrompt);
    sessionStorage.setItem("ai_webgen_autostart", "1");
    router.push("/ai/editor");
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#050507] text-white">
      <style jsx global>{`
        @keyframes syntoFloatA {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(40px, -30px, 0) scale(1.08);
          }
        }

        @keyframes syntoFloatB {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(-50px, 35px, 0) scale(1.05);
          }
        }

        @keyframes syntoBorderShift {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        @keyframes syntoPulse {
          0%,
          100% {
            opacity: 0.45;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.14]" />

      <div
        className="pointer-events-none absolute -left-24 top-[-120px] h-[30rem] w-[30rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(124,92,255,0.28) 0%, rgba(124,92,255,0.10) 35%, transparent 70%)",
          animation: "syntoFloatA 16s ease-in-out infinite alternate",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[-160px] right-[-80px] h-[34rem] w-[34rem] rounded-full blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, rgba(90,209,255,0.22) 0%, rgba(90,209,255,0.08) 35%, transparent 72%)",
          animation: "syntoFloatB 18s ease-in-out infinite alternate",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,255,255,0.06),transparent_28%)]" />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-7xl flex-col px-6 py-8 md:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_0_30px_rgba(124,92,255,0.14)]">
              <div className="absolute inset-0 rounded-2xl bg-[linear-gradient(135deg,rgba(124,92,255,0.15),rgba(90,209,255,0.10))]" />
              <span className="relative text-lg font-semibold tracking-[0.18em] text-white">
                S
              </span>
            </div>

            <div>
              <div className="text-base font-semibold tracking-tight text-white">
                Synto
              </div>
              <div className="text-xs text-zinc-500">
                AI Website Builder by Webraketa
              </div>
            </div>
          </div>

          <div className="hidden rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 md:block">
            50 kreditů zdarma
          </div>
        </header>

        <main className="flex flex-1 items-center">
          <div className="mx-auto w-full max-w-4xl py-12 text-center md:py-20">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 backdrop-blur-xl">
              <span
                className="inline-block h-2 w-2 rounded-full bg-emerald-400"
                style={{ animation: "syntoPulse 1.8s ease-in-out infinite" }}
              />
              Vytvoř si svůj web zcela zdarma
            </div>

            <h1 className="mx-auto max-w-4xl text-5xl font-semibold tracking-tight text-white md:text-7xl">
              Vygeneruj si web pomocí AI
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-zinc-400 md:text-lg">
              Popiš svůj byznys, styl a cíl. Synto ti během chvíle vytvoří kompletní
              web včetně stylů a připraví ho rovnou k exportu.
            </p>

            <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-white/10 bg-[rgba(17,17,24,0.72)] p-3 shadow-[0_20px_100px_-40px_rgba(0,0,0,0.8)] backdrop-blur-2xl md:p-4">
              <div
                className="rounded-[1.7rem] p-[1px]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(124,92,255,0.85), rgba(90,209,255,0.65), rgba(124,92,255,0.85))",
                  backgroundSize: "200% 200%",
                  animation: "syntoBorderShift 6s linear infinite",
                }}
              >
                <div className="rounded-[1.65rem] bg-[#0B0B10]">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Např. Vytvoř moderní web pro soukromou psychiatrickou ambulanci v Praze. Klidný, minimalistický a důvěryhodný styl. Sekce služby, o lékaři, objednání, reference a kontakt."
                    className="h-44 w-full resize-none rounded-[1.65rem] border-0 bg-transparent px-6 py-5 text-base text-white outline-none placeholder:text-zinc-500 md:h-48 md:text-lg"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  {QUICK_PROMPTS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPrompt(item)}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300 transition duration-200 hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => startGenerating()}
                  disabled={!canContinue}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(124,92,255,1), rgba(90,209,255,0.92))",
                    boxShadow:
                      "0 10px 30px rgba(124,92,255,0.28), 0 0 40px rgba(90,209,255,0.12)",
                  }}
                >
                  Generovat web
                  <Icon icon="solar:arrow-right-linear" width={18} />
                </button>
              </div>
            </div>

            <div className="mt-5 text-sm text-zinc-500">
              Start zdarma — získáš až 50 kreditů pro první generování
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}