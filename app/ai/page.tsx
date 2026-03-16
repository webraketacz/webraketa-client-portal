"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

const PRESETS = [
  {
    title: "Prémiový autoservis",
    desc: "Tmavý moderní web s důrazem na servis, důvěru a rezervaci termínu.",
    prompt:
      "Vytvoř moderní prémiový web pro autoservis a detailing studio. Tmavý styl, důvěryhodný vzhled, rezervace termínu, služby, reference, kontakt.",
  },
  {
    title: "Psychiatrická ambulance",
    desc: "Klidný, minimalistický a profesionální web se silnou důvěrou.",
    prompt:
      "Navrhni minimalistický a důvěryhodný web pro psychiatrickou ambulanci. Klidný styl, čistá typografie, služby, o lékaři, objednání, kontakt.",
  },
  {
    title: "Luxusní realitní kancelář",
    desc: "Prémiový layout s vysokou důvěryhodností a lead-generation CTA.",
    prompt:
      "Vytvoř elegantní web pro realitní kancelář zaměřenou na prémiové nemovitosti. Luxusní styl, silná hero sekce, nabídka, reference, kontakt.",
  },
  {
    title: "Tech startup landing page",
    desc: "Moderní startup vibe, silné CTA, produktové sekce a pricing.",
    prompt:
      "Vytvoř moderní landing page pro tech startup. Čistý technologický styl, produktové benefity, pricing, FAQ, CTA na demo.",
  },
];

export default function AiLandingPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const canContinue = useMemo(() => prompt.trim().length >= 12, [prompt]);

  function openEditor(initialPrompt?: string) {
    const finalPrompt = (initialPrompt ?? prompt).trim();
    if (!finalPrompt) return;

    sessionStorage.setItem("ai_webgen_prompt", finalPrompt);
    router.push("/ai/editor");
  }

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed left-[10%] top-0 h-[28rem] w-[28rem] -translate-y-1/3 rounded-full bg-violet-600/20 blur-[140px]" />
      <div className="pointer-events-none fixed bottom-0 right-[5%] h-[32rem] w-[32rem] translate-y-1/3 rounded-full bg-blue-600/10 blur-[140px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(124,58,237,0.14),transparent_35%),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:auto,40px_40px,40px_40px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:px-8 md:py-14">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
              <Icon icon="solar:magic-stick-3-linear" width={20} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">AI Web Generator</div>
              <div className="text-xs text-zinc-500">Webraketa DEMO</div>
            </div>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
            Launcher
          </div>
        </div>

        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-zinc-300">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            Navrhni web podle oboru, stylu a cíle
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Co dnes chceš vygenerovat?
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-zinc-400">
            Zadej stručný popis firmy nebo projektu. AI nejdřív připraví designový směr
            a potom vytvoří kompletní HTML + Tailwind verzi webu.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-[2rem] border border-white/10 bg-white/[0.06] p-4 shadow-[0_10px_60px_-20px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white">
              Landing page
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-zinc-400">
              Firemní web
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.02] px-4 py-2 text-sm text-zinc-400">
              Premium brand
            </span>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Např. Vytvoř moderní web pro psychiatrickou ambulanci. Minimalistický, klidný a důvěryhodný styl. Sekce služby, o lékaři, objednání, kontakt..."
            className="h-48 w-full resize-none rounded-[1.5rem] border border-white/10 bg-zinc-950/50 p-5 text-base text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
          />

          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {PRESETS.slice(0, 3).map((preset) => (
                <button
                  key={preset.title}
                  type="button"
                  onClick={() => setPrompt(preset.prompt)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                >
                  {preset.title}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => openEditor()}
              disabled={!canContinue}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Otevřít editor
              <Icon icon="solar:arrow-right-linear" width={18} />
            </button>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PRESETS.map((preset) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => openEditor(preset.prompt)}
              className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-5 text-left transition hover:bg-white/[0.08]"
            >
              <div className="text-base font-semibold text-white">{preset.title}</div>
              <p className="mt-2 text-sm leading-7 text-zinc-400">{preset.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}