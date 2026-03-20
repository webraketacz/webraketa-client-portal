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
type ActiveTab = "preview" | "code";

type ChatMessage = {
  id: string;
  role: "system" | "user" | "assistant";
  text: string;
};

type SectionMeta = {
  id: string;
  type: string;
  label: string;
};

const GENERATE_LOADING_MESSAGES = [
  "Rozumím zadání…",
  "Analyzuji obor a cílový dojem…",
  "Připravuji strukturu webu…",
  "Navrhuji sekce a kompozici…",
  "Generuji layout a vizuální směr…",
  "Tvořím HTML, CSS a interakce…",
  "Ladím responzivitu…",
  "Dolaďuji CTA a detaily…",
  "Finalizuji výstup…",
];

const IMPROVE_LOADING_MESSAGES = [
  "Analyzuji úpravy…",
  "Porovnávám aktuální návrh…",
  "Vyhodnocuji změny textů a layoutu…",
  "Připravuji úpravy struktury a stylu…",
  "Aplikuji změny do HTML a CSS…",
  "Kontroluji konzistenci návrhu…",
  "Ladím výsledný vzhled…",
  "Finalizuji upravený výstup…",
];

function prettifySectionLabel(id: string, type: string) {
  const source = type || id || "sekce";
  return source
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function extractSectionsFromHtml(html: string): SectionMeta[] {
  if (!html) return [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");
    const nodes = Array.from(doc.querySelectorAll("[data-section-id]"));

    const sections = nodes
      .map((node) => {
        const id = node.getAttribute("data-section-id") || "";
        const type = node.getAttribute("data-section-type") || "";
        if (!id) return null;

        return {
          id,
          type,
          label: prettifySectionLabel(id, type),
        };
      })
      .filter(Boolean) as SectionMeta[];

    const unique = new Map<string, SectionMeta>();
    for (const section of sections) {
      if (!unique.has(section.id)) {
        unique.set(section.id, section);
      }
    }

    return Array.from(unique.values());
  } catch {
    return [];
  }
}

function buildPreviewDocument(
  html: string,
  css: string,
  js: string,
  selectedSectionId: string | null
) {
  const safeSelected = selectedSectionId ? JSON.stringify(selectedSectionId) : "null";

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Zyvia Preview</title>
  <style>
${css}

html {
  scroll-behavior: smooth;
}

body {
  position: relative;
}

[data-section-id] {
  transition: outline-color .18s ease, box-shadow .18s ease, transform .18s ease;
}

[data-section-id].zyvia-section-hover {
  outline: 2px solid rgba(90, 209, 255, 0.45);
  outline-offset: 4px;
  box-shadow: 0 0 0 4px rgba(90, 209, 255, 0.08);
  cursor: pointer !important;
}

[data-section-id].zyvia-section-selected {
  outline: 2px solid rgba(124, 92, 255, 0.75);
  outline-offset: 4px;
  box-shadow:
    0 0 0 4px rgba(124, 92, 255, 0.14),
    0 10px 30px rgba(124, 92, 255, 0.16);
}

.zyvia-section-badge {
  position: absolute;
  z-index: 999999;
  pointer-events: none;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(9, 10, 15, 0.92);
  color: #fff;
  font: 12px/1.2 Inter, system-ui, sans-serif;
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 8px 22px rgba(0,0,0,0.20);
  transform: translateY(-10px);
  white-space: nowrap;
}
  </style>
</head>
<body>
${html}
<script>
${js}
</script>

<script>
(function () {
  const SELECTED_SECTION_ID = ${safeSelected};
  let badgeEl = null;

  function ensureBadge() {
    if (badgeEl) return badgeEl;
    badgeEl = document.createElement("div");
    badgeEl.className = "zyvia-section-badge";
    badgeEl.style.display = "none";
    document.body.appendChild(badgeEl);
    return badgeEl;
  }

  function getSectionFromEventTarget(target) {
    if (!target || !(target instanceof Element)) return null;
    return target.closest("[data-section-id]");
  }

  function clearHoverStates() {
    document.querySelectorAll("[data-section-id].zyvia-section-hover").forEach((node) => {
      node.classList.remove("zyvia-section-hover");
    });
  }

  function applySelectedState() {
    document.querySelectorAll("[data-section-id]").forEach((node) => {
      const id = node.getAttribute("data-section-id");
      node.classList.toggle("zyvia-section-selected", id === SELECTED_SECTION_ID);
    });
  }

  function moveBadgeForSection(section) {
    const badge = ensureBadge();
    const rect = section.getBoundingClientRect();

    badge.textContent =
      section.getAttribute("data-section-type") ||
      section.getAttribute("data-section-id") ||
      "Sekce";

    badge.style.display = "block";
    badge.style.left = window.scrollX + rect.left + 8 + "px";
    badge.style.top = window.scrollY + rect.top + 8 + "px";
  }

  function hideBadge() {
    if (!badgeEl) return;
    badgeEl.style.display = "none";
  }

  function preventNavigation(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const clickable = target.closest("a, button");
    const section = getSectionFromEventTarget(target);

    if (clickable && section) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  document.addEventListener("mouseover", function (event) {
    const section = getSectionFromEventTarget(event.target);
    clearHoverStates();

    if (section) {
      section.classList.add("zyvia-section-hover");
      moveBadgeForSection(section);
    } else {
      hideBadge();
    }
  });

  document.addEventListener("mouseout", function (event) {
    const related = event.relatedTarget;
    if (related instanceof Element && related.closest("[data-section-id]")) return;
    clearHoverStates();
    hideBadge();
  });

  document.addEventListener("click", function (event) {
    const section = getSectionFromEventTarget(event.target);
    preventNavigation(event);

    if (!section) return;

    event.preventDefault();
    event.stopPropagation();

    const payload = {
      type: "zyvia-section-select",
      sectionId: section.getAttribute("data-section-id") || "",
      sectionType: section.getAttribute("data-section-type") || "",
    };

    window.parent.postMessage(payload, "*");
  }, true);

  applySelectedState();

  window.addEventListener("load", applySelectedState);
})();
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
  a.download = "zyvia-export.zip";
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
  const [publishedUrl, setPublishedUrl] = useState("");

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Připraveno");

  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [activeTab, setActiveTab] = useState<ActiveTab>("preview");

  const [buildType, setBuildType] = useState("");
  const [model, setModel] = useState("");
  const [briefLabel, setBriefLabel] = useState("");

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedSectionType, setSelectedSectionType] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "system-initial",
      role: "system",
      text: "Zyvia je připravena upravit layout, sekce, CTA, spacing i vizuální styl.",
    },
  ]);

  const [chatInput, setChatInput] = useState("");

  const progressRef = useRef<number | null>(null);
  const loadingMessageRef = useRef<number>(0);
  const autostartRef = useRef(false);
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);

  const iframeKey = useMemo(
    () => `${html.length}-${css.length}-${js.length}-${selectedSectionId ?? "none"}`,
    [html, css, js, selectedSectionId]
  );

  const availableSections = useMemo(() => extractSectionsFromHtml(html), [html]);

  const selectedSectionMeta = useMemo(() => {
    if (!selectedSectionId) return null;
    return (
      availableSections.find((section) => section.id === selectedSectionId) || {
        id: selectedSectionId,
        type: selectedSectionType || "",
        label: prettifySectionLabel(selectedSectionId, selectedSectionType || ""),
      }
    );
  }, [availableSections, selectedSectionId, selectedSectionType]);

  const previewDocument = useMemo(() => {
    if (!html) return "";
    return buildPreviewDocument(html, css, js, selectedSectionId);
  }, [html, css, js, selectedSectionId]);

  function getChatHistoryPayload() {
    return messages.slice(-12).map((message) => ({
      role: message.role,
      text: message.text,
    }));
  }

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
    function onMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== "object") return;
      if (data.type !== "zyvia-section-select") return;

      setSelectedSectionId(data.sectionId || null);
      setSelectedSectionType(data.sectionType || null);

      if (data.sectionId) {
        setMessages((prev) => {
          const alreadyExists = prev.some(
            (message) =>
              message.role === "system" &&
              message.text === `Vybraná sekce: ${prettifySectionLabel(data.sectionId, data.sectionType || "")}`
          );

          if (alreadyExists) return prev;

          return [
            ...prev,
            {
              id: `section-select-${Date.now()}`,
              role: "system",
              text: `Vybraná sekce: ${prettifySectionLabel(data.sectionId, data.sectionType || "")}`,
            },
          ];
        });
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    return () => {
      if (progressRef.current) {
        window.clearInterval(progressRef.current);
      }
    };
  }, []);

  function startSmoothProgress(mode: "generate" | "improve") {
    if (progressRef.current) window.clearInterval(progressRef.current);

    const source =
      mode === "generate" ? GENERATE_LOADING_MESSAGES : IMPROVE_LOADING_MESSAGES;

    loadingMessageRef.current = 0;
    setProgress(2);
    setStatus(source[0]);

    progressRef.current = window.setInterval(() => {
      loadingMessageRef.current = (loadingMessageRef.current + 1) % source.length;
      setStatus(source[loadingMessageRef.current]);

      setProgress((prev) => {
        const speed =
          mode === "generate" ? Math.random() * 2.8 + 0.8 : Math.random() * 3.2 + 1.0;
        const next = prev + speed;
        return next >= 98 ? 98 : next;
      });
    }, 900);
  }

  function stopSmoothProgress(success = true, finalStatus?: string) {
    if (progressRef.current) {
      window.clearInterval(progressRef.current);
      progressRef.current = null;
    }

    if (success) {
      setProgress(100);
      setStatus(finalStatus || "Hotovo");
    } else {
      setStatus(finalStatus || "Operace selhala");
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
    setSelectedSectionId(null);
    setSelectedSectionType(null);
    setProgress(0);
    setActiveTab("preview");

    startSmoothProgress("generate");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          buildType,
          model,
          chatHistory: getChatHistoryPayload(),
        }),
      });

      const data: GeneratorResponse & { error?: string } = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Generování selhalo");
      }

      stopSmoothProgress(true, "Web byl úspěšně vygenerován");
      setHtml(data.html);
      setCss(data.css);
      setJs(data.js);

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-generate-${Date.now()}`,
          role: "assistant",
          text: "Návrh je připraven. Klikni na sekci v náhledu nebo mi napiš změnu.",
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
      stopSmoothProgress(false, "Generování selhalo");
      setError(e?.message ?? "Generování selhalo");
    } finally {
      setTimeout(() => setLoading(false), 250);
    }
  }

  async function handleImprove(instructionOverride?: string) {
    if (!html || !css) return;

    const instruction = (instructionOverride ?? chatInput).trim();
    if (instruction.length < 3) return;

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

    startSmoothProgress("improve");

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
          chatHistory: getChatHistoryPayload(),
        }),
      });

      const data: GeneratorResponse & { error?: string } = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Úprava designu selhala");
      }

      stopSmoothProgress(true, "Úpravy byly úspěšně aplikovány");
      setHtml(data.html);
      setCss(data.css);
      setJs(data.js);
      setChatInput("");
      setActiveTab("preview");

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-improve-${Date.now()}`,
          role: "assistant",
          text: "Úprava byla aplikována do návrhu.",
        },
      ]);
    } catch (e: any) {
      stopSmoothProgress(false, "Úpravy se nepodařilo dokončit");
      setError(e?.message ?? "Úprava designu selhala");
    } finally {
      setTimeout(() => setImproving(false), 250);
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
    chatInputRef.current?.focus();
  }

  function onChatKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleImprove();
    }
  }

  function useSectionAction(type: "text" | "visual" | "regenerate" | "move-up" | "move-down") {
    if (!selectedSectionMeta) return;

    const sectionName = selectedSectionMeta.label;
    const prompts: Record<typeof type, string> = {
      text: `Uprav texty v sekci ${sectionName}, aby byly přesvědčivější a lépe strukturované.`,
      visual: `Vylepši vizuál sekce ${sectionName}, přidej lepší hierarchii, spacing a výraznější kompozici.`,
      regenerate: `Přegeneruj sekci ${sectionName} v novém, kvalitnějším layoutu, ale zachovej celkový styl webu.`,
      "move-up": `Posuň sekci ${sectionName} výše v rámci stránky a uprav návaznost sekcí.`,
      "move-down": `Posuň sekci ${sectionName} níže v rámci stránky a uprav návaznost sekcí.`,
    };

    setChatInput(prompts[type]);
    chatInputRef.current?.focus();
  }

  const previewWidthClass =
    viewMode === "desktop"
      ? "w-full"
      : viewMode === "tablet"
      ? "mx-auto w-[920px] max-w-full"
      : "mx-auto w-[430px] max-w-full";

  return (
    <div className="relative h-dvh overflow-hidden bg-[#050507] text-zinc-100">
      <style jsx global>{`
        @keyframes zyviaEditorFloatA {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(28px, -18px, 0) scale(1.04);
          }
        }

        @keyframes zyviaEditorFloatB {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(-26px, 18px, 0) scale(1.05);
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.08]" />
      <div
        className="pointer-events-none absolute left-[-120px] top-[-120px] h-[24rem] w-[24rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(124,92,255,0.18) 0%, rgba(124,92,255,0.05) 35%, transparent 75%)",
          animation: "zyviaEditorFloatA 16s ease-in-out infinite alternate",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[-140px] right-[-100px] h-[28rem] w-[28rem] rounded-full blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(90,209,255,0.14) 0%, rgba(90,209,255,0.05) 35%, transparent 75%)",
          animation: "zyviaEditorFloatB 18s ease-in-out infinite alternate",
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <header className="border-b border-white/8 bg-[#07070b]/80 px-4 py-3 backdrop-blur-2xl">
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
                src="/zyvia-logo.svg"
                alt="Zyvia"
                className="h-5 w-auto opacity-90"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
                <button
                  type="button"
                  onClick={() => setViewMode("desktop")}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
                    viewMode === "desktop"
                      ? "bg-white/[0.10] text-white"
                      : "text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                  }`}
                  title="Desktop"
                >
                  <Icon icon="solar:monitor-linear" width={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("tablet")}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
                    viewMode === "tablet"
                      ? "bg-white/[0.10] text-white"
                      : "text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                  }`}
                  title="Tablet"
                >
                  <Icon icon="solar:tablet-linear" width={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode("mobile")}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition ${
                    viewMode === "mobile"
                      ? "bg-white/[0.10] text-white"
                      : "text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                  }`}
                  title="Mobil"
                >
                  <Icon icon="solar:smartphone-linear" width={18} />
                </button>
              </div>

              <button
                type="button"
                onClick={focusEditInput}
                disabled={!html}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                <Icon icon="solar:pen-2-linear" width={16} />
                Upravit
              </button>

              <button
                type="button"
                onClick={() => downloadZipSite(html, css, js)}
                disabled={!html}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
              >
                <Icon icon="solar:download-linear" width={16} />
                Export
              </button>

              <button
                type="button"
                onClick={handlePublish}
                disabled={!html || publishing}
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 transition hover:bg-emerald-500/15 disabled:opacity-40"
              >
                <Icon icon="solar:upload-linear" width={16} />
                {publishing ? "Publikuji…" : "Publikovat"}
              </button>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="min-h-0 border-r border-white/8 bg-[#08080c]/88 backdrop-blur-2xl">
            <div className="flex h-full flex-col">
              <div className="border-b border-white/8 px-4 py-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-medium text-white">Projekt</div>
                  {(loading || improving) && (
                    <div className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs text-violet-300">
                      {loading ? "Generuji" : "Upravuji"}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-sm text-zinc-300">
                  {prompt || "Zatím není zadání"}
                </div>

                {briefLabel && (
                  <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.03] p-3 text-xs leading-6 text-zinc-500">
                    {briefLabel}
                  </div>
                )}

                {selectedSectionMeta && (
                  <div className="mt-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-3">
                    <div className="text-xs uppercase tracking-[0.16em] text-cyan-200/80">
                      Vybraná sekce
                    </div>
                    <div className="mt-2 text-sm font-medium text-white">
                      {selectedSectionMeta.label}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => useSectionAction("text")}
                        className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-zinc-200 transition hover:bg-white/[0.10]"
                      >
                        Upravit text
                      </button>
                      <button
                        type="button"
                        onClick={() => useSectionAction("visual")}
                        className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-zinc-200 transition hover:bg-white/[0.10]"
                      >
                        Vylepšit vzhled
                      </button>
                      <button
                        type="button"
                        onClick={() => useSectionAction("regenerate")}
                        className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-zinc-200 transition hover:bg-white/[0.10]"
                      >
                        Přegenerovat
                      </button>
                      <button
                        type="button"
                        onClick={() => useSectionAction("move-up")}
                        className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-zinc-200 transition hover:bg-white/[0.10]"
                      >
                        Posunout výš
                      </button>
                      <button
                        type="button"
                        onClick={() => useSectionAction("move-down")}
                        className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-zinc-200 transition hover:bg-white/[0.10]"
                      >
                        Posunout níž
                      </button>
                    </div>
                  </div>
                )}

                {availableSections.length > 0 && (
                  <div className="mt-3">
                    <div className="mb-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
                      Sekce stránky
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableSections.map((section) => (
                        <button
                          key={section.id}
                          type="button"
                          onClick={() => {
                            setSelectedSectionId(section.id);
                            setSelectedSectionType(section.type);
                          }}
                          className={`rounded-full border px-3 py-2 text-xs transition ${
                            selectedSectionId === section.id
                              ? "border-cyan-400/30 bg-cyan-500/10 text-white"
                              : "border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                          }`}
                        >
                          {section.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={loading || improving || prompt.trim().length < 12}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white transition disabled:opacity-50"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(124,92,255,1), rgba(90,209,255,0.92))",
                    boxShadow:
                      "0 10px 24px rgba(124,92,255,0.20), 0 0 28px rgba(90,209,255,0.08)",
                  }}
                >
                  {loading ? "Generuji…" : improving ? "Probíhá úprava…" : "Regenerovat návrh"}
                  <Icon icon="solar:arrow-up-linear" width={16} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
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

                    <div className="mt-3 text-xs leading-6 text-zinc-500">
                      {loading
                        ? "Probíhá generování návrhu a průběžná optimalizace výstupu."
                        : improving
                        ? "Probíhá zpracování úprav a aplikace změn do návrhu."
                        : selectedSectionMeta
                        ? "Kliknutím v náhledu vybíráš konkrétní sekce pro úpravy."
                        : "Klikni do náhledu na konkrétní sekci, kterou chceš upravit."}
                    </div>
                  </div>

                  {publishedUrl && (
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
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
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                      {publishError}
                    </div>
                  )}

                  {error && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-white/8 px-4 py-4">
                <div className="mb-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
                  Upravit návrh
                </div>

                <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-3">
                  <textarea
                    ref={chatInputRef}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={onChatKeyDown}
                    placeholder={
                      selectedSectionMeta
                        ? `Napiš úpravu pro sekci ${selectedSectionMeta.label.toLowerCase()}…`
                        : "Napiš úpravu návrhu… například: Uprav hero, přidej více prostoru, vylepši CTA."
                    }
                    className="h-16 w-full resize-none bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                  />

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="text-xs text-zinc-500">
                      Enter odešle úpravu
                    </div>

                    <button
                      type="button"
                      onClick={() => handleImprove()}
                      disabled={!html || loading || improving || chatInput.trim().length < 3}
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/15 disabled:opacity-40"
                    >
                      <Icon icon="solar:pen-2-linear" width={16} />
                      {improving ? "Upravuji…" : "Použít"}
                    </button>
                  </div>
                </div>
              </div>
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

                {(buildType || model) && (
                  <div className="flex flex-wrap items-center gap-2">
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
                )}
              </div>

              <div className="min-h-0 flex-1">
                {activeTab === "preview" ? (
                  <div className="flex h-full min-h-0 items-stretch justify-center overflow-auto px-2 py-0 md:px-3">
                    {previewDocument ? (
                      <div className={`${previewWidthClass} h-full`}>
                        <iframe
                          key={iframeKey}
                          title="Zyvia preview"
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
                  <div className="grid h-full min-h-0 gap-3 px-3 py-3 md:grid-cols-3">
                    <textarea
                      readOnly
                      value={html}
                      className="h-full min-h-[220px] resize-none rounded-xl border border-white/8 bg-[#0b0b10] p-4 font-mono text-xs leading-6 text-zinc-200 outline-none"
                      placeholder="HTML výstup"
                    />
                    <textarea
                      readOnly
                      value={css}
                      className="h-full min-h-[220px] resize-none rounded-xl border border-white/8 bg-[#0b0b10] p-4 font-mono text-xs leading-6 text-zinc-200 outline-none"
                      placeholder="CSS výstup"
                    />
                    <textarea
                      readOnly
                      value={js}
                      className="h-full min-h-[220px] resize-none rounded-xl border border-white/8 bg-[#0b0b10] p-4 font-mono text-xs leading-6 text-zinc-200 outline-none"
                      placeholder="JS výstup"
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