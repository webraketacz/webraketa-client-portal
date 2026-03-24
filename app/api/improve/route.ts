import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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
    assetPlan: Array.isArray(bundle.assetPlan) ? bundle.assetPlan.slice(0, 2) : [],
  };
}

function formatChatHistory(history: ChatHistoryItem[]) {
  if (!history?.length) return "Žádná historie chatu.";

  return history
    .slice(-10)
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
  html: string;
  css: string;
  js: string;
  chatHistory?: ChatHistoryItem[];
}) {
  return `
You are an elite web designer and frontend engineer.

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

IMAGE RULES:
- if you use a new image in this section, add data-image-slot="<slot>" to the image element
- assetPlan may contain up to 2 items
- assetPlan.slot values must match the slot values used in sectionHtml
- if no new image is needed, return an empty assetPlan array

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

    const improvedSection = await createStructuredObject<SectionBundle>({
      model: WEB_MODEL,
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
      }),
      schemaName: "improve_section_bundle_two_step",
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
      assetPlan: safeImprovedSection.assetPlan,
      assets: [],
      selectedSectionId,
      changedOnlySelectedSection: true,
      twoStepMode: true,
      modelUsed: WEB_MODEL,
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