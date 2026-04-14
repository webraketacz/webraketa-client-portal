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
  dataUrl?: string;
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

type BusinessGoal =
  | "auto"
  | "leads"
  | "sales"
  | "registrations"
  | "trust"
  | "presentation";

type ContentDensity = "airy" | "balanced" | "dense";

type HeroStyle =
  | "auto"
  | "minimal"
  | "cover"
  | "split"
  | "overlay"
  | "dashboard"
  | "editorial";

type ToneOfVoice =
  | "professional"
  | "premium"
  | "direct"
  | "friendly"
  | "luxury"
  | "technical";

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

  businessGoal: BusinessGoal;
  contentDensity: ContentDensity;
  heroStyle: HeroStyle;
  toneOfVoice: ToneOfVoice;
  targetAudience: string;
  contactPreferences: string[];

  exactPrimaryHex: string;
  exactSecondaryHex: string;
  exactBackgroundHex: string;
  exactTextHex: string;
};

const DEFAULT_BUILD_TYPE = "premium";
const DEFAULT_MODEL = "openai-gpt-4";

const TYPING_PROMPTS = [
  "Vytvořte prémiový web pro soukromou kliniku v Praze…",
  "Navrhněte výrazný dark SaaS web pro AI startup…",
  "Připravte luxusní landing page pro developerský projekt…",
  "Vygenerujte redesign podle URL konkurenčního webu…",
  "Vytvořte prémiový web pro fine dining restauraci…",
];

const ROTATING_TIPS = [
  "Tajný tip: vložte URL oblíbeného webu a Zyvia přesněji převezme layout, rytmus i atmosféru návrhu.",
  "Tajný tip: přidejte screenshot reference a zlepšíte kompozici hero sekce, typografii i spacing.",
  "Tajný tip: uveďte obor, cílového zákazníka a obchodní cíl. Výsledek bude výrazně přesnější.",
  "Tajný tip: nastavte přesné HEX barvy a získáte konzistentnější první návrh bez zbytečných oprav.",
  "Tajný tip: u redesignu z URL se vyplatí otevřít Pokročilé nastavení návrhu a zamknout hero styl i hustotu obsahu.",
];

const CONTACT_CHOICES = [
  "Telefon",
  "E-mail",
  "Formulář",
  "Mapa",
  "WhatsApp",
  "Rezervace schůzky",
];

const EMPTY_PREFERENCES: LandingPreferences = {
  visualStyle: "auto",
  fontMood: "auto",
  animationLevel: "minimal",
  layoutPreference: "auto",
  buttonStyle: "auto",
  promptEnhancerMode: "balanced",
  preferredPrimaryColor: "",
  preferredBackgroundColor: "",
  typefaceFamily: "auto",
  headingFont: "auto",
  bodyFont: "auto",
  headingSizePreset: "md",
  bodySizePreset: "md",
  headingWeightPreset: "regular",
  letterSpacingPreset: "normal",
  animationType: "auto",
  animationScene: "auto",
  animationDuration: 0,
  animationDelay: 0,
  animationTiming: "ease",
  animationIterations: "once",
  animationDirection: "normal",
  accentColorPreset: "auto",
  backgroundColorPreset: "auto",
  borderColorPreset: "auto",
  shadowPreset: "none",
  framingPreset: "auto",
  themePreset: "auto",
  uiStylePreset: "auto",
  businessGoal: "auto",
  contentDensity: "balanced",
  heroStyle: "auto",
  toneOfVoice: "professional",
  targetAudience: "",
  contactPreferences: [],
  exactPrimaryHex: "",
  exactSecondaryHex: "",
  exactBackgroundHex: "",
  exactTextHex: "",
};

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Nepodařilo se převést soubor na data URL."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Čtení souboru selhalo."));
    };

    reader.readAsDataURL(file);
  });
}

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
      ? "Jde o generování podle screenshotu nebo vizuální reference. Screenshot je PRIMÁRNÍ zdroj pravdy pro layout, hierarchii, navigaci, rytmus sekcí, spacing, velikosti typografie, poměry bloků, umístění CTA, framing hero sekce a celkový vizuální směr. Nevytvářej generický web podle oboru. Pokud screenshot ukazuje navigaci uvnitř hero wrapperu nebo jednoho framed shellu, zachovej to stejně. Pokud screenshot ukazuje světlejší design, nepřeklápěj výsledek do tmavého business stylu."
      : "Jde o generování podle textového zadání.";

  const extraLines = [
    preferences.preferredPrimaryColor.trim()
      ? `Preferovaná primární barva: ${preferences.preferredPrimaryColor.trim()}.`
      : "",
    preferences.preferredBackgroundColor.trim()
      ? `Preferovaná barva pozadí: ${preferences.preferredBackgroundColor.trim()}.`
      : "",
    preferences.exactPrimaryHex.trim()
      ? `Použij přesný HEX pro primární barvu: ${preferences.exactPrimaryHex.trim()}.`
      : "",
    preferences.exactSecondaryHex.trim()
      ? `Použij přesný HEX pro sekundární barvu: ${preferences.exactSecondaryHex.trim()}.`
      : "",
    preferences.exactBackgroundHex.trim()
      ? `Použij přesný HEX pro pozadí: ${preferences.exactBackgroundHex.trim()}.`
      : "",
    preferences.exactTextHex.trim()
      ? `Použij přesný HEX pro text: ${preferences.exactTextHex.trim()}.`
      : "",
    preferences.targetAudience.trim()
      ? `Cílový zákazník: ${preferences.targetAudience.trim()}.`
      : "",
    preferences.contactPreferences.length
      ? `Kontaktní prvky, které má web obsahovat: ${preferences.contactPreferences.join(", ")}.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const detailLines = [
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
    `Business goal: ${preferences.businessGoal}.`,
    `Content density: ${preferences.contentDensity}.`,
    `Hero style: ${preferences.heroStyle}.`,
    `Tone of voice: ${preferences.toneOfVoice}.`,
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
    extraLines,
    detailLines,
    "Výsledek musí působit prémiově, promyšleně, vizuálně konzistentně a ne jako generická šablona.",
    "Hlídej silný spacing, kvalitní hero sekci, přehlednou navigaci, konzistentní tlačítka, kvalitní práci s obrázky, lepší celkovou art direction a výrazně lepší kompozici.",
    "Pokud jsou vyplněné obchodní cíle, cílový zákazník, hero styl nebo přesné barvy, ber je jako prioritu před automatickými volbami.",
  ]
    .filter(Boolean)
    .join("\n");
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[9px] uppercase tracking-[0.14em] text-zinc-500">
      {children}
    </label>
  );
}

function SelectField<T extends string>(props: {
  value: T;
  onChange: (value: T) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={props.value}
      onChange={(e) => props.onChange(e.target.value as T)}
      className="h-10 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3 text-[13px] text-white outline-none"
    >
      {props.children}
    </select>
  );
}

function SettingCard(props: {
  title: string;
  subtitle: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[18px] border border-white/8 bg-white/[0.022] p-4">
      <div className="mb-4 flex items-start gap-3">
        <div className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-200">
          <Icon icon={props.icon} width={16} />
        </div>
        <div>
          <div className="text-[13px] font-medium text-white">{props.title}</div>
          <div className="mt-0.5 text-[11px] text-zinc-500">{props.subtitle}</div>
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
      className={`rounded-[12px] border px-3 py-2 text-[11px] transition ${
        props.active
          ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
          : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {props.label}
    </button>
  );
}

function ModeButton(props: {
  active: boolean;
  compact?: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      title={props.label}
      className={`group inline-flex items-center rounded-full border transition ${
        props.compact ? "gap-0 px-3 py-1.5 text-[12px]" : "gap-2 px-3.5 py-1.5 text-[12px]"
      } ${
        props.active
          ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-100"
          : "border-white/10 bg-white/[0.03] text-zinc-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      <Icon icon={props.icon} width={14} />
      {props.compact ? (
        <span
          className={`overflow-hidden whitespace-nowrap transition-all duration-200 ${
            props.active
              ? "ml-2 max-w-[110px] opacity-100"
              : "ml-0 max-w-0 opacity-0 group-hover:ml-2 group-hover:max-w-[110px] group-hover:opacity-100"
          }`}
        >
          {props.label}
        </span>
      ) : (
        <span>{props.label}</span>
      )}
    </button>
  );
}

function ColorInputRow(props: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div>
      <FieldLabel>{props.label}</FieldLabel>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={props.value || "#7c5cff"}
          onChange={(e) => props.onChange(e.target.value)}
          className="h-10 w-12 rounded-[12px] border border-white/10 bg-[#0B0B10] p-1"
        />
        <input
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder="#7C5CFF"
          className="h-10 w-full rounded-[12px] border border-white/10 bg-[#0B0B10] px-3 text-[13px] text-white outline-none placeholder:text-zinc-500"
        />
      </div>
    </div>
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
  const [rotatingTipIndex, setRotatingTipIndex] = useState(0);

  const [enhanceModalOpen, setEnhanceModalOpen] = useState(false);
  const [originalPromptPreview, setOriginalPromptPreview] = useState("");
  const [enhancedPromptPreview, setEnhancedPromptPreview] = useState("");
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);

  const [visualStyle, setVisualStyle] = useState<VisualStyle>("premium");
  const [fontMood, setFontMood] = useState<FontMood>("auto");
  const [animationLevel, setAnimationLevel] = useState<AnimationLevel>("rich");
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
  const [bodySizePreset, setBodySizePreset] = useState<BodySizePreset>("md");
  const [headingWeightPreset, setHeadingWeightPreset] =
    useState<HeadingWeightPreset>("semibold");
  const [letterSpacingPreset, setLetterSpacingPreset] =
    useState<LetterSpacingPreset>("tight");

  const [animationType, setAnimationType] = useState<AnimationType>("glow");
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
  const [uiStylePreset, setUiStylePreset] = useState<UiStylePreset>("glass");

  const [businessGoal, setBusinessGoal] = useState<BusinessGoal>("trust");
  const [contentDensity, setContentDensity] =
    useState<ContentDensity>("balanced");
  const [heroStyle, setHeroStyle] = useState<HeroStyle>("auto");
  const [toneOfVoice, setToneOfVoice] = useState<ToneOfVoice>("premium");
  const [targetAudience, setTargetAudience] = useState("");
  const [contactPreferences, setContactPreferences] = useState<string[]>([
    "Telefon",
    "E-mail",
    "Formulář",
  ]);

  const [exactPrimaryHex, setExactPrimaryHex] = useState("#7C5CFF");
  const [exactSecondaryHex, setExactSecondaryHex] = useState("#5AD1FF");
  const [exactBackgroundHex, setExactBackgroundHex] = useState("#09090D");
  const [exactTextHex, setExactTextHex] = useState("#F4F4F5");

  const screenshotInputRef = useRef<HTMLInputElement | null>(null);
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

        timeoutId = window.setTimeout(tick, 38);
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

      timeoutId = window.setTimeout(tick, 18);
    };

    timeoutId = window.setTimeout(tick, 500);

    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [prompt, sourceMode, sourceUrl]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRotatingTipIndex((prev) => (prev + 1) % ROTATING_TIPS.length);
    }, 3600);

    return () => window.clearInterval(interval);
  }, []);

  async function addAttachment(file: File, kind: "screenshot" | "file") {
    const nextItem: AttachmentItem = {
      id: `${kind}-${file.name}-${Date.now()}`,
      name: file.name,
      kind,
      dataUrl: kind === "screenshot" ? await fileToDataUrl(file) : undefined,
    };

    setAttachments((prev) => {
      const exists = prev.some(
        (item) => item.name === file.name && item.kind === kind
      );
      if (exists) return prev;
      return [...prev, nextItem];
    });
  }

  async function handleScreenshotSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await addAttachment(file, "screenshot");
      setSourceMode("screenshot");
    } finally {
      e.target.value = "";
    }
  }

  async function handleHtmlFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setSourceHtml(text);
      setSourceMode("html");
      await addAttachment(file, "file");
    } finally {
      e.target.value = "";
    }
  }

  function removeAttachment(id?: string) {
    if (!id) return;
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  }

  const screenshotAttachments = attachments.filter((item) => item.kind === "screenshot");
  const fileAttachments = attachments.filter((item) => item.kind === "file");

  function toggleContactPreference(item: string) {
    setContactPreferences((prev) =>
      prev.includes(item) ? prev.filter((value) => value !== item) : [...prev, item]
    );
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
      businessGoal,
      contentDensity,
      heroStyle,
      toneOfVoice,
      targetAudience,
      contactPreferences,
      exactPrimaryHex,
      exactSecondaryHex,
      exactBackgroundHex,
      exactTextHex,
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
      preferences:
        sourceMode === "screenshot" || sourceMode === "url"
          ? EMPTY_PREFERENCES
          : getLandingPreferences(),
    });

    setOriginalPromptPreview(trimmed);
    setEnhancedPromptPreview(enhanced);
    setEnhanceModalOpen(true);

    window.setTimeout(() => setIsEnhancingPrompt(false), 260);
  }

  function applyEnhancedPrompt() {
    if (!enhancedPromptPreview.trim()) return;
    setPrompt(enhancedPromptPreview);
    setEnhanceModalOpen(false);
  }

  function buildAutoPromptForSourceMode() {
    if (sourceMode === "url" && sourceUrl.trim()) {
      return `Vytvoř nový web podle této URL reference: ${sourceUrl.trim()}. URL je hlavní zdroj layoutu, hierarchie, kompozice a vizuálního směru. Výsledek má být co nejpodobnější strukturou a dojmem, ale s vlastním brandem, vlastním logem, vlastními obrázky a čistším prémiovým zpracováním.`;
    }

    if (sourceMode === "html" && sourceHtml.trim()) {
      return "Vytvoř nový prémiový web podle dodaného HTML souboru. Zachovej nejsilnější strukturu a layout logiku, ale výrazně vylepši vizuál, spacing, typografii, CTA a celkový dojem.";
    }

    if (sourceMode === "screenshot") {
      return "Vytvoř nový web podle přiložené screenshot reference. Screenshot je PRIMÁRNÍ zdroj layoutu, hierarchie, navigace, kompozice, velikostí nadpisů, spacingu, rytmu sekcí, umístění CTA, poměrů bloků a celkového vizuálního směru. Prosím o co nejvěrnější rekonstrukci screenshotu, je to můj design. Nevytvářej generický web podle oboru. Primárně se řiď screenshot referencí.";
    }

    return prompt.trim();
  }

  function startGenerating(customPrompt?: string) {
    const manualPrompt = (customPrompt ?? prompt).trim();
    const validScreenshotAttachments = attachments.filter(
      (item) =>
        item.kind === "screenshot" &&
        typeof item.dataUrl === "string" &&
        item.dataUrl.startsWith("data:image/")
    );
    const screenshotDataUrl = validScreenshotAttachments[0]?.dataUrl ?? "";
    const hasValidScreenshot = screenshotDataUrl.length > 0;
    const resolvedSourceMode: SourceMode =
      sourceMode === "screenshot" || hasValidScreenshot ? "screenshot" : sourceMode;
    const finalPrompt = manualPrompt || buildAutoPromptForSourceMode();

    if (!finalPrompt.trim()) return;
    if (resolvedSourceMode === "screenshot" && !hasValidScreenshot) {
      console.error("START_GENERATING_FAIL", {
        sourceMode,
        resolvedSourceMode,
        attachmentsCount: attachments.length,
        screenshotAttachments: attachments.map((item) => ({
          id: item.id,
          kind: item.kind,
          hasDataUrl:
            typeof item.dataUrl === "string" &&
            item.dataUrl.startsWith("data:image/"),
          dataUrlLength:
            typeof item.dataUrl === "string" ? item.dataUrl.length : 0,
        })),
      });
      return;
    }

    const landingPreferences =
      resolvedSourceMode === "screenshot" ||
      resolvedSourceMode === "url" ||
      resolvedSourceMode === "html"
        ? EMPTY_PREFERENCES
        : getLandingPreferences();

    console.log("START_GENERATING_DEBUG", {
      sourceMode,
      resolvedSourceMode,
      hasValidScreenshot,
      screenshotDataUrlLength: screenshotDataUrl.length,
      attachmentsCount: attachments.length,
      screenshotAttachments: attachments.map((item) => ({
        id: item.id,
        kind: item.kind,
        hasDataUrl:
          typeof item.dataUrl === "string" &&
          item.dataUrl.startsWith("data:image/"),
        dataUrlLength:
          typeof item.dataUrl === "string" ? item.dataUrl.length : 0,
      })),
      sourceUrlLength: sourceUrl.trim().length,
      sourceHtmlLength: sourceHtml.length,
      promptLength: finalPrompt.length,
    });

    sessionStorage.setItem("ai_webgen_prompt", finalPrompt);
    sessionStorage.setItem("ai_webgen_autostart", "1");
    sessionStorage.setItem("ai_webgen_build_type", DEFAULT_BUILD_TYPE);
    sessionStorage.setItem("ai_webgen_model", DEFAULT_MODEL);
    sessionStorage.setItem(
      "ai_webgen_attachments",
      JSON.stringify(
        resolvedSourceMode === "screenshot"
          ? validScreenshotAttachments
          : attachments
      )
    );
    sessionStorage.setItem(
      "ai_webgen_landing_preferences",
      JSON.stringify(landingPreferences)
    );
    sessionStorage.setItem("ai_webgen_source_mode", resolvedSourceMode);
    sessionStorage.setItem("ai_webgen_input_mode", resolvedSourceMode);
    sessionStorage.setItem("ai_webgen_source_url", sourceUrl.trim());
    sessionStorage.setItem("ai_webgen_source_html", sourceHtml);
    sessionStorage.setItem("ai_webgen_screenshot_data_url", screenshotDataUrl);

    router.push("/editor");
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#050507] text-white">
      <style jsx global>{`
        @keyframes zyviaFloatA {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(52px, -30px, 0) scale(1.08);
          }
        }
        @keyframes zyviaFloatB {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          100% {
            transform: translate3d(-56px, 36px, 0) scale(1.1);
          }
        }
        @keyframes zyviaAuroraShift {
          0% {
            transform: translate3d(-4%, -2%, 0) scale(1.02) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            transform: translate3d(3%, 2%, 0) scale(1.08) rotate(8deg);
            opacity: 0.46;
          }
          100% {
            transform: translate3d(-2%, 4%, 0) scale(1.04) rotate(-6deg);
            opacity: 0.34;
          }
        }
        @keyframes zyviaOrbitalDrift {
          0% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(32px, -22px, 0) scale(1.08);
          }
          100% {
            transform: translate3d(-24px, 18px, 0) scale(0.96);
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

          <nav className="hidden items-center gap-7 text-[15px] font-medium text-zinc-400 md:flex">
            <button type="button" className="transition hover:text-white">
              Agent
            </button>
            <button type="button" className="transition hover:text-white">
              Ceník
            </button>
            <button type="button" className="transition hover:text-white">
              Dokumentace
            </button>
          </nav>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              className="text-[15px] font-medium text-zinc-300 transition hover:text-white"
            >
              Přihlášení
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-[linear-gradient(135deg,rgba(124,92,255,0.96),rgba(90,209,255,0.84))] px-5 py-2.5 text-[15px] font-medium text-white shadow-[0_10px_28px_rgba(124,92,255,0.18)] transition hover:opacity-95"
            >
              Začít zdarma
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
                Zadejte zadání nebo vložte referenci. Zyvia připraví výrazně
                přesnější návrh webu během chvilky.
              </p>
            </div>

            <div className="rounded-[30px] border border-white/10 bg-[rgba(13,13,18,0.8)] p-3 shadow-[0_20px_120px_-40px_rgba(0,0,0,0.82)] backdrop-blur-2xl md:p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                <ModeButton
                  active={sourceMode === "prompt"}
                  icon="solar:pen-2-linear"
                  label="Prompt"
                  onClick={() => setSourceMode("prompt")}
                />
                <ModeButton
                  active={sourceMode === "url"}
                  compact
                  icon="solar:link-linear"
                  label="URL"
                  onClick={() => setSourceMode("url")}
                />
                <ModeButton
                  active={sourceMode === "screenshot"}
                  compact
                  icon="solar:gallery-wide-linear"
                  label="Screenshot"
                  onClick={() => setSourceMode("screenshot")}
                />
                <ModeButton
                  active={sourceMode === "html"}
                  compact
                  icon="solar:code-linear"
                  label="HTML"
                  onClick={() => setSourceMode("html")}
                />
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
                        className="mb-4 h-11 w-full rounded-[14px] border border-white/8 bg-white/[0.03] px-4 text-sm text-white outline-none placeholder:text-zinc-500"
                      />
                    </div>
                  )}

                  {sourceMode === "html" && (
                    <div className="border-b border-white/8 px-5 pt-5 md:px-6">
                      <textarea
                        value={sourceHtml}
                        onChange={(e) => setSourceHtml(e.target.value)}
                        placeholder="Vložte HTML nebo nahrajte .html soubor…"
                        className="mb-4 min-h-[120px] w-full rounded-[16px] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
                      />
                    </div>
                  )}

                  <div className="px-5 py-5 md:px-6 md:pt-6">
                    {sourceMode === "screenshot" && (
                      <div className="mb-4 rounded-[18px] border border-white/8 bg-white/[0.03] p-3.5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <div className="text-sm font-medium text-white">Screenshot reference</div>
                            <div className="mt-1 text-xs text-zinc-500">
                              Nahrajte screenshot a Zyvia převezme kompozici, rytmus i layout.
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => screenshotInputRef.current?.click()}
                            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
                          >
                            <Icon icon="solar:gallery-add-linear" width={16} />
                            Přidat screenshot
                          </button>
                        </div>

                        {screenshotAttachments.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {screenshotAttachments.map((item) => (
                              <div
                                key={item.id}
                                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300"
                              >
                                <Icon icon="solar:gallery-wide-linear" width={14} />
                                <span>{item.name}</span>
                                <button
                                  type="button"
                                  onClick={() => removeAttachment(item.id)}
                                  className="text-zinc-500 transition hover:text-white"
                                >
                                  <Icon icon="solar:close-circle-linear" width={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {sourceMode === "html" && (
                      <div className="mb-4 flex justify-end">
                        <button
                          type="button"
                          onClick={() => htmlFileInputRef.current?.click()}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
                        >
                          <Icon icon="solar:upload-linear" width={16} />
                          Nahrát HTML soubor
                        </button>
                      </div>
                    )}

                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={
                        typingText ||
                        "Popište, co chcete vytvořit. Např. prémiový web pro fintech startup se silným důrazem na důvěru a konverze."
                      }
                      className="min-h-[168px] w-full resize-none bg-transparent text-[16px] leading-7 text-white outline-none placeholder:text-zinc-500 md:min-h-[186px]"
                    />

                    <div className="mt-5 flex flex-col gap-3 border-t border-white/8 pt-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={openEnhanceModal}
                          disabled={prompt.trim().length < 8 || isEnhancingPrompt}
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
                          title="Vylepšit zadání"
                        >
                          <Icon icon="solar:magic-stick-3-linear" width={16} />
                          AI vylepšení promptu
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => startGenerating()}
                        disabled={!canContinue}
                        className="inline-flex min-w-[192px] items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white transition duration-200 disabled:cursor-not-allowed disabled:opacity-40"
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
                      ref={htmlFileInputRef}
                      type="file"
                      accept=".html,text/html"
                      className="hidden"
                      onChange={handleHtmlFileSelect}
                    />
                  </div>
                </div>
              </div>

              <div className="px-2 pt-3 text-center text-[12px] text-zinc-500">
                <span className="text-zinc-400">{ROTATING_TIPS[rotatingTipIndex]}</span>
              </div>

              {fileAttachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {fileAttachments.map((item) => (
                    <div
                      key={item.id}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-300"
                    >
                      <Icon icon="solar:document-text-linear" width={14} />
                      <span>{item.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(item.id)}
                        className="text-zinc-500 transition hover:text-white"
                      >
                        <Icon icon="solar:close-circle-linear" width={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-5 text-center text-xs text-zinc-500">
                Prémiový start bez složitého nastavování
              </div>
            </div>
          </div>
        </main>
      </div>

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
                  {isEnhancingPrompt ? "Zyvia právě doplňuje brief…" : enhancedPromptPreview}
                </div>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEnhanceModalOpen(false)}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                Zavřít
              </button>

              <button
                type="button"
                onClick={applyEnhancedPrompt}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium text-white"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(124,92,255,1), rgba(90,209,255,0.92))",
                  boxShadow:
                    "0 10px 30px rgba(124,92,255,0.24), 0 0 40px rgba(90,209,255,0.1)",
                }}
              >
                Použít vylepšené zadání
                <Icon icon="solar:magic-stick-3-linear" width={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}