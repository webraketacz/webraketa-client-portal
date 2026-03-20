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

const AGENTS = [
  { id: "synto-core", label: "Synto Core", sub: "Vyvážený agent" },
  { id: "synto-convert", label: "Synto Convert", sub: "Silnější CTA a konverze" },
  { id: "synto-brand", label: "Synto Brand", sub: "Více vizuální směr" },
];

const MODELS = [
  { id: "gpt-5.4", label: "GPT-5.4" },
  { id: "claude-4.5", label: "Claude 4.5" },
  { id: "gemini-2.0", label: "Gemini 2.0" },
];

export default function AiLandingPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [buildType, setBuildType] = useState("landing");
  const [agent, setAgent] = useState("synto-core");
  const [model, setModel] = useState("gpt-5.4");

  const canContinue = useMemo(() => prompt.trim().length >= 12, [prompt]);

  function startGenerating(customPrompt?: string) {
    const finalPrompt = (customPrompt ?? prompt).trim();
    if (!finalPrompt) return;

    sessionStorage.setItem("ai_webgen_prompt", finalPrompt);
    sessionStorage.setItem("ai_webgen_autostart", "1");
    sessionStorage.setItem("ai_webgen_build_type", buildType);
    sessionStorage.setItem("ai_webgen_agent", agent);
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
            transform: translate3d(32px, -24px, 0) scale(1.05);
          }
        }

        @keyframes syntoFloatB {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(-40px, 28px, 0) scale(1.06);
          }
        }

        @keyframes syntoGlowPulse {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.9;
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
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:42px_42px] opacity-[0.11]" />

      <div
        className="pointer-events-none absolute left-[-140px] top-[-120px] h-[28rem] w-[28rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(124,92,255,0.22) 0%, rgba(124,92,255,0.08) 35%, transparent 75%)",
          animation: "syntoFloatA 16s ease-in-out infinite alternate",
        }}
      />

      <div
        className="pointer-events-none absolute bottom-[-160px] right-[-100px] h-[30rem] w-[30rem] rounded-full blur-[130px]"
        style={{
          background:
            "radial-gradient(circle, rgba(90,209,255,0.18) 0%, rgba(90,209,255,0.07) 35%, transparent 75%)",
          animation: "syntoFloatB 18s ease-in-out infinite alternate",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-7xl flex-col px-6 py-8 md:px-8 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src="/synto-logo.svg"
              alt="Synto"
              className="h-10 w-auto md:h-11"
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
                Vytvoř si svůj web zcela zdarma
              </div>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Co vytvoříme dnes?
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-zinc-400">
                Popiš projekt, zvol styl generování a nech Synto vytvořit hotový web
                včetně stylů a exportu.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[rgba(13,13,18,0.86)] p-3 shadow-[0_20px_120px_-40px_rgba(0,0,0,0.82)] backdrop-blur-2xl md:p-4">
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
                    "linear-gradient(135deg, rgba(124,92,255,0.8), rgba(90,209,255,0.52), rgba(124,92,255,0.8))",
                  backgroundSize: "200% 200%",
                  animation: "syntoBorderShift 6s linear infinite",
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

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
                  AI agent
                </div>

                {AGENTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAgent(item.id)}
                    className={`rounded-full border px-3 py-2 text-left transition ${
                      agent === item.id
                        ? "border-cyan-400/30 bg-cyan-500/10 text-white"
                        : "border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="text-[11px] text-zinc-500">{item.sub}</div>
                  </button>
                ))}

                <div className="ml-auto flex flex-wrap gap-2">
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
              </div>

              <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="flex flex-1 flex-wrap gap-2">
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