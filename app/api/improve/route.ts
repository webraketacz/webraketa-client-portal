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
  source: "pexels" | "fallback";
  photographer?: string;
  photographerUrl?: string;
};

type ImprovePlan = {
  changeSummary: string;
  preserveRules: string[];
  imageRefreshPlan: ImagePlanItem[];
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

async function searchPexelsImage(
  query: string,
  orientation: "landscape" | "portrait" | "square"
): Promise<ResolvedAsset | null> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  const url = new URL("https://api.pexels.com/v1/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "1");
  url.searchParams.set("orientation", orientation);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: apiKey,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

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

  const photo = data.photos?.[0];
  const imageUrl =
    photo?.src?.large2x || photo?.src?.large || photo?.src?.original || "";

  if (!photo || !imageUrl) {
    return null;
  }

  return {
    slot: "",
    url: imageUrl,
    alt: photo.alt || query,
    source: "pexels",
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
  };
}

async function resolveImageAssets(imagePlan: ImagePlanItem[]): Promise<ResolvedAsset[]> {
  const limitedPlan = imagePlan.slice(0, 4);

  const resolved = await Promise.all(
    limitedPlan.map(async (item) => {
      const pexels = await searchPexelsImage(item.query, item.orientation);

      if (pexels) {
        return {
          ...pexels,
          slot: item.slot,
        };
      }

      return {
        slot: item.slot,
        url: fallbackImageUrl(item.query, item.orientation),
        alt: item.query,
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

Nesmíš vrátit markdown. Nesmíš vrátit nic kromě JSON objektu.

Vrať PŘESNĚ tento JSON:
{
  "changeSummary": "string",
  "preserveRules": ["string", "string", "string"],
  "imageRefreshPlan": [
    {
      "slot": "hero",
      "query": "string",
      "placement": "string",
      "mood": "string",
      "orientation": "landscape"
    }
  ]
}

Pravidla:
- preserveRules musí popsat, co se má zachovat
- imageRefreshPlan vyplň jen pokud změna vyžaduje nové nebo lepší fotky
- query piš anglicky
- pokud nejsou nové fotky potřeba, vrať prázdné pole
- pokud web obsahuje prázdná místa, nevyvážené bloky nebo slabé menu, zahrň to do changeSummary
- pokud chybí kvalitní mobilní menu, ber to jako chybu k opravě
- pokud obrázky významově nesedí, navrhni nové

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

TASK:
You are improving an existing website bundle, not blindly recreating a new one from zero.
Preserve the strong parts. Apply the requested changes with precision.

CRITICAL OUTPUT RULES:
- html must contain ONLY the body markup content
- do not return <!DOCTYPE html>
- do not return <html>, <head> or <body>
- css must contain ALL styling needed for the website
- js must contain vanilla JavaScript only
- do not use external libraries
- keep semantic sections with data-section-id and data-section-type
- maintain responsive layout
- preserve working structure unless the instruction requires structural change
- keep a complete polished navigation with CTA
- keep or improve a working mobile hamburger menu
- logo placement can vary if the redesign benefits from it

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
- improve spacing, hierarchy, contrast and clarity
- if new images are provided and relevant, use them meaningfully
- do not break the page
- do not remove major sections unless clearly requested
- keep the website polished and production-like
- use Czech copy
- maintain or improve responsiveness

ANTI-GAP RULES:
- remove dead space and awkward empty areas
- if an image block feels too empty around it, add supporting content or rebalance the composition
- avoid oversized containers with not enough content inside
- ensure sections feel intentionally composed
- fix layouts where image and text do not feel proportionally balanced
- avoid large blank areas under images, cards or stat blocks

NAVIGATION RULES:
- keep at least one strong CTA button in navigation
- ensure mobile hamburger menu works with JavaScript
- mobile menu should open and close cleanly
- menu must remain visually polished after edits

IMAGE RULES:
- if current images are semantically weak, replace them with stronger ones
- do not keep irrelevant generic photos
- use object-fit cover where needed
- ensure image placement supports the section instead of weakening it

FINAL QA BEFORE OUTPUT:
- no obvious empty spaces
- complete navigation with CTA
- working mobile menu
- balanced hero and section compositions
- coherent imagery
- polished responsive result

Return only final JSON object.
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

    const planner = await client.responses.create({
      model: "gpt-5.4",
      instructions:
        "You are a precise AI design editor. Return only valid JSON. No markdown.",
      input: improvePlannerPrompt({
        prompt,
        instruction,
        chatHistory,
        html,
        css,
        js,
      }),
    });

    const plannerText = cleanJsonOutput(planner.output_text?.trim() ?? "");
    const plan = JSON.parse(extractJson(plannerText)) as ImprovePlan;

    const assets = await resolveImageAssets(plan.imageRefreshPlan || []);

    const improved = await client.responses.create({
      model: "gpt-5.4",
      instructions:
        "You are an elite web designer and frontend engineer. Return only valid JSON.",
      input: improveRenderPrompt({
        prompt,
        instruction,
        html,
        css,
        js,
        chatHistory,
        plan,
        assets,
      }),
    });

    const text = cleanJsonOutput(improved.output_text?.trim() ?? "");
    const bundle = JSON.parse(extractJson(text)) as WebsiteBundle;
    const safeBundle = sanitizeBundle(bundle);

    return Response.json({
      html: safeBundle.html,
      css: safeBundle.css,
      js: safeBundle.js,
      assets,
    });
  } catch (e: any) {
    return Response.json(
      { error: e?.message ?? "Improve route failed" },
      { status: 500 }
    );
  }
}