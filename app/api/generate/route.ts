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

type GenerationPreferences = {
  speedMode?: SpeedMode;
  layoutPreference?: LayoutPreference;
  visualStyle?: VisualStyle;
  animationLevel?: AnimationLevel;
  fontMood?: FontMood;
  iconStyle?: IconStyle;
  contactItems?: string[];
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

function makeDeterministicChoice<T>(input: string, items: T[]): T {
  const safeItems = items.length ? items : ["" as T];
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }

  return safeItems[hash % safeItems.length];
}

function resolveCreativeDirection(
  prompt: string,
  prefs: GenerationPreferences
) {
  const layoutPool: LayoutPreference[] = [
    "editorial",
    "split",
    "asymmetrical",
    "story",
    "grid",
    "luxury",
  ];

  const visualPool: VisualStyle[] = [
    "clean",
    "premium",
    "bold",
    "editorial",
    "luxury",
    "playful",
  ];

  const fontPool: FontMood[] = [
    "geometric",
    "editorial",
    "luxury",
    "trustworthy",
    "tech",
    "friendly",
  ];

  const iconPool: IconStyle[] = ["minimal", "outlined", "solid", "custom"];

  const fallbackLayout = makeDeterministicChoice(`${prompt}-layout`, layoutPool);
  const fallbackVisual = makeDeterministicChoice(`${prompt}-visual`, visualPool);
  const fallbackFont = makeDeterministicChoice(`${prompt}-font`, fontPool);
  const fallbackIcon = makeDeterministicChoice(`${prompt}-icon`, iconPool);

  return {
    speedMode: prefs.speedMode || "balanced",
    layoutPreference:
      prefs.layoutPreference && prefs.layoutPreference !== "auto"
        ? prefs.layoutPreference
        : fallbackLayout,
    visualStyle:
      prefs.visualStyle && prefs.visualStyle !== "auto"
        ? prefs.visualStyle
        : fallbackVisual,
    animationLevel: prefs.animationLevel || "subtle",
    fontMood:
      prefs.fontMood && prefs.fontMood !== "auto"
        ? prefs.fontMood
        : fallbackFont,
    iconStyle:
      prefs.iconStyle && prefs.iconStyle !== "auto"
        ? prefs.iconStyle
        : fallbackIcon,
    contactItems: Array.isArray(prefs.contactItems) ? prefs.contactItems : [],
  };
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
}) {
  return `
You are a world-class commercial web designer, art director and senior frontend developer.

Return ONLY a structured JSON object matching the schema.

PRIMARY GOAL:
Create a premium commercial website that feels custom-designed for this exact business.
It must not feel like a recycled template.

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

LAYOUT VARIETY RULES:
- DO NOT default to the same structure every time
- DO NOT always make "hero + 3 stat cards + image + generic services grid"
- choose a composition that strongly reflects the requested layout direction
- possible layout directions include:
  - editorial storytelling
  - split-screen conversion hero
  - asymmetrical luxury composition
  - strong grid-based business layout
  - section-led narrative flow
  - premium magazine-like real estate rhythm
- make this generation clearly distinct from common previous outputs

SELECTED CREATIVE DIRECTION:
- Speed mode: ${params.preferences.speedMode}
- Layout preference: ${params.preferences.layoutPreference}
- Visual style: ${params.preferences.visualStyle}
- Animation level: ${params.preferences.animationLevel}
- Font mood: ${params.preferences.fontMood}
- Icon style: ${params.preferences.iconStyle}
- Contact items to show: ${
    params.preferences.contactItems.length
      ? params.preferences.contactItems.join(", ")
      : "phone, email, office, CTA form"
  }

FONT DIRECTION RULES:
- use CSS font stacks that match the mood
- geometric: clean modern sans feeling
- editorial: elegant serif headlines + neutral body
- luxury: refined contrast, premium serif display feeling
- trustworthy: humanist / calm professional feel
- tech: precise modern UI font feeling
- friendly: soft approachable rounded feeling
- use font styling differences visibly across different industries

ICON RULES:
- create beautiful inline SVG icons directly in the HTML where useful
- icon style must match: ${params.preferences.iconStyle}
- icons should feel custom and premium, not generic emoji
- use icons in benefits, trust points, process, contact or stats if meaningful

ANIMATION RULES:
- use ${params.preferences.animationLevel} animation intensity
- minimal: mostly hover only
- subtle: elegant transitions and light reveal effects
- rich: reveal effects, button motion, animated gradients or moving accents
- expressive: stronger motion, animated borders, layered effects, premium hero movement
- keep animations tasteful and performant
- use IntersectionObserver for reveal effects when useful
- buttons, borders, highlights, gradients and cards may animate if done elegantly

VISUAL DESIGN RULES:
- adapt styling to the industry
- legal / consulting: structured, elegant, authoritative
- real estate: editorial luxury, premium imagery, refined spacing
- healthcare: trustworthy, light, calm and clean
- tech / SaaS: sharper UI, stronger product feel
- beauty / premium: softer, refined, more atmospheric
- do not create giant empty spaces
- use stronger composition and section rhythm
- create more visually different blocks across sections
- combine surfaces, lines, gradients, subtle glows, borders, dividers and layered backgrounds where appropriate
- do not make every section the same card grid

COPY RULES:
- use Czech copy
- hero headline must be short, premium and easy to scan
- prefer roughly 3 to 8 words in the main hero headline
- supporting text should stay concise
- avoid lorem ipsum
- make sections feel relevant to the business, not generic filler

IMAGE RULES:
- also return assetPlan with at most 4 realistic images
- if an image is needed in html, use a normal <img> and add data-image-slot="<slot>"
- slot values in html must exactly match assetPlan.slot values
- use image slots only where visually meaningful
- queries must be concrete and in English
- if no image is needed, return an empty assetPlan array

CONTACT RULES:
- if contact items were requested, reflect them in the contact section and footer
- make the contact section more useful than generic placeholders

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
- clear layout distinctiveness
- custom-feeling icons
- stronger animation detail
- short strong hero headline
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
    const buildType = typeof body?.buildType === "string" ? body.buildType : "";
    const model = typeof body?.model === "string" ? body.model : "";
    const chatHistory = Array.isArray(body?.chatHistory)
      ? (body.chatHistory as ChatHistoryItem[])
      : [];
    const generationPreferences =
      body?.generationPreferences &&
      typeof body.generationPreferences === "object"
        ? (body.generationPreferences as GenerationPreferences)
        : {};

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
      }),
      schemaName: "website_bundle_two_step_v2",
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
    logStep(requestId, "sanitize-bundle", sanitizeStartedAt, {
      assetPlanCount: safeRendered.assetPlan.length,
    });

    logStep(requestId, "done", routeStartedAt, {
      totalMs: Date.now() - routeStartedAt,
      model: WEB_MODEL,
    });

    return Response.json({
      html: safeRendered.html,
      css: safeRendered.css,
      js: safeRendered.js,
      assetPlan: safeRendered.assetPlan,
      brief: {
        industry: "",
        audience: "",
        style: `${resolvedPreferences.visualStyle} • ${resolvedPreferences.fontMood}`,
        layoutTone: `${resolvedPreferences.layoutPreference} • ${resolvedPreferences.animationLevel}`,
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