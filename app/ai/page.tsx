"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const GENERATION_STEPS = [
  { progress: 8, status: "Čtu zadání klienta..." },
  { progress: 18, status: "Analyzuji typ webu..." },
  { progress: 32, status: "Navrhuji strukturu sekcí..." },
  { progress: 48, status: "Generuji HTML layout..." },
  { progress: 64, status: "Aplikuji Tailwind styly..." },
  { progress: 78, status: "Ladím CTA a vizuální hierarchy..." },
  { progress: 89, status: "Připravuji finální náhled..." },
  { progress: 94, status: "Dokončuji výstup..." },
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
<body class="bg-zinc-950 text-white">
${html}
</body>
</html>`;
}

export default function AiPage() {
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Připraveno");
  const [liveOutput, setLiveOutput] = useState("");

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepIndexRef = useRef(0);

  const iframeKey = useMemo(() => `${Date.now()}-${html.length}`, [html]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startFakeProgress = () => {
    stepIndexRef.current = 0;
    setProgress(5);
    setStatus("Spouštím AI generování...");
    setLiveOutput("");

    intervalRef.current = setInterval(() => {
      const step = GENERATION_STEPS[stepIndexRef.current];

      if (!step) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      setProgress((prev) => Math.max(prev, step.progress));
      setStatus(step.status);

      setLiveOutput((prev) => {
        const nextLine = `• ${step.status}\n`;
        return prev + nextLine;
      });

      stepIndexRef.current += 1;
    }, 900);
  };

  const stopFakeProgress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const onGenerate = async () => {
    setLoading(true);
    setError(null);
    setHtml("");
    setProgress(0);
    setStatus("Spouštím AI generování...");
    setLiveOutput("");

    startFakeProgress();

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

      stopFakeProgress();
      setProgress(100);
      setStatus("Hotovo");
      setLiveOutput((prev) => prev + "• Web úspěšně vygenerován.\n");

      setHtml(wrapHtmlDocument(data.html));
    } catch (e: any) {
      stopFakeProgress();
      setError(e.message ?? "Generování se nepodařilo");
      setStatus("Generování se nepodařilo");
      setLiveOutput((prev) => prev + "• Došlo k chybě při generování.\n");
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 350);
    }
  };

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-semibold">AI Web Generator (DEMO)</h1>
        <p className="mt-2 text-zinc-400">
          Zadej popis webu a AI vygeneruje HTML + Tailwind.
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
                  <span>{progress}%</span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Náhled
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black">
              {loading ? (
                <div className="flex h-[520px] flex-col">
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
                  className="h-[520px] w-full"
                  srcDoc={html}
                  sandbox="allow-same-origin"
                />
              ) : (
                <div className="flex h-[520px] items-center justify-center text-zinc-500">
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
                  className="mt-2 h-40 w-full rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-xs text-zinc-100"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}