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
  source: "pexels" | "fallback";
  photographer?: string;
  photographerUrl?: string;
};

type WebsiteBundle = {
  html: string;
  css: string;
  js: string;
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
  const limitedPlan = imagePlan.slice(0, 6);

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
- queries musí obsahově odpovídat zadání a nesmí být generické
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
- zvažuj různé typy navigace: left logo, centered logo, split nav, premium editorial nav
- zvažuj různé typy hero layoutu, nejen běžný split screen
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
- footer must include multiple useful groups of links or structured info where appropriate

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
- make the composition clearly reflect the chosen styleDirection and layoutArchetype
- use distinct visual rhythm, contrast and hierarchy
- create meaningful section contrast
- use the provided images where appropriate
- use Czech copy, not lorem ipsum
- ensure responsive design across desktop, tablet and mobile
- avoid giant empty blank blocks
- buttons and forms must look polished
- do not default to the same card style, same radius, same hero shape or same content rhythm every time
- actively vary block treatment, spacing language, card logic and layout composition

ANTI-GAP / COMPOSITION RULES:
- never leave a large empty area next to or under an image without supporting content
- every major hero must feel intentionally filled, not half-empty
- image blocks must use object-fit cover or a balanced composition
- avoid sections where only one corner has content and the rest is dead space
- keep sections vertically balanced
- avoid awkward whitespace especially on desktop and tablet
- tablet layout must be actively tuned so navigation and content spacing do not look broken
- if there are many nav links, resolve them elegantly on tablet
- avoid “same box repeated everywhere” composition

HEADER RULES:
- header must feel premium and deliberate
- use a complete navigation with brand/logo, links and CTA
- mobile header must include functional hamburger
- tablet header spacing and wrapping must be handled carefully
- you may use centered logo or alternative premium navigation structures when appropriate

FOOTER RULES:
- footer must always be well designed, not an afterthought
- footer should include structured columns, useful links, trust/contact info, legal links, CTA or summary where suitable
- footer should visually match the brand tone
- footer must feel complete and commercial-grade
- do not output a weak minimal footer unless the concept truly requires it

TYPOGRAPHY & SHAPE LOGIC:
- choose typography and corner treatment based on industry
- for legal / law / attorney / notary / advisory:
  - use more authoritative, elegant, serious typography
  - use smaller radius or squared blocks where appropriate
  - reduce playful startup aesthetics
  - emphasize order, trust and gravitas
- for startups and saas:
  - cleaner UI geometry, modern contrast, conversion rhythm
- for premium/luxury:
  - editorial hierarchy, refined spacing, less generic UI feel
- for healthcare:
  - clean and calm but still rich and intentional
- do not use the same visual system for every industry

STRUCTURE RULES:
- target at least 8 strong sections when appropriate
- target up to 10 or more sections for richer commercial websites if the prompt supports it
- make sections meaningful, not filler
- include strong header and strong footer as part of the experience
- build a complete page, not just a hero plus a few blocks

IMAGE RULES:
- choose the most semantically fitting provided images
- do not use random irrelevant imagery
- images must support selling the product, not distract from it

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
- Fix incomplete or weak navigation
- Fix weak or underdeveloped footer
- Ensure mobile hamburger menu works
- Ensure tablet spacing is polished
- Improve section balance if needed
- Keep Czech copy
- Keep semantic sections and data-section-id/data-section-type
- Do not explain changes
- Return final repaired bundle only

SELF-CHECK CRITERIA:
1. Are there dead spaces or awkward empty areas?
2. Does the hero feel filled and intentional?
3. Is the navigation complete with CTA?
4. Is the footer truly premium and complete?
5. Does mobile menu work?
6. Does tablet layout look polished?
7. Do images feel relevant?
8. Is the section rhythm visually balanced?
9. Does the page feel production-ready?
10. Are there enough meaningful sections?

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

    const assets = await resolveImageAssets(brief.imagePlan || []);

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