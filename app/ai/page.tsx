"use client";

import { useMemo, useState } from "react";

export default function AiPage() {
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iframeKey = useMemo(() => String(Date.now()), [html]);

  const onGenerate = async () => {
    setLoading(true);
    setError(null);
    setHtml("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Request failed");

      setHtml(data.html);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
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
              placeholder="Např. Landing page pro stavební firmu, moderní, CTA, reference..."
              className="mt-2 h-56 w-full rounded-2xl border border-white/10 bg-zinc-950/40 p-4 text-zinc-100 outline-none placeholder:text-zinc-500 focus:ring-2 focus:ring-white/10"
            />

            <button
              onClick={onGenerate}
              disabled={loading || prompt.trim().length < 10}
              className="mt-4 w-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Generuju…" : "Vygenerovat"}
            </button>

            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Náhled
            </div>

            <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-black">
              {html ? (
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