import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return Response.json({ error: "Missing prompt" }, { status: 400 });
    }

    const response = await client.responses.create({
      // klidně změň na model, který máš dostupný
      model: "gpt-5.2",
      instructions:
        "You generate a single, complete HTML file using TailwindCSS via CDN. " +
        "Return ONLY the HTML. No markdown fences. No explanations.",
      input:
        `Create a modern, clean landing page based on this description:\n\n` +
        prompt +
        `\n\nRequirements:\n- Single HTML file\n- Tailwind via <script src='https://cdn.tailwindcss.com'></script>\n- Responsive\n- Hero, features, CTA, footer\n- Use placeholders for images\n- No external JS frameworks`,
    });

    const html = response.output_text?.trim() ?? "";

    if (!html.toLowerCase().includes("<html")) {
      return Response.json(
        { error: "Model did not return valid HTML", raw: html },
        { status: 500 }
      );
    }

    return Response.json({ html });
  } catch (e: any) {
    return Response.json(
      { error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}