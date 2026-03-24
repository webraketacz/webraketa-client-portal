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

type SectionBundle = {
  sectionHtml: string;
  sectionCss: string;
  sectionJs: string;
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

const sectionBundleSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    sectionHtml: { type: "string" },
    sectionCss: { type: "string" },
    sectionJs: { type: "string" },
  },
  required: ["sectionHtml", "sectionCss", "sectionJs"],
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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
        "forest",
        "nature",
        "beach",
        "landscape",
        "waterfall",
        "travel",
        "animal",
        "dog",
        "cat",
      ],
      fallbackQueries: [
        "lawyer office consultation",
        "attorney meeting client",
        "law firm interior",
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
  prompt: string
): Promise<ResolvedAsset[]> {
  const limitedPlan = imagePlan.slice(0, 2);
  const rules = getIndustryImageRules(prompt, prompt);

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
    .slice(-12)
    .map((item, index) => `${index + 1}. [${item.role}] ${item.text}`)
    .join("\n");
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

  const allIds = [
    ...normalized.matchAll(/data-section-id=(["'])(.*?)\1/g),
  ].map((match) => match[2]);

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

function improvePlannerPrompt(params: {
  prompt: string;
  instruction: string;
  selectedSectionId: string;
  selectedSectionHtml: string;
  chatHistory?: ChatHistoryItem[];
  html: string;
  css: string;
  js: string;
}) {
  return `
Jsi senior AI design editor a web creative director.

Tvým úkolem je pochopit změnu, kterou uživatel chce provést nad JEDNOU konkrétní sekcí již existujícího webu.

Vrať přesně strukturovaný JSON podle schématu.

DŮLEŽITÉ:
- Upravuje se pouze sekce "${params.selectedSectionId}"
- Nesmíš navrhovat změny, které vyžadují přegenerování celého webu
- preserveRules musí výslovně připomínat, že vše mimo vybranou sekci se zachovává beze změny
- imageRefreshPlan vyplň jen pokud změna vyžaduje nové nebo lepší fotky uvnitř této sekce
- query piš anglicky
- pokud nejsou nové fotky potřeba, vrať prázdné pole
- pokud je instrukce čistě textová, nesnaž se předělávat layout mimo sekci

PŮVODNÍ PROMPT:
${params.prompt}

INSTRUKCE UŽIVATELE:
${params.instruction}

VYBRANÁ SEKCE:
${params.selectedSectionId}

HTML VYBRANÉ SEKCE:
${params.selectedSectionHtml}

HISTORIE CHATU:
${formatChatHistory(params.chatHistory || [])}

CELKOVÉ HTML WEBU (jen pro kontext, ne pro kompletní přepis):
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
  selectedSectionId: string;
  selectedSectionHtml: string;
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

YOU ARE EDITING ONLY ONE SECTION OF AN EXISTING WEBSITE.

CRITICAL RULES:
- return ONLY sectionHtml, sectionCss and sectionJs
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
- keep result production-safe

ORIGINAL PROJECT PROMPT:
${params.prompt}

CURRENT USER INSTRUCTION:
${params.instruction}

SELECTED SECTION ID:
${params.selectedSectionId}

SELECTED SECTION HTML:
${params.selectedSectionHtml}

CHAT HISTORY:
${formatChatHistory(params.chatHistory || [])}

CHANGE SUMMARY:
${params.plan.changeSummary}

PRESERVE RULES:
${params.plan.preserveRules.join("\n")}

NEW IMAGE ASSETS:
${assetsText}

FULL HTML FOR CONTEXT ONLY:
${params.html}

FULL CSS FOR CONTEXT ONLY:
${params.css}

FULL JS FOR CONTEXT ONLY:
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
    const selectedSectionId =
      typeof body?.selectedSectionId === "string" ? body.selectedSectionId : "";
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

    if (!selectedSectionId.trim()) {
      return Response.json(
        { error: "Chybí selectedSectionId. AI musí upravovat jen vybranou sekci." },
        { status: 400 }
      );
    }

    const selectedSectionHtml = extractSectionById(html, selectedSectionId);

    if (!selectedSectionHtml) {
      return Response.json(
        {
          error: `Vybraná sekce "${selectedSectionId}" nebyla v HTML nalezena.`,
        },
        { status: 400 }
      );
    }

    const plan = await createStructuredObject<ImprovePlan>({
      model: OPENAI_PLANNER_MODEL,
      system: "You are a precise AI design editor. Return only valid JSON.",
      user: improvePlannerPrompt({
        prompt,
        instruction,
        selectedSectionId,
        selectedSectionHtml,
        chatHistory,
        html,
        css,
        js,
      }),
      schemaName: "improve_plan",
      schema: improvePlanSchema,
    });

    const assets = await resolveImageAssets(plan.imageRefreshPlan || [], prompt);

    const improvedSection = await createStructuredObject<SectionBundle>({
      model: OPENAI_RENDER_MODEL,
      system:
        "You are an elite web designer and frontend engineer. Return only valid JSON.",
      user: improveRenderPrompt({
        prompt,
        instruction,
        selectedSectionId,
        selectedSectionHtml,
        html,
        css,
        js,
        chatHistory,
        plan,
        assets,
      }),
      schemaName: "improve_section_bundle",
      schema: sectionBundleSchema,
    });

    const safeImprovedSection = sanitizeSectionBundle(improvedSection);
    ensureSectionScope(safeImprovedSection.sectionHtml, selectedSectionId);

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

    return Response.json({
      html: safeFinalBundle.html,
      css: safeFinalBundle.css,
      js: safeFinalBundle.js,
      assets,
      selectedSectionId,
      changedOnlySelectedSection: true,
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