import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type ChatHistoryItem = {
  role: "system" | "user" | "assistant";
  text: string;
};

type ImagePlanItem = {
  slot: string;
  query: string;
  placement: string;
  mood: string;
  orientation: "landscape" | "portrait" | "square";
};

type DesignBrief = {
  industry: string;
  audience: string;
  style: string;
  layoutTone: string;
  styleDirection: string;
  layoutArchetype: string;
  palette: string[];
  sections: string[];
  headlineAngle: string;
  differentiators: string[];
  imagePlan: ImagePlanItem[];
  iconPlan: string[];
};

type ResolvedAsset = {
  slot: string;
  url: string;
  alt: string;
  source: "pexels" | "unsplash" | "fallback";
  photographer?: string;
  photographerUrl?: string;
};

type WebsiteBundle = {
  html: string;
  css: string;
  js: string;
};

type IndustryImageRules = {
  preferred: string[];
  banned: string[];
  fallbackQueries: string[];
};

const OPENAI_PLANNER_MODEL = "gpt-4.1-mini";
const OPENAI_RENDER_MODEL = "gpt-4.1";
const IMAGE_FETCH_TIMEOUT_MS = 3500;

async function withTimeout<T>(
  promiseFactory: (signal?: AbortSignal) => Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await promiseFactory(controller.signal);
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(errorMessage);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function createStructuredObject<T>({
  model,
  system,
  user,
  schemaName,
  schema,
}: {
  model: string;
  system: string;
  user: string;
  schemaName: string;
  schema: Record<string, unknown>;
}): Promise<T> {
  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
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

const designBriefSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    industry: { type: "string" },
    audience: { type: "string" },
    style: { type: "string" },
    layoutTone: { type: "string" },
    styleDirection: { type: "string" },
    layoutArchetype: { type: "string" },
    palette: {
      type: "array",
      items: { type: "string" },
    },
    sections: {
      type: "array",
      items: { type: "string" },
    },
    headlineAngle: { type: "string" },
    differentiators: {
      type: "array",
      items: { type: "string" },
    },
    imagePlan: {
      type: "array",
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
    iconPlan: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: [
    "industry",
    "audience",
    "style",
    "layoutTone",
    "styleDirection",
    "layoutArchetype",
    "palette",
    "sections",
    "headlineAngle",
    "differentiators",
    "imagePlan",
    "iconPlan",
  ],
};

const websiteBundleSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    html: { type: "string" },
    css: { type: "string" },
    js: { type: "string" },
  },
  required: ["html", "css", "js"],
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

function sanitizeBundle(bundle: WebsiteBundle): WebsiteBundle {
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
  };
}

function makeSeed(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function fallbackImageUrl(
  query: string,
  orientation: "landscape" | "portrait" | "square"
) {
  const seed = makeSeed(query) || "zyvia";
  const size =
    orientation === "portrait"
      ? "900/1200"
      : orientation === "square"
      ? "1200/1200"
      : "1600/1000";

  return `https://picsum.photos/seed/${seed}/${size}`;
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getIndustryImageRules(industry: string, prompt: string): IndustryImageRules {
  const text = normalizeText(`${industry} ${prompt}`);

  if (
    text.includes("prav") ||
    text.includes("advokat") ||
    text.includes("law") ||
    text.includes("legal") ||
    text.includes("attorney") ||
    text.includes("notar")
  ) {
    return {
      preferred: [
        "lawyer",
        "attorney",
        "legal",
        "law office",
        "office",
        "consultation",
        "meeting",
        "business",
        "corporate",
        "documents",
        "desk",
        "interior",
        "professional",
        "team",
        "client",
      ],
      banned: [
        "mountain",
        "mountains",
        "forest",
        "nature",
        "beach",
        "landscape",
        "waterfall",
        "hiking",
        "travel",
        "animal",
        "dog",
        "cat",
        "camping",
        "lake",
      ],
      fallbackQueries: [
        "lawyer office consultation",
        "attorney meeting client",
        "law firm interior",
      ],
    };
  }

  if (
    text.includes("klin") ||
    text.includes("doktor") ||
    text.includes("ambul") ||
    text.includes("medical") ||
    text.includes("health") ||
    text.includes("doctor")
  ) {
    return {
      preferred: [
        "doctor",
        "medical",
        "clinic",
        "healthcare",
        "consultation",
        "patient",
        "interior",
        "clean",
        "professional",
        "nurse",
        "team",
      ],
      banned: [
        "mountain",
        "forest",
        "beach",
        "landscape",
        "travel",
        "dog",
        "cat",
        "car",
        "motorcycle",
      ],
      fallbackQueries: [
        "doctor consultation clinic",
        "modern clinic interior",
        "healthcare professional portrait",
      ],
    };
  }

  if (
    text.includes("beauty") ||
    text.includes("esthetic") ||
    text.includes("estet") ||
    text.includes("skin") ||
    text.includes("kosmet") ||
    text.includes("derma")
  ) {
    return {
      preferred: [
        "beauty clinic",
        "skin care",
        "facial treatment",
        "beauty consultation",
        "esthetic doctor",
        "clinic interior",
        "skincare",
        "woman",
        "professional",
      ],
      banned: [
        "mountain",
        "forest",
        "beach",
        "landscape",
        "travel",
        "animal",
        "dog",
        "cat",
      ],
      fallbackQueries: [
        "beauty clinic consultation",
        "modern beauty clinic interior",
        "skincare treatment woman",
      ],
    };
  }

  if (
    text.includes("saas") ||
    text.includes("startup") ||
    text.includes("software") ||
    text.includes("tech") ||
    text.includes("app")
  ) {
    return {
      preferred: [
        "dashboard",
        "software",
        "technology",
        "startup",
        "team",
        "office",
        "laptop",
        "workspace",
        "product",
        "interface",
        "developer",
      ],
      banned: [
        "mountain",
        "forest",
        "beach",
        "waterfall",
        "wedding",
        "dog",
        "cat",
        "farm",
      ],
      fallbackQueries: [
        "modern saas dashboard",
        "startup team office",
        "technology workspace laptop",
      ],
    };
  }

  if (
    text.includes("realit") ||
    text.includes("reality") ||
    text.includes("property") ||
    text.includes("estate")
  ) {
    return {
      preferred: [
        "interior",
        "property",
        "apartment",
        "real estate",
        "home",
        "building",
        "architecture",
        "luxury",
        "office",
      ],
      banned: ["forest", "mountain", "waterfall", "dog", "cat", "travel"],
      fallbackQueries: [
        "luxury apartment interior",
        "modern real estate office",
        "premium property exterior",
      ],
    };
  }

  if (
    text.includes("restaurant") ||
    text.includes("hotel") ||
    text.includes("cafe") ||
    text.includes("gastro")
  ) {
    return {
      preferred: [
        "restaurant",
        "food",
        "chef",
        "interior",
        "dining",
        "table",
        "hospitality",
        "kitchen",
        "coffee",
      ],
      banned: ["mountain", "forest", "office documents", "lawyer", "dashboard"],
      fallbackQueries: [
        "restaurant interior premium",
        "chef preparing food",
        "elegant dining table",
      ],
    };
  }

  return {
    preferred: [
      "business",
      "office",
      "professional",
      "interior",
      "team",
      "workspace",
      "modern",
      "meeting",
      "client",
    ],
    banned: [
      "mountain",
      "forest",
      "beach",
      "waterfall",
      "wildlife",
      "animal",
      "travel",
      "camping",
    ],
    fallbackQueries: [
      "modern business office",
      "professional team meeting",
      "premium office interior",
    ],
  };
}

function scoreImageRelevance(
  alt: string,
  query: string,
  rules: IndustryImageRules
): number {
  const haystack = normalizeText(`${alt} ${query}`);
  let score = 0;

  for (const preferred of rules.preferred) {
    if (haystack.includes(normalizeText(preferred))) score += 2;
  }

  for (const banned of rules.banned) {
    if (haystack.includes(normalizeText(banned))) score -= 5;
  }

  return score;
}

function isImageRelevantForIndustry(
  alt: string,
  query: string,
  rules: IndustryImageRules
) {
  return scoreImageRelevance(alt, query, rules) >= 1;
}

async function searchPexelsCandidates(
  query: string,
  orientation: "landscape" | "portrait" | "square"
) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  try {
    return await withTimeout(
      async (signal) => {
        const url = new URL("https://api.pexels.com/v1/search");
        url.searchParams.set("query", query);
        url.searchParams.set("per_page", "3");
        url.searchParams.set("orientation", orientation);

        const res = await fetch(url.toString(), {
          headers: {
            Authorization: apiKey,
          },
          cache: "no-store",
          signal,
        });

        if (!res.ok) return [];

        const data = (await res.json()) as {
          photos?: Array<{
            alt?: string;
            photographer?: string;
            photographer_url?: string;
            src?: {
              large2x?: string;
              large?: string;
              original?: string;
            };
          }>;
        };

        return (data.photos || [])
          .map((photo) => {
            const imageUrl =
              photo?.src?.large2x ||
              photo?.src?.large ||
              photo?.src?.original ||
              "";

            if (!imageUrl) return null;

            return {
              slot: "",
              url: imageUrl,
              alt: photo.alt || query,
              source: "pexels" as const,
              photographer: photo.photographer,
              photographerUrl: photo.photographer_url,
            };
          })
          .filter(Boolean) as ResolvedAsset[];
      },
      IMAGE_FETCH_TIMEOUT_MS,
      "Pexels timeout"
    );
  } catch {
    return [];
  }
}

async function searchUnsplashCandidates(
  query: string,
  orientation: "landscape" | "portrait" | "square"
) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return [];

  try {
    return await withTimeout(
      async (signal) => {
        const orientationMap =
          orientation === "portrait"
            ? "portrait"
            : orientation === "square"
            ? "squarish"
            : "landscape";

        const url = new URL("https://api.unsplash.com/search/photos");
        url.searchParams.set("query", query);
        url.searchParams.set("per_page", "3");
        url.searchParams.set("orientation", orientationMap);

        const res = await fetch(url.toString(), {
          headers: {
            Authorization: `Client-ID ${accessKey}`,
          },
          cache: "no-store",
          signal,
        });

        if (!res.ok) return [];

        const data = (await res.json()) as {
          results?: Array<{
            alt_description?: string;
            description?: string;
            urls?: {
              regular?: string;
              full?: string;
            };
            user?: {
              name?: string;
              links?: {
                html?: string;
              };
            };
          }>;
        };

        return (data.results || [])
          .map((photo) => {
            const imageUrl = photo?.urls?.regular || photo?.urls?.full || "";
            if (!imageUrl) return null;

            return {
              slot: "",
              url: imageUrl,
              alt: photo.alt_description || photo.description || query,
              source: "unsplash" as const,
              photographer: photo.user?.name,
              photographerUrl: photo.user?.links?.html,
            };
          })
          .filter(Boolean) as ResolvedAsset[];
      },
      IMAGE_FETCH_TIMEOUT_MS,
      "Unsplash timeout"
    );
  } catch {
    return [];
  }
}

async function findRelevantImage(params: {
  query: string;
  orientation: "landscape" | "portrait" | "square";
  rules: IndustryImageRules;
}) {
  const [pexelsCandidates, unsplashCandidates] = await Promise.all([
    searchPexelsCandidates(params.query, params.orientation),
    searchUnsplashCandidates(params.query, params.orientation),
  ]);

  const candidates = [...pexelsCandidates, ...unsplashCandidates];

  return (
    candidates
      .sort(
        (a, b) =>
          scoreImageRelevance(b.alt, params.query, params.rules) -
          scoreImageRelevance(a.alt, params.query, params.rules)
      )
      .find((candidate) =>
        isImageRelevantForIndustry(candidate.alt, params.query, params.rules)
      ) || null
  );
}

async function resolveImageAssets(
  imagePlan: ImagePlanItem[],
  industry: string,
  prompt: string
): Promise<ResolvedAsset[]> {
  const limitedPlan = imagePlan.slice(0, 3);
  const rules = getIndustryImageRules(industry, prompt);

  const resolved = await Promise.all(
    limitedPlan.map(async (item, index) => {
      try {
        const directMatch = await findRelevantImage({
          query: item.query,
          orientation: item.orientation,
          rules,
        });

        if (directMatch) {
          return {
            ...directMatch,
            slot: item.slot,
          };
        }

        const safeFallbackQuery =
          rules.fallbackQueries[index % rules.fallbackQueries.length];

        return {
          slot: item.slot,
          url: fallbackImageUrl(safeFallbackQuery, item.orientation),
          alt: safeFallbackQuery,
          source: "fallback" as const,
        };
      } catch {
        const safeFallbackQuery =
          rules.fallbackQueries[index % rules.fallbackQueries.length];

        return {
          slot: item.slot,
          url: fallbackImageUrl(safeFallbackQuery, item.orientation),
          alt: safeFallbackQuery,
          source: "fallback" as const,
        };
      }
    })
  );

  return resolved;
}

function formatChatHistory(history: ChatHistoryItem[]) {
  if (!history?.length) return "Žádná historie chatu.";

  return history
    .slice(-10)
    .map((item, index) => `${index + 1}. [${item.role}] ${item.text}`)
    .join("\n");
}

function plannerPrompt(params: {
  prompt: string;
  buildType?: string;
  model?: string;
  chatHistory?: ChatHistoryItem[];
}) {
  return `
Jsi senior brand stratég, creative director a UX architekt.

Tvým úkolem je připravit detailní design plán pro AI generování webu.

Vrať přesně strukturovaný JSON podle schématu.

Důležitá pravidla:
- styleDirection musí být KONKRÉTNÍ vizuální směr, ne obecná fráze
- layoutArchetype musí být konkrétní kompoziční archetyp
- imagePlan musí být užitečný a realistický
- navrhni maximálně 3 obrázky
- query musí být v angličtině kvůli image search
- queries musí být konkrétní a popisné, ne abstraktní mood fráze
- u profesních oborů používej konkrétní dotazy jako office, consultation, team, interior, documents apod.
- sections navrhni podle skutečné potřeby projektu
- differentiators musí být použitelné přímo na webu
- iconPlan má být seznam témat ikon, ne názvy knihoven

DŮLEŽITÉ UX A ART DIRECTION ZÁSADY:
- web nesmí mít prázdná mrtvá místa
- každá sekce musí být kompozičně zaplněná a vizuálně vyvážená
- obrázky musí významově sedět k byznysu
- navigation musí být plnohodnotná
- footer musí být propracovaný a bohatý na relevantní odkazy
- vždy počítej s CTA tlačítkem v menu
- mobile menu musí být řešeno hamburgerem
- layout musí počítat i s mobile verzí už ve fázi plánování
- tablet verze musí být promyšlená, zejména spacing, zalamování a navigace
- cílem je premium commercial quality

COPYWRITING PRAVIDLA:
- hlavní hero headline musí být krátký, silný a dobře čitelný
- preferuj 3 až 8 slov v hlavním hero nadpisu
- supporting text pod hero musí být stručný, jasný a prodejní

KONTEKST:
- Build type: ${params.buildType || "neuvedeno"}
- Zvolený model: ${params.model || "neuvedeno"}

HISTORIE CHATU:
${formatChatHistory(params.chatHistory || [])}

ZADÁNÍ KLIENTA:
${params.prompt}
`;
}

function renderPrompt(params: {
  prompt: string;
  buildType?: string;
  model?: string;
  brief: DesignBrief;
  assets: ResolvedAsset[];
  chatHistory?: ChatHistoryItem[];
}) {
  const assetsText =
    params.assets.length > 0
      ? params.assets
          .map(
            (asset, index) =>
              `${index + 1}. slot=${asset.slot}; url=${asset.url}; alt=${asset.alt}; source=${asset.source}`
          )
          .join("\n")
      : "Žádné assets nejsou k dispozici.";

  return `
You are an elite web designer, UX designer and frontend developer.

Return ONLY a structured JSON object matching the schema.

CRITICAL OUTPUT RULES:
- html must contain ONLY the body markup content
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
- preferred ids are: navigation, hero, about, services, properties, references, process, contact, footer
- navigation must be its own section with data-section-id="navigation"
- footer must be its own section with data-section-id="footer"
- add a fully working mobile hamburger navigation
- include a CTA button in the main navigation
- navigation must be complete and visually polished
- footer must be complete and visually polished

PROJECT CONTEXT:
- Original prompt: ${params.prompt}
- Build type: ${params.buildType || "neuvedeno"}
- Preferred model label: ${params.model || "neuvedeno"}

CHAT HISTORY:
${formatChatHistory(params.chatHistory || [])}

DESIGN BRIEF:
- Industry: ${params.brief.industry}
- Audience: ${params.brief.audience}
- Style: ${params.brief.style}
- Layout tone: ${params.brief.layoutTone}
- Style direction: ${params.brief.styleDirection}
- Layout archetype: ${params.brief.layoutArchetype}
- Palette: ${params.brief.palette.join(", ")}
- Sections: ${params.brief.sections.join(", ")}
- Headline angle: ${params.brief.headlineAngle}
- Differentiators: ${params.brief.differentiators.join(", ")}
- Icon themes: ${params.brief.iconPlan.join(", ")}

AVAILABLE IMAGE ASSETS:
${assetsText}

STRICT DESIGN RULES:
- use the provided images where appropriate
- use Czech copy, not lorem ipsum
- ensure responsive design across desktop, tablet and mobile
- avoid giant empty blank blocks
- the result must be fast to render and production safe

COPYWRITING RULES:
- the main hero headline must be short, punchy and premium
- prefer roughly 3 to 8 words for the main hero headline
- supporting hero paragraph should be concise and easy to scan

FINAL QA BEFORE OUTPUT:
- no obvious empty spaces
- complete premium navigation with CTA
- complete premium footer
- functional mobile menu
- tablet spacing checked
- visually coherent image usage
- balanced hero section
- responsive layout
- commercial quality result
- short and strong hero headline
`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const prompt = typeof body?.prompt === "string" ? body.prompt : "";
    const buildType = typeof body?.buildType === "string" ? body.buildType : "";
    const model = typeof body?.model === "string" ? body.model : "";
    const chatHistory = Array.isArray(body?.chatHistory)
      ? (body.chatHistory as ChatHistoryItem[])
      : [];

    if (!prompt || prompt.trim().length < 8) {
      return Response.json(
        { error: "Missing or invalid prompt" },
        { status: 400 }
      );
    }

    const brief = await createStructuredObject<DesignBrief>({
      model: OPENAI_PLANNER_MODEL,
      system: "You are a precise design strategist. Return only valid JSON.",
      user: plannerPrompt({
        prompt,
        buildType,
        model,
        chatHistory,
      }),
      schemaName: "design_brief",
      schema: designBriefSchema,
    });

    const assets = await resolveImageAssets(
      brief.imagePlan || [],
      brief.industry,
      prompt
    );

    const renderedBundle = await createStructuredObject<WebsiteBundle>({
      model: OPENAI_RENDER_MODEL,
      system:
        "You are an elite web designer and frontend engineer. Return only valid JSON.",
      user: renderPrompt({
        prompt,
        buildType,
        model,
        brief,
        assets,
        chatHistory,
      }),
      schemaName: "website_bundle",
      schema: websiteBundleSchema,
    });

    const safeRendered = sanitizeBundle(renderedBundle);

    return Response.json({
      html: safeRendered.html,
      css: safeRendered.css,
      js: safeRendered.js,
      brief: {
        industry: brief.industry,
        audience: brief.audience,
        style: `${brief.style} • ${brief.styleDirection}`,
        layoutTone: `${brief.layoutTone} • ${brief.layoutArchetype}`,
      },
      assets,
    });
  } catch (e: any) {
    console.error("/api/generate fatal error:", e);

    return Response.json(
      {
        error: e?.message ?? "Server error",
      },
      { status: 500 }
    );
  }
}