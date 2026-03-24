export const runtime = "nodejs";
export const maxDuration = 30;

type AssetPlanItem = {
  slot: string;
  query: string;
  placement: string;
  mood: string;
  orientation: "landscape" | "portrait" | "square";
};

type ResolvedAsset = {
  slot: string;
  url: string;
  alt: string;
  source: "pexels" | "unsplash" | "fallback";
  photographer?: string;
  photographerUrl?: string;
};

type IndustryImageRules = {
  preferred: string[];
  banned: string[];
  fallbackQueries: string[];
};

const IMAGE_FETCH_TIMEOUT_MS = 3500;

function nowMs() {
  return Date.now();
}

function logStep(requestId: string, step: string, startedAt: number, extra?: Record<string, unknown>) {
  const duration = Date.now() - startedAt;
  console.log(
    JSON.stringify({
      scope: "api-resolve-assets",
      requestId,
      step,
      durationMs: duration,
      ...(extra || {}),
    })
  );
}

async function withTimeout<T>(
  promiseFactory: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await promiseFactory(controller.signal);
  } finally {
    clearTimeout(timer);
  }
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
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

function getIndustryImageRules(prompt: string): IndustryImageRules {
  const text = normalizeText(prompt);

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
        "consultation",
        "meeting",
        "business",
        "documents",
        "office",
        "professional",
      ],
      banned: ["mountain", "forest", "beach", "waterfall", "travel", "dog", "cat"],
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
      ],
      banned: ["forest", "mountain", "waterfall", "dog", "cat", "travel"],
      fallbackQueries: [
        "luxury apartment interior",
        "modern real estate office",
        "premium property exterior",
      ],
    };
  }

  if (
    text.includes("klin") ||
    text.includes("doctor") ||
    text.includes("medical") ||
    text.includes("health")
  ) {
    return {
      preferred: [
        "doctor",
        "medical",
        "clinic",
        "healthcare",
        "consultation",
        "patient",
        "interior",
        "clean",
        "professional",
      ],
      banned: ["mountain", "forest", "beach", "travel", "dog", "cat"],
      fallbackQueries: [
        "doctor consultation clinic",
        "modern clinic interior",
        "healthcare professional portrait",
      ],
    };
  }

  if (
    text.includes("saas") ||
    text.includes("startup") ||
    text.includes("software") ||
    text.includes("tech")
  ) {
    return {
      preferred: [
        "dashboard",
        "software",
        "technology",
        "startup",
        "team",
        "office",
        "workspace",
        "laptop",
      ],
      banned: ["mountain", "forest", "beach", "waterfall", "dog", "cat"],
      fallbackQueries: [
        "modern saas dashboard",
        "startup team office",
        "technology workspace laptop",
      ],
    };
  }

  if (
    text.includes("beauty") ||
    text.includes("esthetic") ||
    text.includes("kosmet") ||
    text.includes("derma")
  ) {
    return {
      preferred: [
        "beauty clinic",
        "skin care",
        "facial treatment",
        "beauty consultation",
        "clinic interior",
        "professional",
      ],
      banned: ["mountain", "forest", "beach", "travel", "dog", "cat"],
      fallbackQueries: [
        "beauty clinic consultation",
        "modern beauty clinic interior",
        "skincare treatment woman",
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
    ],
    banned: ["mountain", "forest", "beach", "waterfall", "animal", "travel"],
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
  requestId: string,
  query: string,
  orientation: "landscape" | "portrait" | "square"
) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return [];

  const startedAt = nowMs();

  try {
    const result = await withTimeout(async (signal) => {
      const url = new URL("https://api.pexels.com/v1/search");
      url.searchParams.set("query", query);
      url.searchParams.set("per_page", "4");
      url.searchParams.set("orientation", orientation);

      const res = await fetch(url.toString(), {
        headers: { Authorization: apiKey },
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
            photo?.src?.large2x || photo?.src?.large || photo?.src?.original || "";

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
    }, IMAGE_FETCH_TIMEOUT_MS);

    logStep(requestId, "pexels", startedAt, {
      query,
      orientation,
      count: result.length,
    });

    return result;
  } catch (error: any) {
    logStep(requestId, "pexels-failed", startedAt, {
      query,
      orientation,
      error: error?.message ?? "unknown",
    });
    return [];
  }
}

async function searchUnsplashCandidates(
  requestId: string,
  query: string,
  orientation: "landscape" | "portrait" | "square"
) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return [];

  const startedAt = nowMs();

  try {
    const result = await withTimeout(async (signal) => {
      const orientationMap =
        orientation === "portrait"
          ? "portrait"
          : orientation === "square"
          ? "squarish"
          : "landscape";

      const url = new URL("https://api.unsplash.com/search/photos");
      url.searchParams.set("query", query);
      url.searchParams.set("per_page", "4");
      url.searchParams.set("orientation", orientationMap);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Client-ID ${accessKey}` },
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
    }, IMAGE_FETCH_TIMEOUT_MS);

    logStep(requestId, "unsplash", startedAt, {
      query,
      orientation,
      count: result.length,
    });

    return result;
  } catch (error: any) {
    logStep(requestId, "unsplash-failed", startedAt, {
      query,
      orientation,
      error: error?.message ?? "unknown",
    });
    return [];
  }
}

async function findRelevantImage(params: {
  requestId: string;
  query: string;
  orientation: "landscape" | "portrait" | "square";
  rules: IndustryImageRules;
}) {
  const [pexelsCandidates, unsplashCandidates] = await Promise.all([
    searchPexelsCandidates(params.requestId, params.query, params.orientation),
    searchUnsplashCandidates(params.requestId, params.query, params.orientation),
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
  requestId: string,
  assetPlan: AssetPlanItem[],
  prompt: string
): Promise<ResolvedAsset[]> {
  const limitedPlan = assetPlan.slice(0, 3);
  const rules = getIndustryImageRules(prompt);

  return Promise.all(
    limitedPlan.map(async (item, index) => {
      const startedAt = nowMs();

      try {
        const match = await findRelevantImage({
          requestId,
          query: item.query,
          orientation: item.orientation,
          rules,
        });

        if (match) {
          logStep(requestId, "asset-resolved", startedAt, {
            slot: item.slot,
            source: match.source,
            query: item.query,
          });

          return {
            ...match,
            slot: item.slot,
          };
        }

        const fallbackQuery =
          rules.fallbackQueries[index % rules.fallbackQueries.length];

        logStep(requestId, "asset-fallback", startedAt, {
          slot: item.slot,
          query: fallbackQuery,
        });

        return {
          slot: item.slot,
          url: fallbackImageUrl(fallbackQuery, item.orientation),
          alt: fallbackQuery,
          source: "fallback" as const,
        };
      } catch (error: any) {
        const fallbackQuery =
          rules.fallbackQueries[index % rules.fallbackQueries.length];

        logStep(requestId, "asset-fallback-error", startedAt, {
          slot: item.slot,
          query: fallbackQuery,
          error: error?.message ?? "unknown",
        });

        return {
          slot: item.slot,
          url: fallbackImageUrl(fallbackQuery, item.orientation),
          alt: fallbackQuery,
          source: "fallback" as const,
        };
      }
    })
  );
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const routeStartedAt = nowMs();

  try {
    const bodyStartedAt = nowMs();
    const body = await req.json();
    logStep(requestId, "parse-body", bodyStartedAt);

    const prompt = typeof body?.prompt === "string" ? body.prompt : "";
    const assetPlan = Array.isArray(body?.assetPlan)
      ? (body.assetPlan as AssetPlanItem[])
      : [];

    console.log(
      JSON.stringify({
        scope: "api-resolve-assets",
        requestId,
        step: "start",
        promptLength: prompt.length,
        assetPlanCount: assetPlan.length,
      })
    );

    if (!prompt.trim()) {
      return Response.json({ error: "Chybí prompt." }, { status: 400 });
    }

    if (!assetPlan.length) {
      return Response.json({ assets: [], requestId });
    }

    const resolveStartedAt = nowMs();
    const assets = await resolveImageAssets(requestId, assetPlan, prompt);
    logStep(requestId, "resolve-all-assets", resolveStartedAt, {
      resolvedCount: assets.length,
    });

    logStep(requestId, "done", routeStartedAt, {
      totalMs: Date.now() - routeStartedAt,
    });

    return Response.json({ assets, requestId });
  } catch (e: any) {
    console.error(
      JSON.stringify({
        scope: "api-resolve-assets",
        requestId,
        step: "fatal-error",
        totalMs: Date.now() - routeStartedAt,
        error: e?.message ?? "Unknown error",
        stack: e?.stack || null,
      })
    );

    return Response.json(
      {
        error: e?.message ?? "Resolve assets failed",
        requestId,
      },
      { status: 500 }
    );
  }
}