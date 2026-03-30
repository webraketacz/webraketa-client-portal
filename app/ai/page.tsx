"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

type AttachmentItem = {
  id: string;
  name: string;
  kind: "screenshot" | "file";
};

type SourceMode = "prompt" | "url" | "screenshot" | "html";

type LayoutPreference =
  | "auto"
  | "editorial"
  | "split"
  | "asymmetrical"
  | "story"
  | "grid"
  | "luxury";

type VisualStyle =
  | "auto"
  | "clean"
  | "premium"
  | "bold"
  | "editorial"
  | "luxury"
  | "playful";

type AnimationLevel = "minimal" | "subtle" | "rich" | "expressive";

type FontMood =
  | "auto"
  | "geometric"
  | "editorial"
  | "luxury"
  | "trustworthy"
  | "tech"
  | "friendly";

type ButtonStyle =
  | "auto"
  | "soft-pill"
  | "glass"
  | "solid-premium"
  | "outline-elegant"
  | "gradient-glow";

type PromptEnhancerMode =
  | "balanced"
  | "conversion"
  | "premium-brand"
  | "wow-creative";

type TypefaceFamily =
  | "auto"
  | "sans"
  | "serif"
  | "rounded"
  | "condensed"
  | "mono";

type FontChoice =
  | "auto"
  | "inter"
  | "manrope"
  | "geist"
  | "playfair"
  | "instrument-serif"
  | "plex-serif";

type HeadingSizePreset = "sm" | "md" | "lg" | "xl";
type BodySizePreset = "sm" | "md" | "lg" | "xl";
type HeadingWeightPreset =
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold";
type LetterSpacingPreset = "tight" | "normal" | "wide";

type AnimationType =
  | "auto"
  | "fade"
  | "slide"
  | "scale"
  | "blur"
  | "rotate"
  | "glow";

type AnimationScene =
  | "auto"
  | "all-at-once"
  | "sequence"
  | "word-by-word"
  | "letter-by-letter";

type TimingPreset =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "spring";

type IterationPreset = "once" | "twice" | "thrice" | "infinite";
type DirectionPreset =
  | "normal"
  | "reverse"
  | "alternate"
  | "alternate-reverse";

type AccentColorPreset =
  | "auto"
  | "cyan"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "amber"
  | "emerald"
  | "rose";

type SurfaceColorPreset =
  | "auto"
  | "neutral"
  | "slate"
  | "zinc"
  | "stone"
  | "dark-navy"
  | "warm-black"
  | "charcoal";

type BorderColorPreset =
  | "auto"
  | "subtle"
  | "neutral"
  | "soft-white"
  | "cool-gray"
  | "glass-cyan"
  | "violet";

type ShadowPreset =
  | "none"
  | "small"
  | "medium"
  | "large"
  | "xl"
  | "glow";

type FramingPreset =
  | "auto"
  | "full-screen"
  | "card"
  | "browser"
  | "device"
  | "editorial-frame";

type ThemePreset = "auto" | "dark" | "light" | "dark-premium" | "warm-light";

type UiStylePreset =
  | "auto"
  | "flat"
  | "outline"
  | "minimal"
  | "glass"
  | "soft-premium"
  | "editorial";

type LandingPreferences = {
  visualStyle: VisualStyle;
  fontMood: FontMood;
  animationLevel: AnimationLevel;
  layoutPreference: LayoutPreference;
  buttonStyle: ButtonStyle;
  promptEnhancerMode: PromptEnhancerMode;
  preferredPrimaryColor: string;
  preferredBackgroundColor: string;

  typefaceFamily: TypefaceFamily;
  headingFont: FontChoice;
  bodyFont: FontChoice;
  headingSizePreset: HeadingSizePreset;
  bodySizePreset: BodySizePreset;
  headingWeightPreset: HeadingWeightPreset;
  letterSpacingPreset: LetterSpacingPreset;

  animationType: AnimationType;
  animationScene: AnimationScene;
  animationDuration: number;
  animationDelay: number;
  animationTiming: TimingPreset;
  animationIterations: IterationPreset;
  animationDirection: DirectionPreset;

  accentColorPreset: AccentColorPreset;
  backgroundColorPreset: SurfaceColorPreset;
  borderColorPreset: BorderColorPreset;
  shadowPreset: ShadowPreset;
  framingPreset: FramingPreset;
  themePreset: ThemePreset;
  uiStylePreset: UiStylePreset;
};

const DEFAULT_BUILD_TYPE = "premium";
const DEFAULT_MODEL = "openai-gpt-4";

const TYPING_PROMPTS = [
  "Vytvořte prémiový web pro soukromou kliniku v Praze…",
  "Navrhněte wow dark SaaS web pro AI startup…",
  "Připravte luxusní landing page pro developerský projekt…",
  "Vygenerujte redesign podle URL konkurenčního webu…",
  "Vytvořte prémiový web pro fine dining restauraci…",
];

function buildEnhancedPrompt(params: {
  prompt: string;
  sourceMode: SourceMode;
  sourceUrl: string;
  sourceHtml: string;
  preferences: LandingPreferences;
}) {
  const { prompt, sourceMode, sourceUrl, sourceHtml, preferences } = params;

  const visualStyleMap: Record<VisualStyle, string> = {
    auto: "Styl zvol chytře podle oboru a promptu.",
    clean: "Vizuální styl má být čistý, moderní a uhlazený.",
    premium: "Vizuální styl má být prémiový, elegantní a velmi polished.",
    bold: "Vizuální styl má být výrazný, kontrastní a sebevědomý.",
    editorial:
      "Vizuální styl má mít editorial feeling, vzduch a rafinovanou typografii.",
    luxury: "Vizuální styl má působit luxusně, sofistikovaně a exkluzivně.",
    playful:
      "Vizuální styl může být hravější, ale stále kvalitní a profesionální.",
  };

  const fontMoodMap: Record<FontMood, string> = {
    auto: "Fonty zvol podle oboru a nálady projektu.",
    geometric: "Použij geometrický, moderní a čistý font feeling.",
    editorial:
      "Použij výraznější editorial typografii s elegantním display dojmem.",
    luxury: "Použij luxusní, rafinovanou a prémiovou typografii.",
    trustworthy: "Použij důvěryhodnou, profesionální a klidnou typografii.",
    tech: "Použij tech / product orientovanou typografii s přesným moderním dojmem.",
    friendly: "Použij přístupnou, přátelskou a příjemnou typografii.",
  };

  const animationMap: Record<AnimationLevel, string> = {
    minimal: "Animace drž minimální, jemné a nenápadné.",
    subtle: "Použij jemné prémiové animace a decentní hover efekty.",
    rich: "Použij bohatší animace, mikrointerakce, reveal efekty a polished motion.",
    expressive:
      "Použij výraznější prémiové animace, gradient movement, glow efekty a wow motion, ale stále profesionálně.",
  };

  const layoutMap: Record<LayoutPreference, string> = {
    auto: "Layout zvol chytře podle oboru a zadání.",
    editorial: "Preferuj editorial layout s rytmem, vzduchem a silnou hierarchií.",
    split: "Preferuj split layout s jasně oddělenými bloky obsahu.",
    asymmetrical: "Preferuj asymetrický layout s prémiovou kompozicí.",
    story: "Preferuj story-driven layout s návazností sekcí.",
    grid: "Preferuj čistý grid layout s disciplinovaným spacingem.",
    luxury: "Preferuj luxusní layout s velkým důrazem na kompozici a wow dojem.",
  };

  const buttonStyleMap: Record<ButtonStyle, string> = {
    auto: "Styl tlačítek zvol podle značky a layoutu.",
    "soft-pill": "Použij měkčí pill tlačítka s prémiovým dojmem.",
    glass: "Použij glass nebo translucent styl tlačítek tam, kde to dává smysl.",
    "solid-premium": "Použij silnější solid premium tlačítka s vysokým kontrastem.",
    "outline-elegant": "Použij elegantní outline tlačítka s čistým prémiovým dojmem.",
    "gradient-glow": "Použij gradient CTA tlačítka s jemným glow efektem.",
  };

  const enhancerModeMap: Record<PromptEnhancerMode, string> = {
    balanced:
      "Výsledek má být vyvážený mezi estetikou, použitelností a konverzí.",
    conversion:
      "Výsledek má mít silnější důraz na CTA, konverzní strukturu, hierarchy a obchodní efekt.",
    "premium-brand":
      "Výsledek má mít silnější důraz na brand, prémiový dojem, vizuální konzistenci a detail.",
    "wow-creative":
      "Výsledek má mít silnější wow efekt, originálnější kompozici, motion a výraznější art direction.",
  };

  const sourceModeLine =
    sourceMode === "url" && sourceUrl.trim()
      ? `Jde o generování podle URL reference: ${sourceUrl.trim()}. Tato URL je hlavní zdroj layoutu, hierarchie, kompozice a vizuální inspirace. Textové zadání ber jen jako doplněk.`
      : sourceMode === "html" && sourceHtml.trim()
      ? "Jde o generování nebo redesign podle vloženého HTML. Zachovej silné části struktury, ale vizuál i UX výrazně vylepši."
      : sourceMode === "screenshot"
      ? "Jde o generování podle screenshotu nebo vizuální reference. Vnímej layout, spacing, rytmus a hierarchii."
      : "Jde o generování podle textového zadání.";

  const colorLines = [
    preferences.preferredPrimaryColor.trim()
      ? `Primární akcent nebo CTA barva preferovaně: ${preferences.preferredPrimaryColor.trim()}.`
      : "",
    preferences.preferredBackgroundColor.trim()
      ? `Preferovaná barva pozadí nebo základní tonalita: ${preferences.preferredBackgroundColor.trim()}.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const detailedSetup = [
    `Typeface family: ${preferences.typefaceFamily}.`,
    `Heading font preference: ${preferences.headingFont}.`,
    `Body font preference: ${preferences.bodyFont}.`,
    `Heading size preset: ${preferences.headingSizePreset}.`,
    `Body size preset: ${preferences.bodySizePreset}.`,
    `Heading weight preset: ${preferences.headingWeightPreset}.`,
    `Heading letter spacing: ${preferences.letterSpacingPreset}.`,
    `Animation type: ${preferences.animationType}.`,
    `Animation scene: ${preferences.animationScene}.`,
    `Animation duration: ${preferences.animationDuration}s.`,
    `Animation delay: ${preferences.animationDelay}s.`,
    `Animation timing: ${preferences.animationTiming}.`,
    `Animation iterations: ${preferences.animationIterations}.`,
    `Animation direction: ${preferences.animationDirection}.`,
    `Accent color preset: ${preferences.accentColorPreset}.`,
    `Background color preset: ${preferences.backgroundColorPreset}.`,
    `Border color preset: ${preferences.borderColorPreset}.`,
    `Shadow preset: ${preferences.shadowPreset}.`,
    `Framing preset: ${preferences.framingPreset}.`,
    `Theme preset: ${preferences.themePreset}.`,
    `UI style preset: ${preferences.uiStylePreset}.`,
  ].join("\n");

  return [
    prompt.trim(),
    "",
    "Doplňující kreativní instrukce:",
    sourceModeLine,
    visualStyleMap[preferences.visualStyle],
    fontMoodMap[preferences.fontMood],
    animationMap[preferences.animationLevel],
    layoutMap[preferences.layoutPreference],
    buttonStyleMap[preferences.buttonStyle],
    enhancerModeMap[preferences.promptEnhancerMode],
    colorLines,
    detailedSetup,
    "Výsledek musí působit prémiově, promyšleně, vizuálně konzistentně a ne jako generická šablona.",
    "Hlídej silný spacing, kvalitní hero sekci, přehlednou navigaci, konzistentní tlačítka, kvalitní práci s obrázky, lepší celkovou art direction a výrazně lepší kompozici.",
  ]
    .filter(Boolean)
    .join("\n");
}

function SettingCard(props: {
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[18px] border border-white/8 bg-white/[0.025] p-4">
      <div className="mb-4 flex items-start gap-3">
        <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-200">
          <Icon icon={props.icon} width={16} />
        </div>
        <div>
          <div className="text-sm font-medium text-white">{props.title}</div>
          <div className="mt-0.5 text-xs text-zinc-500">{props.subtitle}</div>
        </div>
      </div>
      {props.children}
    </section>
  );
}

function ChipOption(props: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={`rounded-[12px] border px-3 py-2 text-xs transition ${
        props.active
          ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
          : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {props.label}
    </button>
  );
}

export default function AiLandingPage() {
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [sourceMode, setSourceMode] = useState<SourceMode>("prompt");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceHtml, setSourceHtml] = useState("");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [typingText, setTypingText] = useState("");

  const [creativeSetupOpen, setCreativeSetupOpen] = useState(false);

  const [enhanceModalOpen, setEnhanceModalOpen] = useState(false);
  const [originalPromptPreview, setOriginalPromptPreview] = useState("");
  const [enhancedPromptPreview, setEnhancedPromptPreview] = useState("");
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);

  const [visualStyle, setVisualStyle] = useState<VisualStyle>("premium");
  const [fontMood, setFontMood] = useState<FontMood>("auto");
  const [animationLevel, setAnimationLevel] =
    useState<AnimationLevel>("rich");
  const [layoutPreference, setLayoutPreference] =
    useState<LayoutPreference>("auto");
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>("auto");
  const [promptEnhancerMode, setPromptEnhancerMode] =
    useState<PromptEnhancerMode>("premium-brand");
  const [preferredPrimaryColor, setPreferredPrimaryColor] = useState("");
  const [preferredBackgroundColor, setPreferredBackgroundColor] = useState("");

  const [typefaceFamily, setTypefaceFamily] =
    useState<TypefaceFamily>("sans");
  const [headingFont, setHeadingFont] = useState<FontChoice>("manrope");
  const [bodyFont, setBodyFont] = useState<FontChoice>("manrope");
  const [headingSizePreset, setHeadingSizePreset] =
    useState<HeadingSizePreset>("lg");
  const [bodySizePreset, setBodySizePreset] =
    useState<BodySizePreset>("md");
  const [headingWeightPreset, setHeadingWeightPreset] =
    useState<HeadingWeightPreset>("semibold");
  const [letterSpacingPreset, setLetterSpacingPreset] =
    useState<LetterSpacingPreset>("tight");

  const [animationType, setAnimationType] =
    useState<AnimationType>("glow");
  const [animationScene, setAnimationScene] =
    useState<AnimationScene>("sequence");
  const [animationDuration, setAnimationDuration] = useState(0.8);
  const [animationDelay, setAnimationDelay] = useState(0);
  const [animationTiming, setAnimationTiming] =
    useState<TimingPreset>("ease-out");
  const [animationIterations, setAnimationIterations] =
    useState<IterationPreset>("once");
  const [animationDirection, setAnimationDirection] =
    useState<DirectionPreset>("normal");

  const [accentColorPreset, setAccentColorPreset] =
    useState<AccentColorPreset>("cyan");
  const [backgroundColorPreset, setBackgroundColorPreset] =
    useState<SurfaceColorPreset>("dark-navy");
  const [borderColorPreset, setBorderColorPreset] =
    useState<BorderColorPreset>("glass-cyan");
  const [shadowPreset, setShadowPreset] = useState<ShadowPreset>("glow");
  const [framingPreset, setFramingPreset] =
    useState<FramingPreset>("full-screen");
  const [themePreset, setThemePreset] =
    useState<ThemePreset>("dark-premium");
  const [uiStylePreset, setUiStylePreset] =
    useState<UiStylePreset>("glass");

  const screenshotInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const htmlFileInputRef = useRef<HTMLInputElement | null>(null);

  const canContinue = useMemo(() => {
    if (sourceMode === "url") {
      return sourceUrl.trim().length >= 8;
    }

    if (sourceMode === "html") {
      return sourceHtml.trim().length >= 20 || prompt.trim().length >= 8;
    }

    if (sourceMode === "screenshot") {
      return (
        attachments.some((item) => item.kind === "screenshot") ||
        prompt.trim().length >= 8
      );
    }

    return prompt.trim().length >= 12;
  }, [prompt, sourceMode, sourceUrl, sourceHtml, attachments]);

  useEffect(() => {
    const shouldShowTyping =
      sourceMode === "prompt" && prompt.trim().length === 0 && !sourceUrl.trim();

    if (!shouldShowTyping) {
      setTypingText("");
      return;
    }

    let promptIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timeoutId: number | undefined;

    const tick = () => {
      const fullText = TYPING_PROMPTS[promptIndex];

      if (!deleting) {
        charIndex += 1;
        setTypingText(fullText.slice(0, charIndex));

        if (charIndex >= fullText.length) {
          deleting = true;
          timeoutId = window.setTimeout(tick, 1100);
          return;
        }

        timeoutId = window.setTimeout(tick, 42);
        return;
      }

      charIndex -= 1;
      setTypingText(fullText.slice(0, charIndex));

      if (charIndex <= 0) {
        deleting = false;
        promptIndex = (promptIndex + 1) % TYPING_PROMPTS.length;
        timeoutId = window.setTimeout(tick, 20);
        return;
      }

      timeoutId = window.setTimeout(tick, 20);
    };

    timeoutId = window.setTimeout(tick, 500);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [prompt, sourceMode, sourceUrl]);

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

  function handleScreenshotSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    addAttachment(file, "screenshot");
    setSourceMode("screenshot");
    e.target.value = "";
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    addAttachment(file, "file");
    e.target.value = "";
  }

  async function handleHtmlFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setSourceHtml(text);
      setSourceMode("html");
      addAttachment(file, "file");
    } finally {
      e.target.value = "";
    }
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  }

  function getLandingPreferences(): LandingPreferences {
    return {
      visualStyle,
      fontMood,
      animationLevel,
      layoutPreference,
      buttonStyle,
      promptEnhancerMode,
      preferredPrimaryColor,
      preferredBackgroundColor,
      typefaceFamily,
      headingFont,
      bodyFont,
      headingSizePreset,
      bodySizePreset,
      headingWeightPreset,
      letterSpacingPreset,
      animationType,
      animationScene,
      animationDuration,
      animationDelay,
      animationTiming,
      animationIterations,
      animationDirection,
      accentColorPreset,
      backgroundColorPreset,
      borderColorPreset,
      shadowPreset,
      framingPreset,
      themePreset,
      uiStylePreset,
    };
  }

  function openEnhanceModal() {
    const trimmed = prompt.trim();
    if (trimmed.length < 8) return;

    setIsEnhancingPrompt(true);

    const enhanced = buildEnhancedPrompt({
      prompt: trimmed,
      sourceMode,
      sourceUrl,
      sourceHtml,
      preferences: getLandingPreferences(),
    });

    setOriginalPromptPreview(trimmed);
    setEnhancedPromptPreview(enhanced);
    setEnhanceModalOpen(true);

    window.setTimeout(() => setIsEnhancingPrompt(false), 300);
  }

  function applyEnhancedPrompt() {
    if (!enhancedPromptPreview.trim()) return;
    setPrompt(enhancedPromptPreview);
    setEnhanceModalOpen(false);
  }

  function resetCreativeSetup() {
    setVisualStyle("premium");
    setFontMood("auto");
    setAnimationLevel("rich");
    setLayoutPreference("auto");
    setButtonStyle("auto");
    setPromptEnhancerMode("premium-brand");
    setPreferredPrimaryColor("");
    setPreferredBackgroundColor("");

    setTypefaceFamily("sans");
    setHeadingFont("manrope");
    setBodyFont("manrope");
    setHeadingSizePreset("lg");
    setBodySizePreset("md");
    setHeadingWeightPreset("semibold");
    setLetterSpacingPreset("tight");

    setAnimationType("glow");
    setAnimationScene("sequence");
    setAnimationDuration(0.8);
    setAnimationDelay(0);
    setAnimationTiming("ease-out");
    setAnimationIterations("once");
    setAnimationDirection("normal");

    setAccentColorPreset("cyan");
    setBackgroundColorPreset("dark-navy");
    setBorderColorPreset("glass-cyan");
    setShadowPreset("glow");
    setFramingPreset("full-screen");
    setThemePreset("dark-premium");
    setUiStylePreset("glass");
  }

  function buildAutoPromptForSourceMode() {
    if (sourceMode === "url" && sourceUrl.trim()) {
      return `Vytvoř nový web podle této URL reference: ${sourceUrl.trim()}. URL je hlavní zdroj layoutu, hierarchie, kompozice a vizuálního směru. Výsledek má být co nejpodobnější strukturou a dojmem, ale s vlastním brandem, vlastním logem, vlastními obrázky a čistším prémiovým zpracováním.`;
    }

    if (sourceMode === "html" && sourceHtml.trim()) {
      return "Vytvoř nový prémiový web podle dodaného HTML souboru. Zachovej nejsilnější strukturu a layout logiku, ale výrazně vylepši vizuál, spacing, typografii, CTA a celkový dojem.";
    }

    if (sourceMode === "screenshot") {
      return "Vytvoř nový web podle dodaného screenshotu nebo vizuální reference. Zachovej co nejvíce layout, rytmus, kompozici a vizuální směr, ale výsledek udělej čistší, modernější a připravený pro nový brand.";
    }

    return prompt.trim();
  }

  function startGenerating(customPrompt?: string) {
    const manualPrompt = (customPrompt ?? prompt).trim();
    const finalPrompt = manualPrompt || buildAutoPromptForSourceMode();

    if (!finalPrompt.trim()) return;

    const landingPreferences = getLandingPreferences();

    sessionStorage.setItem("ai_webgen_prompt", finalPrompt);
    sessionStorage.setItem("ai_webgen_autostart", "1");
    sessionStorage.setItem("ai_webgen_build_type", DEFAULT_BUILD_TYPE);
    sessionStorage.setItem("ai_webgen_model", DEFAULT_MODEL);
    sessionStorage.setItem(
      "ai_webgen_attachments",
      JSON.stringify(attachments)
    );
    sessionStorage.setItem(
      "ai_webgen_landing_preferences",
      JSON.stringify(landingPreferences)
    );
    sessionStorage.setItem("ai_webgen_source_mode", sourceMode);
    sessionStorage.setItem("ai_webgen_source_url", sourceUrl.trim());
    sessionStorage.setItem("ai_webgen_source_html", sourceHtml);

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
            transform: translate3d(36px, -22px, 0) scale(1.05);
          }
        }

        @keyframes zyviaFloatB {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(-42px, 28px, 0) scale(1.06);
          }
        }

        @keyframes zyviaGlowPulse {
          0%,
          100% {
            opacity: 0.34;
          }
          50% {
            opacity: 0.78;
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
            transform: translate3d(18px, 12px, 0);
          }
        }

        @keyframes zyviaCaretBlink {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }

        @keyframes zyviaBeamMove {
          0% {
            transform: translateX(-6%);
            opacity: 0.22;
          }
          50% {
            transform: translateX(6%);
            opacity: 0.34;
          }
          100% {
            transform: translateX(-6%);
            opacity: 0.22;
          }
        }

        @keyframes zyviaLinesPulse {
          0%,
          100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
        }

        @keyframes zyviaModalIn {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.985);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_16%,rgba(255,255,255,0.04),transparent_22%)]" />

        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
            animation: "zyviaGridDrift 18s linear infinite alternate",
          }}
        />

        <div
          className="absolute inset-x-[-8%] top-[110px] h-[340px] md:top-[102px] md:h-[380px]"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,180,92,0.025) 12%, rgba(255,180,92,0.10) 50%, rgba(255,180,92,0.025) 88%, transparent 100%)",
            filter: "blur(22px)",
            animation: "zyviaBeamMove 10s ease-in-out infinite",
          }}
        />

        <div
          className="absolute left-0 right-0 top-[138px] h-[240px] md:top-[130px] md:h-[260px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(to bottom, rgba(255,180,92,0.08) 0px, rgba(255,180,92,0.08) 1px, transparent 1px, transparent 16px)",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            animation: "zyviaLinesPulse 4.6s ease-in-out infinite",
          }}
        />

        <div
          className="absolute left-[-180px] top-[-140px] h-[34rem] w-[34rem] rounded-[10px] blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, rgba(98,70,255,0.18) 0%, rgba(98,70,255,0.08) 36%, transparent 74%)",
            animation: "zyviaFloatA 16s ease-in-out infinite alternate",
          }}
        />

        <div
          className="absolute bottom-[-220px] right-[-120px] h-[38rem] w-[38rem] rounded-[10px] blur-[150px]"
          style={{
            background:
              "radial-gradient(circle, rgba(42,169,255,0.14) 0%, rgba(42,169,255,0.06) 36%, transparent 76%)",
            animation: "zyviaFloatB 18s ease-in-out infinite alternate",
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_48%,rgba(0,0,0,0.34)_100%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-7xl flex-col px-5 py-6 md:px-8 md:py-7">
        <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="flex items-center">
            <img
              src="/zyvia-logo.svg?v=1"
              alt="Zyvia"
              className="h-7 w-auto opacity-95 md:h-8"
            />
          </div>

          <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
            <button type="button" className="transition hover:text-white">
              Agent
            </button>
            <button type="button" className="transition hover:text-white">
              Pricing
            </button>
            <button type="button" className="transition hover:text-white">
              Docs
            </button>
          </nav>

          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-200 backdrop-blur-xl transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
            >
              <Icon icon="solar:login-3-linear" width={16} />
              Přihlášení / Registrace
            </button>
          </div>
        </header>

        <main className="flex flex-1 items-center justify-center py-8 md:py-12">
          <div className="w-full max-w-5xl">
            <div className="mb-4 flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-zinc-300 backdrop-blur-xl md:text-sm">
                <span
                  className="inline-block h-2 w-2 rounded-full bg-cyan-300"
                  style={{ animation: "zyviaGlowPulse 1.8s ease-in-out infinite" }}
                />
                1M kreditů zdarma pro váš první návrh
              </div>
            </div>

            <div className="mb-7 text-center">
              <h1 className="text-balance text-[2.15rem] font-semibold tracking-[-0.03em] text-white md:text-[3.35rem]">
                Co chcete dnes vytvořit?
              </h1>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-zinc-500 md:text-[15px]">
                Web, landing page nebo redesign z URL, screenshotu či HTML.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[rgba(13,13,18,0.8)] p-3 shadow-[0_20px_120px_-40px_rgba(0,0,0,0.82)] backdrop-blur-2xl md:p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {[
                  {
                    value: "prompt" as const,
                    label: "Prompt",
                    icon: "solar:pen-2-linear",
                  },
                  {
                    value: "url" as const,
                    label: "URL",
                    icon: "solar:link-linear",
                  },
                  {
                    value: "screenshot" as const,
                    label: "Screenshot",
                    icon: "solar:gallery-wide-linear",
                  },
                  {
                    value: "html" as const,
                    label: "HTML",
                    icon: "solar:code-linear",
                  },
                ].map((item) => {
                  const active = sourceMode === item.value;

                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setSourceMode(item.value)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                        active
                          ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
                          : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      <Icon icon={item.icon} width={15} />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <div
                className="rounded-[26px] p-[1px]"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(124,92,255,0.72), rgba(90,209,255,0.34), rgba(255,180,92,0.22), rgba(124,92,255,0.72))",
                  backgroundSize: "220% 220%",
                  animation: "zyviaBorderShift 7s linear infinite",
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.02), 0 0 34px rgba(90,209,255,0.05)",
                }}
              >
                <div className="relative rounded-[25px] bg-[#09090D]">
                  {sourceMode === "url" && (
                    <div className="border-b border-white/8 px-5 pt-5 md:px-6">
                      <input
                        value={sourceUrl}
                        onChange={(e) => setSourceUrl(e.target.value)}
                        placeholder="Vložte URL webu, podle kterého se má návrh inspirovat…"
                        className="mb-4 h-12 w-full rounded-[14px] border border-white/8 bg-white/[0.03] px-4 text-sm text-white outline-none placeholder:text-zinc-500"
                      />
                    </div>
                  )}

                  {sourceMode === "html" && (
                    <div className="border-b border-white/8 px-5 pt-5 md:px-6">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="text-sm text-zinc-300">
                          Vložte HTML nebo nahrajte HTML soubor
                        </div>
                        <button
                          type="button"
                          onClick={() => htmlFileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
                        >
                          <Icon icon="solar:upload-linear" width={14} />
                          Nahrát HTML
                        </button>
                      </div>

                      <textarea
                        value={sourceHtml}
                        onChange={(e) => setSourceHtml(e.target.value)}
                        placeholder="<html>…</html>"
                        className="mb-4 h-32 w-full resize-none rounded-[14px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
                      />
                    </div>
                  )}

                  {sourceMode === "prompt" && prompt.trim().length === 0 && (
                    <div className="pointer-events-none absolute left-5 top-5 z-10 text-[15px] text-zinc-500 md:left-6 md:top-6 md:text-base">
                      {typingText}
                      <span
                        className="ml-0.5 inline-block h-[1.05em] w-[1px] translate-y-[3px] bg-zinc-400"
                        style={{ animation: "zyviaCaretBlink 1s linear infinite" }}
                      />
                    </div>
                  )}

                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="relative z-[2] h-48 w-full resize-none rounded-[25px] border-0 bg-transparent px-5 py-5 text-[15px] text-white outline-none placeholder:text-transparent md:h-52 md:px-6 md:py-6 md:text-base"
                    placeholder={
                      sourceMode === "url"
                        ? "Volitelně doplňte poznámku k URL, např. co zachovat nebo změnit…"
                        : sourceMode === "screenshot"
                        ? "Volitelně doplňte, co má návrh zachovat nebo vylepšit…"
                        : sourceMode === "html"
                        ? "Volitelně doplňte požadovaný redesign nebo změny…"
                        : "Popište, co chcete vytvořit..."
                    }
                  />

                  <div className="absolute bottom-4 left-4 z-[3] flex flex-wrap items-center gap-2 md:left-5">
                    <button
                      type="button"
                      onClick={() => screenshotInputRef.current?.click()}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
                      title="Screenshot"
                    >
                      <Icon icon="solar:gallery-wide-linear" width={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
                      title="Soubor"
                    >
                      <Icon icon="solar:file-text-linear" width={17} />
                    </button>

                    <button
                      type="button"
                      onClick={openEnhanceModal}
                      disabled={prompt.trim().length < 8 || isEnhancingPrompt}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-cyan-100 transition hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-40"
                      title="Vylepšit zadání"
                    >
                      <Icon icon="solar:magic-stick-3-linear" width={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setCreativeSetupOpen(true)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
                      title="Creative setup"
                    >
                      <Icon icon="solar:tuning-2-linear" width={17} />
                      Creative setup
                    </button>
                  </div>

                  <div className="absolute bottom-4 right-4 z-[3]">
                    <button
                      type="button"
                      onClick={() => startGenerating()}
                      disabled={!canContinue}
                      className="inline-flex min-w-[168px] items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                      style={{
                        background:
                          "linear-gradient(135deg, rgba(124,92,255,0.96), rgba(90,209,255,0.84))",
                        boxShadow:
                          "0 10px 28px rgba(124,92,255,0.2), 0 0 32px rgba(90,209,255,0.08)",
                      }}
                    >
                      Generovat návrh
                      <Icon icon="solar:arrow-right-linear" width={17} />
                    </button>
                  </div>

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

                  <input
                    ref={htmlFileInputRef}
                    type="file"
                    accept=".html,text/html"
                    className="hidden"
                    onChange={handleHtmlFileSelect}
                  />
                </div>
              </div>

              {attachments.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {attachments.map((item) => (
                    <div
                      key={item.id}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300"
                    >
                      <Icon
                        icon={
                          item.kind === "screenshot"
                            ? "solar:gallery-wide-linear"
                            : "solar:file-text-linear"
                        }
                        width={14}
                      />
                      <span className="max-w-[180px] truncate">{item.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(item.id)}
                        className="text-zinc-500 transition hover:text-white"
                        aria-label="Odebrat soubor"
                      >
                        <Icon icon="solar:close-circle-linear" width={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-5 text-center text-xs text-zinc-500 md:text-sm">
              Prémiový start bez složitého nastavování
            </div>
          </div>
        </main>
      </div>

      {creativeSetupOpen && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/72 p-4 backdrop-blur-md">
          <div
            className="w-full max-w-7xl rounded-[28px] border border-white/10 bg-[#0A0A0D]/97 shadow-[0_40px_140px_rgba(0,0,0,0.55)]"
            style={{ animation: "zyviaModalIn 220ms ease-out" }}
          >
            <div className="flex items-center justify-between border-b border-white/8 px-5 py-4 md:px-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-200">
                  <Icon icon="solar:tuning-2-linear" width={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    Creative setup
                  </div>
                  <div className="mt-0.5 text-xs text-zinc-500">
                    Rozšířené nastavení art direction pro kvalitnější generování
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetCreativeSetup}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <Icon icon="solar:restart-linear" width={14} />
                  Reset
                </button>

                <button
                  type="button"
                  onClick={() => setCreativeSetupOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                >
                  <Icon icon="solar:close-circle-linear" width={18} />
                </button>
              </div>
            </div>

            <div className="max-h-[78vh] overflow-auto px-5 py-5 md:px-6 md:py-6">
              <div className="grid gap-4 xl:grid-cols-2">
                <SettingCard
                  title="Art direction"
                  subtitle="Celkový dojem, kompozice a UI styl"
                  icon="solar:palette-2-linear"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Styl
                      </label>
                      <select
                        value={visualStyle}
                        onChange={(e) =>
                          setVisualStyle(e.target.value as VisualStyle)
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="clean">Clean</option>
                        <option value="premium">Premium</option>
                        <option value="bold">Bold</option>
                        <option value="editorial">Editorial</option>
                        <option value="luxury">Luxury</option>
                        <option value="playful">Playful</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Layout
                      </label>
                      <select
                        value={layoutPreference}
                        onChange={(e) =>
                          setLayoutPreference(
                            e.target.value as LayoutPreference
                          )
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="editorial">Editorial</option>
                        <option value="split">Split</option>
                        <option value="asymmetrical">Asymmetrical</option>
                        <option value="story">Story</option>
                        <option value="grid">Grid</option>
                        <option value="luxury">Luxury</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Theme
                      </label>
                      <select
                        value={themePreset}
                        onChange={(e) =>
                          setThemePreset(e.target.value as ThemePreset)
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="dark">Dark</option>
                        <option value="light">Light</option>
                        <option value="dark-premium">Dark premium</option>
                        <option value="warm-light">Warm light</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Surface style
                      </label>
                      <select
                        value={uiStylePreset}
                        onChange={(e) =>
                          setUiStylePreset(e.target.value as UiStylePreset)
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="flat">Flat</option>
                        <option value="outline">Outline</option>
                        <option value="minimal">Minimal</option>
                        <option value="glass">Glass</option>
                        <option value="soft-premium">Soft premium</option>
                        <option value="editorial">Editorial</option>
                      </select>
                    </div>
                  </div>
                </SettingCard>

                <SettingCard
                  title="Typography"
                  subtitle="Typeface, velikost, váha, spacing"
                  icon="solar:text-field-focus-linear"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Typeface family
                      </label>
                      <select
                        value={typefaceFamily}
                        onChange={(e) =>
                          setTypefaceFamily(e.target.value as TypefaceFamily)
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="sans">Sans</option>
                        <option value="serif">Serif</option>
                        <option value="rounded">Rounded</option>
                        <option value="condensed">Condensed</option>
                        <option value="mono">Mono</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Font mood
                      </label>
                      <select
                        value={fontMood}
                        onChange={(e) => setFontMood(e.target.value as FontMood)}
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="geometric">Geometric</option>
                        <option value="editorial">Editorial</option>
                        <option value="luxury">Luxury</option>
                        <option value="trustworthy">Trustworthy</option>
                        <option value="tech">Tech</option>
                        <option value="friendly">Friendly</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Heading font
                      </label>
                      <select
                        value={headingFont}
                        onChange={(e) =>
                          setHeadingFont(e.target.value as FontChoice)
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="inter">Inter</option>
                        <option value="manrope">Manrope</option>
                        <option value="geist">Geist</option>
                        <option value="playfair">Playfair Display</option>
                        <option value="instrument-serif">Instrument Serif</option>
                        <option value="plex-serif">Plex Serif</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Body font
                      </label>
                      <select
                        value={bodyFont}
                        onChange={(e) =>
                          setBodyFont(e.target.value as FontChoice)
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="inter">Inter</option>
                        <option value="manrope">Manrope</option>
                        <option value="geist">Geist</option>
                        <option value="playfair">Playfair Display</option>
                        <option value="instrument-serif">Instrument Serif</option>
                        <option value="plex-serif">Plex Serif</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Heading size
                      </label>
                      <select
                        value={headingSizePreset}
                        onChange={(e) =>
                          setHeadingSizePreset(
                            e.target.value as HeadingSizePreset
                          )
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="sm">20–32px</option>
                        <option value="md">32–40px</option>
                        <option value="lg">48–64px</option>
                        <option value="xl">64–80px</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Body size
                      </label>
                      <select
                        value={bodySizePreset}
                        onChange={(e) =>
                          setBodySizePreset(e.target.value as BodySizePreset)
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="sm">12–14px</option>
                        <option value="md">14–16px</option>
                        <option value="lg">16–18px</option>
                        <option value="xl">18–20px</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Heading weight
                      </label>
                      <select
                        value={headingWeightPreset}
                        onChange={(e) =>
                          setHeadingWeightPreset(
                            e.target.value as HeadingWeightPreset
                          )
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="light">Light</option>
                        <option value="regular">Regular</option>
                        <option value="medium">Medium</option>
                        <option value="semibold">Semibold</option>
                        <option value="bold">Bold</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Letter spacing
                      </label>
                      <select
                        value={letterSpacingPreset}
                        onChange={(e) =>
                          setLetterSpacingPreset(
                            e.target.value as LetterSpacingPreset
                          )
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="tight">Tight</option>
                        <option value="normal">Normal</option>
                        <option value="wide">Wide</option>
                      </select>
                    </div>
                  </div>
                </SettingCard>

                <SettingCard
                  title="Motion system"
                  subtitle="Typ animací, timing a intenzita"
                  icon="solar:bolt-circle-linear"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Intenzita
                      </label>
                      <select
                        value={animationLevel}
                        onChange={(e) =>
                          setAnimationLevel(e.target.value as AnimationLevel)
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="minimal">Minimal</option>
                        <option value="subtle">Subtle</option>
                        <option value="rich">Rich</option>
                        <option value="expressive">Expressive</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Animation type
                      </label>
                      <select
                        value={animationType}
                        onChange={(e) =>
                          setAnimationType(e.target.value as AnimationType)
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="fade">Fade</option>
                        <option value="slide">Slide</option>
                        <option value="scale">Scale</option>
                        <option value="blur">Blur</option>
                        <option value="rotate">Rotate</option>
                        <option value="glow">Glow</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Scene
                      </label>
                      <select
                        value={animationScene}
                        onChange={(e) =>
                          setAnimationScene(e.target.value as AnimationScene)
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="all-at-once">All at once</option>
                        <option value="sequence">Sequence</option>
                        <option value="word-by-word">Word by word</option>
                        <option value="letter-by-letter">Letter by letter</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Timing
                      </label>
                      <select
                        value={animationTiming}
                        onChange={(e) =>
                          setAnimationTiming(e.target.value as TimingPreset)
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="linear">Linear</option>
                        <option value="ease">Ease</option>
                        <option value="ease-in">Ease In</option>
                        <option value="ease-out">Ease Out</option>
                        <option value="ease-in-out">Ease In Out</option>
                        <option value="spring">Spring</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Iterations
                      </label>
                      <select
                        value={animationIterations}
                        onChange={(e) =>
                          setAnimationIterations(
                            e.target.value as IterationPreset
                          )
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="once">Once</option>
                        <option value="twice">Twice</option>
                        <option value="thrice">Thrice</option>
                        <option value="infinite">Infinite</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Direction
                      </label>
                      <select
                        value={animationDirection}
                        onChange={(e) =>
                          setAnimationDirection(
                            e.target.value as DirectionPreset
                          )
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="normal">Normal</option>
                        <option value="reverse">Reverse</option>
                        <option value="alternate">Alternate</option>
                        <option value="alternate-reverse">
                          Alternate reverse
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        <span>Duration</span>
                        <span>{animationDuration.toFixed(1)}s</span>
                      </div>
                      <input
                        type="range"
                        min={0.2}
                        max={2.4}
                        step={0.1}
                        value={animationDuration}
                        onChange={(e) =>
                          setAnimationDuration(Number(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        <span>Delay</span>
                        <span>{animationDelay.toFixed(1)}s</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1.5}
                        step={0.1}
                        value={animationDelay}
                        onChange={(e) =>
                          setAnimationDelay(Number(e.target.value))
                        }
                        className="w-full"
                      />
                    </div>
                  </div>
                </SettingCard>

                <SettingCard
                  title="Color & surface system"
                  subtitle="Akcent, pozadí, border, shadow, framing"
                  icon="solar:stars-line-duotone"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Accent preset
                      </label>
                      <select
                        value={accentColorPreset}
                        onChange={(e) =>
                          setAccentColorPreset(
                            e.target.value as AccentColorPreset
                          )
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="cyan">Cyan</option>
                        <option value="blue">Blue</option>
                        <option value="indigo">Indigo</option>
                        <option value="violet">Violet</option>
                        <option value="purple">Purple</option>
                        <option value="fuchsia">Fuchsia</option>
                        <option value="amber">Amber</option>
                        <option value="emerald">Emerald</option>
                        <option value="rose">Rose</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Background preset
                      </label>
                      <select
                        value={backgroundColorPreset}
                        onChange={(e) =>
                          setBackgroundColorPreset(
                            e.target.value as SurfaceColorPreset
                          )
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="neutral">Neutral</option>
                        <option value="slate">Slate</option>
                        <option value="zinc">Zinc</option>
                        <option value="stone">Stone</option>
                        <option value="dark-navy">Dark navy</option>
                        <option value="warm-black">Warm black</option>
                        <option value="charcoal">Charcoal</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Border preset
                      </label>
                      <select
                        value={borderColorPreset}
                        onChange={(e) =>
                          setBorderColorPreset(
                            e.target.value as BorderColorPreset
                          )
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="subtle">Subtle</option>
                        <option value="neutral">Neutral</option>
                        <option value="soft-white">Soft white</option>
                        <option value="cool-gray">Cool gray</option>
                        <option value="glass-cyan">Glass cyan</option>
                        <option value="violet">Violet</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Shadow preset
                      </label>
                      <select
                        value={shadowPreset}
                        onChange={(e) =>
                          setShadowPreset(e.target.value as ShadowPreset)
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="none">None</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="xl">XL</option>
                        <option value="glow">Glow</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Framing
                      </label>
                      <select
                        value={framingPreset}
                        onChange={(e) =>
                          setFramingPreset(e.target.value as FramingPreset)
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="full-screen">Full screen</option>
                        <option value="card">Card</option>
                        <option value="browser">Browser</option>
                        <option value="device">Device</option>
                        <option value="editorial-frame">Editorial frame</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Barva tlačítek
                      </label>
                      <input
                        value={preferredPrimaryColor}
                        onChange={(e) => setPreferredPrimaryColor(e.target.value)}
                        placeholder="Např. champagne"
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none placeholder:text-zinc-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Barva pozadí
                      </label>
                      <input
                        value={preferredBackgroundColor}
                        onChange={(e) =>
                          setPreferredBackgroundColor(e.target.value)
                        }
                        placeholder="Např. dark navy"
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                </SettingCard>

                <SettingCard
                  title="Prompt strategy"
                  subtitle="Jak agresivně se má prompt vylepšit"
                  icon="solar:magic-stick-3-linear"
                >
                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <ChipOption
                      active={promptEnhancerMode === "balanced"}
                      label="Balanced"
                      onClick={() => setPromptEnhancerMode("balanced")}
                    />
                    <ChipOption
                      active={promptEnhancerMode === "conversion"}
                      label="Conversion"
                      onClick={() => setPromptEnhancerMode("conversion")}
                    />
                    <ChipOption
                      active={promptEnhancerMode === "premium-brand"}
                      label="Premium brand"
                      onClick={() => setPromptEnhancerMode("premium-brand")}
                    />
                    <ChipOption
                      active={promptEnhancerMode === "wow-creative"}
                      label="Wow creative"
                      onClick={() => setPromptEnhancerMode("wow-creative")}
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                        Button system
                      </label>
                      <select
                        value={buttonStyle}
                        onChange={(e) =>
                          setButtonStyle(e.target.value as ButtonStyle)
                        }
                        className="h-11 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3.5 text-sm text-white outline-none"
                      >
                        <option value="auto">Auto</option>
                        <option value="soft-pill">Soft pill</option>
                        <option value="glass">Glass</option>
                        <option value="solid-premium">Solid premium</option>
                        <option value="outline-elegant">Outline elegant</option>
                        <option value="gradient-glow">Gradient glow</option>
                      </select>
                    </div>
                  </div>
                </SettingCard>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/8 px-5 py-4 md:px-6">
              <div className="text-xs text-zinc-500">
                Toto nastavení se uloží pro generování, enhance prompt i další editor flow.
              </div>

              <button
                type="button"
                onClick={() => setCreativeSetupOpen(false)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(124,92,255,1), rgba(90,209,255,0.92))",
                  boxShadow:
                    "0 10px 30px rgba(124,92,255,0.24), 0 0 40px rgba(90,209,255,0.1)",
                }}
              >
                Použít nastavení
                <Icon icon="solar:check-circle-linear" width={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {enhanceModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
          <div
            className="w-full max-w-5xl rounded-[28px] border border-white/10 bg-[#0B0B10]/95 p-4 shadow-[0_30px_120px_rgba(0,0,0,0.55)] md:p-6"
            style={{ animation: "zyviaModalIn 220ms ease-out" }}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-lg font-semibold text-white">
                  Vylepšit zadání
                </div>
                <div className="mt-1 text-sm text-zinc-500">
                  Porovnání původního a vylepšeného zadání před generováním.
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEnhanceModalOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <Icon icon="solar:close-circle-linear" width={20} />
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Původní zadání
                </div>
                <div className="max-h-[420px] overflow-auto whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                  {originalPromptPreview}
                </div>
              </div>

              <div className="rounded-[22px] border border-cyan-400/15 bg-cyan-400/[0.05] p-4">
                <div className="mb-3 text-xs uppercase tracking-[0.18em] text-cyan-200/80">
                  Vylepšené zadání
                </div>
                <div className="max-h-[420px] overflow-auto whitespace-pre-wrap text-sm leading-7 text-zinc-100">
                  {enhancedPromptPreview}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEnhanceModalOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
              >
                Ponechat původní
              </button>

              <button
                type="button"
                onClick={applyEnhancedPrompt}
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-white"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(124,92,255,1), rgba(90,209,255,0.92))",
                  boxShadow:
                    "0 10px 30px rgba(124,92,255,0.28), 0 0 40px rgba(90,209,255,0.12)",
                }}
              >
                Použít vylepšené zadání
                <Icon icon="solar:magic-stick-3-linear" width={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}