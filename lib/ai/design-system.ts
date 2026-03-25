export type IndustryKind =
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

export type ThemePreset =
  | "saas-dark"
  | "clinic-light"
  | "real-estate-editorial"
  | "luxury-dark"
  | "neutral-premium";

export type LayoutSeed =
  | "hero-center-dashboard-below"
  | "offset-bottom-left-copy"
  | "framed-hero-with-floating-ui"
  | "stacked-analytics-panels"
  | "floating-control-room-hero"
  | "calm-trust-split"
  | "editorial-clinic-intro"
  | "full-bleed-editorial-property-cover"
  | "centered-crest-navigation-with-cover-image"
  | "bottom-left-copy-over-architecture-shot"
  | "oversized-serif-copy-on-airy-canvas"
  | "gallery-led-development-microsite"
  | "immersive-cinematic-hero"
  | "bottom-left-copy-over-photo"
  | "editorial-story-menu-flow"
  | "product-hero-with-packshot"
  | "benefit-led-commerce-layout"
  | "trust-led-service-grid"
  | "bottom-left-copy-over-project-shot"
  | "disciplined-bento-layout";

export type DesignReference =
  | "fintech-neon"
  | "signal-orchestration"
  | "cinematic-resort"
  | "luxury-editorial"
  | "product-commerce"
  | "restaurant-editorial"
  | "barber-premium"
  | "clean-automotive"
  | "service-trades"
  | "clean-business";

export type Blueprint = {
  industry: IndustryKind;
  themePreset: ThemePreset;
  designReference: DesignReference;
  defaultLayoutSeed: LayoutSeed;
  allowedLayoutSeeds: LayoutSeed[];
  promptHints: string[];
  afterGeneratePrompts: string[];
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function deterministicPick<T>(input: string, items: T[]): T {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return items[hash % items.length];
}

export function inferIndustryKind(prompt: string): IndustryKind {
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
    text.includes("realit") ||
    text.includes("nemovit") ||
    text.includes("makler") ||
    text.includes("developer") ||
    text.includes("rezidence") ||
    text.includes("property")
  ) {
    return "real-estate";
  }

  if (
    text.includes("klinika") ||
    text.includes("medical") ||
    text.includes("doctor") ||
    text.includes("ordinace")
  ) {
    return "healthcare";
  }

  if (
    text.includes("hotel") ||
    text.includes("resort") ||
    text.includes("wellness")
  ) {
    return "resort";
  }

  if (
    text.includes("restaurant") ||
    text.includes("restaurace") ||
    text.includes("bistro") ||
    text.includes("kavarna")
  ) {
    return "restaurant";
  }

  if (text.includes("catering")) return "catering";
  if (text.includes("barber") || text.includes("barbershop")) return "barber";

  if (
    text.includes("kadernictvi") ||
    text.includes("kadernice") ||
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
    text.includes("beauty") ||
    text.includes("kosmet") ||
    text.includes("esthetic")
  ) {
    return "beauty";
  }

  if (
    text.includes("advokat") ||
    text.includes("pravnik") ||
    text.includes("notar")
  ) {
    return "legal";
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

  return "generic-business";
}

const BLUEPRINTS: Record<IndustryKind, Blueprint> = {
  fintech: {
    industry: "fintech",
    themePreset: "saas-dark",
    designReference: "fintech-neon",
    defaultLayoutSeed: "floating-control-room-hero",
    allowedLayoutSeeds: [
      "hero-center-dashboard-below",
      "offset-bottom-left-copy",
      "framed-hero-with-floating-ui",
      "stacked-analytics-panels",
      "floating-control-room-hero",
    ],
    promptHints: [
      "dark premium product feeling",
      "luminous accents but disciplined spacing",
      "do not overuse ultra-bold headings",
      "product mockups may sit below hero instead of always on the right",
    ],
    afterGeneratePrompts: [
      "Chcete silnější wow hero, nebo čistší enterprise verzi?",
      "Má být pricing výraznější?",
      "Chcete přidat důvěru, integrace, nebo case studies?",
    ],
  },
  saas: {
    industry: "saas",
    themePreset: "saas-dark",
    designReference: "signal-orchestration",
    defaultLayoutSeed: "hero-center-dashboard-below",
    allowedLayoutSeeds: [
      "hero-center-dashboard-below",
      "offset-bottom-left-copy",
      "framed-hero-with-floating-ui",
      "stacked-analytics-panels",
      "floating-control-room-hero",
    ],
    promptHints: [
      "interface-led but premium",
      "do not default to left-text/right-image",
      "cards must feel like one system family",
    ],
    afterGeneratePrompts: [
      "Chcete více startup wow, nebo více enterprise důvěru?",
      "Má být hero odvážnější?",
      "Chcete výraznější pricing, integrace, nebo demo CTA?",
    ],
  },
  "real-estate": {
    industry: "real-estate",
    themePreset: "real-estate-editorial",
    designReference: "luxury-editorial",
    defaultLayoutSeed: "full-bleed-editorial-property-cover",
    allowedLayoutSeeds: [
      "full-bleed-editorial-property-cover",
      "centered-crest-navigation-with-cover-image",
      "bottom-left-copy-over-architecture-shot",
      "oversized-serif-copy-on-airy-canvas",
      "gallery-led-development-microsite",
    ],
    promptHints: [
      "luxury editorial real-estate direction",
      "huge elegant serif headlines are welcome",
      "airy white sections after hero are welcome",
      "thin dividers and restrained palette are welcome",
      "navigation may be centered or symmetrically composed around branding",
    ],
    afterGeneratePrompts: [
      "Chcete to víc jako developerský projekt, nebo osobní značku makléře?",
      "Má být hero ještě víc luxusní a vzdušný?",
      "Chcete přidat galerii, lokaci, nebo poptávku pro prohlídku?",
    ],
  },
  resort: {
    industry: "resort",
    themePreset: "luxury-dark",
    designReference: "cinematic-resort",
    defaultLayoutSeed: "immersive-cinematic-hero",
    allowedLayoutSeeds: [
      "immersive-cinematic-hero",
      "bottom-left-copy-over-photo",
      "oversized-serif-copy-on-airy-canvas",
    ],
    promptHints: [
      "cinematic atmosphere first",
      "copy may sit bottom-left over photography inside safe padded wrapper",
    ],
    afterGeneratePrompts: [
      "Chcete větší důraz na atmosféru, nebo na rezervace?",
      "Má být web světlejší, nebo temnější?",
      "Chcete přidat wellness, pokoje, nebo galerii?",
    ],
  },
  "luxury-service": {
    industry: "luxury-service",
    themePreset: "luxury-dark",
    designReference: "luxury-editorial",
    defaultLayoutSeed: "oversized-serif-copy-on-airy-canvas",
    allowedLayoutSeeds: [
      "oversized-serif-copy-on-airy-canvas",
      "bottom-left-copy-over-photo",
      "disciplined-bento-layout",
    ],
    promptHints: [
      "refined serif direction",
      "restrained premium instead of noisy luxury",
    ],
    afterGeneratePrompts: [
      "Chcete víc editorial, nebo víc prodejní styl?",
      "Má být více whitespace?",
      "Chcete silnější CTA nebo jemnější luxury mood?",
    ],
  },
  "food-product": {
    industry: "food-product",
    themePreset: "neutral-premium",
    designReference: "product-commerce",
    defaultLayoutSeed: "product-hero-with-packshot",
    allowedLayoutSeeds: [
      "product-hero-with-packshot",
      "benefit-led-commerce-layout",
    ],
    promptHints: [
      "product photography is mandatory",
      "clear benefits and packaging hierarchy",
    ],
    afterGeneratePrompts: [
      "Chcete větší důraz na produkt, nebo na benefity?",
      "Má být web více premium, nebo více fresh commerce?",
    ],
  },
  "ecommerce-product": {
    industry: "ecommerce-product",
    themePreset: "neutral-premium",
    designReference: "product-commerce",
    defaultLayoutSeed: "benefit-led-commerce-layout",
    allowedLayoutSeeds: [
      "product-hero-with-packshot",
      "benefit-led-commerce-layout",
    ],
    promptHints: [
      "commerce-first conversion structure",
      "visual trust and product clarity",
    ],
    afterGeneratePrompts: [
      "Chcete více produktových bloků?",
      "Má být CTA agresivnější?",
    ],
  },
  healthcare: {
    industry: "healthcare",
    themePreset: "clinic-light",
    designReference: "clean-business",
    defaultLayoutSeed: "calm-trust-split",
    allowedLayoutSeeds: [
      "calm-trust-split",
      "editorial-clinic-intro",
      "oversized-serif-copy-on-airy-canvas",
    ],
    promptHints: [
      "calm, trustworthy, clean medical feeling",
      "avoid heavy glow or noisy premium gimmicks",
      "prioritize clarity, trust, appointments and doctor credibility",
    ],
    afterGeneratePrompts: [
      "Chcete web více důvěryhodný, nebo více prémiový?",
      "Má být důraz na objednání, služby, nebo tým?",
      "Chcete přidat reference, certifikace, nebo FAQ?",
    ],
  },
  legal: {
    industry: "legal",
    themePreset: "neutral-premium",
    designReference: "clean-business",
    defaultLayoutSeed: "disciplined-bento-layout",
    allowedLayoutSeeds: [
      "disciplined-bento-layout",
      "oversized-serif-copy-on-airy-canvas",
    ],
    promptHints: [
      "trust-first professional tone",
      "structured and calm, not flashy",
    ],
    afterGeneratePrompts: [
      "Chcete víc autority, nebo víc lidskosti?",
      "Má být silnější důraz na kontakt?",
    ],
  },
  beauty: {
    industry: "beauty",
    themePreset: "luxury-dark",
    designReference: "luxury-editorial",
    defaultLayoutSeed: "bottom-left-copy-over-photo",
    allowedLayoutSeeds: [
      "bottom-left-copy-over-photo",
      "oversized-serif-copy-on-airy-canvas",
    ],
    promptHints: [
      "luxury editorial beauty feel",
      "soft premium, not aggressive e-commerce",
    ],
    afterGeneratePrompts: [
      "Chcete víc beauty luxury, nebo víc clean clinic styl?",
      "Má být silnější galerie a proměny?",
    ],
  },
  restaurant: {
    industry: "restaurant",
    themePreset: "luxury-dark",
    designReference: "restaurant-editorial",
    defaultLayoutSeed: "editorial-story-menu-flow",
    allowedLayoutSeeds: [
      "bottom-left-copy-over-photo",
      "editorial-story-menu-flow",
    ],
    promptHints: [
      "food photography is central",
      "reservation CTA should be clear",
    ],
    afterGeneratePrompts: [
      "Chcete více atmosféry, nebo více rezervací?",
      "Má být hero tmavší, nebo světlejší?",
    ],
  },
  catering: {
    industry: "catering",
    themePreset: "neutral-premium",
    designReference: "restaurant-editorial",
    defaultLayoutSeed: "bottom-left-copy-over-photo",
    allowedLayoutSeeds: [
      "bottom-left-copy-over-photo",
      "disciplined-bento-layout",
    ],
    promptHints: [
      "food and event imagery",
      "clear demand generation",
    ],
    afterGeneratePrompts: [
      "Chcete větší důraz na firemní akce, nebo svatby?",
    ],
  },
  barber: {
    industry: "barber",
    themePreset: "luxury-dark",
    designReference: "barber-premium",
    defaultLayoutSeed: "bottom-left-copy-over-photo",
    allowedLayoutSeeds: [
      "bottom-left-copy-over-photo",
      "disciplined-bento-layout",
    ],
    promptHints: [
      "craft and portrait driven",
      "bold but not cluttered",
    ],
    afterGeneratePrompts: [
      "Chcete víc premium barbershop mood, nebo víc clean booking styl?",
    ],
  },
  "hair-salon": {
    industry: "hair-salon",
    themePreset: "neutral-premium",
    designReference: "luxury-editorial",
    defaultLayoutSeed: "bottom-left-copy-over-photo",
    allowedLayoutSeeds: [
      "bottom-left-copy-over-photo",
      "oversized-serif-copy-on-airy-canvas",
    ],
    promptHints: [
      "soft premium salon direction",
      "service, gallery, reservation",
    ],
    afterGeneratePrompts: [
      "Chcete více beauty feeling, nebo více practical booking style?",
    ],
  },
  autoservis: {
    industry: "autoservis",
    themePreset: "neutral-premium",
    designReference: "clean-automotive",
    defaultLayoutSeed: "trust-led-service-grid",
    allowedLayoutSeeds: [
      "trust-led-service-grid",
      "bottom-left-copy-over-project-shot",
    ],
    promptHints: [
      "trustworthy and clean",
      "avoid futuristic saas look",
    ],
    afterGeneratePrompts: [
      "Chcete silnější důvěru, nebo agresivnější prodejní styl?",
    ],
  },
  "car-dealer": {
    industry: "car-dealer",
    themePreset: "neutral-premium",
    designReference: "clean-automotive",
    defaultLayoutSeed: "bottom-left-copy-over-project-shot",
    allowedLayoutSeeds: [
      "bottom-left-copy-over-project-shot",
      "trust-led-service-grid",
    ],
    promptHints: [
      "vehicle imagery matters",
      "clean sales structure",
    ],
    afterGeneratePrompts: [
      "Chcete větší důraz na vozidla, nebo na financování?",
    ],
  },
  zednik: {
    industry: "zednik",
    themePreset: "neutral-premium",
    designReference: "service-trades",
    defaultLayoutSeed: "trust-led-service-grid",
    allowedLayoutSeeds: [
      "trust-led-service-grid",
      "bottom-left-copy-over-project-shot",
    ],
    promptHints: [
      "practical trust-first structure",
      "clear services, realizace and contact",
    ],
    afterGeneratePrompts: [
      "Chcete více realizací, nebo více důrazu na rychlou poptávku?",
    ],
  },
  "generic-business": {
    industry: "generic-business",
    themePreset: "neutral-premium",
    designReference: "clean-business",
    defaultLayoutSeed: "disciplined-bento-layout",
    allowedLayoutSeeds: [
      "disciplined-bento-layout",
      "offset-bottom-left-copy",
      "oversized-serif-copy-on-airy-canvas",
    ],
    promptHints: [
      "balanced premium commercial site",
      "avoid generic template rhythm",
    ],
    afterGeneratePrompts: [
      "Chcete více premium, více clean, nebo více odvážný styl?",
    ],
  },
};

export function getBlueprint(prompt: string): Blueprint {
  const industry = inferIndustryKind(prompt);
  return BLUEPRINTS[industry];
}

export function getLayoutSeed(prompt: string): LayoutSeed {
  const blueprint = getBlueprint(prompt);
  return deterministicPick(prompt, blueprint.allowedLayoutSeeds);
}

export function buildBlueprintPromptFragment(prompt: string) {
  const blueprint = getBlueprint(prompt);
  const layoutSeed = getLayoutSeed(prompt);

  return {
    blueprint,
    layoutSeed,
    promptFragment: `
THEME PRESET:
- ${blueprint.themePreset}

DESIGN REFERENCE:
- ${blueprint.designReference}

LAYOUT SEED:
- ${layoutSeed}

INDUSTRY-SPECIFIC PREMIUM HINTS:
${blueprint.promptHints.map((item) => `- ${item}`).join("\n")}
`.trim(),
  };
}