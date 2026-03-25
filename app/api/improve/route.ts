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

  return Array.from(new Set(matches)).slice(0, 20);
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
}) {
  return `
You are a world-class commercial web designer and senior frontend engineer.

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

DESIGN QUALITY RULES:
- improve this section so it feels designed by a strong human designer
- avoid generic template look
- use stronger hierarchy, spacing, alignment and composition
- keep the section consistent with the probable industry and visual tone
- do not overcomplicate markup
- if the instruction is mainly text-related, change mostly the copy
- if the instruction is mainly visual, improve composition without breaking structure
- do NOT silently convert unusual hero direction into a generic left-text/right-image split
- if the user asks for text bottom-left, bottom-center, overlay, framed copy or layered composition, follow that request directly
- improve padding wherever icons, text blocks or cards feel cramped
- if a visual panel or chart feels off, redesign it into a cleaner premium composition

SPACING RULES:
- always add safe baseline inner padding to content wrappers, overlays, cards and text containers
- never leave text visually glued to image edges or viewport edges
- use at minimum:
  - desktop horizontal inner padding: clamp(24px, 4vw, 56px)
  - tablet horizontal inner padding: clamp(20px, 5vw, 40px)
  - mobile horizontal inner padding: clamp(16px, 5vw, 24px)
- if copy is positioned low in the section, ensure protected bottom padding too
- spacing must feel premium and intentional, never cramped

TYPOGRAPHY RULES:
- strengthen hierarchy between heading, body, label and CTA
- do not default to extremely bold headings
- avoid overusing 800 or 900
- vary font weight more elegantly, usually body 400-500 and headings 500-700 unless a display moment truly needs more
- if the section already uses a certain mood, refine it instead of flattening it

CARD, ICON AND INTERNAL SPACING RULES:
- cards must never feel cramped
- preserve or improve internal spacing between icon, title, body and CTA
- use comfortable padding inside feature cards, stat cards, pricing cards and content panels
- if a card feels dense, increase its internal spacing before adding more content
- keep consistent padding across similar cards in the same section

ICON RULES:
- icons must have their own protected visual space
- never let icons sit too close to borders or too close to the heading
- icon wrapper, icon size and text spacing must feel balanced and premium

GRAPH / VISUAL PANEL RULES:
- if this section contains a chart, graph, dashboard preview, bars, nodes or analytics visual, make it visually aligned
- bars must share one baseline
- dots and lines must align to a clean grid
- avoid fake charts that look broken, random or amateur
- if needed, simplify the graphic instead of forcing a bad-looking chart

IMAGE RULES:
- if you use a new image in this section, add data-image-slot="<slot>" to the image element
- assetPlan may contain up to 2 items
- assetPlan.slot values must match the slot values used in sectionHtml
- use concrete English queries
- if no new image is needed, return an empty assetPlan array
- keep image placement editable-friendly and visually meaningful

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
        "You are an elite web designer and frontend engineer. Return only valid JSON.",
      user: improveRenderPrompt({
        prompt,
        instruction,
        selectedSectionId,
        selectedSectionHtml,
        sectionIds,
        chatHistory,
      }),
      schemaName: "improve_section_bundle_spacing_v4",
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