import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `
You are a senior web designer and frontend developer.

Your task is to generate beautiful, modern, premium-quality landing pages as a SINGLE COMPLETE HTML document using Tailwind CSS via CDN.

STRICT RULES:
- Return ONLY raw HTML
- Do not use markdown
- Do not use code fences
- Always return a complete HTML document
- Always include:
  - <!DOCTYPE html>
  - <html lang="cs">
  - <head>
  - <meta charset="UTF-8" />
  - <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  - <script src="https://cdn.tailwindcss.com"></script>
  - <body>
- The design must look premium, modern, polished, visually impressive, and production-like
- Never create a plain or unstyled layout
- Never use default browser blue links
- Never create huge isolated icons without proper composition
- Never return a weak school-project-looking website
- Use strong visual hierarchy, large headings, modern spacing, clean sections, premium CTA buttons
- Use high-quality Tailwind utility classes
- Prefer dark modern UI unless the user's business clearly suggests otherwise
- Use rounded-2xl or rounded-3xl cards
- Use subtle borders, shadows, gradients, glassmorphism-style sections where appropriate
- Use good spacing like py-20, py-24, gap-6, gap-8
- Use professional Czech copywriting, not lorem ipsum
- Make the page responsive
- The website should feel like a real 2025 commercial landing page
- Use multiple rich sections with proper visual composition
- Add large background glows, gradients, split layouts, layered cards, and premium CTA blocks where suitable
- Avoid plain text stacked without containers
- Ensure all links and buttons are styled with Tailwind classes
- Use max-width containers and section spacing consistently
- Make the result look polished inside an iframe preview

DESIGN EXPECTATIONS:
- elegant or sticky navbar
- visually strong hero section with badge, heading, subheading, CTA buttons
- services/features in premium cards
- benefits / why choose us section
- showcase / gallery / process section
- testimonials or references section
- contact section with form
- polished footer
- strong CTA buttons
- consistent spacing and typography

TECHNICAL:
- No external JS frameworks
- Tailwind CDN only
- If images are needed, use elegant placeholder images from https://images.unsplash.com
- Ensure the HTML renders correctly in iframe srcDoc
- Use real Tailwind classes everywhere, not plain HTML
`;

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
<body class="min-h-screen bg-zinc-950 text-white">
${html}
</body>
</html>`;
}

function getBusinessStyleHints(prompt: string) {
  const lower = prompt.toLowerCase();

  if (
    lower.includes("autoservis") ||
    lower.includes("detailing") ||
    lower.includes("auta") ||
    lower.includes("auto")
  ) {
    return `
BUSINESS STYLE HINTS:
- premium automotive dark style
- black / zinc / charcoal background
- accent colors blue, violet, cyan or orange
- bold hero with strong headline
- premium service studio aesthetic
- glossy modern cards
- bold stats strip
- services section in cards
- process timeline
- testimonials
- gallery with premium image cards
- booking CTA section
- use language suitable for a high-end autoservis brand
`;
  }

  if (
    lower.includes("restaurace") ||
    lower.includes("bistro") ||
    lower.includes("kavárna") ||
    lower.includes("cafe")
  ) {
    return `
BUSINESS STYLE HINTS:
- elegant hospitality style
- warm premium atmosphere
- full-width hero image
- menu highlights in cards
- reservation CTA
- refined typography
`;
  }

  if (
    lower.includes("realit") ||
    lower.includes("nemovitost") ||
    lower.includes("developer")
  ) {
    return `
BUSINESS STYLE HINTS:
- premium real estate style
- luxurious layout
- upscale typography
- trust-building stats
- premium property cards
- strong lead generation CTA
`;
  }

  return `
BUSINESS STYLE HINTS:
- premium modern corporate landing page
- elegant section layout
- professional typography
- trust-oriented visual style
- strong call to action
`;
}

function buildUserPrompt(userPrompt: string) {
  return `
Create a visually impressive Czech landing page based on this client description:

CLIENT DESCRIPTION:
${userPrompt}

REQUIRED PAGE STRUCTURE:
1. premium navbar
2. hero section with badge, large headline, supporting text, 2 CTA buttons, visual side composition
3. services/features section using beautiful premium cards
4. benefits / why choose us section
5. showcase / gallery / process section
6. testimonials / references section
7. contact section with styled form and contact info
8. CTA banner before footer
9. polished footer

VISUAL REQUIREMENTS:
- modern premium look
- polished layout
- generous whitespace
- no bland template feel
- strong hierarchy
- clean typography
- modern CTA buttons
- subtle gradients
- elegant shadows
- premium section composition
- beautiful cards
- consistent spacing
- production-quality visual finish
- use max-w-7xl containers
- use bg gradients, glow effects, layered cards, visual depth
- avoid plain lists without card styling
- use strong section backgrounds and separation

NEGATIVE REQUIREMENTS:
- do not create raw simple HTML
- do not create unstyled links
- do not create ugly default lists
- do not create one giant icon as the main visual
- do not create weak spacing
- do not create amateur-looking layout
- do not return mostly plain text blocks

${getBusinessStyleHints(userPrompt)}

IMPORTANT:
Return only the final HTML document.
`;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Missing prompt" }, { status: 400 });
    }

    const response = await client.responses.create({
      model: "gpt-5.2",
      instructions: SYSTEM_PROMPT,
      input: buildUserPrompt(prompt),
    });

    const rawHtml = response.output_text?.trim() ?? "";
    const cleanedHtml = cleanHtmlOutput(rawHtml);
    const safeHtml = ensureHtmlDocument(cleanedHtml);

    if (!safeHtml.toLowerCase().includes("<html")) {
      return Response.json(
        { error: "Model did not return valid HTML", raw: safeHtml },
        { status: 500 }
      );
    }

    return Response.json({ html: safeHtml });
  } catch (e: any) {
    return Response.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}