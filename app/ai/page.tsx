"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

const QUICK_PROMPTS = [
  "Vytvořte web pro soukromou kliniku v Praze, klidný a důvěryhodný styl, služby, objednání a kontakt.",
  "Vytvořte si luxusní landing page pro prémiový realitní projekt v Praze.",
  "Navrhněte wow dark SaaS web pro AI startup s pricingem, dashboardem a CTA.",
  "Připravte moderní web pro autoservis a detailing studio s rezervací termínu.",
];

const RUNNING_TEXT = [
  "Vytvořte web pro kliniku",
  "Vytvořte si luxusní landing page",
  "Navrhněte wow dark SaaS web",
  "Připravte web pro realitního makléře",
  "Vytvořte prémiový web pro autoservis",
];

const DEFAULT_BUILD_TYPE = "premium";
const DEFAULT_MODEL = "openai-gpt-4";

type AttachmentItem = {
  id: string;
  name: string;
  kind: "screenshot" | "file";
};

export default function AiLandingPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

  const screenshotInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canContinue = useMemo(() => prompt.trim().length >= 12, [prompt]);

  function addAttachment(file: File, kind: "screenshot" | "file") {
    const nextItem: AttachmentItem = {
      id: `${kind}-${file.name}-${Date.now()}`,
      name: file.name,
      kind,
    };

    setAttachments((prev) => {
      const exists = prev.some(
        (item) => item.name === file.name && item.kind === kind
      );
      if (exists) return prev;
      return [...prev, nextItem];
    });
  }

  function handleScreenshotSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    addAttachment(file, "screenshot");
    e.target.value = "";
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    addAttachment(file, "file");
    e.target.value = "";
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  }

  function startGenerating(customPrompt?: string) {
    const finalPrompt = (customPrompt ?? prompt).trim();
    if (!finalPrompt) return;

    sessionStorage.setItem("ai_webgen_prompt", finalPrompt);
    sessionStorage.setItem("ai_webgen_autostart", "1");
    sessionStorage.setItem("ai_webgen_build_type", DEFAULT_BUILD_TYPE);
    sessionStorage.setItem("ai_webgen_model", DEFAULT_MODEL);
    sessionStorage.setItem("ai_webgen_attachments", JSON.stringify(attachments));

    router.push("/ai/editor");
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#050507] text-white">
      <style jsx global>{`
        @keyframes zyviaFloatA {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(42px, -26px, 0) scale(1.08);
          }
        }

        @keyframes zyviaFloatB {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(-52px, 36px, 0) scale(1.1);
          }
        }

        @keyframes zyviaFloatC {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(20px, 40px, 0) scale(1.05);
          }
        }

        @keyframes zyviaGlowPulse {
          0%,
          100% {
            opacity: 0.35;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes zyviaBorderShift {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: 200% 50%;
          }
        }

        @keyframes zyviaGridDrift {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(24px, 18px, 0);
          }
        }

        @keyframes zyviaMarquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.07),transparent_22%)]" />

        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
            animation: "zyviaGridDrift 18s linear infinite alternate",
          }}
        />

        <div
          className="absolute left-[-180px] top-[-140px] h-[34rem] w-[34rem] rounded-[10px] blur-[140px]"
          style={{
            background:
              "radial-gradient(circle, rgba(98,70,255,0.30) 0%, rgba(98,70,255,0.10) 36%, transparent 74%)",
            animation: "zyviaFloatA 16s ease-in-out infinite alternate",
          }}
        />

        <div
          className="absolute bottom-[-220px] right-[-120px] h-[38rem] w-[38rem] rounded-[10px] blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, rgba(42,169,255,0.22) 0%, rgba(42,169,255,0.09) 36%, transparent 76%)",
            animation: "zyviaFloatB 18s ease-in-out infinite alternate",
          }}
        />

        <div
          className="absolute left-[35%] top-[18%] h-[24rem] w-[24rem] rounded-[10px] blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(124,92,255,0.04) 30%, transparent 72%)",
            animation: "zyviaFloatC 14s ease-in-out infinite alternate",
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_45%,rgba(0,0,0,0.35)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-7xl flex-col px-6 py-8 md:px-8 lg:px-10">
        <header className="relative flex items-center justify-center">
          <img
            src="/zyvia-logo.svg"
            alt="Zyvia"
            className="h-8 w-auto opacity-95 md:h-9"
          />

          <div className="absolute right-0 hidden sm:flex">
            <div className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 backdrop-blur-xl">
              <span
                className="inline-block h-2.5 w-2.5 rounded-[10px] bg-emerald-400"
                style={{ animation: "zyviaGlowPulse 1.8s ease-in-out infinite" }}
              />
              Začít zdarma
            </div>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-10 md:py-14">
          <div className="w-full max-w-5xl">
            <div className="mb-6 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 backdrop-blur-xl">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-[10px] bg-cyan-300"
                  style={{ animation: "zyviaGlowPulse 1.8s ease-in-out infinite" }}
                />
                50 kreditů zdarma
              </div>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                Co chcete dnes vytvořit?
              </h1>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-[rgba(13,13,18,0.82)] p-3 shadow-[0_20px_120px_-40px_rgba(0,0,0,0.82)] backdrop-blur-2xl md:p-4">
              <div
                className="mb-3 overflow-hidden rounded-[1.15rem] border border-white/10 bg-white/[0.03]"
                style={{
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
                }}
              >
                <div className="flex min-w-max gap-10 px-5 py-3 text-sm text-zinc-300">
                  <div
                    className="flex min-w-max items-center gap-10"
                    style={{ animation: "zyviaMarquee 22s linear infinite" }}
                  >
                    {[...RUNNING_TEXT, ...RUNNING_TEXT].map((item, index) => (
                      <span
                        key={`${item}-${index}`}
                        className="inline-flex items-center gap-3 whitespace-nowrap"
                      >
                        <span className="h-1.5 w-1.5 rounded-[10px] bg-cyan-300/90" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div
                className="rounded-[1.7rem] p-[1px]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(124,92,255,0.85), rgba(90,209,255,0.48), rgba(124,92,255,0.85))",
                  backgroundSize: "200% 200%",
                  animation: "zyviaBorderShift 6s linear infinite",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.02), 0 0 40px rgba(90,209,255,0.06)",
                }}
              >
                <div className="rounded-[1.65rem] bg-[#0B0B10]">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Popište, co chcete vytvořit..."
                    className="h-44 w-full resize-none rounded-[1.65rem] border-0 bg-transparent px-5 py-5 text-base text-white outline-none placeholder:text-zinc-500 md:h-48 md:px-6 md:text-lg"
                  />
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {attachments.map((item) => (
                    <div
                      key={item.id}
                      className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300"
                    >
                      <Icon
                        icon={
                          item.kind === "screenshot"
                            ? "solar:gallery-wide-linear"
                            : "solar:file-text-linear"
                        }
                        width={16}
                      />
                      <span className="max-w-[220px] truncate">{item.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(item.id)}
                        className="text-zinc-500 transition hover:text-white"
                        aria-label="Odebrat soubor"
                      >
                        <Icon icon="solar:close-circle-linear" width={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => screenshotInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
                  >
                    <Icon icon="solar:gallery-wide-linear" width={18} />
                    Printscreen
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
                  >
                    <Icon icon="solar:file-text-linear" width={18} />
                    Soubor
                  </button>

                  <input
                    ref={screenshotInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleScreenshotSelect}
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => startGenerating()}
                  disabled={!canContinue}
                  className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-[10px] px-6 py-3.5 text-sm font-semibold text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(124,92,255,1), rgba(90,209,255,0.92))",
                    boxShadow:
                      "0 10px 30px rgba(124,92,255,0.28), 0 0 40px rgba(90,209,255,0.12)",
                  }}
                >
                  Začít zdarma
                  <Icon icon="solar:arrow-right-linear" width={18} />
                </button>
              </div>

              <div className="mt-5 border-t border-white/8 pt-5">
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Rychlé prompty
                </div>

                <div className="grid gap-2 md:grid-cols-2">
                  {QUICK_PROMPTS.map((item, index) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setPrompt(item)}
                      className="group rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-left transition duration-200 hover:border-white/15 hover:bg-white/[0.07]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-sm leading-6 text-zinc-200 transition group-hover:text-white">
                          {item}
                        </div>
                        <div className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.05] text-zinc-400 transition group-hover:text-white">
                          <Icon
                            icon={
                              index % 4 === 0
                                ? "solar:stethoscope-linear"
                                : index % 4 === 1
                                ? "solar:buildings-2-linear"
                                : index % 4 === 2
                                ? "solar:widget-5-linear"
                                : "solar:smartphone-2-linear"
                            }
                            width={16}
                          />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 text-center text-sm text-zinc-500">
              Prémiový start bez složitého nastavování
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}