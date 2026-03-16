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

function extractJson(raw: string) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");

  if (start === -1 || end === -1) {
    throw new Error("Planner did not return valid JSON.");
  }

  return raw.slice(start, end + 1);
}

function cleanHtmlOutput(raw: string) {
  return raw
    .replace(/```html/gi, "")
    .replace(/```/g, "")
    .trim();
}

function ensureHtmlDocument(html: string) {
  const normalized = html.toLowerCase();

  const hasDoctype = normalized.includes("<!doctype html>");
  const hasHtml = normalized.includes("<html");
  const hasHead = normalized.includes("<head>");
  const hasBody = normalized.includes("<body");

  if (hasDoctype && hasHtml && hasHead && hasBody) {
    return html;
  }

  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Generated Website</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-zinc-950 text-white">
${html}
</body>
</html>`;
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

function htmlPrompt(userPrompt: string, brief: DesignBrief) {
  return `
You are a world-class web designer and frontend developer.

Return ONLY a complete HTML document using Tailwind CSS CDN.
No markdown.
No code fences.
No explanation.

MANDATORY:
- Return a full HTML document
- Include <!DOCTYPE html>
- Include <html lang="cs">
- Include <head>
- Include <meta charset="UTF-8" />
- Include <meta name="viewport" content="width=device-width, initial-scale=1.0" />
- Include <script src="https://cdn.tailwindcss.com"></script>
- Must render correctly inside iframe srcDoc

GOAL:
Create a visually distinctive, premium, realistic Czech website.
Avoid repetitive template-like layouts.
Avoid generic "AI made this" look.
Do NOT always generate the same structure or same visual language.
Make composition feel tailored to the business.

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
- strong visual hierarchy
- real 2026 commercial quality
- premium spacing and typography
- one unique hero composition
- make the page visually match the industry
- use modern cards, subtle borders, gradients, shadows, premium CTA buttons
- if the business is clinical, use calmer space and restrained styling
- if the business is automotive or luxury, use bolder contrast and premium drama
- if the business is startup/tech, use sharper sections and stronger conversion blocks
- if the business is hospitality, use warmer and more atmospheric composition
- responsive layout required
- generate Czech copy, not lorem ipsum
- never use default blue links
- never create a weak or school-project-looking page

CONTENT REQUIREMENTS:
- navbar
- hero
- services/features
- proof / trust / references
- process or showcase
- CTA section
- contact section
- footer

OUTPUT:
Return only final HTML.
`;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string" || prompt.trim().length < 8) {
      return Response.json({ error: "Missing or invalid prompt" }, { status: 400 });
    }

    // 1) Planner pass
    const planner = await client.responses.create({
      model: "gpt-5.4",
      instructions:
        "You are a precise design strategist. Return only valid JSON. No markdown.",
      input: plannerPrompt(prompt),
    });

    const plannerText = planner.output_text?.trim() ?? "";
    const brief = JSON.parse(extractJson(plannerText)) as DesignBrief;

    // 2) HTML render pass
    const renderer = await client.responses.create({
      model: "gpt-5.4",
      instructions:
        "You are an elite web designer and frontend engineer. Return only HTML.",
      input: htmlPrompt(prompt, brief),
    });

    const rawHtml = renderer.output_text?.trim() ?? "";
    const cleanedHtml = cleanHtmlOutput(rawHtml);
    const safeHtml = ensureHtmlDocument(cleanedHtml);

    if (!safeHtml.toLowerCase().includes("<html")) {
      return Response.json(
        { error: "Model did not return valid HTML" },
        { status: 500 }
      );
    }

    return Response.json({
      html: safeHtml,
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