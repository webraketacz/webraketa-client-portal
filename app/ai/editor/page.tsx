"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";

function downloadHtmlFile(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type GeneratorResponse = {
  html: string;
  brief?: {
    industry?: string;
    audience?: string;
    style?: string;
    layoutTone?: string;
  };
};

export default function AiEditorPage() {
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Připraveno");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [briefLabel, setBriefLabel] = useState<string>("");

  const progressRef = useRef<number | null>(null);
  const iframeKey = useMemo(() => `${html.length}-${Date.now()}`, [html]);

  useEffect(() => {
    const initial = sessionStorage.getItem("ai_webgen_prompt") ?? "";
    if (initial) setPrompt(initial);
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

    setProgress(2);
    setStatus("Rozbíhám AI builder...");

    progressRef.current = window.setInterval(() => {
      setProgress((prev) => {
        if (prev < 18) {
          setStatus("Analyzuji zadání a obor...");
          return prev + 2;
        }
        if (prev < 36) {
          setStatus("Připravuji design brief...");
          return prev + 1.8;
        }
        if (prev < 58) {
          setStatus("Navrhuji strukturu sekcí a vizuální směr...");
          return prev + 1.3;
        }
        if (prev < 76) {
          setStatus("Generuji HTML layout...");
          return prev + 0.9;
        }
        if (prev < 88) {
          setStatus("Ladím kompozici, CTA a styl...");
          return prev + 0.55;
        }
        if (prev < 95) {
          setStatus("Dokončuji preview a čistím výstup...");
          return prev + 0.2;
        }
        return prev;
      });
    }, 240);
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
      setStatus("Generování se nepodařilo");
    }
  }

  async function handleGenerate() {
    if (prompt.trim().length < 12) return;

    setLoading(true);
    setError(null);
    setHtml("");
    setBriefLabel("");
    setProgress(0);
    setActiveTab("preview");

    startSmoothProgress();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data: GeneratorResponse & { error?: string } = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Generování selhalo");
      }

      stopSmoothProgress(true);
      setHtml(data.html);

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

  return (
    <div className="h-dvh overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none fixed left-[8%] top-0 h-[28rem] w-[28rem] -translate-y-1/3 rounded-full bg-violet-600/20 blur-[140px]" />
      <div className="pointer-events-none fixed bottom-0 right-[5%] h-[32rem] w-[32rem] translate-y-1/3 rounded-full bg-blue-600/10 blur-[140px]" />
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 flex h-full flex-col">
        <header className="border-b border-white/10 bg-zinc-950/70 px-4 py-3 backdrop-blur-xl md:px-6">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06]">
                  <Icon icon="solar:magic-stick-3-linear" width={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">AI Web Generator</div>
                  <div className="text-xs text-zinc-500">Editor</div>
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
                onClick={() => html && downloadHtmlFile("webraketa-generated-site.html", html)}
                disabled={!html}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon icon="solar:download-linear" width={16} />
                Export HTML
              </button>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[520px_minmax(0,1fr)]">
          {/* LEFT */}
          <aside className="min-h-0 border-r border-white/10 bg-zinc-950/55 p-4 backdrop-blur-xl md:p-5">
            <div className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
              <div className="mb-4 flex items-center gap-2">
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
                placeholder="Popiš, co chceš vytvořit. Čím konkrétnější zadání, tím lepší výsledek."
                className="h-56 w-full resize-none rounded-[1.5rem] border border-white/10 bg-zinc-950/60 p-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
              />

              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading || prompt.trim().length < 12}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Generuji..." : "Vygenerovat web"}
                <Icon icon="solar:arrow-up-linear" width={16} />
              </button>

              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-zinc-950/50 p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-zinc-400">
                  <span>{status}</span>
                  <span>{Math.round(progress)}%</span>
                </div>

                <div className="h-2.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-4 space-y-2 text-sm text-zinc-500">
                  <div>• 1. AI připraví design brief podle oboru</div>
                  <div>• 2. Navrhne jiný vizuální směr a kompozici</div>
                  <div>• 3. Až potom vygeneruje HTML + Tailwind</div>
                </div>
              </div>

              {error && (
                <div className="mt-4 rounded-[1.25rem] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                  {error}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  "Minimalistický web pro kliniku",
                  "Prémiový autoservis a detailing",
                  "Startup landing page s pricingem",
                  "Luxusní realitní kancelář",
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

          {/* RIGHT */}
          <main className="min-h-0 p-4 md:p-5">
            <div className="flex h-full min-h-0 flex-col rounded-[2rem] border border-white/10 bg-white/[0.04]">
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
                    HTML kód
                  </button>
                </div>

                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Full-screen editor
                </div>
              </div>

              <div className="min-h-0 flex-1 p-4">
                {activeTab === "preview" ? (
                  <div className="h-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
                    {html ? (
                      <iframe
                        key={iframeKey}
                        title="AI preview"
                        className="h-full w-full"
                        srcDoc={html}
                        sandbox="allow-same-origin"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-zinc-500">
                        Zatím nic...
                      </div>
                    )}
                  </div>
                ) : (
                  <textarea
                    readOnly
                    value={html}
                    className="h-full w-full resize-none rounded-[1.5rem] border border-white/10 bg-zinc-950/60 p-4 font-mono text-xs leading-6 text-zinc-200 outline-none"
                    placeholder="Tady se po vygenerování objeví HTML výstup."
                  />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}