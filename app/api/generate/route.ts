import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type DesignBrief = {
  industry: string;
  audience: string;
  style: string;
  layoutTone: string;
  palette: string[];
  sections: string[];
  headlineAngle: string;
  differentiators: string[];
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

function plannerPrompt(userPrompt: string) {
  return `
Jsi senior brand stratég a webový kreativní ředitel.

Na základě zadání připrav stručný JSON design brief.
Nesmíš vrátit markdown. Nesmíš vrátit nic kromě JSON objektu.

Požadovaný JSON formát:
{
  "industry": "string",
  "audience": "string",
  "style": "string",
  "layoutTone": "string",
  "palette": ["string", "string", "string"],
  "sections": ["string", "string"],
  "headlineAngle": "string",
  "differentiators": ["string", "string", "string"]
}

Důležité:
- přemýšlej nad oborem a udělej odlišný směr podle typu byznysu
- nevracej generické fráze
- style a layoutTone musí být konkrétní, ne obecné
- sections navrhni podle skutečné potřeby daného webu
- palette napiš slovně nebo jako hex kombinaci
- differentiators musí být reálně použitelné na webu

ZADÁNÍ KLIENTA:
${userPrompt}
`;
}

function bundlePrompt(userPrompt: string, brief: DesignBrief) {
  return `
You are a world-class web designer, UX designer and frontend developer.

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
- do not use Bootstrap
- do not use remote assets that may fail
- output must be production-looking and render correctly in an iframe
- CSS must be complete, polished and responsive
- JS should be light and useful (menu toggle, FAQ accordion, subtle interactions if relevant)
- The website must look complete even if JS is empty

GOAL:
Create a premium, visually distinctive Czech website.
It must feel tailored to the business, not template-like.
It must look commercial, polished and modern.

CLIENT PROMPT:
${userPrompt}

DESIGN BRIEF:
- Industry: ${brief.industry}
- Audience: ${brief.audience}
- Style: ${brief.style}
- Layout tone: ${brief.layoutTone}
- Palette: ${brief.palette.join(", ")}
- Headline angle: ${brief.headlineAngle}
- Sections: ${brief.sections.join(", ")}
- Differentiators: ${brief.differentiators.join(", ")}

STRICT DESIGN RULES:
- real premium 2026 quality
- strong typography hierarchy
- strong CTA hierarchy
- tailored hero composition
- polished spacing system
- responsive design required
- refined cards, borders, gradients and shadows where appropriate
- use industry-appropriate mood
- clinical = calmer, cleaner, restrained
- automotive/luxury = bolder, darker, more dramatic
- tech/startup = sharper composition, more conversion-oriented
- hospitality = warmer and more atmospheric
- generate Czech copy, not lorem ipsum
- no generic weak layouts
- no giant empty areas
- do not make it look like a school project

CONTENT REQUIREMENTS:
- navbar
- hero
- services or features
- trust / proof / references
- process / showcase / methodology
- CTA section
- contact section
- footer

TECHNICAL REQUIREMENTS:
- include responsive navbar
- include proper container widths
- include mobile styles
- include visible hover states
- include nice button styles
- include polished section spacing
- include background treatments, gradients or subtle visual effects when suitable
- avoid relying on system defaults
- ensure text contrast is strong

Return only final JSON object.
`;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 8) {
      return Response.json({ error: "Missing or invalid prompt" }, { status: 400 });
    }

    const planner = await client.responses.create({
      model: "gpt-5.4",
      instructions:
        "You are a precise design strategist. Return only valid JSON. No markdown.",
      input: plannerPrompt(prompt),
    });

    const plannerText = cleanJsonOutput(planner.output_text?.trim() ?? "");
    const brief = JSON.parse(extractJson(plannerText)) as DesignBrief;

    const renderer = await client.responses.create({
      model: "gpt-5.4",
      instructions:
        "You are an elite web designer and frontend engineer. Return only valid JSON.",
      input: bundlePrompt(prompt, brief),
    });

    const rendererText = cleanJsonOutput(renderer.output_text?.trim() ?? "");
    const bundle = JSON.parse(extractJson(rendererText)) as WebsiteBundle;
    const safeBundle = sanitizeBundle(bundle);

    return Response.json({
      html: safeBundle.html,
      css: safeBundle.css,
      js: safeBundle.js,
      brief: {
        industry: brief.industry,
        audience: brief.audience,
        style: brief.style,
        layoutTone: brief.layoutTone,
      },
    });
  } catch (e: any) {
    return Response.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}