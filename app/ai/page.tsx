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

const BUILD_TYPES = [
  { id: "landing", label: "Landing Page", icon: "solar:window-frame-linear" },
  { id: "business", label: "Firemní web", icon: "solar:buildings-2-linear" },
  { id: "premium", label: "Premium brand", icon: "solar:star-line-duotone" },
];

const MODELS = [
  { id: "openai-gpt-4", label: "ChatGPT 4" },
  { id: "gemini-3.1-pro", label: "Gemini 3.1 Pro" },
  { id: "claude-4.5", label: "Claude 4.5" },
];

export default function AiLandingPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [buildType, setBuildType] = useState("landing");
  const [model, setModel] = useState("openai-gpt-4");

  const canContinue = useMemo(() => prompt.trim().length >= 12, [prompt]);

  function startGenerating(customPrompt?: string) {
    const finalPrompt = (customPrompt ?? prompt).trim();
    if (!finalPrompt) return;

    sessionStorage.setItem("ai_webgen_prompt", finalPrompt);
    sessionStorage.setItem("ai_webgen_autostart", "1");
    sessionStorage.setItem("ai_webgen_build_type", buildType);
    sessionStorage.setItem("ai_webgen_model", model);

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
            transform: translate3d(42px, -26px, 0) scale(1.08);
          }
        }

        @keyframes syntoFloatB {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(-52px, 36px, 0) scale(1.1);
          }
        }

        @keyframes syntoFloatC {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(20px, 40px, 0) scale(1.06);
          }
        }

        @keyframes syntoGlowPulse {
          0%,
          100% {
            opacity: 0.35;
          }
          50% {
            opacity: 0.95;
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

        @keyframes syntoGridDrift {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(24px, 18px, 0);
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.06),transparent_22%)]" />

        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
            animation: "syntoGridDrift 18s linear infinite alternate",
          }}
        />

        <div
          className="absolute left-[-180px] top-[-140px] h-[34rem] w-[34rem] rounded-full blur-[140px]"
          style={{
            background:
              "radial-gradient(circle, rgba(98,70,255,0.30) 0%, rgba(98,70,255,0.10) 36%, transparent 74%)",
            animation: "syntoFloatA 16s ease-in-out infinite alternate",
          }}
        />

        <div
          className="absolute bottom-[-220px] right-[-120px] h-[38rem] w-[38rem] rounded-full blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, rgba(42,169,255,0.22) 0%, rgba(42,169,255,0.09) 36%, transparent 76%)",
            animation: "syntoFloatB 18s ease-in-out infinite alternate",
          }}
        />

        <div
          className="absolute left-[35%] top-[18%] h-[24rem] w-[24rem] rounded-full blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(124,92,255,0.04) 30%, transparent 72%)",
            animation: "syntoFloatC 14s ease-in-out infinite alternate",
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_45%,rgba(0,0,0,0.35)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-7xl flex-col px-6 py-8 md:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/synto-logo.svg"
              alt="Synto"
              className="h-7 w-auto opacity-95 md:h-8"
            />
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300">
            50 kreditů zdarma
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-10 md:py-14">
          <div className="w-full max-w-5xl">
            <div className="mb-5 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 backdrop-blur-xl">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400"
                  style={{ animation: "syntoGlowPulse 1.8s ease-in-out infinite" }}
                />
                Vytvoř si svůj web zdarma
              </div>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Co vytvoříme dnes?
              </h1>

              <div className="mx-auto mt-5 max-w-2xl space-y-1 text-base leading-8 text-zinc-400 md:text-lg">
                <p>Popiš svůj projekt a vyber si styl generování.</p>
                <p>Synto ti připraví hotový web včetně stylů a exportu.</p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[rgba(13,13,18,0.82)] p-3 shadow-[0_20px_120px_-40px_rgba(0,0,0,0.82)] backdrop-blur-2xl md:p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {BUILD_TYPES.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setBuildType(type.id)}
                    className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition ${
                      buildType === type.id
                        ? "border-white/15 bg-white/[0.08] text-white"
                        : "border-white/8 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <Icon icon={type.icon} width={16} />
                    {type.label}
                  </button>
                ))}
              </div>

              <div
                className="rounded-[1.7rem] p-[1px]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(124,92,255,0.85), rgba(90,209,255,0.48), rgba(124,92,255,0.85))",
                  backgroundSize: "200% 200%",
                  animation: "syntoBorderShift 6s linear infinite",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.02), 0 0 40px rgba(90,209,255,0.06)",
                }}
              >
                <div className="rounded-[1.65rem] bg-[#0B0B10]">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Popiš, co chceš vytvořit. Např. moderní web pro soukromou kliniku v Praze, klidný a důvěryhodný styl, služby, o lékaři, reference, objednání a kontakt."
                    className="h-44 w-full resize-none rounded-[1.65rem] border-0 bg-transparent px-5 py-5 text-base text-white outline-none placeholder:text-zinc-500 md:h-48 md:px-6 md:text-lg"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
                    AI model
                  </div>

                  {MODELS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setModel(item.id)}
                      className={`rounded-full border px-3 py-2 text-sm transition ${
                        model === item.id
                          ? "border-violet-400/30 bg-violet-500/10 text-white"
                          : "border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => startGenerating()}
                  disabled={!canContinue}
                  className="inline-flex min-w-[190px] items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-40"
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

              <div className="mt-5 border-t border-white/8 pt-5">
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Rychlé prompty
                </div>

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
              </div>
            </div>

            <div className="mt-5 text-center text-sm text-zinc-500">
              Start zdarma — získáš až 50 kreditů pro první generování
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}