"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@iconify/react";
import JSZip from "jszip";

type AssetPlanItem = {
  slot: string;
  query: string;
  placement: string;
  mood: string;
  orientation: "landscape" | "portrait" | "square";
};

type ResolvedAsset = {
  slot: string;
  url: string;
  alt: string;
  source: "pexels" | "unsplash" | "fallback";
  photographer?: string;
  photographerUrl?: string;
};

type BrandLogoAsset = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

type AttachmentItem = {
  id?: string;
  name?: string;
  kind?: "screenshot" | "file";
  dataUrl?: string;
};

type SpeedMode = "fast" | "balanced" | "premium";
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
type IconStyle =
  | "auto"
  | "minimal"
  | "outlined"
  | "solid"
  | "custom";
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
type DesignReference =
  | "auto"
  | "fintech-neon"
  | "signal-orchestration"
  | "angled-enterprise"
  | "cinematic-resort"
  | "luxury-editorial"
  | "product-commerce"
  | "clean-business"
  | "restaurant-editorial"
  | "barber-premium"
  | "clean-automotive"
  | "service-trades";
type InputMode = "prompt" | "url" | "screenshot" | "html";

type ClientAnswers = {
  contactDetails?: string;
  styleNotes?: string;
  offerNotes?: string;
  extras?: string;
};

type GenerationPreferences = {
  speedMode: SpeedMode;
  layoutPreference: LayoutPreference;
  visualStyle: VisualStyle;
  animationLevel: AnimationLevel;
  fontMood: FontMood;
  iconStyle: IconStyle;
  designReference: DesignReference;
  buttonStyle?: ButtonStyle;
  promptEnhancerMode?: PromptEnhancerMode;
  preferredPrimaryColor?: string;
  preferredBackgroundColor?: string;
  contactItems: string[];
  clientAnswers: ClientAnswers;
  sourcePrompt?: string;
};

type ReferenceSiteSummary = {
  referenceUrl?: string;
  finalUrl?: string;
  title?: string;
  metaDescription?: string;
  headings?: string[];
  navLinks?: string[];
  ctas?: string[];
  firstParagraphs?: string[];
  sectionCount?: number;
  classHints?: string[];
  idHints?: string[];
  textSample?: string;
  htmlSnippet?: string;
};

type ReferenceLayoutFingerprint = {
  heroType:
    | "full-bleed-centered"
    | "split"
    | "editorial-cover"
    | "bottom-left-overlay"
    | "grid"
    | "unknown";
  visualDominance:
    | "vehicle"
    | "architecture"
    | "product"
    | "food"
    | "software-ui"
    | "people-service"
    | "mixed"
    | "unknown";
  sectionSequence: string[];
  density: "airy" | "balanced" | "dense";
  navStyle: "minimal" | "corporate" | "editorial" | "unknown";
  likelyAccentStyle: "lime" | "cyan" | "gold" | "white" | "unknown";
  shouldUseStatsBandAfterHero: boolean;
  heroNeedsSingleDominantSubject: boolean;
  shouldAvoidSplitHero: boolean;
};

type ReferenceScreenshotAnalysis = {
  screenshotAvailable?: boolean;
  aboveTheFoldType?:
    | "cover-hero"
    | "split-hero"
    | "editorial-cover"
    | "grid-hero"
    | "unknown";
  heroContentAlignment?:
    | "center"
    | "left"
    | "right"
    | "bottom-left"
    | "unknown";
  navVisualWeight?: "minimal" | "medium" | "heavy" | "unknown";
  firstSectionAfterHero?:
    | "stats-band"
    | "services"
    | "gallery"
    | "testimonials"
    | "unknown";
  dominantVisualSubject?:
    | "vehicle"
    | "architecture"
    | "product"
    | "food"
    | "ui"
    | "portrait"
    | "mixed"
    | "unknown";
  shouldKeepFullWidthHero?: boolean;
  shouldKeepSingleDominantSubject?: boolean;
  shouldAvoidSplitHero?: boolean;
  mustKeepMotifs?: string[];
  forbiddenMistakes?: string[];
  colorDirection?: string;
  compositionSummary?: string;
};

type GeneratorResponse = {
  html: string;
  css: string;
  js: string;
  assetPlan?: AssetPlanItem[];
  assets?: ResolvedAsset[];
  brief?: {
    industry?: string;
    audience?: string;
    style?: string;
    layoutTone?: string;
  };
  error?: string;
  selectedSectionId?: string;
  changedOnlySelectedSection?: boolean;
  twoStepMode?: boolean;
  generationPreferences?: Partial<GenerationPreferences>;
  referenceSummary?: ReferenceSiteSummary | null;
  layoutFingerprint?: ReferenceLayoutFingerprint | null;
  screenshotAnalysis?: ReferenceScreenshotAnalysis | null;
  hasReferenceScreenshot?: boolean;
};

type AssetResolveResponse = {
  assets: ResolvedAsset[];
  error?: string;
};

type AssetSearchResponse = {
  images: ResolvedAsset[];
  error?: string;
};

type PublishResponse = {
  url?: string;
  inspectUrl?: string;
  deploymentId?: string;
  error?: string;
};

type PublishFormState = {
  siteName: string;
  slug: string;
  description: string;
};

type ViewMode = "desktop" | "tablet" | "mobile";
type ActiveTab = "preview" | "editor";

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

type EditableTextSelection = {
  id: string;
  text: string;
  tagName: string;
  sectionId: string;
  href?: string;
};

type EditableImageSelection = {
  slot: string;
  tagName: string;
  sectionId: string;
  currentUrl?: string;
  alt: string;
  orientation: "landscape" | "portrait" | "square";
};

type IndustryKind =
  | "fintech"
  | "saas"
  | "real-estate"
  | "resort"
  | "luxury-service"
  | "food-product"
  | "ecommerce-product"
  | "healthcare"
  | "legal"
  | "beauty"
  | "restaurant"
  | "catering"
  | "barber"
  | "hair-salon"
  | "autoservis"
  | "car-dealer"
  | "zednik"
  | "generic-business";

type Otazka = {
  id: keyof ClientAnswers;
  text: string;
  placeholder: string;
  appendLabel?: string;
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
  "Kontroluji typografii a hierarchii…",
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
  "Aktualizuji sekce a CTA…",
  "Finalizuji upravený výstup…",
];

const ACCEPTED_LOGO_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/svg+xml",
  "image/webp",
];

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function inferIndustryKind(prompt: string): IndustryKind {
  const text = normalizeText(prompt);

  if (
    text.includes("fintech") ||
    text.includes("payment") ||
    text.includes("platby") ||
    text.includes("bank") ||
    text.includes("finance")
  ) {
    return "fintech";
  }

  if (
    text.includes("saas") ||
    text.includes("software") ||
    text.includes("app") ||
    text.includes("platform") ||
    text.includes("workflow")
  ) {
    return "saas";
  }

  if (
    text.includes("restaurant") ||
    text.includes("restaurace") ||
    text.includes("bistro") ||
    text.includes("osteria") ||
    text.includes("kavarna") ||
    text.includes("fine dining")
  ) {
    return "restaurant";
  }

  if (text.includes("catering")) return "catering";
  if (text.includes("barber") || text.includes("barbershop")) return "barber";

  if (
    text.includes("kadernice") ||
    text.includes("kadernictvi") ||
    text.includes("hair salon")
  ) {
    return "hair-salon";
  }

  if (
    text.includes("autoservis") ||
    text.includes("oprava aut") ||
    text.includes("servis aut")
  ) {
    return "autoservis";
  }

  if (
    text.includes("autobazar") ||
    text.includes("prodej aut") ||
    text.includes("dealer")
  ) {
    return "car-dealer";
  }

  if (
    text.includes("zednik") ||
    text.includes("stavebni firma") ||
    text.includes("rekonstrukce") ||
    text.includes("fasady")
  ) {
    return "zednik";
  }

  if (
    text.includes("realit") ||
    text.includes("makler") ||
    text.includes("nemovit") ||
    text.includes("developer") ||
    text.includes("developersky projekt")
  ) {
    return "real-estate";
  }

  if (
    text.includes("resort") ||
    text.includes("hotel") ||
    text.includes("wellness")
  ) {
    return "resort";
  }

  if (
    text.includes("cukr") ||
    text.includes("sugar") ||
    text.includes("food") ||
    text.includes("potrav")
  ) {
    return "food-product";
  }

  if (
    text.includes("shop") ||
    text.includes("eshop") ||
    text.includes("e-shop") ||
    text.includes("produkt")
  ) {
    return "ecommerce-product";
  }

  if (
    text.includes("advokat") ||
    text.includes("pravnik") ||
    text.includes("notar")
  ) {
    return "legal";
  }

  if (
    text.includes("klinika") ||
    text.includes("medical") ||
    text.includes("doctor")
  ) {
    return "healthcare";
  }

  if (
    text.includes("beauty") ||
    text.includes("kosmet") ||
    text.includes("esthetic")
  ) {
    return "beauty";
  }

  return "generic-business";
}

function getDefaultContactItems(industry: IndustryKind) {
  switch (industry) {
    case "restaurant":
    case "catering":
      return ["telefon", "email", "adresa kanceláře", "mapa"];
    case "barber":
    case "hair-salon":
      return ["telefon", "email", "adresa kanceláře", "otevírací doba"];
    case "autoservis":
    case "car-dealer":
      return ["telefon", "email", "adresa kanceláře", "otevírací doba"];
    default:
      return ["telefon", "email", "kontaktní formulář"];
  }
}

function getDefaultDesignReference(industry: IndustryKind): DesignReference {
  switch (industry) {
    case "fintech":
      return "fintech-neon";
    case "saas":
      return "signal-orchestration";
    case "restaurant":
    case "catering":
      return "restaurant-editorial";
    case "barber":
      return "barber-premium";
    case "autoservis":
    case "car-dealer":
      return "clean-automotive";
    case "zednik":
      return "service-trades";
    case "food-product":
    case "ecommerce-product":
      return "product-commerce";
    case "resort":
      return "cinematic-resort";
    case "real-estate":
    case "beauty":
    case "luxury-service":
      return "luxury-editorial";
    default:
      return "clean-business";
  }
}

function getDefaultFontMood(industry: IndustryKind): FontMood {
  switch (industry) {
    case "fintech":
    case "saas":
      return "tech";
    case "restaurant":
    case "resort":
    case "real-estate":
      return "editorial";
    case "beauty":
      return "luxury";
    case "barber":
    case "autoservis":
    case "zednik":
      return "trustworthy";
    case "food-product":
    case "catering":
    case "hair-salon":
      return "friendly";
    default:
      return "geometric";
  }
}

function getDefaultVisualStyle(industry: IndustryKind): VisualStyle {
  switch (industry) {
    case "fintech":
    case "saas":
      return "premium";
    case "restaurant":
    case "resort":
    case "real-estate":
    case "beauty":
      return "luxury";
    case "food-product":
    case "hair-salon":
      return "clean";
    case "barber":
    case "autoservis":
      return "bold";
    default:
      return "premium";
  }
}

function getDefaultLayout(industry: IndustryKind): LayoutPreference {
  switch (industry) {
    case "restaurant":
    case "resort":
      return "story";
    case "fintech":
    case "healthcare":
    case "car-dealer":
      return "split";
    case "barber":
    case "beauty":
      return "asymmetrical";
    case "real-estate":
      return "editorial";
    default:
      return "grid";
  }
}

function createDefaultPreferences(prompt = ""): GenerationPreferences {
  const industry = inferIndustryKind(prompt);

  return {
    speedMode: "premium",
    layoutPreference: getDefaultLayout(industry),
    visualStyle: getDefaultVisualStyle(industry),
    animationLevel:
      industry === "fintech" || industry === "saas" ? "rich" : "subtle",
    fontMood: getDefaultFontMood(industry),
    iconStyle:
      industry === "barber" || industry === "food-product"
        ? "solid"
        : "minimal",
    designReference: getDefaultDesignReference(industry),
    buttonStyle: "auto",
    promptEnhancerMode: "premium-brand",
    preferredPrimaryColor: "",
    preferredBackgroundColor: "",
    contactItems: getDefaultContactItems(industry),
    clientAnswers: {
      contactDetails: "",
      styleNotes: "",
      offerNotes: "",
      extras: "",
    },
    sourcePrompt: prompt,
  };
}


function createReferenceLockedPreferences(
  sourcePrompt = ""
): GenerationPreferences {
  return {
    speedMode: "premium",
    layoutPreference: "auto",
    visualStyle: "auto",
    animationLevel: "subtle",
    fontMood: "auto",
    iconStyle: "auto",
    designReference: "auto",
    buttonStyle: "auto",
    promptEnhancerMode: "balanced",
    preferredPrimaryColor: "",
    preferredBackgroundColor: "",
    contactItems: [],
    clientAnswers: {
      contactDetails: "",
      styleNotes: "",
      offerNotes: "",
      extras: "",
    },
    sourcePrompt,
  };
}

function mergeStoredPreferences(
  base: GenerationPreferences,
  incoming: unknown
): GenerationPreferences {
  if (!incoming || typeof incoming !== "object") return base;
  const value = incoming as Partial<GenerationPreferences>;

  return {
    ...base,
    speedMode:
      value.speedMode === "fast" ||
      value.speedMode === "balanced" ||
      value.speedMode === "premium"
        ? value.speedMode
        : base.speedMode,
    layoutPreference:
      typeof value.layoutPreference === "string"
        ? (value.layoutPreference as LayoutPreference)
        : base.layoutPreference,
    visualStyle:
      typeof value.visualStyle === "string"
        ? (value.visualStyle as VisualStyle)
        : base.visualStyle,
    animationLevel:
      typeof value.animationLevel === "string"
        ? (value.animationLevel as AnimationLevel)
        : base.animationLevel,
    fontMood:
      typeof value.fontMood === "string"
        ? (value.fontMood as FontMood)
        : base.fontMood,
    iconStyle:
      typeof value.iconStyle === "string"
        ? (value.iconStyle as IconStyle)
        : base.iconStyle,
    designReference:
      typeof value.designReference === "string"
        ? (value.designReference as DesignReference)
        : base.designReference,
    buttonStyle:
      typeof value.buttonStyle === "string"
        ? (value.buttonStyle as ButtonStyle)
        : base.buttonStyle,
    promptEnhancerMode:
      typeof value.promptEnhancerMode === "string"
        ? (value.promptEnhancerMode as PromptEnhancerMode)
        : base.promptEnhancerMode,
    preferredPrimaryColor:
      typeof value.preferredPrimaryColor === "string"
        ? value.preferredPrimaryColor
        : base.preferredPrimaryColor,
    preferredBackgroundColor:
      typeof value.preferredBackgroundColor === "string"
        ? value.preferredBackgroundColor
        : base.preferredBackgroundColor,
    contactItems: Array.isArray(value.contactItems)
      ? value.contactItems.filter((item): item is string => typeof item === "string")
      : base.contactItems,
    clientAnswers:
      value.clientAnswers && typeof value.clientAnswers === "object"
        ? {
            ...base.clientAnswers,
            ...value.clientAnswers,
          }
        : base.clientAnswers,
    sourcePrompt:
      typeof value.sourcePrompt === "string" ? value.sourcePrompt : base.sourcePrompt,
  };
}



function getEffectivePrompt(params: {
  prompt?: string;
  inputMode: InputMode;
  referenceUrl?: string;
  referenceHtml?: string;
  attachments?: AttachmentItem[];
}) {
  const prompt = (params.prompt || "").trim();
  const referenceUrl = (params.referenceUrl || "").trim();
  const referenceHtml = (params.referenceHtml || "").trim();
  const hasScreenshot =
    params.inputMode === "screenshot" ||
    (params.attachments || []).some((item) => item.kind === "screenshot");

  if (params.inputMode === "url" && referenceUrl) {
    return [
      `Vytvoř nový web podle této URL reference: ${referenceUrl}.`,
      "URL reference je PRIMÁRNÍ zdroj layoutu, struktury, hierarchie, vizuálního směru, kompozice a rytmu sekcí.",
      prompt ? `Doplňující instrukce od uživatele: ${prompt}` : "",
      "Nevytvářej generický web podle oboru. Primárně se řiď URL referencí a použij prompt jen jako sekundární vrstvu.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (params.inputMode === "html" && referenceHtml) {
    return [
      "Vytvoř nový web podle dodaného HTML základu.",
      "HTML je PRIMÁRNÍ zdroj struktury, pořadí sekcí a layoutu.",
      prompt ? `Doplňující instrukce od uživatele: ${prompt}` : "",
      "Výsledek výrazně vizuálně i UX vylepši, ale neudělej generický web.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (hasScreenshot) {
    return [
      "Vytvoř nový web podle přiložené screenshot reference.",
      "Screenshot je PRIMÁRNÍ zdroj layoutu, hierarchie, kompozice a vizuálního směru.",
      prompt ? `Doplňující instrukce od uživatele: ${prompt}` : "",
      "Nevytvářej generický web podle oboru. Primárně se řiď screenshot referencí.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return prompt;
}


function sanitizeReferenceUrl(value?: string) {
  const trimmed = (value || "").trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

function getGenerationRequestInput(params: {
  prompt?: string;
  inputMode: InputMode;
  referenceUrl?: string;
  referenceHtml?: string;
  attachments?: AttachmentItem[];
}) {
  const safeInputMode: InputMode =
    params.inputMode === "url" ||
    params.inputMode === "html" ||
    params.inputMode === "screenshot"
      ? params.inputMode
      : "prompt";

  const safeReferenceUrl =
    safeInputMode === "url" ? sanitizeReferenceUrl(params.referenceUrl) : "";
  const safeReferenceHtml =
    safeInputMode === "html" ? (params.referenceHtml || "").trim() : "";
  const safeAttachments = Array.isArray(params.attachments)
    ? params.attachments.filter(Boolean)
    : [];

  const effectivePrompt = getEffectivePrompt({
    prompt: params.prompt,
    inputMode: safeInputMode,
    referenceUrl: safeReferenceUrl,
    referenceHtml: safeReferenceHtml,
    attachments: safeAttachments,
  }).trim();

  return {
    effectivePrompt,
    inputMode: safeInputMode,
    referenceUrl: safeReferenceUrl,
    referenceHtml: safeReferenceHtml,
    attachments: safeAttachments,
  };
}

function getQuestionsForIndustry(industry: IndustryKind): Otazka[] {
  const common: Otazka[] = [
    {
      id: "contactDetails",
      appendLabel: "Kontakty",
      text: "Jaké kontaktní údaje chcete na webu zobrazit?",
      placeholder: "Např. telefon, e-mail, adresa, otevírací doba, formulář…",
    },
    {
      id: "offerNotes",
      appendLabel: "Cíl webu",
      text: "Komu je web určen a co má návštěvník po příchodu hlavně udělat?",
      placeholder:
        "Např. rezervovat termín, zavolat, vyplnit poptávku, prohlédnout nabídku…",
    },
    {
      id: "styleNotes",
      appendLabel: "Styl",
      text: "Jak má web působit? Barvy, fonty, styl, úroveň luxusu nebo reference.",
      placeholder:
        "Např. jemný editorial styl, světlý premium minimalismus, dark wow SaaS, serif nadpisy…",
    },
    {
      id: "extras",
      appendLabel: "Logo a značka",
      text: "Máte logo, slogan nebo pravidla značky? Logo můžete nahrát níže přímo během otázek.",
      placeholder:
        "Např. používáme zlatou a krémovou, logo je textové, značka má působit velmi prémiově…",
    },
  ];

  switch (industry) {
    case "real-estate":
      return [
        ...common,
        {
          id: "offerNotes",
          appendLabel: "Nabídka / projekt",
          text: "Prodáváte developerský projekt, jednotlivé nemovitosti nebo služby makléře?",
          placeholder:
            "Např. prémiový developerský projekt ve Vinohradech, prodej bytů, investiční nemovitosti…",
        },
        {
          id: "styleNotes",
          appendLabel: "Reference stylu",
          text: "Má to působit spíš jako klidný luxusní editorial developerský web?",
          placeholder:
            "Např. velké full-bleed interiéry, tenké linky, jemná serif typografie, hodně vzduchu, velmi prémiové…",
        },
      ];

    case "healthcare":
      return [
        ...common,
        {
          id: "offerNotes",
          appendLabel: "Služby",
          text: "Jaké služby nebo specializace chcete nejvíc zdůraznit?",
          placeholder:
            "Např. praktický lékař, prevence, očkování, vstupní prohlídky, objednání…",
        },
      ];

    case "restaurant":
      return [
        ...common,
        {
          id: "offerNotes",
          appendLabel: "Hlavní nabídka",
          text: "Co chcete na webu restaurace nejvíc prodat?",
          placeholder:
            "Např. degustační menu, rezervace, brunch, rodinná atmosféra…",
        },
      ];

    default:
      return common;
  }
}

function getIndustryDisplayName(industry: IndustryKind) {
  const industryTextMap: Record<IndustryKind, string> = {
    fintech: "fintech",
    saas: "SaaS / software",
    "real-estate": "reality / developerský projekt",
    resort: "resort / hotel",
    "luxury-service": "prémiová služba",
    "food-product": "produkt / potravina",
    "ecommerce-product": "e-shop / produkt",
    healthcare: "zdravotnictví",
    legal: "právní služby",
    beauty: "beauty",
    restaurant: "restaurace",
    catering: "catering",
    barber: "barber",
    "hair-salon": "kadeřnictví",
    autoservis: "autoservis",
    "car-dealer": "prodej aut",
    zednik: "stavební / zednické práce",
    "generic-business": "obecná firma",
  };

  return industryTextMap[industry];
}

function getPostGenerateSuggestions(industry: IndustryKind) {
  switch (industry) {
    case "real-estate":
      return [
        "Vylepši hero na luxusnější editorial prezentaci projektu.",
        "Uprav navigaci a menu do prémiovější real-estate podoby.",
        "Zesil důraz na lokalitu, galerii a standardy projektu.",
      ];
    case "healthcare":
      return [
        "Zpřehledni služby a ordinační hodiny.",
        "Uprav web na důvěryhodnější a klidnější styl.",
        "Posil sekci objednání a kontaktu.",
      ];
    case "saas":
    case "fintech":
      return [
        "Vylepši hero na výraznější wow produktovou sekci.",
        "Uprav pricing a CTA pro vyšší konverzi.",
        "Přidej silnější social proof a reference.",
      ];
    case "restaurant":
    case "catering":
      return [
        "Vylepši sekci nabídky a rezervace.",
        "Přidej atmosféru a výraznější food vizuály.",
        "Uprav texty, aby působily víc prémiově a chutně.",
      ];
    default:
      return [
        "Vylepši hero a první dojem webu.",
        "Zpřehledni hlavní nabídku a CTA.",
        "Posil kontakt a důvěryhodnost.",
      ];
  }
}

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

        return { id, type, label: prettifySectionLabel(id, type) };
      })
      .filter(Boolean) as SectionMeta[];

    return Array.from(new Map(sections.map((s) => [s.id, s])).values());
  } catch {
    return [];
  }
}

function injectEditableTextAttributes(html: string) {
  if (!html) return html;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");
    const selectors = [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "span",
      "li",
      "a",
      "button",
      "label",
      "small",
      "strong",
      "em",
      "blockquote",
    ].join(",");

    let index = 1;

    Array.from(doc.body.querySelectorAll(selectors)).forEach((node) => {
      const el = node as HTMLElement;
      if (el.closest("[data-no-inline-edit='true']")) return;
      if (el.querySelector(selectors)) return;

      const text = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (!text || text.length < 2) return;

      if (!el.getAttribute("data-zyvia-text-id")) {
        el.setAttribute("data-zyvia-text-id", `txt-${index}`);
        index += 1;
      }
    });

    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

function mergeAnswerValue(
  originalValue: string | undefined,
  appendLabel: string | undefined,
  nextValue: string
) {
  const trimmed = nextValue.trim();
  if (!trimmed) return originalValue || "";

  const nextLine = appendLabel ? `${appendLabel}: ${trimmed}` : trimmed;
  if (!originalValue?.trim()) return nextLine;
  return `${originalValue.trim()}\n${nextLine}`;
}

async function parseApiResponse<T>(res: Response): Promise<T> {
  const raw = await res.text();
  const contentType = res.headers.get("content-type") || "";

  if (!raw) throw new Error("Server vrátil prázdnou odpověď.");

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw) as T;
    } catch {
      throw new Error(`Server vrátil neplatný JSON: ${raw.slice(0, 220)}`);
    }
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    const cleaned = raw
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 220);

    throw new Error(
      cleaned ||
        "Server nevrátil JSON. Pravděpodobně došlo k chybě na backendu."
    );
  }
}

function replaceImageAssetsInHtml(html: string, assets: ResolvedAsset[]) {
  if (!html || !assets?.length) return html;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<body>${html}</body>`, "text/html");

    assets.forEach((asset) => {
      const node = doc.body.querySelector(
        `[data-image-slot="${asset.slot}"]`
      ) as HTMLElement | null;

      if (!node) return;

      if (node.tagName.toLowerCase() === "img") {
        const img = node as HTMLImageElement;
        img.src = asset.url;
        img.alt = asset.alt || img.alt || "";
        img.loading = "lazy";
        img.decoding = "async";
        return;
      }

      node.style.backgroundImage = `url("${asset.url}")`;
      node.setAttribute("aria-label", asset.alt || "");
      node.setAttribute("role", "img");
    });

    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

function updateTextInHtml(
  html: string,
  sectionId: string,
  textId: string,
  newText: string,
  href?: string
) {
  if (!html || !textId || !sectionId) return html;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<body>${injectEditableTextAttributes(html)}</body>`,
      "text/html"
    );

    const section = doc.body.querySelector(
      `[data-section-id="${sectionId}"]`
    ) as HTMLElement | null;
    if (!section) return html;

    const target = section.querySelector(
      `[data-zyvia-text-id="${textId}"]`
    ) as HTMLElement | null;
    if (!target) return html;

    target.textContent = newText;

    if (typeof href === "string") {
      const anchor = target.closest("a");
      if (anchor) anchor.setAttribute("href", href.trim() || "#");
    }

    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

function buildPreviewDocument(
  html: string,
  css: string,
  js: string,
  interactive = true
) {
  const htmlWithEditableMarkers = interactive
    ? injectEditableTextAttributes(html)
    : html;

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Zyvia Preview</title>
  <style>
${css}

*,
*::before,
*::after { box-sizing: border-box; }

html { scroll-behavior: smooth; }
body { position: relative; }

${
  interactive
    ? `
[data-section-id] { transition: outline-color .18s ease, box-shadow .18s ease, transform .18s ease; }
[data-section-id].zyvia-section-hover {
  outline: 2px solid rgba(90,209,255,.45);
  outline-offset: 4px;
  box-shadow: 0 0 0 4px rgba(90,209,255,.08);
  cursor: pointer !important;
}
[data-section-id].zyvia-section-selected {
  outline: 2px solid rgba(124,92,255,.75);
  outline-offset: 4px;
  box-shadow: 0 0 0 4px rgba(124,92,255,.14), 0 10px 30px rgba(124,92,255,.16);
}
[data-zyvia-text-id].zyvia-text-hover {
  outline: 2px dashed rgba(255,255,255,.35);
  outline-offset: 3px;
  cursor: text !important;
}
[data-image-slot] { transition: outline-color .18s ease, box-shadow .18s ease, transform .18s ease; }
[data-image-slot].zyvia-image-hover {
  outline: 2px dashed rgba(255,194,61,.78);
  outline-offset: 4px;
  box-shadow: 0 0 0 4px rgba(255,194,61,.12);
  cursor: pointer !important;
}
[data-image-slot].zyvia-image-selected {
  outline: 2px solid rgba(255,194,61,.95);
  outline-offset: 4px;
  box-shadow: 0 0 0 4px rgba(255,194,61,.16), 0 14px 36px rgba(255,194,61,.14);
}
.zyvia-section-badge {
  position: absolute;
  z-index: 999999;
  pointer-events: none;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(9,10,15,.92);
  color: #fff;
  font: 12px/1.2 Inter,system-ui,sans-serif;
  border: 1px solid rgba(255,255,255,.12);
  box-shadow: 0 8px 22px rgba(0,0,0,.20);
  transform: translateY(-10px);
  white-space: nowrap;
}`
    : `
a,
button,
[role="button"],
input,
textarea,
select,
label {
  pointer-events: none !important;
  cursor: default !important;
}
`
}
  </style>
</head>
<body>
${htmlWithEditableMarkers}
<script>
${js}
</script>
${
  interactive
    ? `<script>
(function () {
  let selectedSectionId = null;
  let selectedImageSlot = null;
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

  function getEditableTextFromEventTarget(target) {
    if (!target || !(target instanceof Element)) return null;
    const el = target.closest("[data-zyvia-text-id]");
    if (!el || el.closest("[data-no-inline-edit='true']")) return null;
    return el;
  }

  function getEditableImageFromEventTarget(target) {
    if (!target || !(target instanceof Element)) return null;
    const el = target.closest("[data-image-slot]");
    if (!el || el.closest("[data-no-inline-edit='true']")) return null;
    return el;
  }

  function clearHoverStates() {
    document.querySelectorAll("[data-section-id].zyvia-section-hover").forEach((n) => n.classList.remove("zyvia-section-hover"));
    document.querySelectorAll("[data-zyvia-text-id].zyvia-text-hover").forEach((n) => n.classList.remove("zyvia-text-hover"));
    document.querySelectorAll("[data-image-slot].zyvia-image-hover").forEach((n) => n.classList.remove("zyvia-image-hover"));
  }

  function applySelectedState() {
    document.querySelectorAll("[data-section-id]").forEach((node) => {
      const id = node.getAttribute("data-section-id");
      node.classList.toggle("zyvia-section-selected", id === selectedSectionId);
    });

    document.querySelectorAll("[data-image-slot]").forEach((node) => {
      const slot = node.getAttribute("data-image-slot");
      node.classList.toggle("zyvia-image-selected", slot === selectedImageSlot);
    });
  }

  function moveBadgeForElement(element, label) {
    const badge = ensureBadge();
    const rect = element.getBoundingClientRect();
    badge.textContent = label;
    badge.style.display = "block";
    badge.style.left = window.scrollX + rect.left + 8 + "px";
    badge.style.top = window.scrollY + rect.top + 8 + "px";
  }

  function hideBadge() {
    if (!badgeEl) return;
    badgeEl.style.display = "none";
  }

  function shouldAllowNativeInteraction(target) {
    if (!(target instanceof Element)) return false;
    const clickable = target.closest("button, a, [role='button']");
    if (!clickable) return false;

    const haystack = [
      clickable.textContent || clickable.getAttribute("aria-label") || "",
      clickable.getAttribute("class") || "",
      clickable.getAttribute("id") || "",
      clickable.getAttribute("data-menu-toggle") || "",
      clickable.getAttribute("data-nav-toggle") || "",
      clickable.getAttribute("data-mobile-menu-toggle") || "",
      clickable.getAttribute("data-hamburger") || "",
    ].join(" ").toLowerCase();

    return /menu|hamburger|burger|nav-toggle|mobile-menu|open menu|otevrit menu|otevřít menu/.test(haystack);
  }

  function inferOrientation(el) {
    const rect = el.getBoundingClientRect();
    if (!rect.width || !rect.height) return "landscape";
    const ratio = rect.width / rect.height;
    if (ratio > 1.12) return "landscape";
    if (ratio < 0.88) return "portrait";
    return "square";
  }

  function extractBackgroundImageUrl(el) {
    const backgroundImage = window.getComputedStyle(el).backgroundImage || "";
    if (!backgroundImage || backgroundImage === "none") return "";
    const normalized = backgroundImage.trim();
    if (!normalized.toLowerCase().startsWith("url(")) return "";
    let value = normalized.slice(4, -1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    return value;
  }

  document.addEventListener("mouseover", function (event) {
    clearHoverStates();
    const editableText = getEditableTextFromEventTarget(event.target);
    if (editableText) {
      editableText.classList.add("zyvia-text-hover");
      hideBadge();
      return;
    }

    const editableImage = getEditableImageFromEventTarget(event.target);
    if (editableImage) {
      editableImage.classList.add("zyvia-image-hover");
      moveBadgeForElement(
        editableImage,
        editableImage.getAttribute("aria-label") ||
          editableImage.getAttribute("alt") ||
          editableImage.getAttribute("data-image-slot") ||
          "Obrázek"
      );
      return;
    }

    const section = getSectionFromEventTarget(event.target);
    if (section) {
      section.classList.add("zyvia-section-hover");
      moveBadgeForElement(
        section,
        section.getAttribute("data-section-type") ||
          section.getAttribute("data-section-id") ||
          "Sekce"
      );
    } else {
      hideBadge();
    }
  });

  document.addEventListener("mouseout", function (event) {
    const related = event.relatedTarget;
    if (related instanceof Element) {
      if (
        related.closest("[data-section-id]") ||
        related.closest("[data-zyvia-text-id]") ||
        related.closest("[data-image-slot]")
      ) {
        return;
      }
    }

    clearHoverStates();
    hideBadge();
  });

  document.addEventListener("click", function (event) {
    if (shouldAllowNativeInteraction(event.target)) return;

    const editableImage = getEditableImageFromEventTarget(event.target);
    if (editableImage) {
      event.preventDefault();
      event.stopPropagation();

      const parentSection = editableImage.closest("[data-section-id]");
      const tagName = editableImage.tagName || "";
      const slot = editableImage.getAttribute("data-image-slot") || "";
      const alt = editableImage.getAttribute("alt") || editableImage.getAttribute("aria-label") || "";

      let currentUrl = "";
      if (tagName.toLowerCase() === "img") {
        currentUrl = editableImage.currentSrc || editableImage.getAttribute("src") || "";
      } else {
        currentUrl = extractBackgroundImageUrl(editableImage);
      }

      window.parent.postMessage({
        type: "zyvia-image-select",
        slot,
        tagName,
        sectionId: parentSection ? parentSection.getAttribute("data-section-id") || "" : "",
        currentUrl,
        alt,
        orientation: inferOrientation(editableImage),
      }, "*");
      return;
    }

    const editable = getEditableTextFromEventTarget(event.target);
    if (editable) {
      event.preventDefault();
      event.stopPropagation();

      const parentSection = editable.closest("[data-section-id]");
      const linkEl = editable.closest("a");

      window.parent.postMessage({
        type: "zyvia-text-select",
        textId: editable.getAttribute("data-zyvia-text-id") || "",
        textValue: editable.textContent || "",
        tagName: editable.tagName || "",
        sectionId: parentSection ? parentSection.getAttribute("data-section-id") || "" : "",
        href: linkEl ? linkEl.getAttribute("href") || "" : "",
      }, "*");
      return;
    }

    const section = getSectionFromEventTarget(event.target);
    const clickable = event.target instanceof Element ? event.target.closest("a, button") : null;
    if (clickable && section) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!section) return;

    event.preventDefault();
    event.stopPropagation();

    window.parent.postMessage({
      type: "zyvia-section-select",
      sectionId: section.getAttribute("data-section-id") || "",
      sectionType: section.getAttribute("data-section-type") || "",
    }, "*");
  }, true);

  window.addEventListener("message", function (event) {
    const data = event.data;
    if (!data || typeof data !== "object") return;

    if (data.type === "zyvia-set-selected-section") {
      selectedSectionId = data.sectionId || null;
      applySelectedState();
    }

    if (data.type === "zyvia-set-selected-image") {
      selectedImageSlot = data.slot || null;
      applySelectedState();
    }
  });

  applySelectedState();
})();
</script>`
    : ""
}
</body>
</html>`;
}

async function downloadZipSite(html: string, css: string, js: string) {
  const zip = new JSZip();
  zip.file(
    "index.html",
    `<!DOCTYPE html>
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
</html>`
  );
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

function BuilderPlaceholder({ status }: { status: string }) {
  return (
    <div className="flex h-full min-h-[720px] w-full items-center justify-center px-4 py-5">
      <div className="relative h-full min-h-[680px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[#06070b]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
        <div className="pointer-events-none absolute left-[10%] top-[8%] h-40 w-40 rounded-[10px] bg-violet-500/6 blur-[90px]" />
        <div className="pointer-events-none absolute bottom-[10%] right-[8%] h-48 w-48 rounded-[10px] bg-cyan-500/6 blur-[100px]" />

        <div className="relative z-10 flex h-full flex-col p-5 md:p-7">
          <div className="mx-auto w-full max-w-5xl flex-1">
            <div className="mb-4 flex items-center justify-between rounded-[1.3rem] border border-white/10 bg-white/[0.03] px-4 py-3 animate-[zyviaPulse_2.2s_ease-in-out_infinite]">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-[10px] border border-cyan-400/20 bg-cyan-400/10" />
                <div className="space-y-2">
                  <div className="h-3 w-36 rounded-[10px] bg-white/10" />
                  <div className="h-3 w-20 rounded-[10px] bg-white/5" />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="h-9 w-20 rounded-[10px] border border-white/10 bg-white/[0.04]" />
                <div className="h-9 w-24 rounded-[10px] border border-cyan-400/20 bg-cyan-400/10" />
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[1.7rem] border border-violet-400/20 bg-gradient-to-br from-violet-500/10 via-white/[0.02] to-cyan-500/10 p-5 animate-[zyviaPulse_2.5s_ease-in-out_infinite]">
                <div className="mb-4 h-7 w-40 rounded-[10px] border border-cyan-400/20 bg-cyan-400/10" />
                <div className="space-y-3">
                  <div className="h-7 w-[92%] rounded-[10px] bg-white/10" />
                  <div className="h-7 w-[84%] rounded-[10px] bg-white/10" />
                  <div className="h-7 w-[78%] rounded-[10px] bg-white/10" />
                  <div className="h-7 w-[62%] rounded-[10px] bg-white/10" />
                </div>
                <div className="mt-8 flex gap-3">
                  <div className="h-11 w-32 rounded-[10px] border border-cyan-400/20 bg-cyan-400/15" />
                  <div className="h-11 w-36 rounded-[10px] border border-white/10 bg-white/[0.04]" />
                </div>
              </div>

              <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-5 animate-[zyviaPulse_2.8s_ease-in-out_infinite]">
                <div className="mb-4 h-[320px] rounded-[1.3rem] border border-white/10 bg-gradient-to-br from-white/5 to-cyan-400/5" />
                <div className="space-y-3">
                  <div className="h-5 w-36 rounded-[10px] bg-white/10" />
                  <div className="h-4 w-[92%] rounded-[10px] bg-white/6" />
                </div>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6">
            <div className="w-full max-w-2xl rounded-[18px] border border-white/10 bg-[#07070b]/70 px-6 py-6 text-center backdrop-blur-xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/8 px-4 py-2 text-[13px] text-cyan-100">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-300 animate-pulse" />
                Zyvia generuje sekce
              </div>

              <div className="text-lg font-medium text-white md:text-xl">
                {status || "Sestavuji strukturu webu…"}
              </div>

              <div className="mt-2 text-[13px] leading-6 text-zinc-400">
                Vytvářím layout, vizuální směr, hierarchii obsahu a CTA prvky.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AiEditorPage() {
  const [prompt, setPrompt] = useState("");
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");

  const [inputMode, setInputMode] = useState<InputMode>("prompt");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [referenceHtml, setReferenceHtml] = useState("");
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [improving, setImproving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [resolvingAssets, setResolvingAssets] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishedUrl, setPublishedUrl] = useState("");
  const [publishedInspectUrl, setPublishedInspectUrl] = useState("");
  const [publishPanelOpen, setPublishPanelOpen] = useState(false);
  const [publishForm, setPublishForm] = useState<PublishFormState>({
    siteName: "Můj web",
    slug: "",
    description: "",
  });

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Připraveno");

  const [viewMode, setViewMode] = useState<ViewMode>("desktop");
  const [activeTab, setActiveTab] = useState<ActiveTab>("preview");

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedSectionType, setSelectedSectionType] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "system-initial",
      role: "system",
      text: "Zyvia je připravena tvořit weby podle oboru, loga a vašich odpovědí v chatu.",
    },
  ]);

  const [chatInput, setChatInput] = useState("");

  const [textModalOpen, setTextModalOpen] = useState(false);
  const [selectedText, setSelectedText] = useState<EditableTextSelection | null>(null);
  const [editedTextValue, setEditedTextValue] = useState("");
  const [editedHrefValue, setEditedHrefValue] = useState("");

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<EditableImageSelection | null>(null);
  const [imagePickerTab, setImagePickerTab] = useState<"search" | "upload">("search");
  const [imageSearchQuery, setImageSearchQuery] = useState("");
  const [imageSearchResults, setImageSearchResults] = useState<ResolvedAsset[]>([]);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const [uploadedLogo, setUploadedLogo] = useState<BrandLogoAsset | null>(null);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);

  const [generationPreferences, setGenerationPreferences] =
    useState<GenerationPreferences>(createDefaultPreferences(""));
  const [otazky, setOtazky] = useState<Otazka[]>([]);
  const [aktivniOtazkaIndex, setAktivniOtazkaIndex] = useState(0);
  const [odpovedInput, setOdpovedInput] = useState("");
  const [otazkyDokonceny, setOtazkyDokonceny] = useState(false);

  const [generatedIndustry, setGeneratedIndustry] = useState<IndustryKind | null>(null);
  const [postGenerateSuggestions, setPostGenerateSuggestions] = useState<string[]>([]);
  const [referenceSummaryDebug, setReferenceSummaryDebug] =
    useState<ReferenceSiteSummary | null>(null);
  const [layoutFingerprintDebug, setLayoutFingerprintDebug] =
    useState<ReferenceLayoutFingerprint | null>(null);
  const [screenshotAnalysisDebug, setScreenshotAnalysisDebug] =
    useState<ReferenceScreenshotAnalysis | null>(null);
  const [hasReferenceScreenshotDebug, setHasReferenceScreenshotDebug] =
    useState(false);

  const progressRef = useRef<number | null>(null);
  const loadingMessageRef = useRef<number>(0);
  const autostartRef = useRef(false);
  const chatInputRef = useRef<HTMLTextAreaElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const iframeKey = useMemo(
    () => `${html.length}-${css.length}-${js.length}`,
    [html, css, js]
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
    return buildPreviewDocument(html, css, js, false);
  }, [html, css, js]);

  const editorDocument = useMemo(() => {
    if (!html) return "";
    return buildPreviewDocument(html, css, js, true);
  }, [html, css, js]);

  const aktualniOtazka = otazky[aktivniOtazkaIndex] || null;

  const previewWidthClass =
    viewMode === "desktop"
      ? "w-full"
      : viewMode === "tablet"
      ? "mx-auto w-[920px] max-w-full"
      : "mx-auto w-[430px] max-w-full";

  function getChatHistoryPayload() {
    return messages.slice(-12).map((message) => ({
      role: message.role,
      text: message.text,
    }));
  }

  function scrollChatToBottom(smooth = true) {
    chatBottomRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    });
  }

  function slugifyProjectName(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48);
  }

  function openPublishPanel() {
    const fallbackName =
      prompt.trim().split(/[\n\.]/)[0]?.trim().slice(0, 60) || "Můj web";
    const nextSlug =
      publishForm.slug.trim() || slugifyProjectName(fallbackName) || "zyvia-web";

    setPublishForm((prev) => ({
      siteName: prev.siteName.trim() ? prev.siteName : fallbackName,
      slug: nextSlug,
      description: prev.description,
    }));
    setPublishError(null);
    setPublishPanelOpen(true);
  }

  function startQuestionFlow(currentPrompt: string) {
    const prefs = mergeStoredPreferences(
      createDefaultPreferences(currentPrompt),
      generationPreferences
    );
    const industry = inferIndustryKind(currentPrompt);
    const nextOtazky = getQuestionsForIndustry(industry);

    setGenerationPreferences(prefs);
    setOtazky(nextOtazky);
    setAktivniOtazkaIndex(0);
    setOdpovedInput("");
    setOtazkyDokonceny(false);

    setMessages((prev) => [
      ...prev,
      {
        id: `industry-detected-${Date.now()}`,
        role: "system",
        text: `Rozpoznaný obor: ${getIndustryDisplayName(industry)}. Před generováním se vás zeptám na víc konkrétních věcí, aby výsledek lépe seděl projektu.`,
      },
      {
        id: `question-start-${Date.now() + 1}`,
        role: "assistant",
        text: nextOtazky[0]?.text || "Můžeme generovat.",
      },
    ]);
  }

  function applyFollowUpSuggestion(suggestion: string) {
    setChatInput(
      selectedSectionMeta
        ? `${suggestion} Zaměř se na sekci ${selectedSectionMeta.label}.`
        : `${suggestion} Vyberu pak konkrétní sekci v náhledu.`
    );

    if (isFullscreen) {
      setIsFullscreen(false);
      setTimeout(() => chatInputRef.current?.focus(), 200);
      return;
    }

    setTimeout(() => {
      chatInputRef.current?.focus();
      scrollChatToBottom(true);
    }, 60);
  }

  async function resolveAssetsAndPatchHtml(
    assetPlan: AssetPlanItem[] | undefined,
    currentPrompt: string
  ) {
    if (!assetPlan?.length) return;

    setResolvingAssets(true);

    try {
      const res = await fetch("/api/resolve-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: currentPrompt, assetPlan }),
      });

      const data = await parseApiResponse<AssetResolveResponse>(res);
      if (!res.ok) throw new Error(data?.error ?? "Dohledání obrázků selhalo");

      if (data.assets?.length) {
        setHtml((prev) => replaceImageAssetsInHtml(prev, data.assets));
        setMessages((prev) => [
          ...prev,
          {
            id: `assets-resolved-${Date.now()}`,
            role: "system",
            text: `Obrázky byly doplněny (${data.assets
              .map((a) => a.source)
              .join(", ")}). Kliknutím na obrázek ho můžete změnit.`,
          },
        ]);
      }
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assets-failed-${Date.now()}`,
          role: "system",
          text: `Layout zůstal zachovaný, ale obrázky se nepodařilo dohledat: ${
            e?.message ?? "neznámá chyba"
          }`,
        },
      ]);
    } finally {
      setResolvingAssets(false);
    }
  }

  async function searchEditorImages(
    queryOverride?: string,
    orientationOverride?: "landscape" | "portrait" | "square"
  ) {
    const finalQuery = (queryOverride ?? imageSearchQuery).trim();
    const finalOrientation =
      orientationOverride ?? selectedImage?.orientation ?? "landscape";

    if (finalQuery.length < 2) {
      setImageSearchResults([]);
      return;
    }

    setImageSearchLoading(true);
    setImageUploadError(null);

    try {
      const res = await fetch("/api/resolve-assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          searchQuery: finalQuery,
          orientation: finalOrientation,
          maxResults: 8,
        }),
      });

      const data = await parseApiResponse<AssetSearchResponse>(res);
      if (!res.ok) throw new Error(data?.error ?? "Vyhledání obrázků selhalo");
      setImageSearchResults(Array.isArray(data.images) ? data.images : []);
    } catch (e: any) {
      setImageUploadError(e?.message ?? "Vyhledání obrázků selhalo");
      setImageSearchResults([]);
    } finally {
      setImageSearchLoading(false);
    }
  }

  function applyImageChange(asset: ResolvedAsset) {
    if (!selectedImage) return;

    setHtml((prev) =>
      replaceImageAssetsInHtml(prev, [{ ...asset, slot: selectedImage.slot }])
    );
    setSelectedSectionId(selectedImage.sectionId);

    setMessages((prev) => [
      ...prev,
      {
        id: `image-updated-${Date.now()}`,
        role: "assistant",
        text: `Obrázek ve vybrané sekci ${prettifySectionLabel(
          selectedImage.sectionId,
          ""
        )} byl změněn.`,
      },
    ]);

    closeImageModal();
  }

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !selectedImage) return;

    if (!file.type.startsWith("image/")) {
      setImageUploadError("Vybraný soubor není obrázek.");
      event.target.value = "";
      return;
    }

    setImageUploadError(null);
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        setImageUploadError("Soubor se nepodařilo načíst.");
        return;
      }

      applyImageChange({
        slot: selectedImage.slot,
        url: result,
        alt: selectedImage.alt || file.name.replace(/\.[^.]+$/, ""),
        source: "fallback",
      });
    };

    reader.onerror = () => setImageUploadError("Nahrání obrázku selhalo.");
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function closeImageModal() {
    setImageModalOpen(false);
    setSelectedImage(null);
    setImageSearchResults([]);
    setImageSearchQuery("");
    setImageUploadError(null);
    setImagePickerTab("search");
  }

  function removeUploadedLogo() {
    setUploadedLogo(null);
    setLogoUploadError(null);
    sessionStorage.removeItem("ai_webgen_logo_data_url");
    sessionStorage.removeItem("ai_webgen_logo_name");
    sessionStorage.removeItem("ai_webgen_logo_mime_type");
  }

  function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const looksLikeSvg =
      file.name.toLowerCase().endsWith(".svg") ||
      file.type === "image/svg+xml";

    const isAllowed =
      ACCEPTED_LOGO_TYPES.includes(file.type) ||
      looksLikeSvg ||
      file.type === "";

    if (!isAllowed) {
      setLogoUploadError("Povolené jsou pouze PNG, JPG, SVG nebo WEBP.");
      event.target.value = "";
      return;
    }

    setLogoUploadError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (!result) {
        setLogoUploadError("Logo se nepodařilo načíst.");
        return;
      }

      const nextLogo: BrandLogoAsset = {
        name: file.name,
        mimeType: file.type || (looksLikeSvg ? "image/svg+xml" : "image/png"),
        dataUrl: result,
      };

      setUploadedLogo(nextLogo);
      sessionStorage.setItem("ai_webgen_logo_data_url", nextLogo.dataUrl);
      sessionStorage.setItem("ai_webgen_logo_name", nextLogo.name);
      sessionStorage.setItem("ai_webgen_logo_mime_type", nextLogo.mimeType);

      setMessages((prev) => [
        ...prev,
        {
          id: `logo-uploaded-${Date.now()}`,
          role: "system",
          text: `Logo "${nextLogo.name}" bylo nahráno a odešle se do generování webu.`,
        },
      ]);
    };

    reader.onerror = () => {
      setLogoUploadError("Nahrání loga selhalo.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  }

  useEffect(() => {
    const initialPrompt = sessionStorage.getItem("ai_webgen_prompt") ?? "";
    const autostart = sessionStorage.getItem("ai_webgen_autostart") === "1";
    const storedInputMode =
      sessionStorage.getItem("ai_webgen_source_mode") ??
      sessionStorage.getItem("ai_webgen_input_mode") ??
      "prompt";
    const storedReferenceUrl =
      sessionStorage.getItem("ai_webgen_source_url") ??
      sessionStorage.getItem("ai_webgen_reference_url") ??
      "";
    const storedReferenceHtml =
      sessionStorage.getItem("ai_webgen_source_html") ??
      sessionStorage.getItem("ai_webgen_reference_html") ??
      "";
    const storedAttachments = sessionStorage.getItem("ai_webgen_attachments") ?? "[]";
    const storedLandingPreferences =
      sessionStorage.getItem("ai_webgen_landing_preferences") ??
      sessionStorage.getItem("ai_webgen_generation_preferences") ??
      "{}";

    const storedLogoDataUrl =
      sessionStorage.getItem("ai_webgen_logo_data_url") ?? "";
    const storedLogoName = sessionStorage.getItem("ai_webgen_logo_name") ?? "";
    const storedLogoMimeType =
      sessionStorage.getItem("ai_webgen_logo_mime_type") ?? "image/png";

    if (storedLogoDataUrl && storedLogoName) {
      setUploadedLogo({
        name: storedLogoName,
        mimeType: storedLogoMimeType,
        dataUrl: storedLogoDataUrl,
      });
    }

    if (
      storedInputMode === "prompt" ||
      storedInputMode === "url" ||
      storedInputMode === "screenshot" ||
      storedInputMode === "html"
    ) {
      setInputMode(storedInputMode);
    }

    setReferenceUrl(storedReferenceUrl);
    setReferenceHtml(storedReferenceHtml);

    const bootPrompt = getEffectivePrompt({
      prompt: initialPrompt,
      inputMode:
        storedInputMode === "prompt" ||
        storedInputMode === "url" ||
        storedInputMode === "screenshot" ||
        storedInputMode === "html"
          ? storedInputMode
          : "prompt",
      referenceUrl: storedReferenceUrl,
      referenceHtml: storedReferenceHtml,
    });

    if (bootPrompt) {
      setPrompt(bootPrompt);
      const bootInputMode =
        storedInputMode === "prompt" ||
        storedInputMode === "url" ||
        storedInputMode === "screenshot" ||
        storedInputMode === "html"
          ? storedInputMode
          : "prompt";

      setGenerationPreferences((prev) =>
        mergeStoredPreferences(
          bootInputMode === "screenshot" || bootInputMode === "url"
            ? createReferenceLockedPreferences(bootPrompt)
            : createDefaultPreferences(bootPrompt),
          prev
        )
      );
      setMessages((prev) => [
        ...prev,
        { id: `user-initial-${Date.now()}`, role: "user", text: bootPrompt },
      ]);
    }

    try {
      const parsedAttachments = JSON.parse(storedAttachments);
      if (Array.isArray(parsedAttachments)) {
        setAttachments(parsedAttachments);
      }
    } catch {}

    try {
      const parsedPrefs = JSON.parse(storedLandingPreferences);
      const bootInputMode =
        storedInputMode === "prompt" ||
        storedInputMode === "url" ||
        storedInputMode === "screenshot" ||
        storedInputMode === "html"
          ? storedInputMode
          : "prompt";

      setGenerationPreferences((prev) =>
        bootInputMode === "screenshot" || bootInputMode === "url"
          ? createReferenceLockedPreferences(initialPrompt)
          : mergeStoredPreferences(
              initialPrompt ? createDefaultPreferences(initialPrompt) : prev,
              parsedPrefs
            )
      );
    } catch {}

    const autostartPrompt = getEffectivePrompt({
      prompt: initialPrompt,
      inputMode:
        storedInputMode === "prompt" ||
        storedInputMode === "url" ||
        storedInputMode === "screenshot" ||
        storedInputMode === "html"
          ? storedInputMode
          : "prompt",
      referenceUrl: storedReferenceUrl,
      referenceHtml: storedReferenceHtml,
    });

    if (autostart && autostartPrompt && !autostartRef.current) {
      autostartRef.current = true;
      sessionStorage.removeItem("ai_webgen_autostart");

      const resolvedInputMode =
        storedInputMode === "prompt" ||
        storedInputMode === "url" ||
        storedInputMode === "screenshot" ||
        storedInputMode === "html"
          ? storedInputMode
          : "prompt";

      const parsedPrefsSafe = (() => {
        try {
          return JSON.parse(storedLandingPreferences);
        } catch {
          return {};
        }
      })();

      const nextPrefs =
        resolvedInputMode === "screenshot" ||
        resolvedInputMode === "url" ||
        resolvedInputMode === "html"
          ? createReferenceLockedPreferences(autostartPrompt)
          : mergeStoredPreferences(
              autostartPrompt
                ? createDefaultPreferences(autostartPrompt)
                : generationPreferences,
              parsedPrefsSafe
            );

      const parsedAttachmentsSafe = (() => {
        try {
          const parsed = JSON.parse(storedAttachments);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })();

      if (
        resolvedInputMode === "url" ||
        resolvedInputMode === "html" ||
        resolvedInputMode === "screenshot"
      ) {
        setOtazkyDokonceny(true);
        setTimeout(() => {
          void handleGenerate(autostartPrompt, nextPrefs, {
            inputMode: resolvedInputMode,
            referenceUrl: storedReferenceUrl,
            referenceHtml: storedReferenceHtml,
            attachments: parsedAttachmentsSafe,
          });
        }, 250);
      } else {
        setTimeout(() => startQuestionFlow(autostartPrompt), 250);
      }
    }
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "zyvia-section-select") {
        setSelectedSectionId(data.sectionId || null);
        setSelectedSectionType(data.sectionType || null);
      }

      if (data.type === "zyvia-text-select") {
        const selection: EditableTextSelection = {
          id: data.textId || "",
          text: data.textValue || "",
          tagName: data.tagName || "",
          sectionId: data.sectionId || "",
          href: typeof data.href === "string" ? data.href : undefined,
        };

        if (!selection.id || !selection.sectionId) return;

        setSelectedSectionId(selection.sectionId);
        setSelectedImage(null);
        setSelectedText(selection);
        setEditedTextValue(selection.text);
        setEditedHrefValue(selection.href || "");
        setTextModalOpen(true);
      }

      if (data.type === "zyvia-image-select") {
        const selection: EditableImageSelection = {
          slot: data.slot || "",
          tagName: data.tagName || "",
          sectionId: data.sectionId || "",
          currentUrl:
            typeof data.currentUrl === "string" ? data.currentUrl : "",
          alt: typeof data.alt === "string" ? data.alt : "",
          orientation:
            data.orientation === "portrait" ||
            data.orientation === "square" ||
            data.orientation === "landscape"
              ? data.orientation
              : "landscape",
        };

        if (!selection.slot || !selection.sectionId) return;

        setSelectedSectionId(selection.sectionId);
        setSelectedText(null);
        setTextModalOpen(false);
        setSelectedImage(selection);
        setImageSearchQuery(
          selection.alt?.trim() ||
            selection.slot.replace(/[-_]/g, " ").trim() ||
            "premium business photo"
        );
        setImageSearchResults([]);
        setImageUploadError(null);
        setImagePickerTab("search");
        setImageModalOpen(true);
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    return () => {
      if (progressRef.current) window.clearInterval(progressRef.current);
    };
  }, []);

  useEffect(() => {
    scrollChatToBottom(false);
  }, [messages.length]);

  useEffect(() => {
    if (loading || improving || resolvingAssets) scrollChatToBottom(true);
  }, [loading, improving, resolvingAssets, progress, status]);

  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;

    iframeRef.current.contentWindow.postMessage(
      { type: "zyvia-set-selected-section", sectionId: selectedSectionId },
      "*"
    );

    iframeRef.current.contentWindow.postMessage(
      { type: "zyvia-set-selected-image", slot: selectedImage?.slot || null },
      "*"
    );
  }, [selectedSectionId, selectedImage?.slot, editorDocument]);

  useEffect(() => {
    if (!imageModalOpen || !selectedImage) return;
    const initialQuery =
      selectedImage.alt?.trim() ||
      selectedImage.slot.replace(/[-_]/g, " ").trim();
    if (initialQuery.length >= 2) {
      void searchEditorImages(initialQuery, selectedImage.orientation);
    }
  }, [imageModalOpen, selectedImage?.slot]);

  function startSmoothProgress(mode: "generate" | "improve") {
    if (progressRef.current) window.clearInterval(progressRef.current);

    const source =
      mode === "generate" ? GENERATE_LOADING_MESSAGES : IMPROVE_LOADING_MESSAGES;

    loadingMessageRef.current = 0;
    setProgress(1);
    setStatus(source[0]);

    progressRef.current = window.setInterval(() => {
      loadingMessageRef.current = (loadingMessageRef.current + 1) % source.length;
      setStatus(source[loadingMessageRef.current]);

      setProgress((prev) => {
        if (prev < 18) return prev + 1.2;
        if (prev < 34) return prev + 0.95;
        if (prev < 50) return prev + 0.72;
        if (prev < 66) return prev + 0.52;
        if (prev < 79) return prev + 0.34;
        if (prev < 89) return prev + 0.2;
        if (prev < 95) return prev + 0.12;
        if (prev < 98.8) return prev + 0.045;
        if (prev < 99.4) return prev + 0.015;
        return 99.4;
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

  async function handleGenerate(
    customPrompt?: string,
    forcedPreferences?: GenerationPreferences,
    overrideInput?: {
      inputMode?: InputMode;
      referenceUrl?: string;
      referenceHtml?: string;
      attachments?: AttachmentItem[];
    }
  ) {
    const requestInput = getGenerationRequestInput({
      prompt: customPrompt ?? prompt,
      inputMode: overrideInput?.inputMode ?? inputMode,
      referenceUrl: overrideInput?.referenceUrl ?? referenceUrl,
      referenceHtml: overrideInput?.referenceHtml ?? referenceHtml,
      attachments: overrideInput?.attachments ?? attachments,
    });
    const finalPrompt = requestInput.effectivePrompt;

    if (finalPrompt.length < 8) {
      setError("Chybí zadání. Zadejte prompt nebo vložte validní URL / HTML / screenshot.");
      return;
    }

    if (requestInput.inputMode === "url" && !requestInput.referenceUrl) {
      setError("V URL režimu vložte prosím validní URL včetně http:// nebo https://.");
      return;
    }

    if (requestInput.inputMode === "html" && !requestInput.referenceHtml.trim()) {
      setError("V HTML režimu chybí referenční HTML.");
      return;
    }

    if (
      requestInput.inputMode === "screenshot" &&
      !requestInput.attachments.some((item) => item.kind === "screenshot")
    ) {
      setError("V režimu screenshot chybí nahraný screenshot.");
      return;
    }

    const isReferenceLockedMode =
      requestInput.inputMode === "screenshot" || requestInput.inputMode === "url";

    const effectivePreferences = {
      ...(isReferenceLockedMode
        ? createReferenceLockedPreferences(finalPrompt)
        : forcedPreferences || generationPreferences),
      sourcePrompt: finalPrompt,
    };

    const screenshotDataUrl =
      requestInput.inputMode === "screenshot"
        ? requestInput.attachments.find((item) => item.kind === "screenshot")?.dataUrl || ""
        : "";

    const validScreenshotDataUrl =
      typeof screenshotDataUrl === "string" &&
      screenshotDataUrl.startsWith("data:image/")
        ? screenshotDataUrl
        : "";

    if (
      requestInput.inputMode === "screenshot" &&
      !(
        validScreenshotDataUrl ||
        requestInput.attachments.some(
          (item) =>
            item?.kind === "screenshot" &&
            typeof item?.dataUrl === "string" &&
            item.dataUrl.startsWith("data:image/")
        )
      )
    ) {
      console.error("GENERATE_DEBUG_FAIL", {
        inputMode: requestInput.inputMode,
        attachmentsCount: Array.isArray(requestInput.attachments)
          ? requestInput.attachments.length
          : 0,
        screenshotAttachments: Array.isArray(requestInput.attachments)
          ? requestInput.attachments.map((item) => ({
              id: item?.id,
              kind: item?.kind,
              hasDataUrl:
                typeof item?.dataUrl === "string" &&
                item.dataUrl.startsWith("data:image/"),
              dataUrlLength:
                typeof item?.dataUrl === "string" ? item.dataUrl.length : 0,
            }))
          : [],
        screenshotDataUrlPresent: Boolean(validScreenshotDataUrl),
        screenshotDataUrlLength: validScreenshotDataUrl.length,
      });
      setError(
        "Screenshot režim je aktivní, ale editor neposílá žádný validní screenshot do /api/generate."
      );
      return;
    }

    console.log("GENERATE_DEBUG", {
      inputMode: requestInput.inputMode,
      hasScreenshotDataUrl: Boolean(validScreenshotDataUrl),
      screenshotDataUrlLength: validScreenshotDataUrl.length,
      attachmentsCount: Array.isArray(requestInput.attachments)
        ? requestInput.attachments.length
        : 0,
      screenshotAttachments: Array.isArray(requestInput.attachments)
        ? requestInput.attachments.map((item) => ({
            id: item?.id,
            kind: item?.kind,
            hasDataUrl:
              typeof item?.dataUrl === "string" &&
              item.dataUrl.startsWith("data:image/"),
            dataUrlLength:
              typeof item?.dataUrl === "string" ? item.dataUrl.length : 0,
          }))
        : [],
      referenceUrl: requestInput.referenceUrl,
      hasReferenceHtml: Boolean(requestInput.referenceHtml),
      isReferenceLockedMode,
    });

    setLoading(true);
    setError(null);
    setPublishError(null);
    setPublishedUrl("");
    setHtml("");
    setCss("");
    setJs("");
    setSelectedSectionId(null);
    setSelectedSectionType(null);
    setSelectedImage(null);
    setGeneratedIndustry(null);
    setPostGenerateSuggestions([]);
    setReferenceSummaryDebug(null);
    setLayoutFingerprintDebug(null);
    setScreenshotAnalysisDebug(null);
    setHasReferenceScreenshotDebug(false);
    setProgress(0);
    setActiveTab("preview");

    startSmoothProgress("generate");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          inputMode: requestInput.inputMode,
          referenceUrl: requestInput.referenceUrl,
          referenceHtml: requestInput.referenceHtml,
          attachments: requestInput.attachments,
          screenshotDataUrl: validScreenshotDataUrl,
          generationPreferences: effectivePreferences,
          landingPreferences: effectivePreferences,
          chatHistory: getChatHistoryPayload(),
          brandLogo: uploadedLogo,
        }),
      });

      const data = await parseApiResponse<GeneratorResponse>(res);
      if (!res.ok) throw new Error(data?.error ?? "Generování selhalo");
      if (!data?.html || !data?.css) {
        throw new Error("API /api/generate nevrátilo validní HTML/CSS.");
      }

      const detectedIndustry =
        (data.brief?.industry as IndustryKind | undefined) ||
        (isReferenceLockedMode ? null : inferIndustryKind(finalPrompt)) ||
        "generic-business";
      const nextSuggestions = getPostGenerateSuggestions(detectedIndustry);

      stopSmoothProgress(true, "Web byl úspěšně vygenerován");
      setHtml(data.html);
      setCss(data.css);
      setJs(data.js || "");
      setGeneratedIndustry(detectedIndustry);
      setPostGenerateSuggestions(nextSuggestions);

      if (data.generationPreferences && !isReferenceLockedMode) {
        setGenerationPreferences((prev) =>
          mergeStoredPreferences(prev, {
            ...data.generationPreferences,
            sourcePrompt: finalPrompt,
          })
        );
      }

      setReferenceSummaryDebug(data.referenceSummary ?? null);
      setLayoutFingerprintDebug(data.layoutFingerprint ?? null);
      setScreenshotAnalysisDebug(data.screenshotAnalysis ?? null);
      setHasReferenceScreenshotDebug(Boolean(data.hasReferenceScreenshot));

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-generate-${Date.now()}`,
          role: "assistant",
          text: "Návrh je připraven. Klikněte na sekci, text nebo obrázek v editoru a pokračujte v úpravách.",
        },
        {
          id: `assistant-followup-${Date.now() + 1}`,
          role: "assistant",
          text: `Co chcete dál vylepšit pro obor ${getIndustryDisplayName(
            detectedIndustry
          )}? Můžu pomoct třeba s hero sekcí, texty, CTA, galerií, kontaktem nebo celkovým prémiovým dojmem.`,
        },
      ]);

      void resolveAssetsAndPatchHtml(data.assetPlan, finalPrompt);
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

    if (!selectedSectionId) {
      setError("Nejdřív vyberte konkrétní sekci, kterou chcete upravit.");
      return;
    }

    setImproving(true);
    setError(null);
    setPublishError(null);
    setPublishedUrl("");

    setMessages((prev) => [
      ...prev,
      { id: `user-improve-${Date.now()}`, role: "user", text: instruction },
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
          selectedSectionId,
          inputMode,
          referenceUrl,
          referenceHtml,
          attachments,
          generationPreferences,
          chatHistory: getChatHistoryPayload(),
          brandLogo: uploadedLogo,
        }),
      });

      const data = await parseApiResponse<GeneratorResponse>(res);
      if (!res.ok) throw new Error(data?.error ?? "Úprava designu selhala");
      if (!data?.html || !data?.css) {
        throw new Error("API /api/improve nevrátilo validní HTML/CSS.");
      }

      stopSmoothProgress(true, "Úpravy byly úspěšně aplikovány");
      setHtml(data.html);
      setCss(data.css);
      setJs(data.js || "");
      setChatInput("");
      setActiveTab("preview");

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-improve-${Date.now()}`,
          role: "assistant",
          text: `Úprava byla aplikována pouze do sekce ${
            selectedSectionMeta?.label || selectedSectionId
          }.`,
        },
      ]);

      void resolveAssetsAndPatchHtml(data.assetPlan, prompt);
    } catch (e: any) {
      stopSmoothProgress(false, "Úpravy se nepodařilo dokončit");
      setError(e?.message ?? "Úprava designu selhala");
    } finally {
      setTimeout(() => setImproving(false), 250);
    }
  }

  async function handlePublish() {
    if (!html || !css) return;

    const finalSiteName = publishForm.siteName.trim() || "Můj web";
    const finalSlug = slugifyProjectName(publishForm.slug) || "zyvia-web";

    setPublishing(true);
    setPublishError(null);
    setPublishedUrl("");
    setPublishedInspectUrl("");

    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          html,
          css,
          js,
          siteName: finalSiteName,
          slug: finalSlug,
          description: publishForm.description.trim(),
        }),
      });

      const data = await parseApiResponse<PublishResponse>(res);
      if (!res.ok || !data.url) {
        throw new Error(data?.error ?? "Publikace selhala");
      }

      setPublishedUrl(data.url);
      setPublishedInspectUrl(data.inspectUrl || "");
      setPublishPanelOpen(false);

      setMessages((prev) => [
        ...prev,
        {
          id: `publish-success-${Date.now()}`,
          role: "assistant",
          text: `Web byl publikován na ${data.url}`,
        },
      ]);
    } catch (e: any) {
      setPublishError(e?.message ?? "Publikace selhala");
    } finally {
      setPublishing(false);
    }
  }

  function onChatKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleImprove();
    }
  }

  function useSectionAction(type: "text" | "visual" | "regenerate") {
    if (!selectedSectionMeta) return;

    const sectionName = selectedSectionMeta.label;
    const prompts: Record<typeof type, string> = {
      text: `Uprav texty v sekci ${sectionName}, aby byly přesvědčivější a lépe strukturované.`,
      visual: `Vylepši vzhled sekce ${sectionName}, přidej lepší hierarchii, rozestupy, animace a výraznější kompozici.`,
      regenerate: `Přegeneruj sekci ${sectionName} v novém, kvalitnějším rozvržení, ale zachovej celkový styl webu.`,
    };

    setChatInput(prompts[type]);
    setTimeout(() => {
      chatInputRef.current?.focus();
      scrollChatToBottom(true);
    }, 50);
  }

  function handleSaveInlineText() {
    if (!selectedText) return;

    const trimmed = editedTextValue.trim();
    if (!trimmed) return;

    setHtml((prev) =>
      updateTextInHtml(
        prev,
        selectedText.sectionId,
        selectedText.id,
        trimmed,
        selectedText.href !== undefined ? editedHrefValue : undefined
      )
    );

    setSelectedSectionId(selectedText.sectionId);

    setMessages((prev) => [
      ...prev,
      {
        id: `inline-text-${Date.now()}`,
        role: "assistant",
        text:
          selectedText.href !== undefined
            ? `Text a odkaz byly upraveny pouze v sekci ${prettifySectionLabel(
                selectedText.sectionId,
                ""
              )}.`
            : `Text byl upraven pouze v sekci ${prettifySectionLabel(
                selectedText.sectionId,
                ""
              )}.`,
      },
    ]);

    setTextModalOpen(false);
    setSelectedText(null);
    setEditedTextValue("");
    setEditedHrefValue("");
  }

  function ulozitOdpovedNaOtazku() {
    if (!aktualniOtazka) return;

    const trimmed = odpovedInput.trim();

    const nextPreferences = {
      ...generationPreferences,
      clientAnswers: {
        ...generationPreferences.clientAnswers,
        [aktualniOtazka.id]: mergeAnswerValue(
          generationPreferences.clientAnswers[aktualniOtazka.id],
          aktualniOtazka.appendLabel,
          trimmed
        ),
      },
    };

    setGenerationPreferences(nextPreferences);
    setMessages((prev) => [
      ...prev,
      {
        id: `question-answer-${Date.now()}`,
        role: "user",
        text: trimmed || "Bez odpovědi.",
      },
    ]);

    const nextIndex = aktivniOtazkaIndex + 1;
    setOdpovedInput("");

    if (nextIndex < otazky.length) {
      setAktivniOtazkaIndex(nextIndex);
      setMessages((prev) => [
        ...prev,
        {
          id: `question-next-${Date.now() + 1}`,
          role: "assistant",
          text: otazky[nextIndex].text,
        },
      ]);
      return;
    }

    setOtazkyDokonceny(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `question-finished-${Date.now()}`,
        role: "assistant",
        text: "Děkuji, mám víc kontextu k projektu. Teď můžeme web vygenerovat přesněji podle vašich odpovědí.",
      },
    ]);

    void handleGenerate(prompt, nextPreferences);
  }

  function preskocitOtazkyAGenerovat() {
    setOtazkyDokonceny(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `skip-questions-${Date.now()}`,
        role: "system",
        text:
          inputMode === "url" && referenceUrl
            ? "Otázky byly přeskočeny. Generuji web primárně podle URL reference, její struktury, screenshot analýzy a layout fingerprintu. Prompt a obor slouží jen jako doplněk."
            : inputMode === "html"
            ? "Otázky byly přeskočeny. Generuji web primárně podle dodaného HTML a jeho struktury."
            : inputMode === "screenshot"
            ? "Otázky byly přeskočeny. Generuji web primárně podle screenshot reference."
            : "Otázky byly přeskočeny. Generuji web podle promptu a zvoleného kreativního směru.",
      },
    ]);
    void handleGenerate(prompt, generationPreferences);
  }

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
        @keyframes zyviaPulse {
          0%,
          100% {
            opacity: 0.72;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.01);
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px] opacity-[0.08]" />
      <div
        className="pointer-events-none absolute left-[-120px] top-[-120px] h-[24rem] w-[24rem] rounded-[10px] blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(124,92,255,0.18) 0%, rgba(124,92,255,0.05) 35%, transparent 75%)",
          animation: "zyviaEditorFloatA 16s ease-in-out infinite alternate",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-[-140px] right-[-100px] h-[28rem] w-[28rem] rounded-[10px] blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(90,209,255,0.14) 0%, rgba(90,209,255,0.05) 35%, transparent 75%)",
          animation: "zyviaEditorFloatB 18s ease-in-out infinite alternate",
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        {!isFullscreen && (
          <header className="border-b border-white/8 bg-[#07070b]/80 px-4 py-2.5 backdrop-blur-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="/zyvia-logo.svg"
                  alt="Zyvia"
                  className="h-6 w-auto shrink-0"
                />
                <div className="text-xs text-zinc-500">AI Web Builder</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadZipSite(html, css, js)}
                  disabled={!html}
                  className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-zinc-300 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-40"
                >
                  <Icon icon="solar:download-linear" width={14} />
                  Export
                </button>

                <button
                  type="button"
                  onClick={openPublishPanel}
                  disabled={!html}
                  className="inline-flex items-center gap-2 rounded-[10px] border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-2 text-xs text-emerald-200 transition hover:bg-emerald-500/15 disabled:opacity-40"
                >
                  <Icon icon="solar:upload-linear" width={14} />
                  Publikovat
                </button>
              </div>
            </div>
          </header>
        )}

        <div
          className={`min-h-0 flex-1 ${
            isFullscreen
              ? "grid grid-cols-1"
              : "grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)]"
          }`}
        >
          {!isFullscreen && (
            <aside className="min-h-0 border-r border-white/8 bg-[#08080c]/88 backdrop-blur-2xl">
              <div className="flex h-full flex-col">
                <div className="border-b border-white/8 px-4 py-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-xs font-medium uppercase tracking-[0.16em] text-zinc-400">
                      Editor
                    </div>
                    {(loading || improving || resolvingAssets) && (
                      <div className="rounded-[10px] border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-[11px] text-violet-300">
                        {loading
                          ? "Generuji"
                          : improving
                          ? "Upravuji"
                          : "Doplňuji obrázky"}
                      </div>
                    )}
                  </div>

                  <div className="mb-3 rounded-[10px] border border-white/8 bg-white/[0.03] p-3 text-[11px] leading-5 text-zinc-400">
                    <div>Zdroj: <span className="text-white">{inputMode}</span></div>
                    {referenceUrl && <div className="truncate">URL: {referenceUrl}</div>}
                    {attachments.length > 0 && (
                      <div className="truncate">
                        Přílohy: {attachments.map((item) => item.name).filter(Boolean).join(", ")}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!otazky.length || otazkyDokonceny) {
                        startQuestionFlow(prompt);
                        return;
                      }
                      scrollChatToBottom(true);
                    }}
                    disabled={
                      loading ||
                      improving ||
                      resolvingAssets ||
                      prompt.trim().length < 12
                    }
                    className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(124,92,255,1), rgba(90,209,255,0.92))",
                      boxShadow:
                        "0 10px 24px rgba(124,92,255,0.20), 0 0 28px rgba(90,209,255,0.08)",
                    }}
                  >
                    {loading
                      ? "Generuji…"
                      : improving
                      ? "Probíhá úprava…"
                      : resolvingAssets
                      ? "Doplňuji obrázky…"
                      : "Začít generovat"}
                    <Icon icon="solar:arrow-up-linear" width={15} />
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
                          className={`max-w-[94%] rounded-[10px] px-3 py-2 text-[13px] leading-5 ${
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

                    <div className="rounded-[10px] border border-white/8 bg-[#0b0b10] p-3">
                      <div className="mb-2 flex items-center justify-between text-[13px] text-zinc-400">
                        <span>{status}</span>
                        <span>{Math.round(progress)}%</span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-[10px] bg-zinc-800">
                        <div
                          className="h-full rounded-[10px] transition-all duration-500"
                          style={{
                            width: `${progress}%`,
                            background:
                              "linear-gradient(90deg, rgba(124,92,255,1), rgba(90,209,255,1))",
                          }}
                        />
                      </div>

                      <div className="mt-3 text-[11px] leading-5 text-zinc-500">
                        {loading
                          ? "Probíhá generování layoutu podle oboru, loga a vašich odpovědí."
                          : improving
                          ? "Probíhá zpracování úprav a aplikace změn do návrhu."
                          : resolvingAssets
                          ? "Rozvržení už je hotové, teď se dohledávají obrázky odděleně."
                          : selectedSectionMeta
                          ? "Kliknutím v editoru vybíráte konkrétní sekce, texty i obrázky pro úpravy."
                          : "V Editoru vybíráte sekce, texty i obrázky. Náhled slouží jen pro čisté zobrazení."}
                      </div>
                    </div>

                    {otazky.length > 0 && !otazkyDokonceny && aktualniOtazka && (
                      <div className="rounded-[10px] border border-violet-500/20 bg-violet-500/10 p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div className="text-sm font-medium text-white">
                            Otázka {aktivniOtazkaIndex + 1} z {otazky.length}
                          </div>

                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="inline-flex items-center gap-1.5 rounded-[10px] border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-[11px] font-medium text-cyan-100 transition hover:bg-cyan-500/15"
                          >
                            <Icon icon="solar:upload-linear" width={13} />
                            {uploadedLogo ? "Změnit logo" : "Nahrát logo"}
                          </button>
                        </div>

                        {uploadedLogo && (
                          <div className="mb-3 flex items-center gap-3 rounded-[10px] border border-white/8 bg-white/[0.03] p-3">
                            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-[10px] border border-white/10 bg-white">
                              <img
                                src={uploadedLogo.dataUrl}
                                alt={uploadedLogo.name}
                                className="max-h-full max-w-full object-contain"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm text-white">
                                {uploadedLogo.name}
                              </div>
                              <div className="mt-1 text-[11px] text-zinc-500">
                                Logo bude použito při generování
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={removeUploadedLogo}
                              className="text-[11px] text-zinc-500 transition hover:text-white"
                            >
                              Odebrat
                            </button>
                          </div>
                        )}

                        <input
                          ref={logoInputRef}
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />

                        {logoUploadError && (
                          <div className="mb-3 rounded-[10px] border border-red-500/20 bg-red-500/10 p-3 text-[11px] text-red-200">
                            {logoUploadError}
                          </div>
                        )}

                        <div className="mb-3 text-[13px] text-zinc-200">
                          {aktualniOtazka.text}
                        </div>

                        <textarea
                          value={odpovedInput}
                          onChange={(e) => setOdpovedInput(e.target.value)}
                          placeholder={aktualniOtazka.placeholder}
                          className="h-24 w-full resize-none rounded-[10px] border border-white/10 bg-black/25 p-3 text-[13px] text-white outline-none placeholder:text-zinc-500"
                        />

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <button
                            type="button"
                            onClick={preskocitOtazkyAGenerovat}
                            className="rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                          >
                            Přeskočit a generovat
                          </button>

                          <button
                            type="button"
                            onClick={ulozitOdpovedNaOtazku}
                            className="rounded-[10px] border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-[13px] font-medium text-cyan-100 transition hover:bg-cyan-500/15"
                          >
                            Uložit odpověď
                          </button>
                        </div>
                      </div>
                    )}

                    {html && postGenerateSuggestions.length > 0 && (
                      <div className="rounded-[10px] border border-amber-500/20 bg-amber-500/10 p-3">
                        <div className="mb-2 text-sm font-medium text-white">
                          Další rychlé úpravy
                        </div>
                        <div className="mb-3 text-[11px] leading-5 text-zinc-300">
                          Vyberte sekci v editoru a jedním klikem si připravte další zadání.
                        </div>
                        <div className="flex flex-col gap-2">
                          {postGenerateSuggestions.map((item) => (
                            <button
                              key={item}
                              type="button"
                              onClick={() => applyFollowUpSuggestion(item)}
                              className="w-full rounded-[10px] border border-white/10 bg-white/[0.05] px-3 py-2 text-left text-[13px] leading-5 text-zinc-100 transition hover:bg-white/[0.10]"
                            >
                              {item}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {(referenceSummaryDebug ||
                      layoutFingerprintDebug ||
                      screenshotAnalysisDebug ||
                      hasReferenceScreenshotDebug) && (
                      <div className="rounded-[10px] border border-violet-500/20 bg-violet-500/10 p-3">
                        <div className="mb-2 text-sm font-medium text-white">
                          Debug reference analýza
                        </div>
                        <div className="space-y-2 text-[11px] leading-5 text-zinc-300">
                          <div>
                            <span className="text-zinc-100">Screenshot reference:</span>{" "}
                            {hasReferenceScreenshotDebug ? "ano" : "ne"}
                          </div>

                          {referenceSummaryDebug && (
                            <div className="rounded-[8px] border border-white/10 bg-black/20 p-2">
                              <div className="mb-1 text-zinc-100">Reference summary</div>
                              <div>Title: {referenceSummaryDebug.title || "—"}</div>
                              <div>
                                Sekce: {referenceSummaryDebug.sectionCount ?? "—"} · Nav:{" "}
                                {referenceSummaryDebug.navLinks?.length ?? 0} · CTA:{" "}
                                {referenceSummaryDebug.ctas?.length ?? 0}
                              </div>
                            </div>
                          )}

                          {layoutFingerprintDebug && (
                            <div className="rounded-[8px] border border-white/10 bg-black/20 p-2">
                              <div className="mb-1 text-zinc-100">Layout fingerprint</div>
                              <div>Hero: {layoutFingerprintDebug.heroType || "—"}</div>
                              <div>Dominance: {layoutFingerprintDebug.visualDominance || "—"}</div>
                              <div>Nav: {layoutFingerprintDebug.navStyle || "—"}</div>
                              <div>Density: {layoutFingerprintDebug.density || "—"}</div>
                              <div>
                                Sections: {layoutFingerprintDebug.sectionSequence?.join(" → ") || "—"}
                              </div>
                            </div>
                          )}

                          {screenshotAnalysisDebug && (
                            <div className="rounded-[8px] border border-white/10 bg-black/20 p-2">
                              <div className="mb-1 text-zinc-100">Screenshot analýza</div>
                              <div>Above the fold: {screenshotAnalysisDebug.aboveTheFoldType || "—"}</div>
                              <div>Alignment: {screenshotAnalysisDebug.heroContentAlignment || "—"}</div>
                              <div>Subject: {screenshotAnalysisDebug.dominantVisualSubject || "—"}</div>
                              <div>After hero: {screenshotAnalysisDebug.firstSectionAfterHero || "—"}</div>
                              <div>Color: {screenshotAnalysisDebug.colorDirection || "—"}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedSectionMeta && (
                      <div className="rounded-[10px] border border-cyan-500/20 bg-cyan-500/10 p-3">
                        <div className="mb-2 text-sm font-medium text-white">
                          Vybraná sekce: {selectedSectionMeta.label}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => useSectionAction("text")}
                            className="rounded-[10px] border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] text-zinc-200 transition hover:bg-white/[0.10]"
                          >
                            Změnit text
                          </button>
                          <button
                            type="button"
                            onClick={() => useSectionAction("visual")}
                            className="rounded-[10px] border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] text-zinc-200 transition hover:bg-white/[0.10]"
                          >
                            Změnit vzhled
                          </button>
                          <button
                            type="button"
                            onClick={() => useSectionAction("regenerate")}
                            className="rounded-[10px] border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] text-zinc-200 transition hover:bg-white/[0.10]"
                          >
                            Přegenerovat
                          </button>
                        </div>
                      </div>
                    )}

                    {publishedUrl && (
                      <div className="rounded-[10px] border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">
                        <div className="mb-1 font-medium">Web publikován</div>
                        <a
                          href={publishedUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="break-all underline underline-offset-4"
                        >
                          {publishedUrl}
                        </a>
                        {publishedInspectUrl && (
                          <a
                            href={publishedInspectUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 block break-all text-xs text-emerald-200/80 underline underline-offset-4"
                          >
                            Otevřít detail deploymentu
                          </a>
                        )}
                      </div>
                    )}

                    {publishError && (
                      <div className="rounded-[10px] border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                        {publishError}
                      </div>
                    )}

                    {error && (
                      <div className="rounded-[10px] border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                        {error}
                      </div>
                    )}

                    <div ref={chatBottomRef} />
                  </div>
                </div>

                <div className="border-t border-white/8 px-4 py-3">
                  <div className="mb-2 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
                    Upravit návrh
                  </div>

                  <div className="rounded-[10px] border border-white/8 bg-white/[0.03] p-3">
                    <textarea
                      ref={chatInputRef}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={onChatKeyDown}
                      placeholder={
                        selectedSectionMeta
                          ? `Napište úpravu pro sekci ${selectedSectionMeta.label.toLowerCase()}…`
                          : "Nejdřív klikněte v editoru na konkrétní sekci, kterou chcete upravit."
                      }
                      className="h-14 w-full resize-none bg-transparent text-[13px] text-white outline-none placeholder:text-zinc-500"
                    />

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="text-[11px] text-zinc-500">
                        Enter odešle úpravu
                      </div>

                      <button
                        type="button"
                        onClick={() => handleImprove()}
                        disabled={
                          !html ||
                          loading ||
                          improving ||
                          resolvingAssets ||
                          chatInput.trim().length < 3
                        }
                        className="inline-flex items-center gap-2 rounded-[10px] border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-[13px] font-medium text-cyan-100 transition hover:bg-cyan-500/15 disabled:opacity-40"
                      >
                        <Icon icon="solar:pen-2-linear" width={14} />
                        {improving ? "Upravuji…" : "Použít"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          )}

          <main className="relative min-h-0 bg-[#050507]">
            {isFullscreen && activeTab === "preview" && (
              <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center p-4">
                <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-[10px] border border-white/10 bg-[#08080c]/88 px-3 py-2 shadow-2xl backdrop-blur-2xl">
                  <button
                    type="button"
                    onClick={() => setIsFullscreen(false)}
                    className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.04] px-4 text-[13px] text-zinc-200 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <Icon icon="solar:arrow-left-linear" width={14} />
                    Zpět do editoru
                  </button>

                  <div className="mx-1 h-6 w-px bg-white/10" />

                  <button
                    type="button"
                    className="inline-flex h-9 items-center rounded-[10px] bg-white/[0.10] px-4 text-[13px] text-white"
                  >
                    Náhled
                  </button>

                  <div className="mx-1 h-6 w-px bg-white/10" />

                  <button
                    type="button"
                    onClick={() => setViewMode("desktop")}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/10 transition ${
                      viewMode === "desktop"
                        ? "bg-white/[0.10] text-white"
                        : "bg-white/[0.03] text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                    }`}
                    title="Desktop"
                  >
                    <Icon icon="solar:monitor-linear" width={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("tablet")}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/10 transition ${
                      viewMode === "tablet"
                        ? "bg-white/[0.10] text-white"
                        : "bg-white/[0.03] text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                    }`}
                    title="Tablet"
                  >
                    <Icon icon="solar:tablet-linear" width={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("mobile")}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/10 transition ${
                      viewMode === "mobile"
                        ? "bg-white/[0.10] text-white"
                        : "bg-white/[0.03] text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                    }`}
                    title="Mobil"
                  >
                    <Icon icon="solar:smartphone-linear" width={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex h-full min-h-0 flex-col">
              {!isFullscreen && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-4 py-2.5 md:px-5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("preview")}
                      className={`rounded-[10px] px-4 py-2 text-[13px] transition ${
                        activeTab === "preview"
                          ? "bg-white/[0.10] text-white"
                          : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      Náhled
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("editor")}
                      className={`rounded-[10px] px-4 py-2 text-[13px] transition ${
                        activeTab === "editor"
                          ? "bg-white/[0.10] text-white"
                          : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                      }`}
                    >
                      Editor
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!isFullscreen) setActiveTab("preview");
                        setIsFullscreen((prev) => !prev);
                      }}
                      className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.04] px-4 text-[13px] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      <Icon
                        icon={
                          isFullscreen
                            ? "solar:minimize-square-3-linear"
                            : "solar:maximize-square-3-linear"
                        }
                        width={14}
                      />
                      {isFullscreen ? "Ukončit" : "Celá obrazovka"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewMode("desktop")}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/10 transition ${
                        viewMode === "desktop"
                          ? "bg-white/[0.10] text-white"
                          : "bg-white/[0.03] text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                      }`}
                      title="Desktop"
                    >
                      <Icon icon="solar:monitor-linear" width={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("tablet")}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/10 transition ${
                        viewMode === "tablet"
                          ? "bg-white/[0.10] text-white"
                          : "bg-white/[0.03] text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                      }`}
                      title="Tablet"
                    >
                      <Icon icon="solar:tablet-linear" width={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("mobile")}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-white/10 transition ${
                        viewMode === "mobile"
                          ? "bg-white/[0.10] text-white"
                          : "bg-white/[0.03] text-zinc-500 hover:bg-white/[0.06] hover:text-white"
                      }`}
                      title="Mobil"
                    >
                      <Icon icon="solar:smartphone-linear" width={16} />
                    </button>
                  </div>
                </div>
              )}

              <div className="min-h-0 flex-1">
                <div
                  className={`flex h-full min-h-0 items-stretch justify-center overflow-auto ${
                    isFullscreen ? "px-0 py-0" : "px-2 py-0 md:px-3"
                  }`}
                >
                  {activeTab === "preview" ? (
                    previewDocument ? (
                      <div
                        className={`${previewWidthClass} ${
                          isFullscreen ? "h-full min-h-full pt-20" : "h-full"
                        }`}
                      >
                        <iframe
                          key={`${iframeKey}-preview`}
                          title="Zyvia preview"
                          className="h-full min-h-[720px] w-full bg-white"
                          srcDoc={previewDocument}
                          sandbox="allow-scripts allow-same-origin"
                        />
                      </div>
                    ) : (
                      <div className={`${previewWidthClass} h-full`}>
                        <BuilderPlaceholder status={status} />
                      </div>
                    )
                  ) : editorDocument ? (
                    <div
                      className={`${previewWidthClass} ${
                        isFullscreen ? "h-full min-h-full pt-20" : "h-full"
                      }`}
                    >
                      <iframe
                        ref={iframeRef}
                        key={`${iframeKey}-editor`}
                        title="Zyvia editor preview"
                        className="h-full min-h-[720px] w-full bg-white"
                        srcDoc={editorDocument}
                        sandbox="allow-scripts allow-same-origin"
                      />
                    </div>
                  ) : (
                    <div className={`${previewWidthClass} h-full`}>
                      <BuilderPlaceholder status={status} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {publishPanelOpen && (
        <>
          <div
            className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-[2px]"
            onClick={() => {
              if (!publishing) setPublishPanelOpen(false);
            }}
          />
          <div className="fixed inset-y-0 right-0 z-[95] w-full max-w-md border-l border-white/10 bg-[#0a0b10] shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="border-b border-white/8 px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-base font-medium text-white">
                      Publikovat na doménu
                    </div>
                    <div className="mt-1 text-sm text-zinc-500">
                      Pro test nasadíme web zdarma na Vercel URL. Vlastní doména bude v placeném balíčku.
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!publishing) setPublishPanelOpen(false);
                    }}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <Icon icon="solar:close-circle-linear" width={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                <div className="rounded-[10px] border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <div className="text-sm font-medium text-white">Publikace zdarma</div>
                  <div className="mt-1 text-sm text-zinc-300">
                    Web dostane veřejnou URL na Vercelu, kterou můžeš hned otevřít a poslat klientovi.
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">
                    Název projektu
                  </label>
                  <input
                    value={publishForm.siteName}
                    onChange={(e) =>
                      setPublishForm((prev) => ({
                        ...prev,
                        siteName: e.target.value,
                        slug:
                          prev.slug.trim() && prev.slug !== slugifyProjectName(prev.siteName)
                            ? prev.slug
                            : slugifyProjectName(e.target.value),
                      }))
                    }
                    className="w-full rounded-[10px] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
                    placeholder="Např. Klinika Praha"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">
                    URL slug
                  </label>
                  <input
                    value={publishForm.slug}
                    onChange={(e) =>
                      setPublishForm((prev) => ({
                        ...prev,
                        slug: slugifyProjectName(e.target.value),
                      }))
                    }
                    className="w-full rounded-[10px] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
                    placeholder="napr-klinika-praha"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs uppercase tracking-[0.16em] text-zinc-500">
                    Poznámka k publikaci
                  </label>
                  <textarea
                    value={publishForm.description}
                    onChange={(e) =>
                      setPublishForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="h-24 w-full resize-none rounded-[10px] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500"
                    placeholder="Např. první testovací verze pro klienta"
                  />
                </div>

                {publishedUrl && (
                  <div className="rounded-[10px] border border-emerald-500/20 bg-emerald-500/10 p-4">
                    <div className="text-sm font-medium text-white">Poslední publikace</div>
                    <a
                      href={publishedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block break-all text-sm text-emerald-100 underline underline-offset-4"
                    >
                      {publishedUrl}
                    </a>
                    {publishedInspectUrl && (
                      <a
                        href={publishedInspectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block break-all text-xs text-emerald-200/80 underline underline-offset-4"
                      >
                        Otevřít detail deploymentu
                      </a>
                    )}
                  </div>
                )}

                {publishError && (
                  <div className="rounded-[10px] border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
                    {publishError}
                  </div>
                )}
              </div>

              <div className="border-t border-white/8 px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!publishing) setPublishPanelOpen(false);
                    }}
                    className="rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    Zavřít
                  </button>

                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={!html || !css || publishing}
                    className="inline-flex items-center gap-2 rounded-[10px] border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/15 disabled:opacity-40"
                  >
                    <Icon icon="solar:upload-linear" width={16} />
                    {publishing ? "Publikuji…" : "Publikovat zdarma"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {textModalOpen && selectedText && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4">
          <div className="relative w-full max-w-xl rounded-[10px] border border-white/10 bg-[#0a0b10] p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white">Upravit text</div>
                <div className="mt-1 text-xs text-zinc-500">
                  Tag: {selectedText.tagName.toLowerCase()}
                </div>
              </div>

              <button
                type="button"
                aria-label="Zavřít"
                onClick={() => {
                  setTextModalOpen(false);
                  setSelectedText(null);
                  setEditedTextValue("");
                  setEditedHrefValue("");
                }}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/15 bg-white/[0.06] text-white transition hover:bg-white/[0.10]"
              >
                <span className="block -translate-y-[1px] text-[24px] leading-none">
                  ×
                </span>
              </button>
            </div>

            <textarea
              value={editedTextValue}
              onChange={(e) => setEditedTextValue(e.target.value)}
              className="h-32 w-full resize-none rounded-[10px] border border-white/10 bg-black/30 p-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-400/30"
              placeholder="Upravte text…"
            />

            {selectedText.href !== undefined && (
              <div className="mt-3">
                <div className="mb-2 text-xs uppercase tracking-[0.16em] text-zinc-500">
                  Odkaz tlačítka / odkazu
                </div>
                <input
                  value={editedHrefValue}
                  onChange={(e) => setEditedHrefValue(e.target.value)}
                  className="w-full rounded-[10px] border border-white/10 bg-black/30 p-4 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-400/30"
                  placeholder="Např. /kontakt nebo https://example.com"
                />
              </div>
            )}

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setTextModalOpen(false);
                  setSelectedText(null);
                  setEditedTextValue("");
                  setEditedHrefValue("");
                }}
                className="rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                Zrušit
              </button>

              <button
                type="button"
                onClick={handleSaveInlineText}
                className="rounded-[10px] border border-cyan-500/20 bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/15"
              >
                Uložit text
              </button>
            </div>
          </div>
        </div>
      )}

      {imageModalOpen && selectedImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-4">
          <div className="relative w-full max-w-5xl rounded-[10px] border border-white/10 bg-[#0a0b10] p-5 shadow-2xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">Upravit obrázek</div>
                <div className="mt-1 text-xs text-zinc-500">
                  Slot: {selectedImage.slot} • Sekce{" "}
                  {prettifySectionLabel(selectedImage.sectionId, "")}
                </div>
              </div>

              <button
                type="button"
                aria-label="Zavřít"
                onClick={closeImageModal}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/15 bg-white/[0.06] text-white transition hover:bg-white/[0.10]"
              >
                <span className="block -translate-y-[1px] text-[24px] leading-none">
                  ×
                </span>
              </button>
            </div>

            <div className="grid gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
              <div className="rounded-[10px] border border-white/8 bg-white/[0.03] p-4">
                <div className="mb-3 text-xs uppercase tracking-[0.16em] text-zinc-500">
                  Aktuální obrázek
                </div>

                <div className="overflow-hidden rounded-[10px] border border-white/8 bg-black/30">
                  {selectedImage.currentUrl ? (
                    <img
                      src={selectedImage.currentUrl}
                      alt={selectedImage.alt || selectedImage.slot}
                      className="h-64 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center text-sm text-zinc-500">
                      Náhled není dostupný
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.03] p-1">
                  <button
                    type="button"
                    onClick={() => setImagePickerTab("search")}
                    className={`flex-1 rounded-[10px] px-4 py-2 text-sm transition ${
                      imagePickerTab === "search"
                        ? "bg-white/[0.10] text-white"
                        : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    Hledat
                  </button>
                  <button
                    type="button"
                    onClick={() => setImagePickerTab("upload")}
                    className={`flex-1 rounded-[10px] px-4 py-2 text-sm transition ${
                      imagePickerTab === "upload"
                        ? "bg-white/[0.10] text-white"
                        : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    }`}
                  >
                    Nahrát
                  </button>
                </div>

                {imagePickerTab === "upload" && (
                  <div className="mt-4 rounded-[10px] border border-white/8 bg-black/20 p-4">
                    <div className="mb-2 text-sm font-medium text-white">
                      Nahrát vlastní obrázek
                    </div>
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-[10px] border border-dashed border-white/15 bg-white/[0.03] px-4 py-8 text-center transition hover:bg-white/[0.06]">
                      <Icon icon="solar:upload-linear" width={24} />
                      <span className="mt-3 text-sm text-white">
                        Klikněte pro nahrání obrázku
                      </span>
                      <span className="mt-1 text-xs text-zinc-500">
                        PNG, JPG, WEBP, SVG
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="min-w-0 rounded-[10px] border border-white/8 bg-white/[0.03] p-4">
                {imagePickerTab === "search" ? (
                  <>
                    <div className="mb-3 text-sm font-medium text-white">
                      Hledat nový obrázek
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        value={imageSearchQuery}
                        onChange={(e) => setImageSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void searchEditorImages();
                          }
                        }}
                        className="min-w-0 flex-1 rounded-[10px] border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-cyan-400/30"
                        placeholder="Např. luxury resort pool, barber portrait, modern office…"
                      />

                      <button
                        type="button"
                        onClick={() => void searchEditorImages()}
                        disabled={
                          imageSearchLoading ||
                          imageSearchQuery.trim().length < 2
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/15 disabled:opacity-40"
                      >
                        <Icon icon="solar:magnifer-linear" width={16} />
                        {imageSearchLoading ? "Hledám…" : "Hledat"}
                      </button>
                    </div>

                    <div className="mt-4 max-h-[30rem] overflow-y-auto pr-1">
                      {imageSearchLoading ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {Array.from({ length: 6 }).map((_, index) => (
                            <div
                              key={index}
                              className="overflow-hidden rounded-[10px] border border-white/8 bg-white/[0.03]"
                            >
                              <div className="h-40 animate-pulse bg-white/[0.06]" />
                            </div>
                          ))}
                        </div>
                      ) : imageSearchResults.length > 0 ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {imageSearchResults.map((image, index) => (
                            <div
                              key={`${image.url}-${index}`}
                              className="overflow-hidden rounded-[10px] border border-white/8 bg-white/[0.03]"
                            >
                              <img
                                src={image.url}
                                alt={image.alt}
                                className="h-40 w-full object-cover"
                              />
                              <div className="space-y-3 p-3">
                                <div>
                                  <div className="line-clamp-2 text-sm text-white">
                                    {image.alt}
                                  </div>
                                  <div className="mt-1 text-xs text-zinc-500">
                                    {image.source}
                                    {image.photographer
                                      ? ` • ${image.photographer}`
                                      : ""}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => applyImageChange(image)}
                                  className="inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm font-medium text-amber-100 transition hover:bg-amber-500/15"
                                >
                                  <Icon
                                    icon="solar:gallery-add-linear"
                                    width={16}
                                  />
                                  Použít obrázek
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-[16rem] items-center justify-center rounded-[10px] border border-dashed border-white/10 bg-black/20 text-sm text-zinc-500">
                          Zatím nejsou žádné výsledky.
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex h-full min-h-[18rem] items-center justify-center rounded-[10px] border border-dashed border-white/10 bg-black/20 text-sm text-zinc-500">
                    Vlevo nahrajte vlastní obrázek.
                  </div>
                )}
              </div>
            </div>

            {imageUploadError && (
              <div className="mt-4 rounded-[10px] border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                {imageUploadError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
