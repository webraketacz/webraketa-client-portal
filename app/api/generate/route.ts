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

function extractJson(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Model nevrátil validní JSON.");
  }

  return raw.slice(start, end + 1);
}

function cleanJsonOutput(raw: string) {
  return raw.replace(/```json/gi, "").replace(/```/g, "").trim();
}

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
  industry: string,
  prompt: string
): Promise<ResolvedAsset[]> {
  const limitedPlan = imagePlan.slice(0, 6);
  const rules = getIndustryImageRules(industry, prompt);

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
Nesmíš vrátit markdown. Nesmíš vrátit nic kromě JSON objektu.

Vrať PŘESNĚ tento JSON formát:
{
  "industry": "string",
  "audience": "string",
  "style": "string",
  "layoutTone": "string",
  "styleDirection": "string",
  "layoutArchetype": "string",
  "palette": ["string", "string", "string"],
  "sections": ["string", "string", "string"],
  "headlineAngle": "string",
  "differentiators": ["string", "string", "string"],
  "imagePlan": [
    {
      "slot": "hero",
      "query": "string",
      "placement": "string",
      "mood": "string",
      "orientation": "landscape"
    }
  ],
  "iconPlan": ["string", "string", "string"]
}

Důležitá pravidla:
- styleDirection musí být KONKRÉTNÍ vizuální směr, ne obecná fráze
- layoutArchetype musí být konkrétní kompoziční archetyp
- imagePlan musí být užitečný a realistický
- navrhni 4 až 6 obrázků
- query musí být v angličtině kvůli image search
- queries musí být konkrétní a popisné, ne abstraktní mood fráze
- u profesních oborů používej konkrétní dotazy jako office, consultation, team, interior, documents apod.
- nevracej obecné queries typu "premium law mood" nebo "elegant trust concept"
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
- nevol stále stejný styl karet, oken a bloků
- cílem je premium commercial quality

OBOROVÉ STYLING PRAVIDLO:
- právník / advokát / právní kancelář:
  - seriózní a důstojná typografie
  - menší radius nebo bez radiusů
  - pevnější a architektoničtější grid
  - méně „startup glow“, více autority a klidu
- klinika:
  - čistota, důvěra, vzdušnost, ale ne sterilní nuda
- luxury / premium:
  - editorial rhythm, výrazná hierarchie, velké kvalitní bloky
- SaaS / tech:
  - přesná konverzní struktura, modernější UI language
- ecommerce / produkt:
  - benefit-first struktura, produktové bloky, trust, FAQ, CTA

STRUKTURNÍ PRAVIDLO:
- web by měl mít ideálně 8 až 10 propracovaných sekcí, pokud to dává smysl pro typ projektu
- sekce nemají být výplň, ale kvalitní a funkční
- header a footer se počítají jako důležité části výsledku
- footer musí být vždy dotažený, ne minimalisticky odbytý

COPYWRITING PRAVIDLA:
- hlavní hero headline musí být krátký, silný a dobře čitelný
- preferuj 3 až 8 slov v hlavním hero nadpisu
- nepoužívej zbytečně dlouhé věty v hlavním nadpisu
- supporting text pod hero musí být stručný, jasný a prodejní
- vyhýbej se ukecaným odstavcům v top části webu

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

Return ONLY a valid JSON object.
No markdown.
No code fences.
No explanation.

Return this exact JSON shape:
{
  "html": "string",
  "css": "string",
  "js": "string"
}

CRITICAL OUTPUT RULES:
- html must contain ONLY the body markup content
- do not return <!DOCTYPE html>
- do not return <html>, <head> or <body>
- css must contain ALL styling needed for the website
- js must contain vanilla JavaScript only
- do not use external libraries
- do not use Tailwind CDN
- do not rely on remote CSS
- wrap major sections using semantic <section> tags
- add data-section-id and data-section-type to major sections
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
- if an image is provided for legal, healthcare, saas or similar industries, use it semantically and not decoratively
- use Czech copy, not lorem ipsum
- ensure responsive design across desktop, tablet and mobile
- avoid giant empty blank blocks

COPYWRITING RULES:
- the main hero headline must be short, punchy and premium
- prefer roughly 3 to 8 words for the main hero headline
- never make the first headline unnecessarily long
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
- enough meaningful sections
- short and strong hero headline

Return only final JSON object.
`;
}

function selfCheckPrompt(params: {
  prompt: string;
  html: string;
  css: string;
  js: string;
}) {
  return `
You are a brutally honest senior web design QA reviewer and frontend fixer.

Your task:
Review the provided website bundle and improve weak parts before final delivery.

Return ONLY a valid JSON object:
{
  "html": "string",
  "css": "string",
  "js": "string"
}

IMPORTANT:
- Preserve the overall direction unless it is clearly broken
- Fix layout weaknesses
- Fix empty/dead spaces
- Fix weak hero composition
- Shorten an overly long main hero headline if needed
- Fix incomplete or weak navigation
- Fix weak or underdeveloped footer
- Ensure mobile hamburger menu works
- Ensure tablet spacing is polished
- Improve section balance if needed
- Keep Czech copy
- Keep semantic sections and data-section-id/data-section-type
- Do not explain changes
- Return final repaired bundle only

ORIGINAL PROJECT PROMPT:
${params.prompt}

CURRENT HTML:
${params.html}

CURRENT CSS:
${params.css}

CURRENT JS:
${params.js}
`;
}

async function runJsonModel(input: string, instructions: string) {
  const result = await client.responses.create({
    model: "gpt-5.4",
    instructions,
    input,
  });

  const rawText = result.output_text?.trim() ?? "";
  const cleaned = cleanJsonOutput(rawText);

  try {
    return JSON.parse(extractJson(cleaned)) as WebsiteBundle;
  } catch {
    throw new Error(
      `Model nevrátil validní JSON. Začátek odpovědi: ${rawText.slice(0, 180)}`
    );
  }
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
      return Response.json({ error: "Missing or invalid prompt" }, { status: 400 });
    }

    const planner = await client.responses.create({
      model: "gpt-5.4",
      instructions:
        "You are a precise design strategist. Return only valid JSON. No markdown.",
      input: plannerPrompt({
        prompt,
        buildType,
        model,
        chatHistory,
      }),
    });

    const plannerText = cleanJsonOutput(planner.output_text?.trim() ?? "");
    const brief = JSON.parse(extractJson(plannerText)) as DesignBrief;

    const assets = await resolveImageAssets(
      brief.imagePlan || [],
      brief.industry,
      prompt
    );

    const renderedBundle = await runJsonModel(
      renderPrompt({
        prompt,
        buildType,
        model,
        brief,
        assets,
        chatHistory,
      }),
      "You are an elite web designer and frontend engineer. Return only valid JSON."
    );

    const safeRendered = sanitizeBundle(renderedBundle);

    let safeFinal = safeRendered;

    try {
      const checkedBundle = await runJsonModel(
        selfCheckPrompt({
          prompt,
          html: safeRendered.html,
          css: safeRendered.css,
          js: safeRendered.js,
        }),
        "You are a senior web design QA reviewer and frontend fixer. Return only valid JSON."
      );

      safeFinal = sanitizeBundle(checkedBundle);
    } catch (selfCheckError) {
      console.error("Self-check pass failed in /api/generate:", selfCheckError);
      safeFinal = safeRendered;
    }

    return Response.json({
      html: safeFinal.html,
      css: safeFinal.css,
      js: safeFinal.js,
      brief: {
        industry: brief.industry,
        audience: brief.audience,
        style: `${brief.style} • ${brief.styleDirection}`,
        layoutTone: `${brief.layoutTone} • ${brief.layoutArchetype}`,
      },
      assets,
    });
  } catch (e: any) {
    return Response.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}