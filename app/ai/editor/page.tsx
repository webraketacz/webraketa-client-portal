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

type ChatMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  text: string;
};

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
  const [publishing, setPublishing] = useState(false);
  const [improving, setImproving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Připraveno");
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [viewMode, setViewMode] = useState<ViewMode>("desktop");

  const [improvePrompt, setImprovePrompt] = useState("");
  const [publishedUrl, setPublishedUrl] = useState("");
  const [buildType, setBuildType] = useState("");
  const [model, setModel] = useState("");
  const [briefLabel, setBriefLabel] = useState("");

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "system-1",
      role: "system",
      text: "Synto je připraven upravit layout, sekce, CTA, spacing i vizuální styl.",
    },
  ]);

  const progressRef = useRef<number | null>(null);
  const autostartRef = useRef(false);
  const improveInputRef = useRef<HTMLTextAreaElement | null>(null);

  const iframeKey = useMemo(
    () => `${html.length}-${css.length}-${js.length}`,
    [html, css, js]
  );

  const previewDocument = useMemo(() => {
    if (!html) return "";
    return buildPreviewDocument(html, css, js);
  }, [html, css, js]);

  useEffect(() => {
    const initialPrompt = sessionStorage.getItem("ai_webgen_prompt") ?? "";
    const autostart = sessionStorage.getItem("ai_webgen_autostart") === "1";
    const storedBuildType = sessionStorage.getItem("ai_webgen_build_type") ?? "";
    const storedModel = sessionStorage.getItem("ai_webgen_model") ?? "";

    if (initialPrompt) {
      setPrompt(initialPrompt);
      setMessages((prev) => [
        ...prev,
        {
          id: `user-initial-${Date.now()}`,
          role: "user",
          text: initialPrompt,
        },
      ]);
    }

    if (storedBuildType) setBuildType(storedBuildType);
    if (storedModel) setModel(storedModel);

    if (autostart && initialPrompt && !autostartRef.current) {
      autostartRef.current = true;
      sessionStorage.removeItem("ai_webgen_autostart");

      setTimeout(() => {
        handleGenerate(initialPrompt);
      }, 300);
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
    setPublishError(null);
    setPublishedUrl("");
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
        body: JSON.stringify({
          prompt: finalPrompt,
          buildType,
          model,
        }),
      });

      const data: GeneratorResponse & { error?: string } = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Generování selhalo");
      }

      const elapsed = Date.now() - startedAt;
      const minDelay = 7000;

      if (elapsed < minDelay) {
        await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
      }

      stopSmoothProgress(true);
      setHtml(data.html);
      setCss(data.css);
      setJs(data.js);

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-generate-${Date.now()}`,
          role: "assistant",
          text: "Návrh je připraven. Můžeš ho dál upravit přes levý panel.",
        },
      ]);

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

  async function handleImprove() {
    if (!html || !css) return;
    if (improvePrompt.trim().length < 6) return;

    const instruction = improvePrompt.trim();

    setImproving(true);
    setError(null);
    setPublishError(null);
    setPublishedUrl("");

    setMessages((prev) => [
      ...prev,
      {
        id: `user-improve-${Date.now()}`,
        role: "user",
        text: instruction,
      },
    ]);

    try {
      const res = await fetch("/api/improve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          instruction,
          html,
          css,
          js,
        }),
      });

      const data: GeneratorResponse & { error?: string } = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Úprava designu selhala");
      }

      setHtml(data.html);
      setCss(data.css);
      setJs(data.js);
      setActiveTab("preview");
      setImprovePrompt("");

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-improve-${Date.now()}`,
          role: "assistant",
          text: "Úprava byla aplikována do návrhu.",
        },
      ]);
    } catch (e: any) {
      setError(e?.message ?? "Úprava designu selhala");
    } finally {
      setImproving(false);
    }
  }

  async function handlePublish() {
    if (!html || !css) return;

    setPublishing(true);
    setPublishError(null);

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, html, css, js }),
      });

      const data: { url?: string; error?: string } = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data?.error ?? "Publikace selhala");
      }

      setPublishedUrl(data.url);
    } catch (e: any) {
      setPublishError(e?.message ?? "Publikace selhala");
    } finally {
      setPublishing(false);
    }
  }

  function focusEditInput() {
    improveInputRef.current?.focus();
  }

  const previewWidthClass =
    viewMode === "desktop"
      ? "w-full"
      : viewMode === "tablet"
      ? "mx-auto w-[900px] max-w-full"
      : "mx-auto w-[420px] max-w-full";

  return (
    <div className="relative h-dvh overflow-hidden bg-[#050507] text-zinc-100">
      <style jsx global>{`
        @keyframes syntoEditorFloatA {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(28px, -18px, 0) scale(1.04);
          }
        }

        @keyframes syntoEditorFloatB {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(-26px, 18px, 0) scale(1.05);
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.09]" />
      <div
        className="pointer-events-none absolute left-[-120px] top-[-120px] h-[24rem] w-[24rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(124,92,255,0.20) 0%, rgba(124,92,255,0.06) 35%, transparent 75%)",
          animation: "syntoEditorFloatA 16s ease-in-out infinite alternate",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[-140px] right-[-100px] h-[28rem] w-[28rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(90,209,255,0.16) 0%, rgba(90,209,255,0.05) 35%, transparent 75%)",
          animation: "syntoEditorFloatB 18s ease-in-out infinite alternate",
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <header className="border-b border-white/8 bg-[#07070b]/80 px-4 py-3 backdrop-blur-2xl md:px-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/ai"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <Icon icon="solar:arrow-left-linear" width={16} />
                Zpět
              </Link>

              <img
                src="/synto-logo.svg"
                alt="Synto"
                className="h-6 w-auto opacity-95 md:h-7"
              />

              {buildType && (
                <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400">
                  {buildType}
                </div>
              )}

              {model && (
                <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-400">
                  {model}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {briefLabel && (
                <div className="max-w-[48rem] truncate rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-zinc-400">
                  {briefLabel}
                </div>
              )}

              <button
                type="button"
                onClick={focusEditInput}
                disabled={!html}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                <Icon icon="solar:pen-2-linear" width={16} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => downloadZipSite(html, css, js)}
                disabled={!html}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                <Icon icon="solar:download-linear" width={16} />
                Export ZIP
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={!html || publishing}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/15 disabled:opacity-40"
              >
                <Icon icon="solar:upload-linear" width={16} />
                {publishing ? "Publikuji…" : "Publish"}
              </button>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="min-h-0 border-r border-white/8 bg-[#08080c]/85 backdrop-blur-2xl">
            <div className="flex h-full flex-col px-4 py-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-sm font-medium text-white">Chat</div>
                {loading && (
                  <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                    Generuji
                  </div>
                )}
              </div>

              <div className="mb-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                <div className="mb-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
                  Zadání
                </div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Popiš, co chceš vytvořit."
                  className="h-24 w-full resize-none rounded-xl border border-white/8 bg-[#06070a] p-3 text-sm text-white outline-none placeholder:text-zinc-500"
                />

                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={loading || prompt.trim().length < 12}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(124,92,255,1), rgba(90,209,255,0.92))",
                    boxShadow:
                      "0 10px 24px rgba(124,92,255,0.20), 0 0 28px rgba(90,209,255,0.08)",
                  }}
                >
                  {loading ? "Generuji…" : "Regenerovat návrh"}
                  <Icon icon="solar:arrow-up-linear" width={16} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isUser = message.role === "user";
                    const isSystem = message.role === "system";

                    return (
                      <div
                        key={message.id}
                        className={`max-w-[92%] rounded-2xl px-3 py-2.5 text-sm leading-6 ${
                          isUser
                            ? "ml-auto border border-cyan-500/15 bg-cyan-500/10 text-cyan-50"
                            : isSystem
                            ? "border border-white/8 bg-white/[0.03] text-zinc-400"
                            : "border border-white/8 bg-[#0b0b10] text-zinc-200"
                        }`}
                      >
                        {message.text}
                      </div>
                    );
                  })}

                  <div className="rounded-2xl border border-white/8 bg-[#0b0b10] p-3">
                    <div className="mb-2 flex items-center justify-between text-sm text-zinc-400">
                      <span>{status}</span>
                      <span>{Math.round(progress)}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          background:
                            "linear-gradient(90deg, rgba(124,92,255,1), rgba(90,209,255,1))",
                        }}
                      />
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-zinc-500">
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
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                <div className="mb-2 text-sm font-medium text-white">Upravit návrh</div>

                <textarea
                  ref={improveInputRef}
                  value={improvePrompt}
                  onChange={(e) => setImprovePrompt(e.target.value)}
                  placeholder="Např. Přidej výraznější hero, více vzduchu mezi sekcemi, luxusnější CTA a kvalitnější fotky."
                  className="h-24 w-full resize-none rounded-xl border border-white/8 bg-[#06070a] p-3 text-sm text-white outline-none placeholder:text-zinc-500"
                />

                <button
                  type="button"
                  onClick={handleImprove}
                  disabled={!html || improving || improvePrompt.trim().length < 6}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/15 disabled:opacity-40"
                >
                  <Icon icon="solar:pen-2-linear" width={16} />
                  {improving ? "Aplikuji úpravu…" : "Použít úpravu"}
                </button>
              </div>

              {publishedUrl && (
                <div className="mt-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                  <div className="mb-1 font-medium">Web publikován</div>
                  <a
                    href={publishedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all underline underline-offset-4"
                  >
                    {publishedUrl}
                  </a>
                </div>
              )}

              {publishError && (
                <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                  {publishError}
                </div>
              )}

              {error && (
                <div className="mt-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                  {error}
                </div>
              )}
            </div>
          </aside>

          <main className="min-h-0 bg-[#050507]">
            <div className="flex h-full min-h-0 flex-col">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-3 md:px-5">
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

              <div className="min-h-0 flex-1">
                {activeTab === "preview" ? (
                  <div className="flex h-full min-h-0 items-stretch justify-center overflow-auto px-3 py-0 md:px-4">
                    {previewDocument ? (
                      <div className={`${previewWidthClass} h-full`}>
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
                  <div className="grid h-full min-h-0 gap-3 px-3 py-3 md:grid-cols-3 md:px-4">
                    <textarea
                      readOnly
                      value={html}
                      className="h-full min-h-[220px] resize-none rounded-xl border border-white/8 bg-[#0b0b10] p-4 font-mono text-xs leading-6 text-zinc-200 outline-none"
                      placeholder="HTML output"
                    />
                    <textarea
                      readOnly
                      value={css}
                      className="h-full min-h-[220px] resize-none rounded-xl border border-white/8 bg-[#0b0b10] p-4 font-mono text-xs leading-6 text-zinc-200 outline-none"
                      placeholder="CSS output"
                    />
                    <textarea
                      readOnly
                      value={js}
                      className="h-full min-h-[220px] resize-none rounded-xl border border-white/8 bg-[#0b0b10] p-4 font-mono text-xs leading-6 text-zinc-200 outline-none"
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