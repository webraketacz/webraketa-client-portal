import OpenAI from "openai";

export const runtime = "nodejs";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `
You are a senior Czech web strategist and conversion copywriter.

Your job is to improve a client's raw website brief into a more structured, professional, concise, and useful Czech website description for a web designer and developer.

RULES:
- Write in Czech
- Keep it practical and clear
- Do not invent fake facts
- Improve clarity, structure, and professionalism
- Preserve the original meaning
- Make the output suitable as a website brief
- Return only plain text
- No markdown
- No bullet symbols
- No headings in all caps
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawText = body?.text;
    const businessType = body?.businessType ?? "";
    const preferredStyle = body?.preferredStyle ?? "";
    const brandColors = body?.brandColors ?? "";

    if (!rawText || typeof rawText !== "string") {
      return Response.json({ error: "Chybí text k vylepšení." }, { status: 400 });
    }

    const prompt = `
Vylepši tento popis webu tak, aby byl profesionální, přehledný a vhodný jako zadání pro tvorbu webu.

Obor podnikání:
${businessType || "Neuvedeno"}

Preferovaný styl:
${preferredStyle || "Neuvedeno"}

Barvy značky:
${brandColors || "Neuvedeno"}

Původní text klienta:
${rawText}
`;

    const response = await client.responses.create({
      model: "gpt-5.2",
      instructions: SYSTEM_PROMPT,
      input: prompt,
    });

    const improved = response.output_text?.trim();

    if (!improved) {
      return Response.json({ error: "AI nevrátila žádný text." }, { status: 500 });
    }

    return Response.json({ text: improved });
  } catch (e: any) {
    return Response.json(
      { error: e?.message ?? "Nepodařilo se vylepšit text." },
      { status: 500 }
    );
  }
}