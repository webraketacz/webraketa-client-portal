import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 300;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 0,
  timeout: 200000,
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
  sourcePrompt?: string;
};

type SectionBundle = {
  sectionHtml: string;
  sectionCss: string;
  sectionJs: string;
  assetPlan: AssetPlanItem[];
};

type WebsiteBundle = {
  html: string;
  css: string;
  js: string;
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
      scope: "api-improve",
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

function sanitizeAttachments(value: unknown): AttachmentInput[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 12)
    .filter((item): item is AttachmentInput => item && typeof item === "object")
    .map((item) => ({
      id: typeof item.id === "string" ? item.id.slice(0, 120) : undefined,
      name: typeof item.name === "string" ? item.name.slice(0, 200) : undefined,
      kind:
        item.kind === "screenshot" || item.kind === "file"
          ? item.kind
          : undefined,
    }));
}

function resolveInputMode(value: unknown): InputMode {
  return value === "url" ||
    value === "screenshot" ||
    value === "html" ||
    value === "prompt"
    ? value
    : "prompt";
}

function summarizeAttachments(items: AttachmentInput[]) {
  if (!items.length) return "Žádné přílohy.";

  return items
    .map((item, index) => `${index + 1}. ${item.kind || "file"} — ${item.name || "bez názvu"}`)
    .join("\n");
}

function inferIndustryKind(prompt: string) {
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

  if (
    text.includes("luxury") ||
    text.includes("premium") ||
    text.includes("boutique")
  ) {
    return "luxury-service";
  }

  return "generic-business";
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

const sectionBundleSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    sectionHtml: { type: "string" },
    sectionCss: { type: "string" },
    sectionJs: { type: "string" },
    assetPlan: {
      type: "array",
      maxItems: 2,
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
  required: ["sectionHtml", "sectionCss", "sectionJs", "assetPlan"],
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
    .slice(0, 2)
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

function sanitizeBundle(bundle: WebsiteBundle): WebsiteBundle {
  const html = cleanCodeBlock(bundle.html || "");
  const css = cleanCodeBlock(bundle.css || "");
  const js = cleanCodeBlock(bundle.js || "");

  if (!html || !css) {
    throw new Error("Výstup neobsahuje kompletní HTML/CSS.");
  }

  return { html, css, js };
}

function sanitizeSectionBundle(bundle: SectionBundle): SectionBundle {
  const sectionHtml = cleanCodeBlock(bundle.sectionHtml || "");
  const sectionCss = cleanCodeBlock(bundle.sectionCss || "");
  const sectionJs = cleanCodeBlock(bundle.sectionJs || "");

  if (!sectionHtml) {
    throw new Error("Výstup neobsahuje sectionHtml.");
  }

  return {
    sectionHtml,
    sectionCss,
    sectionJs,
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractSectionById(html: string, sectionId: string) {
  const escapedId = escapeRegExp(sectionId);
  const sectionRegex = new RegExp(
    `<section\\b[^>]*data-section-id=(["'])${escapedId}\\1[^>]*>[\\s\\S]*?<\\/section>`,
    "i"
  );

  const match = html.match(sectionRegex);
  return match?.[0] || null;
}

function extractSectionIds(html: string) {
  const matches = [...html.matchAll(/data-section-id=(["'])(.*?)\1/g)].map(
    (match) => match[2]
  );

  return Array.from(new Set(matches)).slice(0, 24);
}

function replaceSectionById(params: {
  html: string;
  sectionId: string;
  nextSectionHtml: string;
}) {
  const escapedId = escapeRegExp(params.sectionId);
  const sectionRegex = new RegExp(
    `<section\\b[^>]*data-section-id=(["'])${escapedId}\\1[^>]*>[\\s\\S]*?<\\/section>`,
    "i"
  );

  if (!sectionRegex.test(params.html)) {
    throw new Error(`Sekce "${params.sectionId}" nebyla v HTML nalezena.`);
  }

  return params.html.replace(sectionRegex, params.nextSectionHtml.trim());
}

function ensureSectionScope(sectionHtml: string, selectedSectionId: string) {
  const normalized = sectionHtml.trim();

  if (!normalized.startsWith("<section")) {
    throw new Error("sectionHtml musí začínat tagem <section ...>.");
  }

  const requiredAttr = `data-section-id="${selectedSectionId}"`;
  const requiredAttrAlt = `data-section-id='${selectedSectionId}'`;

  if (
    !normalized.includes(requiredAttr) &&
    !normalized.includes(requiredAttrAlt)
  ) {
    throw new Error(
      `sectionHtml musí obsahovat data-section-id="${selectedSectionId}".`
    );
  }

  const allIds = [...normalized.matchAll(/data-section-id=(["'])(.*?)\1/g)].map(
    (match) => match[2]
  );

  const uniqueIds = Array.from(new Set(allIds));

  if (uniqueIds.length > 1) {
    throw new Error(
      "AI vrátila více sekcí najednou. Povolená je pouze jedna vybraná sekce."
    );
  }

  if (uniqueIds.length === 1 && uniqueIds[0] !== selectedSectionId) {
    throw new Error(
      `AI vrátila jinou sekci (${uniqueIds[0]}) místo ${selectedSectionId}.`
    );
  }
}

function stripManagedBlock(
  content: string,
  type: "css" | "js",
  sectionId: string
) {
  const label = type === "css" ? "AI_SECTION_CSS" : "AI_SECTION_JS";
  const escapedId = escapeRegExp(sectionId);
  const blockRegex = new RegExp(
    `\\n?/\\* ${label}:${escapedId}:start \\*/[\\s\\S]*?/\\* ${label}:${escapedId}:end \\*/\\n?`,
    "g"
  );

  return content.replace(blockRegex, "\n").trim();
}

function upsertManagedBlock(params: {
  content: string;
  type: "css" | "js";
  sectionId: string;
  patch: string;
}) {
  const label = params.type === "css" ? "AI_SECTION_CSS" : "AI_SECTION_JS";
  const cleanedBase = stripManagedBlock(
    params.content || "",
    params.type,
    params.sectionId
  ).trim();

  const cleanedPatch = cleanCodeBlock(params.patch || "").trim();

  if (!cleanedPatch) {
    return cleanedBase;
  }

  const wrappedBlock = [
    `/* ${label}:${params.sectionId}:start */`,
    cleanedPatch,
    `/* ${label}:${params.sectionId}:end */`,
  ].join("\n");

  return [cleanedBase, wrappedBlock].filter(Boolean).join("\n\n").trim();
}

function improveRenderPrompt(params: {
  prompt: string;
  instruction: string;
  selectedSectionId: string;
  selectedSectionHtml: string;
  sectionIds: string[];
  chatHistory?: ChatHistoryItem[];
  generationPreferences?: GenerationPreferences;
  brandLogo?: BrandLogoAsset | null;
  inputMode: InputMode;
  referenceUrl?: string;
  referenceHtml?: string;
  attachments?: AttachmentInput[];
}) {
  const industry = inferIndustryKind(params.prompt);

  return `
You are a world-class commercial web designer, art director and senior frontend engineer.

Return ONLY a structured JSON object matching the schema.

YOU ARE EDITING ONLY ONE SECTION OF AN EXISTING WEBSITE.

CRITICAL RULES:
- return ONLY sectionHtml, sectionCss, sectionJs and assetPlan
- do NOT rewrite the whole page
- do NOT output other sections
- sectionHtml must contain exactly one root <section>
- sectionHtml must keep data-section-id="${params.selectedSectionId}"
- all changes must be limited to the selected section
- everything outside the selected section will stay untouched
- if you add CSS, scope it to [data-section-id="${params.selectedSectionId}"]
- if you add JS, scope it to the selected section only
- sectionCss and sectionJs may be empty strings if not needed
- use Czech copy
- preserve semantic structure
- keep result lightweight and production-safe

EDITING CONTEXT:
- detected industry: ${industry}
- input mode: ${params.inputMode}
- reference URL: ${params.referenceUrl || "none"}
- reference HTML supplied: ${params.referenceHtml?.trim() ? "yes" : "no"}
- attachments summary:
${summarizeAttachments(params.attachments || [])}

GENERATION PREFERENCES:
- speed mode: ${params.generationPreferences?.speedMode || "premium"}
- layout preference: ${params.generationPreferences?.layoutPreference || "auto"}
- visual style: ${params.generationPreferences?.visualStyle || "auto"}
- animation level: ${params.generationPreferences?.animationLevel || "subtle"}
- font mood: ${params.generationPreferences?.fontMood || "auto"}
- icon style: ${params.generationPreferences?.iconStyle || "auto"}
- design reference: ${params.generationPreferences?.designReference || "auto"}
- button style: ${params.generationPreferences?.buttonStyle || "auto"}
- prompt enhancer mode: ${params.generationPreferences?.promptEnhancerMode || "premium-brand"}
- preferred primary color: ${params.generationPreferences?.preferredPrimaryColor || "none"}
- preferred background color: ${params.generationPreferences?.preferredBackgroundColor || "none"}
- contact items: ${(params.generationPreferences?.contactItems || []).join(", ") || "none"}
- client answers contact details: ${params.generationPreferences?.clientAnswers?.contactDetails || "none"}
- client answers style notes: ${params.generationPreferences?.clientAnswers?.styleNotes || "none"}
- client answers offer notes: ${params.generationPreferences?.clientAnswers?.offerNotes || "none"}
- client answers extras: ${params.generationPreferences?.clientAnswers?.extras || "none"}

BRAND LOGO CONTEXT:
${
  params.brandLogo
    ? `- a real uploaded logo exists
- if the selected section contains brand or footer identity, preserve room for the uploaded logo
- do not create a generic oversized text logo in sections where a real brand area makes more sense`
    : `- no uploaded logo exists`
}

DESIGN QUALITY RULES:
- improve this section so it feels designed by a strong human designer
- avoid generic template look
- use stronger hierarchy, spacing, alignment and composition
- keep the section consistent with the industry, prompt and preferred visual tone
- do not overcomplicate markup
- if the instruction is mainly text-related, change mostly the copy
- if the instruction is mainly visual, improve composition without breaking structure
- do NOT silently convert unusual hero direction into a generic left-text/right-image split
- if the user asks for text bottom-left, bottom-center, overlay, framed copy or layered composition, follow that request directly
- if the user wants stronger premium details, add tasteful gradients, motion, border accents or glass treatment only where appropriate
- if the user wants calmer luxury or editorial styling, keep motion and effects subtle

HARD TECHNICAL LAYOUT CONSTRAINTS:
- the selected section must use stable wrappers and predictable layout primitives
- use disciplined flexbox or disciplined CSS grid
- avoid fragile layouts dependent on random absolute pixel offsets
- primary readable copy must not rely on uncontrolled absolute positioning
- if absolute positioning is used for copy, it must sit inside a bounded safe wrapper
- the section must remain visually stable on desktop, tablet and mobile
- prevent accidental horizontal overflow
- the section must still look resolved if copy length changes moderately

SPACING RULES:
- always add safe baseline inner padding to content wrappers, overlays, cards and text containers
- never leave text visually glued to image edges or viewport edges
- use at minimum:
  - desktop horizontal inner padding: clamp(24px, 4vw, 56px)
  - tablet horizontal inner padding: clamp(20px, 5vw, 40px)
  - mobile horizontal inner padding: clamp(16px, 5vw, 24px)
- if copy is positioned low in the section, ensure protected bottom padding too
- spacing must feel premium and intentional, never cramped
- icons, chips, badges and small UI controls must always have breathing room around them
- cards must never feel text-cramped or icon-cramped
- use a visible spacing rhythm and keep it coherent inside the section
- similar cards inside the same section must use similar internal padding logic

OPTICAL ALIGNMENT RULES:
- text may not be only mathematically centered; it must also feel optically centered
- if a centered composition is used, the text block itself must have bounded max-width and margin-inline:auto
- avoid centered sections where text looks visually pushed left because the wrapper is too wide or unbalanced
- if a left-aligned composition is used, use a clear readable text column
- headings, paragraphs and CTA rows must align as one deliberate unit
- never let centered CTA rows feel offset from centered headlines
- never let section copy feel like it is floating in undefined space

TYPOGRAPHY RULES:
- strengthen hierarchy between heading, body, label and CTA
- do not default to extremely bold headings
- avoid overusing 800 or 900
- vary font weight more elegantly, usually body 400-500 and headings 500-700 unless a display moment truly needs more
- if the section already uses a certain mood, refine it instead of flattening it
- keep heading scale proportional to section importance
- do not let secondary headings overpower the section

NAV HEIGHT RULES:
- if the selected section is navigation or contains navigation, keep the header shell height controlled
- navigation should usually stay within min-height: 72px to max-height: 112px on desktop
- absolute hard limit for premium nav shell height is 124px
- never let extra brand text or oversized logo increase nav height uncontrollably
- nav content must fit inside the shell without overflow
- menu links, logo and CTA must align visually to center
- keep nav inner padding controlled and not bloated

LOGO FIT RULES:
- if the selected section contains the uploaded logo or a brand logo area, the logo must always sit inside a dedicated logo shell
- the actual img must never render at uncontrolled natural size
- use a wrapper such as .brand-logo-shell with explicit sizing constraints
- preferred constraints:
  - desktop max-width: 180px to 240px
  - desktop height: 40px to 64px
  - tablet max-width: 150px to 200px
  - tablet height: 36px to 56px
  - mobile max-width: 120px to 170px
  - mobile height: 34px to 52px
- the img itself should use:
  - display:block
  - max-width:100%
  - max-height:100%
  - width:auto
  - height:auto
  - object-fit:contain
  - object-position:left center
- never let the logo stretch the nav height
- never let the logo overflow out of its shell
- unusually wide or tall logos must shrink inside the shell, not force layout growth

HERO STABILITY RULES:
- if the selected section is a hero, it must feel structurally stable
- hero content must never collide with navigation or top edge
- hero must always have a predictable content wrapper
- do not create a hero where text floats in empty space without a reason
- hero text block must have a maximum readable width
- if the hero is centered, center the whole content stack including CTA row
- if the hero is split, preserve clear and balanced left/right or top/bottom regions
- if the hero uses photo or overlay composition, copy must live in a safe padded container with strong contrast
- if hero uses floating cards or KPIs, they must support the layout, not break it

BENTO / CARD SYSTEM RULES:
- if the selected section uses a bento or card grid, it must look like one coherent family
- match border treatment, padding logic, icon size, heading scale and internal spacing across sibling cards
- avoid one visually weak card next to one dense card unless clearly intentional
- card heights should feel stable and deliberate

BENTO COMPLETENESS RULES:
- if a bento grid is used, it must feel complete and balanced
- never leave the impression that one expected card is missing
- do not create accidental empty holes
- if the layout suggests 4 cards, provide 4 cards
- if the layout suggests 3 cards, balance them intentionally
- avoid ragged unfinished-looking compositions
- cards should align within a clear grid or area system

CARD CONTENT RULES:
- no card may feel unfinished
- every feature / benefit / stat card needs:
  - visible internal padding
  - clear heading
  - readable body copy
  - stable alignment
- if icons are used, place them inside a bounded icon holder
- card content must not stick to top-left corners without breathing room

MOBILE NAV RULES:
- if this section contains navigation or a mobile menu, keep the logo block on the left and the menu toggle fully on the far right
- the mobile nav row must use a full-width wrapper with display:flex, align-items:center, justify-content:space-between and a clear gap
- the toggle must never drift toward the logo or sit awkwardly near the center
- the toggle should usually use margin-left:auto and flex:0 0 auto
- minimum mobile target size for the toggle is 44px by 44px
- the hamburger must animate into an X state when opened and animate back when closed
- use three lines or an equivalent premium toggle construction with transform/opacity animation
- keep the toggle aligned with the navigation style of the site
- when open, the mobile menu panel should appear with a refined fade, slide or scale transition
- if the current section is not navigation, do not add random nav code

IMAGE RULES:
- if you use a new image in this section, add data-image-slot="<slot>" to the image element
- assetPlan may contain up to 2 items
- assetPlan.slot values must match the slot values used in sectionHtml
- use concrete English queries
- if no new image is needed, return an empty assetPlan array
- keep image placement editable-friendly and visually meaningful

MANDATORY CSS IMPLEMENTATION DETAILS:
- if this section has its own container, give it clear max-width logic and margin-inline:auto
- if this section contains brand/logo area, define a constrained logo shell
- if this section contains nav, use flex alignment and controlled height
- if this section contains hero copy, define a stable inner wrapper with explicit max-width
- if this section contains cards, define repeatable padding, radius and border logic
- prevent horizontal overflow in this section
- use box-sizing:border-box assumptions consistently

ORIGINAL PROJECT PROMPT:
${params.prompt}

CURRENT USER INSTRUCTION:
${params.instruction}

SELECTED SECTION ID:
${params.selectedSectionId}

AVAILABLE SECTION IDS ON PAGE:
${params.sectionIds.join(", ") || "unknown"}

SELECTED SECTION HTML:
${params.selectedSectionHtml}

CHAT HISTORY:
${formatChatHistory(params.chatHistory || [])}
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
    const instruction =
      typeof body?.instruction === "string" ? body.instruction : "";
    const html = typeof body?.html === "string" ? body.html : "";
    const css = typeof body?.css === "string" ? body.css : "";
    const js = typeof body?.js === "string" ? body.js : "";
    const selectedSectionId =
      typeof body?.selectedSectionId === "string" ? body.selectedSectionId : "";
    const chatHistory = Array.isArray(body?.chatHistory)
      ? (body.chatHistory as ChatHistoryItem[])
      : [];
    const generationPreferences =
      body?.generationPreferences &&
      typeof body.generationPreferences === "object"
        ? (body.generationPreferences as GenerationPreferences)
        : {};
    const brandLogo = sanitizeBrandLogoAsset(body?.brandLogo);
    const inputMode = resolveInputMode(body?.inputMode);
    const referenceUrl =
      typeof body?.referenceUrl === "string" ? body.referenceUrl.trim() : "";
    const referenceHtml =
      typeof body?.referenceHtml === "string" ? body.referenceHtml : "";
    const attachments = sanitizeAttachments(body?.attachments);

    console.log(
      JSON.stringify({
        scope: "api-improve",
        requestId,
        step: "start",
        model: WEB_MODEL,
        promptLength: prompt.length,
        instructionLength: instruction.length,
        htmlLength: html.length,
        cssLength: css.length,
        jsLength: js.length,
        selectedSectionId,
        inputMode,
        referenceUrlLength: referenceUrl.length,
        referenceHtmlLength: referenceHtml.length,
        attachmentsCount: attachments.length,
        hasBrandLogo: Boolean(brandLogo),
      })
    );

    if (!prompt.trim()) {
      return Response.json({ error: "Chybí původní prompt." }, { status: 400 });
    }

    if (instruction.trim().length < 3) {
      return Response.json(
        { error: "Instrukce pro úpravu je příliš krátká." },
        { status: 400 }
      );
    }

    if (!html.trim() || !css.trim()) {
      return Response.json({ error: "Není co upravovat." }, { status: 400 });
    }

    if (!selectedSectionId.trim()) {
      return Response.json(
        {
          error:
            "Chybí selectedSectionId. AI musí upravovat jen vybranou sekci.",
        },
        { status: 400 }
      );
    }

    const sectionExtractionStartedAt = nowMs();
    const selectedSectionHtml = extractSectionById(html, selectedSectionId);
    const sectionIds = extractSectionIds(html);
    logStep(requestId, "extract-section", sectionExtractionStartedAt, {
      selectedSectionId,
      sectionIdsCount: sectionIds.length,
      selectedSectionLength: selectedSectionHtml?.length || 0,
    });

    if (!selectedSectionHtml) {
      return Response.json(
        {
          error: `Vybraná sekce "${selectedSectionId}" nebyla v HTML nalezena.`,
        },
        { status: 400 }
      );
    }

    const improveStartedAt = nowMs();

    const improvedSection = await createStructuredObject<SectionBundle>({
      model: WEB_MODEL,
      system:
        "You are an elite web designer, art director and frontend engineer. Return only valid JSON.",
      user: improveRenderPrompt({
        prompt,
        instruction,
        selectedSectionId,
        selectedSectionHtml,
        sectionIds,
        chatHistory,
        generationPreferences,
        brandLogo,
        inputMode,
        referenceUrl,
        referenceHtml,
        attachments,
      }),
      schemaName: "improve_section_bundle_layout_guardrails_v6",
      schema: sectionBundleSchema,
      requestId,
    });

    logStep(requestId, "improve-finished", improveStartedAt, {
      sectionHtmlLength: improvedSection?.sectionHtml?.length || 0,
      sectionCssLength: improvedSection?.sectionCss?.length || 0,
      sectionJsLength: improvedSection?.sectionJs?.length || 0,
      assetPlanCount: improvedSection?.assetPlan?.length || 0,
    });

    const sanitizeStartedAt = nowMs();
    const safeImprovedSection = sanitizeSectionBundle(improvedSection);
    ensureSectionScope(safeImprovedSection.sectionHtml, selectedSectionId);
    logStep(requestId, "sanitize-section", sanitizeStartedAt, {
      assetPlanCount: safeImprovedSection.assetPlan.length,
    });

    const mergeStartedAt = nowMs();
    const mergedHtml = replaceSectionById({
      html,
      sectionId: selectedSectionId,
      nextSectionHtml: safeImprovedSection.sectionHtml,
    });

    const mergedCss = upsertManagedBlock({
      content: css,
      type: "css",
      sectionId: selectedSectionId,
      patch: safeImprovedSection.sectionCss,
    });

    const mergedJs = upsertManagedBlock({
      content: js,
      type: "js",
      sectionId: selectedSectionId,
      patch: safeImprovedSection.sectionJs,
    });

    const safeFinalBundle = sanitizeBundle({
      html: mergedHtml,
      css: mergedCss || css,
      js: mergedJs,
    });

    logStep(requestId, "merge-bundle", mergeStartedAt, {
      mergedHtmlLength: safeFinalBundle.html.length,
      mergedCssLength: safeFinalBundle.css.length,
      mergedJsLength: safeFinalBundle.js.length,
    });

    logStep(requestId, "done", routeStartedAt, {
      totalMs: Date.now() - routeStartedAt,
      model: WEB_MODEL,
      selectedSectionId,
      inputMode,
    });

    return Response.json({
      html: safeFinalBundle.html,
      css: safeFinalBundle.css,
      js: safeFinalBundle.js,
      assetPlan: safeImprovedSection.assetPlan,
      assets: [],
      selectedSectionId,
      changedOnlySelectedSection: true,
      twoStepMode: true,
      modelUsed: WEB_MODEL,
      requestId,
    });
  } catch (e: any) {
    console.error(
      JSON.stringify({
        scope: "api-improve",
        requestId,
        step: "fatal-error",
        totalMs: Date.now() - routeStartedAt,
        error: e?.message ?? "Unknown error",
        stack: e?.stack || null,
      })
    );

    return Response.json(
      {
        error: e?.message ?? "Improve route failed",
        requestId,
      },
      { status: 500 }
    );
  }
}
