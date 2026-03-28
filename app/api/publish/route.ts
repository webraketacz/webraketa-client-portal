import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type PublishRequest = {
  prompt?: string;
  html?: string;
  css?: string;
  js?: string;
  siteName?: string;
  slug?: string;
  description?: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function buildPublishedHtml({
  html,
  css,
  js,
  siteName,
}: {
  html: string;
  css: string;
  js: string;
  siteName: string;
}) {
  return `<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${siteName}</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
<script>
${js}
</script>
</body>
</html>`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PublishRequest;

    const html = body.html?.trim() || "";
    const css = body.css?.trim() || "";
    const js = body.js || "";
    const siteName = body.siteName?.trim() || "Můj web";
    const slug = slugify(body.slug?.trim() || body.siteName?.trim() || "zyvia-web");

    if (!html || !css) {
      return NextResponse.json(
        { error: "Chybí HTML nebo CSS pro publikaci." },
        { status: 400 }
      );
    }

    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelTeamId = process.env.VERCEL_TEAM_ID;

    if (!vercelToken) {
      return NextResponse.json(
        {
          error:
            "Chybí VERCEL_TOKEN v .env.local. Nejprve ho doplňte a zkuste publikaci znovu.",
        },
        { status: 500 }
      );
    }

    const publishedHtml = buildPublishedHtml({
      html,
      css,
      js,
      siteName,
    });

    const endpoint = new URL("https://api.vercel.com/v13/deployments");
    if (vercelTeamId) {
      endpoint.searchParams.set("teamId", vercelTeamId);
    }

    const payload = {
      name: slug,
      projectSettings: {
        framework: null,
      },
      target: "preview",
      files: [
        {
          file: "index.html",
          data: publishedHtml,
        },
        {
          file: "vercel.json",
          data: JSON.stringify({
            cleanUrls: false,
            trailingSlash: false,
          }),
        },
      ],
      meta: {
        source: "zyvia-ai-editor",
        projectName: siteName,
        note: body.description?.trim() || "",
        prompt: body.prompt?.trim()?.slice(0, 140) || "",
      },
    };

    const res = await fetch(endpoint.toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            data?.message ||
            "Vercel deployment selhal.",
        },
        { status: res.status }
      );
    }

    const url = data?.url ? `https://${data.url}` : "";
    const inspectUrl =
      data?.inspectorUrl || data?.url || data?.id
        ? `https://vercel.com${data?.inspectorUrl || ""}`
        : "";

    return NextResponse.json({
      url,
      inspectUrl,
      deploymentId: data?.id || "",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Publikace selhala na serveru.",
      },
      { status: 500 }
    );
  }
}
