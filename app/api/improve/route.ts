import OpenAI from "openai";

export const runtime = "nodejs";

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

type WebsiteBundle = {
  html: string;
  css: string;
  js: string;
};

type ResolvedAsset = {
  slot: string;
  url: string;
  alt: string;
  source: "pexels" | "unsplash" | "fallback";
  photographer?: string;
  photographerUrl?: string;
};

type ImprovePlan = {
  changeSummary: string;
  preserveRules: string[];
  imageRefreshPlan: ImagePlanItem[];
};

type IndustryImageRules = {
  preferred: string[];
  banned: string[];
  fallbackQueries: string[];
};

async function createStructuredObject<T>({
  system,
  user,
  schemaName,
  schema,
}: {
  system: string;
  user: string;
  schemaName: string;
  schema: Record<string, unknown>;
}): Promise<T> {
  const completion = await client.chat.completions.create({
    model: "gpt-4.1",
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

const improvePlanSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    changeSummary: { type: "string" },
    preserveRules: {
      type: "array",
      items: { type: "string" },
    },
    imageRefreshPlan: {
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
  },
  required: ["changeSummary", "preserveRules", "imageRefreshPlan"],
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
        "legal documents desk",
        "professional lawyer portrait",
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
        "medical team clean environment",
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
        "esthetic doctor consultation",
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
        "software product interface",
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
        "architectural building facade",
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
        "cafe interior aesthetic",
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
      "client consultation office",
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
    if (haystack.includes(normalizeText(preferred))) {
      score += 2;
    }
  }

  for (const banned of rules.banned) {
    if (haystack.includes(normalizeText(banned))) {
      score -= 5;
    }
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

  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "5");
  url.searchParams.set("orientation", orientation);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: apiKey,
    },
    cache: "no-store",
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
        photo?.src?.large2x || photo?.src?.large || photo?.src?.original || "";

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
}

async function searchUnsplashCandidates(
  query: string,
  orientation: "landscape" | "portrait" | "square"
) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return [];

  const orientationMap =
    orientation === "portrait"
      ? "portrait"
      : orientation === "square"
      ? "squarish"
      : "landscape";

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "5");
  url.searchParams.set("orientation", orientationMap);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Client-ID ${accessKey}`,
    },
    cache: "no-store",
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
}

async function findRelevantImage(params: {
  query: string;
  orientation: "landscape" | "portrait" | "square";
  rules: IndustryImageRules;
}) {
  const pexelsCandidates = await searchPexelsCandidates(
    params.query,
    params.orientation
  );

  const bestPexels = pexelsCandidates
    .sort(
      (a, b) =>
        scoreImageRelevance(b.alt, params.query, params.rules) -
        scoreImageRelevance(a.alt, params.query, params.rules)
    )
    .find((candidate) =>
      isImageRelevantForIndustry(candidate.alt, params.query, params.rules)
    );

  if (bestPexels) return bestPexels;

  const unsplashCandidates = await searchUnsplashCandidates(
    params.query,
    params.orientation
  );

  const bestUnsplash = unsplashCandidates
    .sort(
      (a, b) =>
        scoreImageRelevance(b.alt, params.query, params.rules) -
        scoreImageRelevance(a.alt, params.query, params.rules)
    )
    .find((candidate) =>
      isImageRelevantForIndustry(candidate.alt, params.query, params.rules)
    );

  if (bestUnsplash) return bestUnsplash;

  return null;
}

async function resolveImageAssets(
  imagePlan: ImagePlanItem[],
  prompt: string
): Promise<ResolvedAsset[]> {
  const limitedPlan = imagePlan.slice(0, 4);
  const rules = getIndustryImageRules(prompt, prompt);

  const resolved = await Promise.all(
    limitedPlan.map(async (item, index) => {
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

      const saferMatch = await findRelevantImage({
        query: safeFallbackQuery,
        orientation: item.orientation,
        rules,
      });

      if (saferMatch) {
        return {
          ...saferMatch,
          slot: item.slot,
          alt: saferMatch.alt || safeFallbackQuery,
        };
      }

      return {
        slot: item.slot,
        url: fallbackImageUrl(safeFallbackQuery, item.orientation),
        alt: safeFallbackQuery,
        source: "fallback" as const,
      };
    })
  );

  return resolved;
}

function formatChatHistory(history: ChatHistoryItem[]) {
  if (!history?.length) return "Žádná historie chatu.";

  return history
    .slice(-12)
    .map((item, index) => `${index + 1}. [${item.role}] ${item.text}`)
    .join("\n");
}

function improvePlannerPrompt(params: {
  prompt: string;
  instruction: string;
  chatHistory?: ChatHistoryItem[];
  html: string;
  css: string;
  js: string;
}) {
  return `
Jsi senior AI design editor a web creative director.

Tvým úkolem je pochopit změnu, kterou uživatel chce provést nad již existujícím webem.

Vrať přesně strukturovaný JSON podle schématu.

Pravidla:
- preserveRules musí popsat, co se má zachovat
- imageRefreshPlan vyplň jen pokud změna vyžaduje nové nebo lepší fotky
- query piš anglicky
- pokud nejsou nové fotky potřeba, vrať prázdné pole
- pokud web obsahuje prázdná místa, nevyvážené bloky nebo slabé menu, zahrň to do changeSummary
- pokud chybí kvalitní mobilní menu, ber to jako chybu k opravě
- pokud footer působí slabě, zahrň to do changeSummary
- pokud tablet spacing nebo menu zalamování působí špatně, zahrň to do changeSummary
- pokud obrázky významově nesedí, navrhni konkrétnější image queries
- pokud je hlavní hero headline zbytečně dlouhý, zahrň jeho zkrácení do changeSummary

PŮVODNÍ PROMPT:
${params.prompt}

INSTRUKCE UŽIVATELE:
${params.instruction}

HISTORIE CHATU:
${formatChatHistory(params.chatHistory || [])}

AKTUÁLNÍ HTML:
${params.html}

AKTUÁLNÍ CSS:
${params.css}

AKTUÁLNÍ JS:
${params.js}
`;
}

function improveRenderPrompt(params: {
  prompt: string;
  instruction: string;
  html: string;
  css: string;
  js: string;
  chatHistory?: ChatHistoryItem[];
  plan: ImprovePlan;
  assets: ResolvedAsset[];
}) {
  const assetsText =
    params.assets.length > 0
      ? params.assets
          .map(
            (asset, index) =>
              `${index + 1}. slot=${asset.slot}; url=${asset.url}; alt=${asset.alt}; source=${asset.source}`
          )
          .join("\n")
      : "Žádné nové assets nejsou k dispozici.";

  return `
You are an elite web designer and frontend engineer.

Return ONLY a structured JSON object matching the schema.

TASK:
You are improving an existing website bundle, not blindly recreating a new one from zero.

CRITICAL OUTPUT RULES:
- html must contain ONLY the body markup content
- do not return <!DOCTYPE html>
- do not return <html>, <head> or <body>
- css must contain ALL styling needed for the website
- js must contain vanilla JavaScript only
- keep semantic sections with data-section-id and data-section-type
- maintain responsive layout
- keep a complete polished navigation with CTA
- keep or improve a working mobile hamburger menu
- keep or improve a premium footer

ORIGINAL PROJECT PROMPT:
${params.prompt}

CURRENT USER INSTRUCTION:
${params.instruction}

CHAT HISTORY:
${formatChatHistory(params.chatHistory || [])}

CHANGE SUMMARY:
${params.plan.changeSummary}

PRESERVE RULES:
${params.plan.preserveRules.join("\n")}

NEW IMAGE ASSETS:
${assetsText}

CURRENT HTML:
${params.html}

CURRENT CSS:
${params.css}

CURRENT JS:
${params.js}

IMPROVEMENT RULES:
- preserve the good parts of the design
- improve visual quality where needed
- if new images are provided and relevant, use them meaningfully
- use Czech copy
- shorten an overly long hero headline when needed

FINAL QA BEFORE OUTPUT:
- no obvious empty spaces
- complete navigation with CTA
- complete footer
- working mobile menu
- polished tablet spacing
- balanced hero and section compositions
- coherent imagery
- polished responsive result
- short and strong hero headline
`;
}

function selfCheckPrompt(params: {
  prompt: string;
  instruction: string;
  html: string;
  css: string;
  js: string;
}) {
  return `
You are a brutally honest senior web design QA reviewer and frontend fixer.

Return ONLY a structured JSON object matching the schema.

IMPORTANT:
- Preserve the intended user change
- Fix layout weaknesses
- Fix empty/dead spaces
- Fix incomplete or weak navigation
- Fix incomplete or weak footer
- Ensure mobile hamburger menu works
- Ensure tablet spacing is polished
- Keep Czech copy
- Keep semantic sections and metadata

ORIGINAL PROJECT PROMPT:
${params.prompt}

USER INSTRUCTION:
${params.instruction}

CURRENT HTML:
${params.html}

CURRENT CSS:
${params.css}

CURRENT JS:
${params.js}
`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const prompt = typeof body?.prompt === "string" ? body.prompt : "";
    const instruction = typeof body?.instruction === "string" ? body.instruction : "";
    const html = typeof body?.html === "string" ? body.html : "";
    const css = typeof body?.css === "string" ? body.css : "";
    const js = typeof body?.js === "string" ? body.js : "";
    const chatHistory = Array.isArray(body?.chatHistory)
      ? (body.chatHistory as ChatHistoryItem[])
      : [];

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

    const plan = await createStructuredObject<ImprovePlan>({
      system: "You are a precise AI design editor. Return only valid JSON.",
      user: improvePlannerPrompt({
        prompt,
        instruction,
        chatHistory,
        html,
        css,
        js,
      }),
      schemaName: "improve_plan",
      schema: improvePlanSchema,
    });

    const assets = await resolveImageAssets(plan.imageRefreshPlan || [], prompt);

    const improvedBundle = await createStructuredObject<WebsiteBundle>({
      system:
        "You are an elite web designer and frontend engineer. Return only valid JSON.",
      user: improveRenderPrompt({
        prompt,
        instruction,
        html,
        css,
        js,
        chatHistory,
        plan,
        assets,
      }),
      schemaName: "improve_bundle",
      schema: websiteBundleSchema,
    });

    const safeImproved = sanitizeBundle(improvedBundle);

    let safeFinal = safeImproved;

    try {
      const checkedBundle = await createStructuredObject<WebsiteBundle>({
        system:
          "You are a senior web design QA reviewer and frontend fixer. Return only valid JSON.",
        user: selfCheckPrompt({
          prompt,
          instruction,
          html: safeImproved.html,
          css: safeImproved.css,
          js: safeImproved.js,
        }),
        schemaName: "improve_bundle_checked",
        schema: websiteBundleSchema,
      });

      safeFinal = sanitizeBundle(checkedBundle);
    } catch (selfCheckError) {
      console.error("Self-check pass failed in /api/improve:", selfCheckError);
      safeFinal = safeImproved;
    }

    return Response.json({
      html: safeFinal.html,
      css: safeFinal.css,
      js: safeFinal.js,
      assets,
    });
  } catch (e: any) {
    console.error("/api/improve fatal error:", e);

    return Response.json(
      {
        error: e?.message ?? "Improve route failed",
      },
      { status: 500 }
    );
  }
}