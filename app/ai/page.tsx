"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const STATUS_MESSAGES = [
  "Čtu zadání klienta...",
  "Analyzuji typ webu...",
  "Navrhuji strukturu sekcí...",
  "Generuji HTML layout...",
  "Aplikuji Tailwind styly...",
  "Ladím CTA a vizuální hierarchii...",
  "Připravuji finální náhled...",
  "Dokončuji výstup...",
];

function wrapHtmlDocument(html: string) {
  const normalized = html.toLowerCase();

  const hasDoctype = normalized.includes("<!doctype html>");
  const hasHtml = normalized.includes("<html");
  const hasHead = normalized.includes("<head>");
  const hasBody = normalized.includes("<body");

  if (hasDoctype && hasHtml && hasHead && hasBody) {
    return html;
  }

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AI Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-zinc-950 text-white">
${html}
</body>
</html>`;
}

function slugifyFilename(input: string) {
  return (
    input
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "generated-website"
  );
}

export default function AiPage() {
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Připraveno");
  const [liveOutput, setLiveOutput] = useState("");

  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const statusIndexRef = useRef(0);

  const iframeKey = useMemo(() => `${Date.now()}-${html.length}`, [html]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (statusIntervalRef.current) clearInterval(statusIntervalRef.current);
    };
  }, []);

  const resetIntervals = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    if (statusIntervalRef.current) {
      clearInterval(statusIntervalRef.current);
      statusIntervalRef.current = null;
    }
  };

  const startSmoothProgress = () => {
    resetIntervals();

    statusIndexRef.current = 0;
    setProgress(1);
    setStatus("Spouštím AI generování...");
    setLiveOutput("• Spouštím AI generování...\n");

    // Plynulý progress až do 95 %
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) return prev;

        let increment = 0;

        if (prev < 20) increment = 2.4;
        else if (prev < 40) increment = 1.8;
        else if (prev < 60) increment = 1.3;
        else if (prev < 80) increment = 0.85;
        else increment = 0.35;

        const next = Math.min(prev + increment, 95);
        return Number(next.toFixed(1));
      });
    }, 350);

    // Rotace statusů
    statusIntervalRef.current = setInterval(() => {
      const message = STATUS_MESSAGES[statusIndexRef.current % STATUS_MESSAGES.length];
      setStatus(message);
      setLiveOutput((prev) => {
        const nextLine = `• ${message}\n`;
        return prev.includes(nextLine) ? prev : prev + nextLine;
      });
      statusIndexRef.current += 1;
    }, 1800);
  };

  const finishProgress = async () => {
    resetIntervals();

    setStatus("Dokončuji výstup...");
    setLiveOutput((prev) => prev + "• Dokončuji výstup...\n");

    await new Promise<void>((resolve) => {
      const finishInterval = setInterval(() => {
        setProgress((prev) => {
          const next = Math.min(prev + 2.5, 100);
          if (next >= 100) {
            clearInterval(finishInterval);
            resolve();
          }
          return Number(next.toFixed(1));
        });
      }, 40);
    });

    setStatus("Hotovo");
    setLiveOutput((prev) => prev + "• Web úspěšně vygenerován.\n");
  };

  const downloadHtml = () => {
    if (!html) return;

    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const filename = `${slugifyFilename(prompt || "generated-website")}.html`;

    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  };

  const copyHtml = async () => {
    if (!html) return;
    await navigator.clipboard.writeText(html);
  };

  const onGenerate = async () => {
    setLoading(true);
    setError(null);
    setHtml("");
    setProgress(0);
    setStatus("Spouštím AI generování...");
    setLiveOutput("");

    startSmoothProgress();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Request failed");
      }

      const wrappedHtml = wrapHtmlDocument(data.html);
      setHtml(wrappedHtml);

      await finishProgress();
    } catch (e: any) {
      resetIntervals();
      setError(e.message ?? "Generování se nepodařilo");
      setStatus("Generování se nepodařilo");
      setLiveOutput((prev) => prev + "• Došlo k chybě při generování.\n");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 250);
    }
  };

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-2xl font-semibold">AI Web Generator (DEMO)</h1>
        <p className="mt-2 text-zinc-400">
          Zadej popis webu a AI vygeneruje HTML + Tailwind.
        </p>

        <div className="mt-6 grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
            <label className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Popis webu
            </label>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Např. Moderní landing page pro autoservis, tmavý premium styl, CTA, reference, služby, kontakt..."
              className="mt-2 h-56 w-full rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-zinc-100 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-white/10"
            />

            <button
              onClick={onGenerate}
              disabled={loading || prompt.trim().length < 10}
              className="mt-4 w-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 py-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generuju…" : "Vygenerovat"}
            </button>

            {(loading || progress > 0) && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-zinc-950/50 p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-zinc-400">
                  <div className="flex items-center gap-2">
                    {loading && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                    )}
                    <span>{status}</span>
                  </div>
                  <span>{Math.round(progress)}%</span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Náhled
              </div>

              {html && !loading && (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={copyHtml}
                    className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white transition hover:bg-white/[0.10]"
                  >
                    Kopírovat HTML
                  </button>
                  <button
                    onClick={downloadHtml}
                    className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
                  >
                    Export HTML
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black">
              {loading ? (
                <div className="flex h-[720px] flex-col">
                  <div className="border-b border-white/10 px-4 py-3 text-sm text-zinc-400">
                    AI právě generuje náhled webu...
                  </div>

                  <div className="flex-1 overflow-auto p-4">
                    <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-6 text-zinc-300">
                      {liveOutput || "Inicializuji generování..."}
                    </pre>
                  </div>
                </div>
              ) : html ? (
                <iframe
                  key={iframeKey}
                  title="preview"
                  className="h-[720px] w-full bg-white"
                  srcDoc={html}
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="flex h-[720px] items-center justify-center text-zinc-500">
                  Zatím nic…
                </div>
              )}
            </div>

            {html && (
              <>
                <div className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  HTML výstup
                </div>
                <textarea
                  readOnly
                  value={html}
                  className="mt-2 h-56 w-full rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-xs text-zinc-100"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}