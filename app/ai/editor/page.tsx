"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import JSZip from "jszip";

type GeneratorResponse = {
  html: string;
  css: string;
  js: string;
  brief?: {
    industry?: string;
    audience?: string;
    style?: string;
    layoutTone?: string;
  };
};

type ViewMode = "desktop" | "tablet" | "mobile";

const LOADING_STEPS = [
  "Analyzuji zadání a směr projektu…",
  "Navrhuji strukturu jednotlivých sekcí…",
  "Připravuji vizuální styl a kompozici…",
  "Generuji HTML, CSS a interakce…",
  "Ladím responzivitu a CTA prvky…",
  "Finalizuji export a preview…",
];

function buildPreviewDocument(html: string, css: string, js: string) {
  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Synto Preview</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
<script>
${js}
</script>
</body>
</html>`;
}

async function downloadZipSite(html: string, css: string, js: string) {
  const zip = new JSZip();

  const indexHtml = `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exported Website</title>
  <link rel="stylesheet" href="./styles.css" />
</head>
<body>
${html}
<script src="./script.js"></script>
</body>
</html>`;

  zip.file("index.html", indexHtml);
  zip.file("styles.css", css);
  zip.file("script.js", js);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "synto-export.zip";
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

export default function AiEditorPage() {
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Připraveno");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [briefLabel, setBriefLabel] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");

  const progressRef = useRef<number | null>(null);
  const autostartRef = useRef(false);

  const iframeKey = useMemo(
    () => `${html.length}-${css.length}-${js.length}`,
    [html, css, js]
  );

  const previewDocument = useMemo(() => {
    if (!html) return "";
    return buildPreviewDocument(html, css, js);
  }, [html, css, js]);

  useEffect(() => {
    const initial = sessionStorage.getItem("ai_webgen_prompt") ?? "";
    const autostart = sessionStorage.getItem("ai_webgen_autostart") === "1";

    if (initial) setPrompt(initial);

    if (autostart && initial && !autostartRef.current) {
      autostartRef.current = true;
      sessionStorage.removeItem("ai_webgen_autostart");
      setTimeout(() => {
        handleGenerate(initial);
      }, 350);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (progressRef.current) {
        window.clearInterval(progressRef.current);
      }
    };
  }, []);

  function startSmoothProgress() {
    if (progressRef.current) window.clearInterval(progressRef.current);

    let stepIndex = 0;
    setProgress(3);
    setStatus(LOADING_STEPS[0]);

    progressRef.current = window.setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + Math.random() * 4.2 + 1.3, 94);

        if (next > 15 && stepIndex < 1) {
          stepIndex = 1;
          setStatus(LOADING_STEPS[1]);
        } else if (next > 32 && stepIndex < 2) {
          stepIndex = 2;
          setStatus(LOADING_STEPS[2]);
        } else if (next > 50 && stepIndex < 3) {
          stepIndex = 3;
          setStatus(LOADING_STEPS[3]);
        } else if (next > 70 && stepIndex < 4) {
          stepIndex = 4;
          setStatus(LOADING_STEPS[4]);
        } else if (next > 84 && stepIndex < 5) {
          stepIndex = 5;
          setStatus(LOADING_STEPS[5]);
        }

        return next;
      });
    }, 700);
  }

  function stopSmoothProgress(success = true) {
    if (progressRef.current) {
      window.clearInterval(progressRef.current);
      progressRef.current = null;
    }

    if (success) {
      setProgress(100);
      setStatus("Hotovo");
    } else {
      setStatus("Generování selhalo");
    }
  }

  async function handleGenerate(customPrompt?: string) {
    const finalPrompt = (customPrompt ?? prompt).trim();
    if (finalPrompt.length < 12) return;

    setLoading(true);
    setError(null);
    setHtml("");
    setCss("");
    setJs("");
    setBriefLabel("");
    setProgress(0);
    setActiveTab("preview");

    startSmoothProgress();

    try {
      const startedAt = Date.now();

      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt }),
      });

      const data: GeneratorResponse & { error?: string } = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Generování selhalo");
      }

      const elapsed = Date.now() - startedAt;
      const minDelay = 9000;

      if (elapsed < minDelay) {
        await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
      }

      stopSmoothProgress(true);
      setHtml(data.html);
      setCss(data.css);
      setJs(data.js);

      if (data.brief) {
        const bits = [
          data.brief.industry,
          data.brief.style,
          data.brief.layoutTone,
        ].filter(Boolean);
        setBriefLabel(bits.join(" • "));
      }
    } catch (e: any) {
      stopSmoothProgress(false);
      setError(e?.message ?? "Generování selhalo");
    } finally {
      setTimeout(() => setLoading(false), 250);
    }
  }

  const previewWidthClass =
    viewMode === "desktop"
      ? "w-full"
      : viewMode === "tablet"
      ? "mx-auto w-[820px] max-w-full"
      : "mx-auto w-[390px] max-w-full";

  return (
    <div className="relative h-dvh overflow-hidden bg-[#050507] text-zinc-100">
      <style jsx global>{`
        @keyframes syntoEditorFloatA {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(30px, -20px, 0) scale(1.05);
          }
        }

        @keyframes syntoEditorFloatB {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(-34px, 24px, 0) scale(1.06);
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:42px_42px] opacity-[0.12]" />
      <div
        className="pointer-events-none absolute left-[-100px] top-[-100px] h-[26rem] w-[26rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(124,92,255,0.22) 0%, rgba(124,92,255,0.08) 35%, transparent 75%)",
          animation: "syntoEditorFloatA 16s ease-in-out infinite alternate",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[-140px] right-[-80px] h-[28rem] w-[28rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(90,209,255,0.18) 0%, rgba(90,209,255,0.07) 35%, transparent 75%)",
          animation: "syntoEditorFloatB 18s ease-in-out infinite alternate",
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <header className="border-b border-white/10 bg-[#07070b]/80 px-4 py-3 backdrop-blur-2xl md:px-6">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/ai"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <Icon icon="solar:arrow-left-linear" width={16} />
                Zpět
              </Link>

              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                  <span className="text-sm font-semibold tracking-[0.16em] text-white">
                    S
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Synto</div>
                  <div className="text-xs text-zinc-500">AI Website Builder</div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {briefLabel && (
                <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-zinc-300">
                  {briefLabel}
                </div>
              )}

              <button
                type="button"
                onClick={() => downloadZipSite(html, css, js)}
                disabled={!html}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon icon="solar:download-linear" width={16} />
                Export ZIP
              </button>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[440px_minmax(0,1fr)]">
          <aside className="min-h-0 border-r border-white/10 bg-[#09090d]/70 p-4 backdrop-blur-2xl md:p-5">
            <div className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 shadow-[0_10px_60px_-30px_rgba(0,0,0,0.8)]">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-400">
                  Zadání
                </span>

                {loading && (
                  <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                    Generuji
                  </span>
                )}
              </div>

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Popiš co chceš vytvořit. Čím konkrétnější zadání, tím lepší výsledek."
                className="h-52 w-full resize-none rounded-[1.5rem] border border-white/10 bg-[#0b0b10] p-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
              />

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={loading || prompt.trim().length < 12}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(124,92,255,1), rgba(90,209,255,0.92))",
                    boxShadow:
                      "0 10px 28px rgba(124,92,255,0.25), 0 0 32px rgba(90,209,255,0.10)",
                  }}
                >
                  {loading ? "Generuji…" : "Regenerovat web"}
                  <Icon icon="solar:arrow-up-linear" width={16} />
                </button>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-[#0b0b10] p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-zinc-400">
                  <span>{status}</span>
                  <span>{Math.round(progress)}%</span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                      background:
                        "linear-gradient(90deg, rgba(124,92,255,1), rgba(90,209,255,1))",
                    }}
                  />
                </div>

                <div className="mt-4 space-y-2 text-sm text-zinc-500">
                  {LOADING_STEPS.map((step, index) => (
                    <div key={step} className="flex items-center gap-2">
                      <span
                        className={`inline-block h-1.5 w-1.5 rounded-full ${
                          progress > index * 16 ? "bg-emerald-400" : "bg-zinc-700"
                        }`}
                      />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-[1.25rem] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  "Minimalistický web pro kliniku v Praze",
                  "Prémiový autoservis a detailing studio",
                  "Startup landing page s pricingem a FAQ",
                  "Luxusní realitní kancelář s lead CTA",
                ].map((sample) => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => setPrompt(sample)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <main className="min-h-0 p-4 md:p-5">
            <div className="flex h-full min-h-0 flex-col rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_10px_60px_-30px_rgba(0,0,0,0.8)]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("preview")}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      activeTab === "preview"
                        ? "bg-white/[0.10] text-white"
                        : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    Náhled
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab("code")}
                    className={`rounded-full px-4 py-2 text-sm transition ${
                      activeTab === "code"
                        ? "bg-white/[0.10] text-white"
                        : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    Kód
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {(["desktop", "tablet", "mobile"] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setViewMode(mode)}
                      className={`rounded-full px-3 py-2 text-xs uppercase tracking-[0.14em] transition ${
                        viewMode === mode
                          ? "bg-white/[0.10] text-white"
                          : "text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1 p-4">
                {activeTab === "preview" ? (
                  <div className="flex h-full min-h-0 items-start justify-center overflow-auto rounded-[1.5rem] border border-white/10 bg-[#060608] p-4">
                    {previewDocument ? (
                      <div
                        className={`${previewWidthClass} h-full overflow-hidden rounded-[1.25rem] border border-white/10 bg-black transition-all duration-300`}
                      >
                        <iframe
                          key={iframeKey}
                          title="Synto preview"
                          className="h-full min-h-[720px] w-full bg-white"
                          srcDoc={previewDocument}
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                    ) : (
                      <div className="flex h-full min-h-[400px] w-full items-center justify-center text-zinc-500">
                        Zatím není co zobrazit
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid h-full min-h-0 gap-4 lg:grid-cols-3">
                    <textarea
                      readOnly
                      value={html}
                      className="h-full min-h-[220px] resize-none rounded-[1.25rem] border border-white/10 bg-[#0b0b10] p-4 font-mono text-xs leading-6 text-zinc-200 outline-none"
                      placeholder="HTML output"
                    />
                    <textarea
                      readOnly
                      value={css}
                      className="h-full min-h-[220px] resize-none rounded-[1.25rem] border border-white/10 bg-[#0b0b10] p-4 font-mono text-xs leading-6 text-zinc-200 outline-none"
                      placeholder="CSS output"
                    />
                    <textarea
                      readOnly
                      value={js}
                      className="h-full min-h-[220px] resize-none rounded-[1.25rem] border border-white/10 bg-[#0b0b10] p-4 font-mono text-xs leading-6 text-zinc-200 outline-none"
                      placeholder="JS output"
                    />
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}