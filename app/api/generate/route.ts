import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 300;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 0,
  timeout: 180000,
});

const WEB_MODEL = process.env.OPENAI_WEB_MODEL || "gpt-5.4";

type ChatHistoryItem = {
  role: "system" | "user" | "assistant";
  text: string;
};

type AssetPlanItem = {
  slot: string;
  query: string;
  placement: string;
  mood: string;
  orientation: "landscape" | "portrait" | "square";
};

type BrandLogoAsset = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

type AttachmentInput = {
  id?: string;
  name?: string;
  kind?: "screenshot" | "file";
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

type ClientAnswers = {
  contactDetails?: string;
  styleNotes?: string;
  offerNotes?: string;
  extras?: string;
};

type GenerationPreferences = {
  speedMode?: SpeedMode;
  layoutPreference?: LayoutPreference;
  visualStyle?: VisualStyle;
  animationLevel?: AnimationLevel;
  fontMood?: FontMood;
  iconStyle?: IconStyle;
  designReference?: DesignReference;
  buttonStyle?: ButtonStyle;
  promptEnhancerMode?: PromptEnhancerMode;
  preferredPrimaryColor?: string;
  preferredBackgroundColor?: string;
  contactItems?: string[];
  clientAnswers?: ClientAnswers;
};

type GeneratedWebsiteBundle = {
  html: string;
  css: string;
  js: string;
  assetPlan: AssetPlanItem[];
};

function nowMs() {
  return Date.now();
}

function logStep(
  requestId: string,
  step: string,
  startedAt: number,
  extra?: Record<string, unknown>
) {
  const duration = Date.now() - startedAt;
  console.log(
    JSON.stringify({
      scope: "api-generate",
      requestId,
      step,
      durationMs: duration,
      ...(extra || {}),
    })
  );
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeHtmlAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sanitizeBrandLogoAsset(value: unknown): BrandLogoAsset | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<BrandLogoAsset>;
  const name =
    typeof candidate.name === "string" ? candidate.name.trim().slice(0, 160) : "";
  const mimeType =
    typeof candidate.mimeType === "string"
      ? candidate.mimeType.trim().slice(0, 120)
      : "";
  const dataUrl =
    typeof candidate.dataUrl === "string" ? candidate.dataUrl.trim() : "";

  if (!dataUrl.startsWith("data:image/")) return null;
  if (dataUrl.length > 1_500_000) return null;

  return {
    name: name || "logo",
    mimeType: mimeType || "image/png",
    dataUrl,
  };
}

function buildBrandLogoMarkup(brandLogo: BrandLogoAsset) {
  const altBase = brandLogo.name.replace(/\.[^.]+$/, "").trim() || "Brand logo";

  return `<img src="${escapeHtmlAttr(
    brandLogo.dataUrl
  )}" alt="${escapeHtmlAttr(
    altBase
  )}" class="brand-logo-image" loading="eager" decoding="async" />`;
}

function injectBrandLogoMarkup(
  content: string,
  brandLogo: BrandLogoAsset | null
) {
  if (!content || !brandLogo) return content;
  return content.replace(/__BRAND_LOGO__/g, buildBrandLogoMarkup(brandLogo));
}

function makeDeterministicChoice<T>(input: string, items: T[]): T {
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }

  return items[hash % items.length];
}

function sanitizeAttachments(value: unknown): AttachmentInput[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 8)
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const candidate = item as AttachmentInput;

      return {
        id: typeof candidate.id === "string" ? candidate.id : undefined,
        name: typeof candidate.name === "string" ? candidate.name : undefined,
        kind:
          candidate.kind === "screenshot" || candidate.kind === "file"
            ? candidate.kind
            : undefined,
      };
    });
}

function inferIndustryKind(prompt: string): IndustryKind {
  const text = normalizeText(prompt);

  if (
    text.includes("fintech") ||
    text.includes("payment") ||
    text.includes("platby") ||
    text.includes("bank") ||
    text.includes("finance") ||
    text.includes("penez") ||
    text.includes("money")
  ) {
    return "fintech";
  }

  if (
    text.includes("saas") ||
    text.includes("software") ||
    text.includes("app") ||
    text.includes("platform") ||
    text.includes("automatiz") ||
    text.includes("workflow") ||
    text.includes("integrac")
  ) {
    return "saas";
  }

  if (
    text.includes("realit") ||
    text.includes("makler") ||
    text.includes("nemovit") ||
    text.includes("villa") ||
    text.includes("byt") ||
    text.includes("property") ||
    text.includes("developer") ||
    text.includes("developersky projekt") ||
    text.includes("rezidence")
  ) {
    return "real-estate";
  }

  if (
    text.includes("resort") ||
    text.includes("hotel") ||
    text.includes("wellness") ||
    text.includes("retreat") ||
    text.includes("ubytovani") ||
    text.includes("forest")
  ) {
    return "resort";
  }

  if (
    text.includes("advokat") ||
    text.includes("pravnik") ||
    text.includes("legal") ||
    text.includes("law") ||
    text.includes("notar")
  ) {
    return "legal";
  }

  if (
    text.includes("clinic") ||
    text.includes("klinika") ||
    text.includes("medical") ||
    text.includes("doctor") ||
    text.includes("zubar") ||
    text.includes("ordinace")
  ) {
    return "healthcare";
  }

  if (
    text.includes("beauty") ||
    text.includes("kosmet") ||
    text.includes("salon krasy") ||
    text.includes("esthetic") ||
    text.includes("skincare")
  ) {
    return "beauty";
  }

  if (
    text.includes("barber") ||
    text.includes("barbershop") ||
    text.includes("holic") ||
    text.includes("panske strihani")
  ) {
    return "barber";
  }

  if (
    text.includes("kadernice") ||
    text.includes("kadernictvi") ||
    text.includes("hair salon") ||
    text.includes("strihani vlasu") ||
    text.includes("hairstyle")
  ) {
    return "hair-salon";
  }

  if (
    text.includes("restaurant") ||
    text.includes("restaurace") ||
    text.includes("bistro") ||
    text.includes("cafe") ||
    text.includes("kavarna") ||
    text.includes("gastro") ||
    text.includes("fine dining") ||
    text.includes("osteria")
  ) {
    return "restaurant";
  }

  if (
    text.includes("catering") ||
    text.includes("rozvoz cateringu") ||
    text.includes("firemni catering")
  ) {
    return "catering";
  }

  if (
    text.includes("autoservis") ||
    text.includes("servis aut") ||
    text.includes("oprava aut") ||
    text.includes("mechanik") ||
    text.includes("vymena oleje")
  ) {
    return "autoservis";
  }

  if (
    text.includes("prodej aut") ||
    text.includes("autobazar") ||
    text.includes("vozy") ||
    text.includes("dealer") ||
    text.includes("cars for sale")
  ) {
    return "car-dealer";
  }

  if (
    text.includes("zednik") ||
    text.includes("zednicke prace") ||
    text.includes("stavba domu") ||
    text.includes("fasady") ||
    text.includes("rekonstrukce") ||
    text.includes("stavebni firma")
  ) {
    return "zednik";
  }

  if (
    text.includes("cukr") ||
    text.includes("sugar") ||
    text.includes("potrav") ||
    text.includes("food")
  ) {
    return "food-product";
  }

  if (
    text.includes("eshop") ||
    text.includes("e-shop") ||
    text.includes("shop") ||
    text.includes("produkt") ||
    text.includes("product")
  ) {
    return "ecommerce-product";
  }

  if (
    text.includes("luxury") ||
    text.includes("premium") ||
    text.includes("boutique")
  ) {
    return "luxury-service";
  }

  return "generic-business";
}

function getIndustryDefaults(industry: IndustryKind) {
  switch (industry) {
    case "fintech":
      return {
        designReference: "fintech-neon" as DesignReference,
        layoutPreference: "split" as LayoutPreference,
        visualStyle: "premium" as VisualStyle,
        fontMood: "tech" as FontMood,
        iconStyle: "outlined" as IconStyle,
        imageMode: "ui-heavy",
      };
    case "saas":
      return {
        designReference: "signal-orchestration" as DesignReference,
        layoutPreference: "grid" as LayoutPreference,
        visualStyle: "premium" as VisualStyle,
        fontMood: "tech" as FontMood,
        iconStyle: "minimal" as IconStyle,
        imageMode: "ui-heavy",
      };
    case "real-estate":
      return {
        designReference: "luxury-editorial" as DesignReference,
        layoutPreference: "editorial" as LayoutPreference,
        visualStyle: "luxury" as VisualStyle,
        fontMood: "editorial" as FontMood,
        iconStyle: "minimal" as IconStyle,
        imageMode: "photo-heavy",
      };
    case "resort":
      return {
        designReference: "cinematic-resort" as DesignReference,
        layoutPreference: "story" as LayoutPreference,
        visualStyle: "luxury" as VisualStyle,
        fontMood: "editorial" as FontMood,
        iconStyle: "minimal" as IconStyle,
        imageMode: "photo-heavy",
      };
    case "restaurant":
      return {
        designReference: "restaurant-editorial" as DesignReference,
        layoutPreference: "story" as LayoutPreference,
        visualStyle: "luxury" as VisualStyle,
        fontMood: "editorial" as FontMood,
        iconStyle: "minimal" as IconStyle,
        imageMode: "photo-heavy",
      };
    case "catering":
      return {
        designReference: "restaurant-editorial" as DesignReference,
        layoutPreference: "split" as LayoutPreference,
        visualStyle: "premium" as VisualStyle,
        fontMood: "friendly" as FontMood,
        iconStyle: "solid" as IconStyle,
        imageMode: "photo-heavy",
      };
    case "barber":
      return {
        designReference: "barber-premium" as DesignReference,
        layoutPreference: "asymmetrical" as LayoutPreference,
        visualStyle: "bold" as VisualStyle,
        fontMood: "trustworthy" as FontMood,
        iconStyle: "solid" as IconStyle,
        imageMode: "photo-heavy",
      };
    case "hair-salon":
      return {
        designReference: "luxury-editorial" as DesignReference,
        layoutPreference: "asymmetrical" as LayoutPreference,
        visualStyle: "luxury" as VisualStyle,
        fontMood: "friendly" as FontMood,
        iconStyle: "minimal" as IconStyle,
        imageMode: "photo-heavy",
      };
    case "autoservis":
      return {
        designReference: "clean-automotive" as DesignReference,
        layoutPreference: "grid" as LayoutPreference,
        visualStyle: "bold" as VisualStyle,
        fontMood: "trustworthy" as FontMood,
        iconStyle: "solid" as IconStyle,
        imageMode: "mixed",
      };
    case "car-dealer":
      return {
        designReference: "clean-automotive" as DesignReference,
        layoutPreference: "split" as LayoutPreference,
        visualStyle: "clean" as VisualStyle,
        fontMood: "geometric" as FontMood,
        iconStyle: "outlined" as IconStyle,
        imageMode: "photo-heavy",
      };
    case "zednik":
      return {
        designReference: "service-trades" as DesignReference,
        layoutPreference: "grid" as LayoutPreference,
        visualStyle: "clean" as VisualStyle,
        fontMood: "trustworthy" as FontMood,
        iconStyle: "solid" as IconStyle,
        imageMode: "mixed",
      };
    case "legal":
      return {
        designReference: "clean-business" as DesignReference,
        layoutPreference: "grid" as LayoutPreference,
        visualStyle: "premium" as VisualStyle,
        fontMood: "trustworthy" as FontMood,
        iconStyle: "outlined" as IconStyle,
        imageMode: "mixed",
      };
    case "healthcare":
      return {
        designReference: "clean-business" as DesignReference,
        layoutPreference: "split" as LayoutPreference,
        visualStyle: "clean" as VisualStyle,
        fontMood: "trustworthy" as FontMood,
        iconStyle: "outlined" as IconStyle,
        imageMode: "mixed",
      };
    case "beauty":
      return {
        designReference: "luxury-editorial" as DesignReference,
        layoutPreference: "asymmetrical" as LayoutPreference,
        visualStyle: "luxury" as VisualStyle,
        fontMood: "luxury" as FontMood,
        iconStyle: "custom" as IconStyle,
        imageMode: "photo-heavy",
      };
    case "food-product":
      return {
        designReference: "product-commerce" as DesignReference,
        layoutPreference: "split" as LayoutPreference,
        visualStyle: "clean" as VisualStyle,
        fontMood: "friendly" as FontMood,
        iconStyle: "solid" as IconStyle,
        imageMode: "product-heavy",
      };
    case "ecommerce-product":
      return {
        designReference: "product-commerce" as DesignReference,
        layoutPreference: "grid" as LayoutPreference,
        visualStyle: "bold" as VisualStyle,
        fontMood: "geometric" as FontMood,
        iconStyle: "solid" as IconStyle,
        imageMode: "product-heavy",
      };
    case "luxury-service":
      return {
        designReference: "luxury-editorial" as DesignReference,
        layoutPreference: "editorial" as LayoutPreference,
        visualStyle: "luxury" as VisualStyle,
        fontMood: "editorial" as FontMood,
        iconStyle: "minimal" as IconStyle,
        imageMode: "mixed",
      };
    default:
      return {
        designReference: "clean-business" as DesignReference,
        layoutPreference: "grid" as LayoutPreference,
        visualStyle: "premium" as VisualStyle,
        fontMood: "geometric" as FontMood,
        iconStyle: "minimal" as IconStyle,
        imageMode: "mixed",
      };
  }
}

function resolveCreativeDirection(
  prompt: string,
  prefs: GenerationPreferences
) {
  const industry = inferIndustryKind(prompt);
  const industryDefaults = getIndustryDefaults(industry);

  const fallbackAnimation =
    industry === "fintech" || industry === "saas"
      ? "rich"
      : industry === "resort" ||
        industry === "beauty" ||
        industry === "restaurant" ||
        industry === "real-estate"
      ? "subtle"
      : "subtle";

  const layoutSeedPool = {
    fintech: [
      "hero-center-dashboard-below",
      "offset-bottom-left-copy",
      "framed-hero-with-floating-ui",
      "stacked-analytics-panels",
      "full-bleed-dark-hero-with-overlay-copy",
      "glassy-signal-columns",
    ],
    saas: [
      "hero-center-dashboard-below",
      "offset-bottom-left-copy",
      "stacked-storyflow",
      "grid-led-platform-layout",
      "observability-hub-layout",
      "floating-control-room-hero",
    ],
    realEstate: [
      "full-bleed-editorial-property-cover",
      "centered-crest-navigation-with-cover-image",
      "bottom-left-copy-over-architecture-shot",
      "oversized-serif-copy-on-airy-canvas",
      "gallery-led-development-microsite",
      "editorial-project-cover-with-thin-dividers",
    ],
    resort: [
      "full-bleed-photo-editorial",
      "bottom-left-copy-over-photo",
      "immersive-cinematic-hero",
      "story-led-split-panels",
      "framed-photo-window-hero",
      "layered-editorial-cover",
    ],
    restaurant: [
      "full-bleed-photo-editorial",
      "bottom-left-copy-over-photo",
      "editorial-story-menu-flow",
      "floating-reservation-panel",
      "hero-top-right-copy-over-image",
      "stacked-gallery-cover-hero",
    ],
    product: [
      "product-hero-with-packshot",
      "benefit-led-commerce-layout",
      "clean-product-split",
      "bento-product-panels",
      "bottom-anchored-product-copy",
      "hero-with-overlap-packshot-cards",
    ],
    automotive: [
      "clean-automotive-hero",
      "trust-led-service-grid",
      "split-vehicle-showcase",
      "service-dashboard-clean",
      "bottom-left-copy-over-car-shot",
      "angled-vehicle-cover-layout",
    ],
    trades: [
      "trust-led-service-grid",
      "clean-process-layout",
      "split-service-hero",
      "practical-bento-layout",
      "bottom-left-copy-over-project-shot",
      "framed-construction-cover",
    ],
    luxury: [
      "editorial-cover-layout",
      "framed-luxury-hero",
      "bottom-left-copy-over-visual",
      "airy-serif-hero-with-gallery-rhythm",
      "layered-brand-story-layout",
      "offset-luxury-panels",
    ],
    generic: [
      "hero-center-dashboard-below",
      "stacked-storyflow",
      "asymmetric-panel-composition",
      "disciplined-bento-layout",
      "bottom-left-copy-over-visual",
      "hero-with-layered-overlap-cards",
    ],
  };

  const seedChoices =
    industry === "fintech"
      ? layoutSeedPool.fintech
      : industry === "saas"
      ? layoutSeedPool.saas
      : industry === "real-estate"
      ? layoutSeedPool.realEstate
      : industry === "resort"
      ? layoutSeedPool.resort
      : industry === "restaurant" || industry === "catering"
      ? layoutSeedPool.restaurant
      : industry === "food-product" || industry === "ecommerce-product"
      ? layoutSeedPool.product
      : industry === "autoservis" || industry === "car-dealer"
      ? layoutSeedPool.automotive
      : industry === "zednik"
      ? layoutSeedPool.trades
      : industry === "luxury-service" || industry === "beauty"
      ? layoutSeedPool.luxury
      : layoutSeedPool.generic;

  const layoutSeed = makeDeterministicChoice(`${prompt}-seed`, seedChoices);

  return {
    industry,
    imageMode: industryDefaults.imageMode,
    speedMode: prefs.speedMode || "premium",
    layoutPreference:
      prefs.layoutPreference && prefs.layoutPreference !== "auto"
        ? prefs.layoutPreference
        : industryDefaults.layoutPreference,
    visualStyle:
      prefs.visualStyle && prefs.visualStyle !== "auto"
        ? prefs.visualStyle
        : industryDefaults.visualStyle,
    animationLevel: prefs.animationLevel || fallbackAnimation,
    fontMood:
      prefs.fontMood && prefs.fontMood !== "auto"
        ? prefs.fontMood
        : industryDefaults.fontMood,
    iconStyle:
      prefs.iconStyle && prefs.iconStyle !== "auto"
        ? prefs.iconStyle
        : industryDefaults.iconStyle,
    designReference:
      prefs.designReference && prefs.designReference !== "auto"
        ? prefs.designReference
        : industryDefaults.designReference,
    buttonStyle: prefs.buttonStyle || "auto",
    promptEnhancerMode: prefs.promptEnhancerMode || "premium-brand",
    preferredPrimaryColor: prefs.preferredPrimaryColor?.trim() || "",
    preferredBackgroundColor: prefs.preferredBackgroundColor?.trim() || "",
    contactItems: Array.isArray(prefs.contactItems) ? prefs.contactItems : [],
    clientAnswers: prefs.clientAnswers || {},
    layoutSeed,
  };
}

function getDesignReferenceRecipe(designReference: DesignReference) {
  switch (designReference) {
    case "fintech-neon":
      return `
REFERENCE FAMILY: FINTECH NEON
- dark premium fintech look
- deep navy / black base with electric cyan, indigo or violet accents
- luminous vertical beams, soft glow columns or layered light bars
- large conversion headline on one side or bottom-anchored over visual if fitting seed
- product / analytics / payment mockups may sit beside, below or layered behind content
- pill navigation, glassy panels, elegant CTA glow`;

    case "signal-orchestration":
      return `
REFERENCE FAMILY: SIGNAL ORCHESTRATION
- dark interface-led system design
- glass navigation, cyan / teal glow, HUD feeling
- radial arcs, rings, targeting lines, orchestration grid overlays
- central hero or offset-copy hero with strong system-message headline
- product panel may be below hero instead of always to the right`;

    case "angled-enterprise":
      return `
REFERENCE FAMILY: ANGLED ENTERPRISE
- bold enterprise composition with angled section transitions
- dark premium bands with strong statistics and trust sections
- orbital glow, subtle sci-fi depth, clean readability`;

    case "cinematic-resort":
      return `
REFERENCE FAMILY: CINEMATIC RESORT
- immersive full-screen photography
- editorial luxury composition
- oversized display headline
- atmospheric overlays and cinematic mood`;

    case "luxury-editorial":
      return `
REFERENCE FAMILY: LUXURY EDITORIAL
- premium editorial composition
- refined serif or contrast typography
- strong image-led sections
- asymmetry, generous spacing, layered cards and elegant separators`;

    case "product-commerce":
      return `
REFERENCE FAMILY: PRODUCT COMMERCE
- clean commercial product presentation
- bright or softly premium background
- product packshots, ingredient / benefit visuals, lifestyle photos
- strong product CTA, variants, trust points, FAQ`;

    case "restaurant-editorial":
      return `
REFERENCE FAMILY: RESTAURANT EDITORIAL
- immersive food photography
- elegant dining mood
- refined editorial typography
- reservation CTA, menu highlights, atmosphere and story`;

    case "barber-premium":
      return `
REFERENCE FAMILY: BARBER PREMIUM
- masculine or premium grooming identity
- stronger contrast, sharp typography, dark or warm palette
- service cards, craft story, gallery, booking CTA`;

    case "clean-automotive":
      return `
REFERENCE FAMILY: CLEAN AUTOMOTIVE
- clean, trustworthy, corporate automotive styling
- strong service hierarchy
- useful for autoservis and dealers`;

    case "service-trades":
      return `
REFERENCE FAMILY: SERVICE TRADES
- clean commercial local service website
- practical trust-first structure
- clear services, realizace, process, references, contact`;

    case "clean-business":
      return `
REFERENCE FAMILY: CLEAN BUSINESS
- modern commercial website
- balanced spacing, structured sections, clear conversion hierarchy`;

    default:
      return `
REFERENCE FAMILY: AUTO
- choose the strongest fitting premium commercial family for the business
- do not fall back to a generic template`;
  }
}

function getIndustrySpecificRules(industry: IndustryKind, imageMode: string) {
  switch (industry) {
    case "food-product":
      return `
INDUSTRY RULES: FOOD PRODUCT
- commercial product website
- use 2 to 4 meaningful product / ingredient / packaging / lifestyle images
- product images are REQUIRED`;

    case "restaurant":
      return `
INDUSTRY RULES: RESTAURANT
- food photography is central
- reservation CTA should be clear
- menu highlights, atmosphere, story, visit section and map make sense
- for fine dining, prefer restraint, typography, editorial rhythm and refined luxury`;

    case "catering":
      return `
INDUSTRY RULES: CATERING
- use food and event imagery
- emphasize nabídka, akce, rozvoz, kontakt, poptávka`;

    case "barber":
      return `
INDUSTRY RULES: BARBER
- use craft / portrait / interior imagery
- focus on služby, styl, galerie, tým, rezervace`;

    case "hair-salon":
      return `
INDUSTRY RULES: HAIR SALON
- use salon / portrait / styling imagery
- focus on služby, proměny, rezervace, kontakt`;

    case "autoservis":
      return `
INDUSTRY RULES: AUTOSERVIS
- clean trustworthy company site
- use garage, mechanic, service bay or car maintenance imagery
- focus on služby, ceník, objednání, důvěra, kontakt`;

    case "car-dealer":
      return `
INDUSTRY RULES: CAR DEALER
- clean corporate vehicle sales site
- vehicle images are important
- structure can include nabídka vozů, výhody, financování, reference, kontakt`;

    case "zednik":
      return `
INDUSTRY RULES: MASONRY / CONSTRUCTION TRADES
- practical trustworthy local service website
- use project / facade / construction imagery
- include služby, realizace, proces, reference, kontakt`;

    case "ecommerce-product":
      return `
INDUSTRY RULES: E-COMMERCE PRODUCT
- product or category images are REQUIRED
- use a conversion-first commerce structure`;

    case "resort":
      return `
INDUSTRY RULES: RESORT / HOSPITALITY
- immersive image-led design
- atmosphere matters more than generic cards`;

    case "real-estate":
      return `
INDUSTRY RULES: REAL ESTATE / DEVELOPMENT PROJECT
- use architecture / interior / exterior imagery
- premium editorial composition
- large full-bleed visuals and airy sections are welcome`;

    case "fintech":
      return `
INDUSTRY RULES: FINTECH
- dark premium product direction is appropriate
- product mockups, data panels and trust blocks are allowed`;

    case "saas":
      return `
INDUSTRY RULES: SAAS / SOFTWARE
- interface-led design is appropriate
- richer gradients, glows, animated borders, polished microinteractions are welcome`;

    default:
      return `
INDUSTRY RULES:
- keep imagery and layout aligned with the business
- image mode: ${imageMode}`;
  }
}

function formatChatHistory(history: ChatHistoryItem[]) {
  if (!history?.length) return "Žádná historie chatu.";

  return history
    .slice(-4)
    .map((item, index) => `${index + 1}. [${item.role}] ${item.text}`)
    .join("\n");
}

function renderInputModeContext(params: {
  inputMode: InputMode;
  referenceUrl?: string;
  referenceHtml?: string;
  attachments: AttachmentInput[];
}) {
  const lines: string[] = [];

  lines.push(`INPUT MODE: ${params.inputMode}`);

  if (params.inputMode === "url" && params.referenceUrl?.trim()) {
    lines.push(`REFERENCE URL: ${params.referenceUrl.trim()}`);
    lines.push(
      "The user wants strong inspiration from the supplied URL. Match structure and hierarchy where useful, but do not blindly clone."
    );
  }

  if (params.inputMode === "html" && params.referenceHtml?.trim()) {
    lines.push("REFERENCE HTML PROVIDED: yes");
    lines.push(
      `REFERENCE HTML SNIPPET:\n${params.referenceHtml.trim().slice(0, 6000)}`
    );
    lines.push(
      "Use the supplied HTML as structural inspiration, but return a cleaner and more premium result."
    );
  }

  if (
    params.inputMode === "screenshot" ||
    params.attachments.some((item) => item.kind === "screenshot")
  ) {
    lines.push("SCREENSHOT ATTACHMENTS PROVIDED: yes");
    lines.push(
      "The user likely wants the layout vibe, visual hierarchy or composition to be inspired by screenshots."
    );
  }

  if (params.attachments.length > 0) {
    lines.push(
      `ATTACHMENTS: ${params.attachments
        .map((item) => `${item.kind || "file"}:${item.name || "unknown"}`)
        .join(", ")}`
    );
  }

  return lines.join("\n");
}

function renderPrompt(params: {
  prompt: string;
  buildType?: string;
  model?: string;
  chatHistory?: ChatHistoryItem[];
  preferences: ReturnType<typeof resolveCreativeDirection>;
  brandLogo?: BrandLogoAsset | null;
  inputMode: InputMode;
  referenceUrl?: string;
  referenceHtml?: string;
  attachments: AttachmentInput[];
}) {
  return `
You are a world-class commercial web designer, art director and senior frontend developer.

Return ONLY a structured JSON object matching the schema.

PRIMARY GOAL:
Create a premium commercial website that feels custom-designed for this exact business.
It must not feel like a recycled template.

MOST IMPORTANT PRIORITY:
If the client explicitly described a style, fonts, mood, contact details, content or visual direction,
those explicit client instructions OVERRIDE automatic defaults.

CLIENT EXPLICIT ANSWERS:
- Contact details: ${params.preferences.clientAnswers.contactDetails || "neuvedeno"}
- Style notes: ${params.preferences.clientAnswers.styleNotes || "neuvedeno"}
- Offer notes: ${params.preferences.clientAnswers.offerNotes || "neuvedeno"}
- Extra notes: ${params.preferences.clientAnswers.extras || "neuvedeno"}

OUTPUT RULES:
- html must contain ONLY body markup content
- do not return <!DOCTYPE html>
- do not return <html>, <head> or <body>
- css must contain ALL styling needed for the website
- js must contain vanilla JavaScript only
- do not use external libraries
- do not use Tailwind CDN
- do not rely on remote CSS
- every major page block must use a semantic <section> tag
- every major section must have data-section-id and data-section-type
- data-section-id values must be stable, unique and human-readable
- navigation must be its own section with data-section-id="navigation"
- footer must be its own section with data-section-id="footer"
- add a fully working mobile hamburger navigation
- include a CTA button in the main navigation
- footer must be complete and visually polished

BRAND LOGO RULES:
${
  params.brandLogo
    ? `- a real uploaded logo exists for this project
- when rendering the navigation and any footer brand area, place the exact token __BRAND_LOGO__ where the real logo should appear
- wrap that token in a tasteful logo container or link
- do not invent a generic text logo if a real brand logo is available`
    : `- if no real logo is provided, create an elegant text or monogram logo treatment`
}

SELECTED CREATIVE DIRECTION:
- Detected industry: ${params.preferences.industry}
- Image mode: ${params.preferences.imageMode}
- Speed mode: ${params.preferences.speedMode}
- Layout preference: ${params.preferences.layoutPreference}
- Visual style: ${params.preferences.visualStyle}
- Animation level: ${params.preferences.animationLevel}
- Font mood: ${params.preferences.fontMood}
- Icon style: ${params.preferences.iconStyle}
- Design reference: ${params.preferences.designReference}
- Button style: ${params.preferences.buttonStyle}
- Prompt enhancer mode: ${params.preferences.promptEnhancerMode}
- Preferred primary color: ${params.preferences.preferredPrimaryColor || "auto"}
- Preferred background color: ${params.preferences.preferredBackgroundColor || "auto"}
- Layout seed: ${params.preferences.layoutSeed}
- Contact items to show: ${
    params.preferences.contactItems.length
      ? params.preferences.contactItems.join(", ")
      : "phone, email, office, CTA form"
  }

${getDesignReferenceRecipe(params.preferences.designReference)}

${getIndustrySpecificRules(
    params.preferences.industry,
    params.preferences.imageMode
  )}

INPUT CONTEXT:
${renderInputModeContext({
  inputMode: params.inputMode,
  referenceUrl: params.referenceUrl,
  referenceHtml: params.referenceHtml,
  attachments: params.attachments,
})}

HARD TECHNICAL LAYOUT CONSTRAINTS:
- the page must use stable wrappers and predictable layout primitives
- all important sections must use max-width container + auto margins, disciplined grid, or disciplined flexbox
- avoid fragile absolute positioning for primary readable copy
- every section must remain visually stable at desktop, tablet and mobile
- no section may look unfinished when content length changes moderately

NAV HEIGHT RULES:
- navigation should usually stay within min-height: 72px to max-height: 112px on desktop
- absolute hard limit is 124px
- do not allow brand text or logo to create giant nav height
- nav row should use flex alignment and controlled padding

LOGO FIT RULES:
- uploaded logos must NEVER render at uncontrolled natural size
- always create a dedicated logo shell with explicit sizing constraints
- actual img.brand-logo-image must use object-fit: contain
- never allow the uploaded logo to stretch the nav row height

SPACING AND COMPOSITION RULES:
- spacing must feel deliberate and premium
- desktop section spacing should usually land between 88px and 144px
- tablet spacing should stay generous
- mobile spacing must still breathe
- every hero, overlay card, floating panel and text block must have explicit safe inner padding
- never place text flush to viewport edges or image edges
- use horizontal gutters at minimum:
  - desktop: clamp(24px, 4vw, 56px)
  - tablet: clamp(20px, 5vw, 40px)
  - mobile: clamp(16px, 5vw, 24px)

OPTICAL ALIGNMENT RULES:
- text may not be only mathematically centered; it must also feel optically centered
- centered hero text blocks must have max-width and margin-inline auto
- avoid awkward half-centered layouts

HERO STABILITY RULES:
- hero content must never collide with navigation
- hero must have a predictable content wrapper
- the first screen must feel complete and intentional
- avoid giant accidental empty black gaps

TYPOGRAPHY RULES:
- enforce clear H1 / H2 / H3 hierarchy
- headings must not always use extreme weight
- default body copy should usually live around weight 400 to 500
- display headlines may be strong, but keep them refined

BUTTON AND CONTRAST RULES:
- primary CTA must be clearly visible
- navigation links and CTA button must not visually merge
- if button style is gradient-glow, keep it elegant
- if button style is solid-premium, prioritize clarity and conversion

MOBILE NAV RULES:
- logo on the left, hamburger fully on the far right
- minimum tap target is 44x44
- hamburger animates into X
- mobile menu opens with refined fade, slide or scale

ANIMATION AND WOW RULES:
- use ${params.preferences.animationLevel} animation intensity
- animations must feel premium, not gimmicky
- allowed motion ideas:
  - gradient drift
  - subtle glow pulse
  - reveal on scroll
  - card hover lift
  - animated border shimmer
  - loading skeleton shimmer
  - staggered text reveal
  - animated underline / highlight pass
  - floating UI drift
- for SaaS / AI / product sites, richer motion is welcome
- for luxury / real estate / restaurant, motion should stay more restrained
- if prompt enhancer mode is wow-creative, push animation quality further

IMAGE RULES:
- also return assetPlan with at most 4 realistic images
- if an image is needed in html, use a normal <img> and add data-image-slot="<slot>"
- slot values in html must exactly match assetPlan.slot values
- queries must be concrete and in English
- if industry is food-product, ecommerce-product, restaurant, catering, car-dealer or resort, imagery is mandatory

MANDATORY CSS IMPLEMENTATION DETAILS:
- define a container utility in CSS
- define a logo shell class
- define a nav shell with controlled min/max height
- define a stable hero inner wrapper with explicit max-widths
- define card classes with repeatable padding, radius and border logic
- define responsive breakpoints
- prevent horizontal overflow globally
- use box-sizing: border-box everywhere

COPY RULES:
- use Czech copy
- hero headline should be short, premium and easy to scan
- avoid lorem ipsum
- make sections relevant to the business

PROJECT CONTEXT:
- Original prompt: ${params.prompt}
- Build type: ${params.buildType || "neuvedeno"}
- Preferred model label: ${params.model || "neuvedeno"}

CHAT HISTORY:
${formatChatHistory(params.chatHistory || [])}

FINAL QA:
- no obvious empty spaces
- complete premium navigation with CTA
- complete premium footer
- working mobile menu
- responsive desktop, tablet and mobile
- visible design distinctiveness
- stronger motion and detail
- disciplined spacing
- strong hierarchy
- strong CTA contrast
- uploaded logo constrained by a logo shell
- hero remains structurally stable`;
}

async function createStructuredObject<T>({
  model,
  system,
  user,
  schemaName,
  schema,
  requestId,
}: {
  model: string;
  system: string;
  user: string;
  schemaName: string;
  schema: Record<string, unknown>;
  requestId: string;
}): Promise<T> {
  const startedAt = nowMs();

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "developer", content: system },
      { role: "user", content: user },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: schemaName,
        schema,
        strict: true,
      },
    },
  });

  logStep(requestId, `openai:${schemaName}`, startedAt, { model });

  console.log(
    JSON.stringify({
      scope: "openai",
      requestId,
      schemaName,
      model,
      openaiRequestId: completion._request_id ?? null,
    })
  );

  const content = completion.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(`Model nevrátil obsah pro schema ${schemaName}.`);
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    throw new Error(
      `Structured output pro ${schemaName} není validní JSON. Začátek odpovědi: ${content.slice(
        0,
        180
      )}`
    );
  }
}

const generatedWebsiteSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    html: { type: "string" },
    css: { type: "string" },
    js: { type: "string" },
    assetPlan: {
      type: "array",
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          slot: { type: "string" },
          query: { type: "string" },
          placement: { type: "string" },
          mood: { type: "string" },
          orientation: {
            type: "string",
            enum: ["landscape", "portrait", "square"],
          },
        },
        required: ["slot", "query", "placement", "mood", "orientation"],
      },
    },
  },
  required: ["html", "css", "js", "assetPlan"],
};

function cleanCodeBlock(raw: string) {
  return raw
    .replace(/```html/gi, "")
    .replace(/```css/gi, "")
    .replace(/```js/gi, "")
    .replace(/```javascript/gi, "")
    .replace(/```/g, "")
    .trim();
}

function sanitizeAssetPlan(assetPlan: unknown): AssetPlanItem[] {
  if (!Array.isArray(assetPlan)) return [];

  return assetPlan
    .slice(0, 4)
    .filter((item): item is AssetPlanItem => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as AssetPlanItem;

      return Boolean(
        candidate.slot &&
          candidate.query &&
          candidate.placement &&
          candidate.mood &&
          ["landscape", "portrait", "square"].includes(candidate.orientation)
      );
    });
}

function sanitizeBundle(bundle: GeneratedWebsiteBundle): GeneratedWebsiteBundle {
  const html = cleanCodeBlock(bundle.html || "");
  const css = cleanCodeBlock(bundle.css || "");
  const js = cleanCodeBlock(bundle.js || "");

  if (!html || !css) {
    throw new Error("Výstup neobsahuje kompletní HTML/CSS.");
  }

  return {
    html,
    css,
    js,
    assetPlan: sanitizeAssetPlan(bundle.assetPlan),
  };
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const routeStartedAt = nowMs();

  try {
    const bodyStartedAt = nowMs();
    const body = await req.json();
    logStep(requestId, "parse-body", bodyStartedAt);

    const prompt =
      typeof body?.prompt === "string" ? body.prompt.trim().slice(0, 6000) : "";
    const buildType =
      typeof body?.buildType === "string" ? body.buildType : "";
    const model = typeof body?.model === "string" ? body.model : "";

    const inputMode: InputMode =
      body?.inputMode === "url" ||
      body?.inputMode === "screenshot" ||
      body?.inputMode === "html"
        ? body.inputMode
        : "prompt";

    const referenceUrl =
      typeof body?.referenceUrl === "string" ? body.referenceUrl.trim() : "";
    const referenceHtml =
      typeof body?.referenceHtml === "string"
        ? body.referenceHtml.trim().slice(0, 12000)
        : "";

    const attachments = sanitizeAttachments(body?.attachments);

    const chatHistory = Array.isArray(body?.chatHistory)
      ? (body.chatHistory as ChatHistoryItem[])
      : [];

    const rawPreferences =
      body?.generationPreferences &&
      typeof body.generationPreferences === "object"
        ? (body.generationPreferences as GenerationPreferences)
        : body?.landingPreferences && typeof body.landingPreferences === "object"
        ? (body.landingPreferences as GenerationPreferences)
        : {};

    const brandLogo = sanitizeBrandLogoAsset(body?.brandLogo);

    if (!prompt || prompt.length < 8) {
      return Response.json(
        { error: "Missing or invalid prompt" },
        { status: 400 }
      );
    }

    const resolvedPreferences = resolveCreativeDirection(prompt, rawPreferences);

    console.log(
      JSON.stringify({
        scope: "api-generate",
        requestId,
        step: "start",
        model: WEB_MODEL,
        promptLength: prompt.length,
        chatHistoryCount: chatHistory.length,
        inputMode,
        referenceUrl: referenceUrl || null,
        hasReferenceHtml: Boolean(referenceHtml),
        attachmentCount: attachments.length,
        generationPreferences: resolvedPreferences,
        hasBrandLogo: Boolean(brandLogo),
      })
    );

    const renderStartedAt = nowMs();

    const renderedBundle = await createStructuredObject<GeneratedWebsiteBundle>({
      model: WEB_MODEL,
      system:
        "You are an elite web designer and frontend engineer. Return only valid JSON.",
      user: renderPrompt({
        prompt,
        buildType,
        model,
        chatHistory,
        preferences: resolvedPreferences,
        brandLogo,
        inputMode,
        referenceUrl,
        referenceHtml,
        attachments,
      }),
      schemaName: "website_bundle_creative_setup_v12",
      schema: generatedWebsiteSchema,
      requestId,
    });

    logStep(requestId, "render-finished", renderStartedAt, {
      htmlLength: renderedBundle?.html?.length || 0,
      cssLength: renderedBundle?.css?.length || 0,
      jsLength: renderedBundle?.js?.length || 0,
      assetPlanCount: renderedBundle?.assetPlan?.length || 0,
    });

    const sanitizeStartedAt = nowMs();
    const safeRendered = sanitizeBundle(renderedBundle);

    const htmlWithBrandLogo = injectBrandLogoMarkup(
      safeRendered.html,
      brandLogo
    );

    logStep(requestId, "sanitize-bundle", sanitizeStartedAt, {
      assetPlanCount: safeRendered.assetPlan.length,
      hasBrandLogo: Boolean(brandLogo),
    });

    logStep(requestId, "done", routeStartedAt, {
      totalMs: Date.now() - routeStartedAt,
      model: WEB_MODEL,
    });

    return Response.json({
      html: htmlWithBrandLogo,
      css: safeRendered.css,
      js: safeRendered.js,
      assetPlan: safeRendered.assetPlan,
      brief: {
        industry: resolvedPreferences.industry,
        audience: "",
        style: `${resolvedPreferences.visualStyle} • ${resolvedPreferences.fontMood} • ${resolvedPreferences.designReference}`,
        layoutTone: `${resolvedPreferences.layoutPreference} • ${resolvedPreferences.animationLevel} • ${resolvedPreferences.layoutSeed}`,
      },
      assets: [],
      twoStepMode: true,
      modelUsed: WEB_MODEL,
      requestId,
      generationPreferences: resolvedPreferences,
      inputMode,
      referenceUrl,
    });
  } catch (e: any) {
    console.error(
      JSON.stringify({
        scope: "api-generate",
        requestId,
        step: "fatal-error",
        totalMs: Date.now() - routeStartedAt,
        error: e?.message ?? "Unknown error",
        stack: e?.stack || null,
      })
    );

    return Response.json(
      {
        error: e?.message ?? "Server error",
        requestId,
      },
      { status: 500 }
    );
  }
}
