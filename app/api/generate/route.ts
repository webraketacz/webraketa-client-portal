import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 60;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const WEB_MODEL = process.env.OPENAI_WEB_MODEL || "gpt-4.1";

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

type GeneratedWebsiteBundle = {
  html: string;
  css: string;
  js: string;
  assetPlan: AssetPlanItem[];
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

const generatedWebsiteSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    html: { type: "string" },
    css: { type: "string" },
    js: { type: "string" },
    assetPlan: {
      type: "array",
      maxItems: 3,
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
    assetPlan: Array.isArray(bundle.assetPlan) ? bundle.assetPlan.slice(0, 3) : [],
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
}) {
  return `
You are an elite web designer and frontend developer.

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
- use these ids when relevant: navigation, hero, about, services, properties, references, process, contact, footer
- navigation must be its own section with data-section-id="navigation"
- footer must be its own section with data-section-id="footer"
- add a fully working mobile hamburger navigation
- include a CTA button in the main navigation
- navigation must be complete and visually polished
- footer must be complete and visually polished
- use Czech copy
- avoid giant empty spaces
- keep the result lightweight and production-safe

IMAGE RULES:
- also return assetPlan with at most 3 realistic images
- if an image is needed in html, use a normal <img> and add data-image-slot="<slot>"
- slot values in html must exactly match assetPlan.slot values
- use image slots only where visually meaningful
- if no image is needed, return an empty assetPlan array

COPY RULES:
- hero headline must be short, premium and easy to scan
- prefer roughly 3 to 8 words in the main hero headline
- supporting text should stay concise

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
- short strong hero headline
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

    const renderedBundle = await createStructuredObject<GeneratedWebsiteBundle>({
      model: WEB_MODEL,
      system:
        "You are an elite web designer and frontend engineer. Return only valid JSON.",
      user: renderPrompt({
        prompt,
        buildType,
        model,
        chatHistory,
      }),
      schemaName: "website_bundle_two_step",
      schema: generatedWebsiteSchema,
    });

    const safeRendered = sanitizeBundle(renderedBundle);

    return Response.json({
      html: safeRendered.html,
      css: safeRendered.css,
      js: safeRendered.js,
      assetPlan: safeRendered.assetPlan,
      brief: {
        industry: "",
        audience: "",
        style: "Two-step generation",
        layoutTone: "Structured JSON render",
      },
      assets: [],
      twoStepMode: true,
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