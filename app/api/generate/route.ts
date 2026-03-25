import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 300;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 0,
  timeout: 240000,
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
  if (dataUrl.length > 4_000_000) return null;

  return {
    name: name || "logo",
    mimeType: mimeType || "image/png",
    dataUrl,
  };
}

function buildBrandLogoMarkup(brandLogo: BrandLogoAsset) {
  const altBase =
    brandLogo.name.replace(/\.[^.]+$/, "").trim() || "Brand logo";

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
    text.includes("food") ||
    text.includes("produkt") ||
    text.includes("product") ||
    text.includes("eshop") ||
    text.includes("e-shop") ||
    text.includes("shop") ||
    text.includes("prodej") ||
    text.includes("baleni")
  ) {
    if (
      text.includes("cukr") ||
      text.includes("sugar") ||
      text.includes("food") ||
      text.includes("potrav")
    ) {
      return "food-product";
    }

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
    speedMode: prefs.speedMode || "balanced",
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
- pill navigation, glassy panels, elegant CTA glow
`;
    case "signal-orchestration":
      return `
REFERENCE FAMILY: SIGNAL ORCHESTRATION
- dark interface-led system design
- glass navigation, cyan / teal glow, HUD feeling
- radial arcs, rings, targeting lines, orchestration grid overlays
- central hero or offset-copy hero with strong system-message headline
- product panel may be below hero instead of always to the right
`;
    case "angled-enterprise":
      return `
REFERENCE FAMILY: ANGLED ENTERPRISE
- bold enterprise composition with angled section transitions
- dark premium bands with strong statistics and trust sections
- orbital glow, subtle sci-fi depth, clean readability
`;
    case "cinematic-resort":
      return `
REFERENCE FAMILY: CINEMATIC RESORT
- immersive full-screen photography
- editorial luxury composition
- oversized display headline
- atmospheric overlays and cinematic mood
- copy may sit bottom-left, bottom-center or inside framed overlay panels
`;
    case "luxury-editorial":
      return `
REFERENCE FAMILY: LUXURY EDITORIAL
- premium editorial composition
- refined serif or contrast typography
- strong image-led sections
- asymmetry, generous spacing, layered cards and elegant separators
- for premium real estate or development projects, this may include:
  - centered or split navigation with refined logo treatment
  - huge elegant serif headlines
  - airy white sections after the hero
  - thin dividers, muted palette, restrained luxury
  - full-bleed interiors or architectural photography
`;
    case "product-commerce":
      return `
REFERENCE FAMILY: PRODUCT COMMERCE
- clean commercial product presentation
- bright or softly premium background
- product packshots, ingredient / benefit visuals, lifestyle photos
- strong product CTA, variants, trust points, FAQ
`;
    case "restaurant-editorial":
      return `
REFERENCE FAMILY: RESTAURANT EDITORIAL
- immersive food photography
- elegant dining mood
- refined editorial typography
- reservation CTA, menu highlights, atmosphere and story
- can include subtle map and visit section
`;
    case "barber-premium":
      return `
REFERENCE FAMILY: BARBER PREMIUM
- masculine or premium grooming identity
- stronger contrast, sharp typography, dark or warm palette
- service cards, craft story, gallery, booking CTA
`;
    case "clean-automotive":
      return `
REFERENCE FAMILY: CLEAN AUTOMOTIVE
- clean, trustworthy, corporate automotive styling
- strong service hierarchy
- no futuristic SaaS UI
- useful for autoservis and dealers
- vehicles, services, trust, availability, contact
`;
    case "service-trades":
      return `
REFERENCE FAMILY: SERVICE TRADES
- clean commercial local service website
- practical trust-first structure
- clear services, realizace, process, references, contact
`;
    case "clean-business":
      return `
REFERENCE FAMILY: CLEAN BUSINESS
- modern commercial website
- balanced spacing, structured sections, clear conversion hierarchy
`;
    default:
      return `
REFERENCE FAMILY: AUTO
- choose the strongest fitting premium commercial family for the business
- do not fall back to a generic template
`;
  }
}

function getIndustrySpecificRules(industry: IndustryKind, imageMode: string) {
  switch (industry) {
    case "food-product":
      return `
INDUSTRY RULES: FOOD PRODUCT / SUGAR / PACKAGED GOODS
- do NOT use fintech / dashboard / orchestration / dark SaaS composition
- the site must feel like a commercial product website
- use 2 to 4 meaningful product / ingredient / packaging / lifestyle images
- product images are REQUIRED
- preferred sections:
  - hero with product value
  - benefits
  - product variants or packaging
  - why choose us / ingredients / quality
  - use cases or recipes
  - FAQ
  - contact or order CTA
`;
    case "restaurant":
      return `
INDUSTRY RULES: RESTAURANT
- food photography is central
- reservation CTA should be clear
- menu highlights, atmosphere, story, visit section and map make sense
- avoid product dashboard style
`;
    case "catering":
      return `
INDUSTRY RULES: CATERING
- use food and event imagery
- emphasize nabídka, firemní akce, svatby, rozvoz, kontakt, poptávka
`;
    case "barber":
      return `
INDUSTRY RULES: BARBER
- use craft / portrait / interior imagery
- focus on služby, styl, galerie, tým, rezervace
`;
    case "hair-salon":
      return `
INDUSTRY RULES: HAIR SALON
- use salon / portrait / styling imagery
- focus on služby, proměny, rezervace, kontakt
`;
    case "autoservis":
      return `
INDUSTRY RULES: AUTOSERVIS
- clean trustworthy company site
- use garage, mechanic, service bay or car maintenance imagery
- focus on služby, ceník, objednání, důvěra, kontakt
- do not use fintech or futuristic SaaS layout
`;
    case "car-dealer":
      return `
INDUSTRY RULES: CAR DEALER
- clean corporate vehicle sales site
- vehicle images are important
- structure can include nabídka vozů, výhody, financování, reference, kontakt
- keep it business-clean and not experimental
`;
    case "zednik":
      return `
INDUSTRY RULES: MASONRY / CONSTRUCTION TRADES
- practical trustworthy local service website
- use project / facade / construction imagery
- include služby, realizace, proces, reference, kontakt
`;
    case "ecommerce-product":
      return `
INDUSTRY RULES: E-COMMERCE PRODUCT
- product or category images are REQUIRED
- use a conversion-first commerce structure
`;
    case "resort":
      return `
INDUSTRY RULES: RESORT / HOSPITALITY
- immersive image-led design
- atmosphere matters more than generic cards
`;
    case "real-estate":
      return `
INDUSTRY RULES: REAL ESTATE / DEVELOPMENT PROJECT
- use architecture / interior / exterior imagery
- premium editorial composition
- for luxury real-estate or development sites, the design may resemble a refined editorial project microsite
- large full-bleed property visuals are welcome
- oversized elegant serif headlines are welcome
- airy white sections with restrained palette are welcome
- thin dividers, calm rhythm and strong premium spacing are welcome
- navigation may be centered, split around a logo, or refined and minimal
- avoid generic corporate cards if a calmer premium editorial system is more fitting
`;
    case "fintech":
      return `
INDUSTRY RULES: FINTECH
- dark premium product direction is appropriate
- product mockups, data panels and trust blocks are allowed
`;
    case "saas":
      return `
INDUSTRY RULES: SAAS / SOFTWARE
- dashboard / orchestration / interface-led design is appropriate
`;
    default:
      return `
INDUSTRY RULES:
- keep imagery and layout aligned with the business
- image mode: ${imageMode}
`;
  }
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

function formatChatHistory(history: ChatHistoryItem[]) {
  if (!history?.length) return "Žádná historie chatu.";

  return history
    .slice(-8)
    .map((item, index) => `${index + 1}. [${item.role}] ${item.text}`)
    .join("\n");
}

function renderPrompt(params: {
  prompt: string;
  buildType?: string;
  model?: string;
  chatHistory?: ChatHistoryItem[];
  preferences: ReturnType<typeof resolveCreativeDirection>;
  brandLogo?: BrandLogoAsset | null;
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
- do not create duplicate data-section-id values
- do not nest one editable section inside another editable section
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
- do not invent a generic text logo if a real brand logo is available
- make sure the logo area has premium spacing and alignment`
    : `- if no real logo is provided, create an elegant text or monogram logo treatment`
}

DO NOT GENERATE THE SAME DEFAULT LAYOUT:
- avoid repeating the same generic hero + cards + services pattern
- DO NOT default to hero text on the left and image on the right
- if a split layout is used, it must still feel custom and not be the default fallback
- strongly commit to one design family and one layout system
- make the composition visibly distinct
- hero may be centered, bottom-left over image, bottom-centered, top-right overlay, stacked with media below, framed inside a window, or built with overlapping panels

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

SPACING AND COMPOSITION RULES:
- spacing must feel deliberate and premium, not compressed
- section top/bottom spacing on desktop should usually land between 88px and 144px depending on density
- tablet spacing should stay generous, not collapse too hard
- mobile spacing must still breathe
- keep consistent inner card padding inside similar components
- every hero, overlay card, floating panel, content column and text block must have explicit safe inner padding
- never place text flush to viewport edges or image edges
- use base horizontal gutters at minimum:
  - desktop: clamp(24px, 4vw, 56px)
  - tablet: clamp(20px, 5vw, 40px)
  - mobile: clamp(16px, 5vw, 24px)
- if copy is anchored bottom-left, bottom-center or over media, wrap it in a padded container
- if the user asks for text low in the hero, it must still have protected padding from the bottom and left edges
- if you use a grid or bento layout, make it disciplined and visually aligned
- do not let one card have 18px padding and another similar card 44px unless clearly intentional
- use a visible spacing rhythm and repeat it consistently

TYPOGRAPHY HIERARCHY RULES:
- enforce a clear H1 / H2 / H3 / H4 hierarchy
- H1 must be visually dominant and distinct from H2
- section labels / eyebrow text should be much smaller than section titles
- heading-top margins and bottom margins must be consistent
- avoid oversized headings inside secondary sections
- subheadings should support, not compete with the hero
- paragraphs must have readable line-height and sufficient distance from titles

FONT VARIATION RULES:
- create more visible font variety between projects
- do not keep using the same 2 generic stacks for most outputs
- use CSS variables for font stacks, for example --font-display and --font-body
- choose CSS stacks that clearly differ by mood
- headings must not always use extremely heavy weights
- avoid overusing 800 or 900 weight
- default body copy should usually live around 400 to 500
- secondary headings often work better at 500 to 700 instead of 800+
- display headlines may be strong, but keep them refined and not always ultra-bold
- vary font weight rhythm intentionally across hero, section titles, buttons and microcopy

RADIUS SYSTEM RULES:
- do NOT use the same radius everywhere by default
- establish a radius system per design family:
  - large hero panels / feature wrappers may use larger radius
  - cards use medium radius
  - pills / chips use full or small rounded radius
  - tables and menus can use smaller cleaner radius where appropriate
- keep the radius system coherent and repeated intentionally

BUTTON AND CONTRAST RULES:
- primary CTA must be highly visible against its background
- navigation links and CTA button must not visually merge into the same weight or same contrast level
- if the menu text is light and subtle, the CTA must have stronger fill / outline / contrast
- secondary buttons must still be readable
- never create low-contrast CTA text against similarly colored fills

MENU VARIATION RULES:
- do not always use the same menu pattern
- choose a menu style that fits the design family, for example:
  - central floating navigation bar with rounded shell
  - split navigation with logo left, menu centered, CTA right
  - glass pill navigation over hero
  - clean enterprise top bar with CTA anchored right
  - editorial top navigation with lighter structure
  - centered premium real-estate navigation with logo emphasis
- menu must have balanced internal padding and a deliberate silhouette
- hamburger must be visually clear and functional on mobile

BENTO / CARD SYSTEM RULES:
- if using bento or feature cards, cards should look intentionally designed as one family
- match border color, padding logic, heading scale, icon size and internal spacing
- avoid one visually weak card next to one very dense card unless it is part of the intended layout rhythm

LAYOUT SYSTEM RULES:
- use the layout seed "${params.preferences.layoutSeed}" as a compositional guide
- the layout seed is not decorative text; it is a hard directional clue for hero composition and section rhythm
- examples of acceptable layout systems:
  - centered hero + control panel below
  - immersive full-bleed photo with padded bottom-left copy
  - hero with framed window and floating stat cards
  - bottom-anchored product copy with overlapping packshot
  - layered narrative flow with alternating section directions
  - asymmetrical luxury panel rhythm
  - editorial cover layout with text overlay inside safe padded wrapper
  - clean service hero with trust grid below
  - real-estate project cover with huge serif title and airy sections after hero
- do not flatten everything into the same rectangular rhythm
- do not silently convert unusual hero requests into left-text/right-image fallback

FONT DIRECTION RULES:
- use CSS font stacks that visually suggest the chosen mood
- geometric: clean modern sans
- editorial: elegant serif headlines + neutral body
- luxury: refined contrast display feeling
- trustworthy: calm professional humanist feeling
- tech: precise UI-driven modern feel
- friendly: softer approachable tone

ICON RULES:
- create elegant inline SVG icons directly in the HTML where useful
- icon style must match: ${params.preferences.iconStyle}
- icons should feel custom and premium
- use icons in benefits, trust points, process, stats or contact where meaningful

ANIMATION RULES:
- use ${params.preferences.animationLevel} animation intensity
- minimal: mainly hover and tiny transitions
- subtle: tasteful reveal and CTA motion
- rich: reveal effects, animated highlights, gradient movement, card motion
- expressive: stronger motion, animated borders, layered glows, premium hero movement
- keep animations performant and elegant
- use IntersectionObserver for reveal effects when useful

VISUAL DEVICE RULES:
- use stronger decorative systems where appropriate:
  - moving gradient orbs
  - soft light columns / light beams
  - grid overlays
  - glass surfaces
  - radial arcs
  - orbital glow rings
  - angled separators
  - cinematic overlays
  - floating UI cards
  - premium bordered chips
- not all at once; choose a coherent set for the selected family

COPY RULES:
- use Czech copy
- hero headline must be short, premium and easy to scan
- prefer roughly 3 to 8 words in the main hero headline
- supporting text should stay concise
- avoid lorem ipsum
- make sections relevant to the business, not filler

IMAGE RULES:
- also return assetPlan with at most 4 realistic images
- if an image is needed in html, use a normal <img> and add data-image-slot="<slot>"
- slot values in html must exactly match assetPlan.slot values
- use image slots only where visually meaningful
- queries must be concrete and in English
- if industry is food-product, ecommerce-product, restaurant, catering, car-dealer or resort, imagery is mandatory
- if no image is needed, return an empty assetPlan array only for interface-led or text-led business types where that truly makes sense

CONTACT RULES:
- if the client provided direct contact details, use them exactly in contact and footer
- if contact items were requested, reflect them in the contact section and footer
- make the contact section useful, not placeholder-like

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
- balanced layout
- visible design distinctiveness
- strong compositional identity
- custom-feeling icons
- richer motion and detail
- disciplined spacing
- coherent radius system
- strong heading hierarchy
- strong CTA contrast
- polished bento and cards
- short strong hero headline
- varied hero composition, not repetitive left-text/right-image fallback
- safe padding around all overlayed or edge-near text
- more varied font stacks and more refined font-weight usage
`;
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const routeStartedAt = nowMs();

  try {
    const bodyStartedAt = nowMs();
    const body = await req.json();
    logStep(requestId, "parse-body", bodyStartedAt);

    const prompt = typeof body?.prompt === "string" ? body.prompt : "";
    const buildType =
      typeof body?.buildType === "string" ? body.buildType : "";
    const model = typeof body?.model === "string" ? body.model : "";
    const chatHistory = Array.isArray(body?.chatHistory)
      ? (body.chatHistory as ChatHistoryItem[])
      : [];
    const generationPreferences =
      body?.generationPreferences &&
      typeof body.generationPreferences === "object"
        ? (body.generationPreferences as GenerationPreferences)
        : {};
    const brandLogo = sanitizeBrandLogoAsset(body?.brandLogo);

    if (!prompt || prompt.trim().length < 8) {
      return Response.json(
        { error: "Missing or invalid prompt" },
        { status: 400 }
      );
    }

    const resolvedPreferences = resolveCreativeDirection(
      prompt,
      generationPreferences
    );

    console.log(
      JSON.stringify({
        scope: "api-generate",
        requestId,
        step: "start",
        model: WEB_MODEL,
        promptLength: prompt.length,
        chatHistoryCount: chatHistory.length,
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
      }),
      schemaName: "website_bundle_spacing_typography_brand_v8",
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