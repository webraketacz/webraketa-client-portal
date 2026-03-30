import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 300;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 0,
  timeout: 180000,
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

type BrandLogoAsset = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

type AttachmentInput = {
  id?: string;
  name?: string;
  kind?: "screenshot" | "file";
};

type SpeedMode = "fast" | "balanced" | "premium";

type LayoutPreference =
  | "auto"
  | "editorial"
  | "split"
  | "asymmetrical"
  | "story"
  | "grid"
  | "luxury";

type VisualStyle =
  | "auto"
  | "clean"
  | "premium"
  | "bold"
  | "editorial"
  | "luxury"
  | "playful";

type AnimationLevel = "minimal" | "subtle" | "rich" | "expressive";

type FontMood =
  | "auto"
  | "geometric"
  | "editorial"
  | "luxury"
  | "trustworthy"
  | "tech"
  | "friendly";

type IconStyle =
  | "auto"
  | "minimal"
  | "outlined"
  | "solid"
  | "custom";

type ButtonStyle =
  | "auto"
  | "soft-pill"
  | "glass"
  | "solid-premium"
  | "outline-elegant"
  | "gradient-glow";

type PromptEnhancerMode =
  | "balanced"
  | "conversion"
  | "premium-brand"
  | "wow-creative";

type DesignReference =
  | "auto"
  | "fintech-neon"
  | "signal-orchestration"
  | "angled-enterprise"
  | "cinematic-resort"
  | "luxury-editorial"
  | "product-commerce"
  | "clean-business"
  | "restaurant-editorial"
  | "barber-premium"
  | "clean-automotive"
  | "service-trades";

type InputMode = "prompt" | "url" | "screenshot" | "html";

type IndustryKind =
  | "fintech"
  | "saas"
  | "real-estate"
  | "resort"
  | "luxury-service"
  | "food-product"
  | "ecommerce-product"
  | "healthcare"
  | "legal"
  | "beauty"
  | "restaurant"
  | "catering"
  | "barber"
  | "hair-salon"
  | "autoservis"
  | "car-dealer"
  | "zednik"
  | "generic-business";

type ClientAnswers = {
  contactDetails?: string;
  styleNotes?: string;
  offerNotes?: string;
  extras?: string;
};

type GenerationPreferences = {
  speedMode?: SpeedMode;
  layoutPreference?: LayoutPreference;
  visualStyle?: VisualStyle;
  animationLevel?: AnimationLevel;
  fontMood?: FontMood;
  iconStyle?: IconStyle;
  designReference?: DesignReference;
  buttonStyle?: ButtonStyle;
  promptEnhancerMode?: PromptEnhancerMode;
  preferredPrimaryColor?: string;
  preferredBackgroundColor?: string;
  contactItems?: string[];
  clientAnswers?: ClientAnswers;
};

type GeneratedWebsiteBundle = {
  html: string;
  css: string;
  js: string;
  assetPlan: AssetPlanItem[];
};

type ReferenceSiteSummary = {
  referenceUrl: string;
  finalUrl: string;
  title: string;
  metaDescription: string;
  headings: string[];
  navLinks: string[];
  ctas: string[];
  firstParagraphs: string[];
  sectionCount: number;
  classHints: string[];
  idHints: string[];
  textSample: string;
  htmlSnippet: string;
};

type ReferenceLayoutFingerprint = {
  heroType:
    | "full-bleed-centered"
    | "split"
    | "editorial-cover"
    | "bottom-left-overlay"
    | "grid"
    | "unknown";
  visualDominance:
    | "vehicle"
    | "architecture"
    | "product"
    | "food"
    | "software-ui"
    | "people-service"
    | "mixed"
    | "unknown";
  sectionSequence: string[];
  density: "airy" | "balanced" | "dense";
  navStyle: "minimal" | "corporate" | "editorial" | "unknown";
  likelyAccentStyle: "lime" | "cyan" | "gold" | "white" | "unknown";
  shouldUseStatsBandAfterHero: boolean;
  heroNeedsSingleDominantSubject: boolean;
  shouldAvoidSplitHero: boolean;
};

type ReferenceScreenshotAnalysis = {
  screenshotAvailable: boolean;
  aboveTheFoldType:
    | "cover-hero"
    | "split-hero"
    | "editorial-cover"
    | "grid-hero"
    | "unknown";
  heroContentAlignment:
    | "center"
    | "left"
    | "right"
    | "bottom-left"
    | "unknown";
  navVisualWeight: "minimal" | "medium" | "heavy" | "unknown";
  firstSectionAfterHero:
    | "stats-band"
    | "services"
    | "gallery"
    | "testimonials"
    | "unknown";
  dominantVisualSubject:
    | "vehicle"
    | "architecture"
    | "product"
    | "food"
    | "ui"
    | "portrait"
    | "mixed"
    | "unknown";
  shouldKeepFullWidthHero: boolean;
  shouldKeepSingleDominantSubject: boolean;
  shouldAvoidSplitHero: boolean;
  mustKeepMotifs: string[];
  forbiddenMistakes: string[];
  colorDirection: string;
  compositionSummary: string;
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
      scope: "api-generate",
      requestId,
      step,
      durationMs: duration,
      ...(extra || {}),
    })
  );
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function escapeHtmlAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sanitizeBrandLogoAsset(value: unknown): BrandLogoAsset | null {
  if (!value || typeof value !== "object") return null;

  const candidate = value as Partial<BrandLogoAsset>;
  const name =
    typeof candidate.name === "string" ? candidate.name.trim().slice(0, 160) : "";
  const mimeType =
    typeof candidate.mimeType === "string"
      ? candidate.mimeType.trim().slice(0, 120)
      : "";
  const dataUrl =
    typeof candidate.dataUrl === "string" ? candidate.dataUrl.trim() : "";

  if (!dataUrl.startsWith("data:image/")) return null;
  if (dataUrl.length > 1_500_000) return null;

  return {
    name: name || "logo",
    mimeType: mimeType || "image/png",
    dataUrl,
  };
}

function buildBrandLogoMarkup(brandLogo: BrandLogoAsset) {
  const altBase = brandLogo.name.replace(/\.[^.]+$/, "").trim() || "Brand logo";

  return `<img src="${escapeHtmlAttr(
    brandLogo.dataUrl
  )}" alt="${escapeHtmlAttr(
    altBase
  )}" class="brand-logo-image" loading="eager" decoding="async" />`;
}

function injectBrandLogoMarkup(
  content: string,
  brandLogo: BrandLogoAsset | null
) {
  if (!content || !brandLogo) return content;
  return content.replace(/__BRAND_LOGO__/g, buildBrandLogoMarkup(brandLogo));
}

function makeDeterministicChoice<T>(input: string, items: T[]): T {
  let hash = 0;

  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }

  return items[hash % items.length];
}

function sanitizeAttachments(value: unknown): AttachmentInput[] {
  if (!Array.isArray(value)) return [];

  return value
    .slice(0, 8)
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const candidate = item as AttachmentInput;

      return {
        id: typeof candidate.id === "string" ? candidate.id : undefined,
        name: typeof candidate.name === "string" ? candidate.name : undefined,
        kind:
          candidate.kind === "screenshot" || candidate.kind === "file"
            ? candidate.kind
            : undefined,
      };
    });
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqStrings(items: string[], max = 12) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const item of items) {
    const value = item.trim();
    const key = value.toLowerCase();

    if (!value || seen.has(key)) continue;
    seen.add(key);
    output.push(value);

    if (output.length >= max) break;
  }

  return output;
}

function sanitizeReferenceUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

function matchTexts(html: string, regex: RegExp, max = 12) {
  const results: string[] = [];

  for (const match of html.matchAll(regex)) {
    const text = stripHtml(match[1] || "");
    if (!text) continue;
    results.push(text);
    if (results.length >= max) break;
  }

  return uniqStrings(results, max);
}

function extractAttributeValues(
  html: string,
  attribute: "class" | "id",
  max = 16
) {
  const regex = new RegExp(`${attribute}=["']([^"']+)["']`, "gi");
  const results: string[] = [];

  for (const match of html.matchAll(regex)) {
    const raw = (match[1] || "").trim();
    if (!raw) continue;

    const parts = raw
      .split(/\s+/)
      .map((item) => item.trim())
      .filter(Boolean);

    for (const part of parts) {
      if (part.length < 3) continue;
      if (/^(js-|is-|has-|aria-|sr-|swiper|slick|embla)/i.test(part)) continue;
      results.push(part);
      if (results.length >= max) {
        return uniqStrings(results, max);
      }
    }
  }

  return uniqStrings(results, max);
}

async function fetchReferenceSiteSummary(
  referenceUrl: string,
  requestId: string
): Promise<ReferenceSiteSummary | null> {
  const startedAt = nowMs();
  const safeUrl = sanitizeReferenceUrl(referenceUrl);

  if (!safeUrl) return null;

  try {
    const res = await fetch(safeUrl, {
      method: "GET",
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ZyviaReferenceBot/1.0; +https://example.com/bot)",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "cs,en;q=0.9",
        "Cache-Control": "no-cache",
      },
    });

    if (!res.ok) {
      throw new Error(`Reference URL returned ${res.status}`);
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("text/html")) {
      throw new Error(`Reference URL is not HTML (${contentType || "unknown"})`);
    }

    const html = await res.text();
    const compactHtml = html.replace(/\s+/g, " ");
    const textOnly = stripHtml(html);

    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const metaDescMatch =
      html.match(
        /<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["'][^>]*>/i
      ) ||
      html.match(
        /<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["'][^>]*>/i
      );

    const headings = matchTexts(html, /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi, 14);

    const navLinks = uniqStrings(
      [
        ...matchTexts(
          html,
          /<(?:nav[\s\S]*?)?<a[^>]*href=["'][^"']+["'][^>]*>([\s\S]*?)<\/a>/gi,
          24
        ),
        ...matchTexts(
          html,
          /<header[\s\S]*?<a[^>]*href=["'][^"']+["'][^>]*>([\s\S]*?)<\/a>/gi,
          24
        ),
      ].filter((item) => item.length >= 2 && item.length <= 30),
      12
    );

    const ctas = uniqStrings(
      [
        ...matchTexts(
          html,
          /<(?:a|button)[^>]*>([\s\S]*?)<\/(?:a|button)>/gi,
          40
        ),
      ].filter((item) => item.length >= 2 && item.length <= 42),
      16
    );

    const firstParagraphs = matchTexts(html, /<p[^>]*>([\s\S]*?)<\/p>/gi, 8)
      .filter((item) => item.length >= 40)
      .slice(0, 5);

    const sectionCount =
      (html.match(/<section\b/gi) || []).length ||
      (html.match(
        /<(div|section)[^>]+(?:hero|section|container|wrapper|grid|feature|content)/gi
      ) || []).length;

    const classHints = extractAttributeValues(html, "class", 18);
    const idHints = extractAttributeValues(html, "id", 12);

    const summary: ReferenceSiteSummary = {
      referenceUrl: safeUrl,
      finalUrl: res.url || safeUrl,
      title: stripHtml(titleMatch?.[1] || ""),
      metaDescription: stripHtml(metaDescMatch?.[1] || ""),
      headings,
      navLinks,
      ctas,
      firstParagraphs,
      sectionCount,
      classHints,
      idHints,
      textSample: textOnly.slice(0, 2500),
      htmlSnippet: compactHtml.slice(0, 18000),
    };

    logStep(requestId, "fetch-reference-summary", startedAt, {
      referenceUrl: safeUrl,
      finalUrl: summary.finalUrl,
      titleLength: summary.title.length,
      headingCount: summary.headings.length,
      navCount: summary.navLinks.length,
      ctaCount: summary.ctas.length,
      sectionCount: summary.sectionCount,
    });

    return summary;
  } catch (error: any) {
    console.error(
      JSON.stringify({
        scope: "api-generate",
        requestId,
        step: "fetch-reference-summary-error",
        referenceUrl: safeUrl,
        error: error?.message || "Unknown reference fetch error",
      })
    );

    return null;
  }
}

async function captureReferenceScreenshot(
  referenceUrl: string,
  requestId: string
): Promise<string | null> {
  const startedAt = nowMs();
  const safeUrl = sanitizeReferenceUrl(referenceUrl);
  if (!safeUrl) return null;

  try {
    const playwright = await import("playwright");
    const browser = await playwright.chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    try {
      const page = await browser.newPage({
        viewport: { width: 1440, height: 2200 },
        deviceScaleFactor: 1,
      });

      await page.goto(safeUrl, {
        waitUntil: "networkidle",
        timeout: 45000,
      });

      await page.screenshot({
        path: undefined,
        type: "jpeg",
        quality: 78,
        fullPage: false,
        animations: "disabled",
      });

      const buffer = await page.screenshot({
        path: undefined,
        type: "jpeg",
        quality: 78,
        fullPage: false,
        animations: "disabled",
      });

      const dataUrl = `data:image/jpeg;base64,${Buffer.from(buffer).toString(
        "base64"
      )}`;

      logStep(requestId, "capture-reference-screenshot", startedAt, {
        referenceUrl: safeUrl,
        screenshotBytes: buffer.length,
      });

      return dataUrl;
    } finally {
      await browser.close();
    }
  } catch (error: any) {
    console.error(
      JSON.stringify({
        scope: "api-generate",
        requestId,
        step: "capture-reference-screenshot-error",
        referenceUrl: safeUrl,
        error: error?.message || "Screenshot capture failed",
      })
    );
    return null;
  }
}

function detectSectionSequence(summary: ReferenceSiteSummary): string[] {
  const haystack = normalizeText(
    [
      summary.title,
      summary.metaDescription,
      ...summary.headings,
      ...summary.navLinks,
      ...summary.ctas,
      ...summary.firstParagraphs,
      ...summary.classHints,
      ...summary.idHints,
      summary.textSample,
    ].join(" ")
  );

  const items: string[] = ["hero"];

  if (
    /stat|cisla|čisla|results|vysledk|reference-count|metric|numbers|let zkusenosti|zakaznik/.test(
      haystack
    )
  ) {
    items.push("stats");
  }

  if (/sluzb|services|offer|nabidka|co delame|co umime/.test(haystack)) {
    items.push("services");
  }

  if (/galer|gallery|realizac|portfolio|ukazk/.test(haystack)) {
    items.push("gallery");
  }

  if (/proces|process|jak to funguje|how it works|postup/.test(haystack)) {
    items.push("process");
  }

  if (/reference|testimonials|hodnocen|reviews/.test(haystack)) {
    items.push("testimonials");
  }

  if (/faq|otazky|question/.test(haystack)) {
    items.push("faq");
  }

  if (/kontakt|contact|mapa|adresa|rezerv/.test(haystack)) {
    items.push("contact");
  }

  return uniqStrings(items, 8);
}

function inferReferenceLayoutFingerprint(
  summary: ReferenceSiteSummary | null,
  industry: IndustryKind
): ReferenceLayoutFingerprint {
  if (!summary) {
    return {
      heroType: "unknown",
      visualDominance:
        industry === "autoservis" || industry === "car-dealer"
          ? "vehicle"
          : industry === "real-estate"
          ? "architecture"
          : industry === "restaurant" || industry === "catering"
          ? "food"
          : industry === "food-product" || industry === "ecommerce-product"
          ? "product"
          : industry === "saas" || industry === "fintech"
          ? "software-ui"
          : "unknown",
      sectionSequence: ["hero", "services", "contact"],
      density: "balanced",
      navStyle: "unknown",
      likelyAccentStyle: "unknown",
      shouldUseStatsBandAfterHero: false,
      heroNeedsSingleDominantSubject: false,
      shouldAvoidSplitHero: false,
    };
  }

  const haystack = normalizeText(
    [
      summary.title,
      summary.metaDescription,
      ...summary.headings,
      ...summary.navLinks,
      ...summary.ctas,
      ...summary.firstParagraphs,
      ...summary.classHints,
      ...summary.idHints,
      summary.textSample,
      summary.htmlSnippet.slice(0, 6000),
    ].join(" ")
  );

  const vehicleScore =
    (haystack.match(
      /auto|car|vehicle|detailing|lak|interier|interi[eé]r|ceramic|keramick|vuz|vůz|myti|myt[ií]|servis/g
    ) || []).length;
  const architectureScore =
    (haystack.match(
      /rezidence|apartman|byt|villa|vila|developer|nemovit|projekt|interier|exterier|lokalita|architecture/g
    ) || []).length;
  const foodScore =
    (haystack.match(
      /menu|rezervace|jidlo|gastro|restaur|bistro|kava|káva|brunch|food|chef/g
    ) || []).length;
  const productScore =
    (haystack.match(/produkt|product|shop|variant|baleni|pack|benefit/g) || [])
      .length;
  const softwareUiScore =
    (haystack.match(
      /dashboard|platform|analytics|workflow|api|software|saas|ui|orchestration|signal/g
    ) || []).length;
  const peopleServiceScore =
    (haystack.match(
      /tym|team|specialista|expert|specialist|owner|zakladatel|people|portrait/g
    ) || []).length;

  let visualDominance: ReferenceLayoutFingerprint["visualDominance"] = "mixed";
  const maxScore = Math.max(
    vehicleScore,
    architectureScore,
    foodScore,
    productScore,
    softwareUiScore,
    peopleServiceScore
  );

  if (maxScore <= 1) {
    visualDominance =
      industry === "autoservis" || industry === "car-dealer"
        ? "vehicle"
        : industry === "real-estate"
        ? "architecture"
        : industry === "restaurant" || industry === "catering"
        ? "food"
        : industry === "food-product" || industry === "ecommerce-product"
        ? "product"
        : industry === "saas" || industry === "fintech"
        ? "software-ui"
        : "unknown";
  } else if (maxScore === vehicleScore) {
    visualDominance = "vehicle";
  } else if (maxScore === architectureScore) {
    visualDominance = "architecture";
  } else if (maxScore === foodScore) {
    visualDominance = "food";
  } else if (maxScore === productScore) {
    visualDominance = "product";
  } else if (maxScore === softwareUiScore) {
    visualDominance = "software-ui";
  } else if (maxScore === peopleServiceScore) {
    visualDominance = "people-service";
  }

  const likelyMinimalNav =
    summary.navLinks.length > 0 && summary.navLinks.length <= 5;
  const likelyEditorial =
    /editorial|cover|story|gallery|full|hero|showcase/.test(haystack) ||
    summary.headings.some((h) => h.length > 40);
  const likelyCorporate =
    summary.navLinks.length >= 5 || /services|faq|contact|process|about/.test(haystack);

  const navStyle: ReferenceLayoutFingerprint["navStyle"] = likelyMinimalNav
    ? "minimal"
    : likelyEditorial
    ? "editorial"
    : likelyCorporate
    ? "corporate"
    : "unknown";

  const density: ReferenceLayoutFingerprint["density"] =
    summary.sectionCount >= 9 || summary.navLinks.length >= 6
      ? "dense"
      : summary.sectionCount <= 4
      ? "airy"
      : "balanced";

  const likelyAccentStyle: ReferenceLayoutFingerprint["likelyAccentStyle"] =
    /lime|green|yellow|rezervovat|book|book now|book a service/.test(haystack)
      ? "lime"
      : /cyan|teal|blue|sky|signal|glow/.test(haystack)
      ? "cyan"
      : /gold|luxury|champagne|beige/.test(haystack)
      ? "gold"
      : /white|clean|minimal/.test(haystack)
      ? "white"
      : "unknown";

  const shouldUseStatsBandAfterHero =
    detectSectionSequence(summary)[1] === "stats" ||
    /let zkusenosti|zakaznik|vycistenych|vyčištěných|metric|numbers|results/.test(
      haystack
    );

  const shouldAvoidSplitHero =
    visualDominance === "vehicle" ||
    visualDominance === "architecture" ||
    navStyle === "minimal" ||
    shouldUseStatsBandAfterHero;

  let heroType: ReferenceLayoutFingerprint["heroType"] = "unknown";

  if (
    shouldAvoidSplitHero &&
    (visualDominance === "vehicle" || visualDominance === "architecture")
  ) {
    heroType = "full-bleed-centered";
  } else if (/bottom left|overlay|cover|immersive/.test(haystack)) {
    heroType = "bottom-left-overlay";
  } else if (likelyEditorial) {
    heroType = "editorial-cover";
  } else if (!shouldAvoidSplitHero && summary.sectionCount >= 5) {
    heroType = "split";
  } else if (summary.sectionCount >= 7) {
    heroType = "grid";
  }

  return {
    heroType,
    visualDominance,
    sectionSequence: detectSectionSequence(summary),
    density,
    navStyle,
    likelyAccentStyle,
    shouldUseStatsBandAfterHero,
    heroNeedsSingleDominantSubject:
      visualDominance === "vehicle" ||
      visualDominance === "architecture" ||
      visualDominance === "product",
    shouldAvoidSplitHero,
  };
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

async function createVisionReferenceAnalysis(params: {
  requestId: string;
  model: string;
  screenshotDataUrl: string;
  referenceSummary?: ReferenceSiteSummary | null;
  fingerprint?: ReferenceLayoutFingerprint | null;
}): Promise<ReferenceScreenshotAnalysis | null> {
  const startedAt = nowMs();

  try {
    const schema = {
      type: "object",
      additionalProperties: false,
      properties: {
        screenshotAvailable: { type: "boolean" },
        aboveTheFoldType: {
          type: "string",
          enum: [
            "cover-hero",
            "split-hero",
            "editorial-cover",
            "grid-hero",
            "unknown",
          ],
        },
        heroContentAlignment: {
          type: "string",
          enum: ["center", "left", "right", "bottom-left", "unknown"],
        },
        navVisualWeight: {
          type: "string",
          enum: ["minimal", "medium", "heavy", "unknown"],
        },
        firstSectionAfterHero: {
          type: "string",
          enum: ["stats-band", "services", "gallery", "testimonials", "unknown"],
        },
        dominantVisualSubject: {
          type: "string",
          enum: [
            "vehicle",
            "architecture",
            "product",
            "food",
            "ui",
            "portrait",
            "mixed",
            "unknown",
          ],
        },
        shouldKeepFullWidthHero: { type: "boolean" },
        shouldKeepSingleDominantSubject: { type: "boolean" },
        shouldAvoidSplitHero: { type: "boolean" },
        mustKeepMotifs: {
          type: "array",
          maxItems: 8,
          items: { type: "string" },
        },
        forbiddenMistakes: {
          type: "array",
          maxItems: 10,
          items: { type: "string" },
        },
        colorDirection: { type: "string" },
        compositionSummary: { type: "string" },
      },
      required: [
        "screenshotAvailable",
        "aboveTheFoldType",
        "heroContentAlignment",
        "navVisualWeight",
        "firstSectionAfterHero",
        "dominantVisualSubject",
        "shouldKeepFullWidthHero",
        "shouldKeepSingleDominantSubject",
        "shouldAvoidSplitHero",
        "mustKeepMotifs",
        "forbiddenMistakes",
        "colorDirection",
        "compositionSummary",
      ],
    };

    const userText = `
Analyze this homepage screenshot as a website reference for rebuilding.

Your job:
- determine the actual above-the-fold composition
- determine if the hero is full-width cover-led or split
- determine the dominant subject
- determine if the first section after hero is a stats band
- determine what MUST be preserved
- determine what mistakes MUST be avoided in a rebuild

REFERENCE SUMMARY:
Title: ${params.referenceSummary?.title || "n/a"}
Meta: ${params.referenceSummary?.metaDescription || "n/a"}
Headings: ${(params.referenceSummary?.headings || []).join(" | ") || "n/a"}
Nav: ${(params.referenceSummary?.navLinks || []).join(" | ") || "n/a"}
CTAs: ${(params.referenceSummary?.ctas || []).join(" | ") || "n/a"}

TEXT FINGERPRINT:
Hero type: ${params.fingerprint?.heroType || "unknown"}
Visual dominance: ${params.fingerprint?.visualDominance || "unknown"}
Section sequence: ${(params.fingerprint?.sectionSequence || []).join(" -> ") || "unknown"}
`;

    const completion = await client.chat.completions.create({
      model: params.model,
      messages: [
        {
          role: "developer",
          content:
            "You are an expert website art director and UI layout analyst. Return only valid JSON.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            {
              type: "image_url",
              image_url: {
                url: params.screenshotDataUrl,
              },
            },
          ] as any,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "reference_screenshot_analysis_v1",
          schema,
          strict: true,
        },
      },
    });

    logStep(params.requestId, "openai:reference-screenshot-analysis", startedAt, {
      model: params.model,
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) return null;

    return JSON.parse(content) as ReferenceScreenshotAnalysis;
  } catch (error: any) {
    console.error(
      JSON.stringify({
        scope: "api-generate",
        requestId: params.requestId,
        step: "reference-screenshot-analysis-error",
        error: error?.message || "Vision reference analysis failed",
      })
    );
    return null;
  }
}

function inferIndustryKind(prompt: string): IndustryKind {
  const text = normalizeText(prompt);

  if (
    text.includes("fintech") ||
    text.includes("payment") ||
    text.includes("platby") ||
    text.includes("bank") ||
    text.includes("finance") ||
    text.includes("penez") ||
    text.includes("money")
  ) {
    return "fintech";
  }

  if (
    text.includes("saas") ||
    text.includes("software") ||
    text.includes("app") ||
    text.includes("platform") ||
    text.includes("automatiz") ||
    text.includes("workflow") ||
    text.includes("integrac")
  ) {
    return "saas";
  }

  if (
    text.includes("realit") ||
    text.includes("makler") ||
    text.includes("nemovit") ||
    text.includes("villa") ||
    text.includes("byt") ||
    text.includes("property") ||
    text.includes("developer") ||
    text.includes("developersky projekt") ||
    text.includes("rezidence")
  ) {
    return "real-estate";
  }

  if (
    text.includes("resort") ||
    text.includes("hotel") ||
    text.includes("wellness") ||
    text.includes("retreat") ||
    text.includes("ubytovani") ||
    text.includes("forest")
  ) {
    return "resort";
  }

  if (
    text.includes("advokat") ||
    text.includes("pravnik") ||
    text.includes("legal") ||
    text.includes("law") ||
    text.includes("notar")
  ) {
    return "legal";
  }

  if (
    text.includes("clinic") ||
    text.includes("klinika") ||
    text.includes("medical") ||
    text.includes("doctor") ||
    text.includes("zubar") ||
    text.includes("ordinace")
  ) {
    return "healthcare";
  }

  if (
    text.includes("beauty") ||
    text.includes("kosmet") ||
    text.includes("salon krasy") ||
    text.includes("esthetic") ||
    text.includes("skincare")
  ) {
    return "beauty";
  }

  if (
    text.includes("barber") ||
    text.includes("barbershop") ||
    text.includes("holic") ||
    text.includes("panske strihani")
  ) {
    return "barber";
  }

  if (
    text.includes("kadernice") ||
    text.includes("kadernictvi") ||
    text.includes("hair salon") ||
    text.includes("strihani vlasu") ||
    text.includes("hairstyle")
  ) {
    return "hair-salon";
  }

  if (
    text.includes("restaurant") ||
    text.includes("restaurace") ||
    text.includes("bistro") ||
    text.includes("cafe") ||
    text.includes("kavarna") ||
    text.includes("gastro") ||
    text.includes("fine dining") ||
    text.includes("osteria")
  ) {
    return "restaurant";
  }

  if (
    text.includes("catering") ||
    text.includes("rozvoz cateringu") ||
    text.includes("firemni catering")
  ) {
    return "catering";
  }

  if (
    text.includes("autoservis") ||
    text.includes("servis aut") ||
    text.includes("oprava aut") ||
    text.includes("mechanik") ||
    text.includes("vymena oleje") ||
    text.includes("detailing")
  ) {
    return "autoservis";
  }

  if (
    text.includes("prodej aut") ||
    text.includes("autobazar") ||
    text.includes("vozy") ||
    text.includes("dealer") ||
    text.includes("cars for sale")
  ) {
    return "car-dealer";
  }

  if (
    text.includes("zednik") ||
    text.includes("zednicke prace") ||
    text.includes("stavba domu") ||
    text.includes("fasady") ||
    text.includes("rekonstrukce") ||
    text.includes("stavebni firma")
  ) {
    return "zednik";
  }

  if (
    text.includes("cukr") ||
    text.includes("sugar") ||
    text.includes("potrav") ||
    text.includes("food")
  ) {
    return "food-product";
  }

  if (
    text.includes("eshop") ||
    text.includes("e-shop") ||
    text.includes("shop") ||
    text.includes("produkt") ||
    text.includes("product")
  ) {
    return "ecommerce-product";
  }

  if (
    text.includes("luxury") ||
    text.includes("premium") ||
    text.includes("boutique")
  ) {
    return "luxury-service";
  }

  return "generic-business";
}

function getIndustryDefaults(industry: IndustryKind) {
  switch (industry) {
    case "fintech":
      return {
        designReference: "fintech-neon" as DesignReference,
        layoutPreference: "split" as LayoutPreference,
        visualStyle: "premium" as VisualStyle,
        fontMood: "tech" as FontMood,
        iconStyle: "outlined" as IconStyle,
        imageMode: "ui-heavy",
      };
    case "saas":
      return {
        designReference: "signal-orchestration" as DesignReference,
        layoutPreference: "grid" as LayoutPreference,
        visualStyle: "premium" as VisualStyle,
        fontMood: "tech" as FontMood,
        iconStyle: "minimal" as IconStyle,
        imageMode: "ui-heavy",
      };
    case "real-estate":
      return {
        designReference: "luxury-editorial" as DesignReference,
        layoutPreference: "editorial" as LayoutPreference,
        visualStyle: "luxury" as VisualStyle,
        fontMood: "editorial" as FontMood,
        iconStyle: "minimal" as IconStyle,
        imageMode: "photo-heavy",
      };
    case "resort":
      return {
        designReference: "cinematic-resort" as DesignReference,
        layoutPreference: "story" as LayoutPreference,
        visualStyle: "luxury" as VisualStyle,
        fontMood: "editorial" as FontMood,
        iconStyle: "minimal" as IconStyle,
        imageMode: "photo-heavy",
      };
    case "restaurant":
      return {
        designReference: "restaurant-editorial" as DesignReference,
        layoutPreference: "story" as LayoutPreference,
        visualStyle: "luxury" as VisualStyle,
        fontMood: "editorial" as FontMood,
        iconStyle: "minimal" as IconStyle,
        imageMode: "photo-heavy",
      };
    case "catering":
      return {
        designReference: "restaurant-editorial" as DesignReference,
        layoutPreference: "split" as LayoutPreference,
        visualStyle: "premium" as VisualStyle,
        fontMood: "friendly" as FontMood,
        iconStyle: "solid" as IconStyle,
        imageMode: "photo-heavy",
      };
    case "barber":
      return {
        designReference: "barber-premium" as DesignReference,
        layoutPreference: "asymmetrical" as LayoutPreference,
        visualStyle: "bold" as VisualStyle,
        fontMood: "trustworthy" as FontMood,
        iconStyle: "solid" as IconStyle,
        imageMode: "photo-heavy",
      };
    case "hair-salon":
      return {
        designReference: "luxury-editorial" as DesignReference,
        layoutPreference: "asymmetrical" as LayoutPreference,
        visualStyle: "luxury" as VisualStyle,
        fontMood: "friendly" as FontMood,
        iconStyle: "minimal" as IconStyle,
        imageMode: "photo-heavy",
      };
    case "autoservis":
      return {
        designReference: "clean-automotive" as DesignReference,
        layoutPreference: "grid" as LayoutPreference,
        visualStyle: "bold" as VisualStyle,
        fontMood: "trustworthy" as FontMood,
        iconStyle: "solid" as IconStyle,
        imageMode: "mixed",
      };
    case "car-dealer":
      return {
        designReference: "clean-automotive" as DesignReference,
        layoutPreference: "split" as LayoutPreference,
        visualStyle: "clean" as VisualStyle,
        fontMood: "geometric" as FontMood,
        iconStyle: "outlined" as IconStyle,
        imageMode: "photo-heavy",
      };
    case "zednik":
      return {
        designReference: "service-trades" as DesignReference,
        layoutPreference: "grid" as LayoutPreference,
        visualStyle: "clean" as VisualStyle,
        fontMood: "trustworthy" as FontMood,
        iconStyle: "solid" as IconStyle,
        imageMode: "mixed",
      };
    case "legal":
      return {
        designReference: "clean-business" as DesignReference,
        layoutPreference: "grid" as LayoutPreference,
        visualStyle: "premium" as VisualStyle,
        fontMood: "trustworthy" as FontMood,
        iconStyle: "outlined" as IconStyle,
        imageMode: "mixed",
      };
    case "healthcare":
      return {
        designReference: "clean-business" as DesignReference,
        layoutPreference: "split" as LayoutPreference,
        visualStyle: "clean" as VisualStyle,
        fontMood: "trustworthy" as FontMood,
        iconStyle: "outlined" as IconStyle,
        imageMode: "mixed",
      };
    case "beauty":
      return {
        designReference: "luxury-editorial" as DesignReference,
        layoutPreference: "asymmetrical" as LayoutPreference,
        visualStyle: "luxury" as VisualStyle,
        fontMood: "luxury" as FontMood,
        iconStyle: "custom" as IconStyle,
        imageMode: "photo-heavy",
      };
    case "food-product":
      return {
        designReference: "product-commerce" as DesignReference,
        layoutPreference: "split" as LayoutPreference,
        visualStyle: "clean" as VisualStyle,
        fontMood: "friendly" as FontMood,
        iconStyle: "solid" as IconStyle,
        imageMode: "product-heavy",
      };
    case "ecommerce-product":
      return {
        designReference: "product-commerce" as DesignReference,
        layoutPreference: "grid" as LayoutPreference,
        visualStyle: "bold" as VisualStyle,
        fontMood: "geometric" as FontMood,
        iconStyle: "solid" as IconStyle,
        imageMode: "product-heavy",
      };
    case "luxury-service":
      return {
        designReference: "luxury-editorial" as DesignReference,
        layoutPreference: "editorial" as LayoutPreference,
        visualStyle: "luxury" as VisualStyle,
        fontMood: "editorial" as FontMood,
        iconStyle: "minimal" as IconStyle,
        imageMode: "mixed",
      };
    default:
      return {
        designReference: "clean-business" as DesignReference,
        layoutPreference: "grid" as LayoutPreference,
        visualStyle: "premium" as VisualStyle,
        fontMood: "geometric" as FontMood,
        iconStyle: "minimal" as IconStyle,
        imageMode: "mixed",
      };
  }
}

function resolveCreativeDirection(
  prompt: string,
  prefs: GenerationPreferences,
  fingerprint?: ReferenceLayoutFingerprint | null,
  screenshotAnalysis?: ReferenceScreenshotAnalysis | null
) {
  const industry = inferIndustryKind(prompt);
  const industryDefaults = getIndustryDefaults(industry);

  const fallbackAnimation =
    industry === "fintech" || industry === "saas"
      ? "rich"
      : industry === "resort" ||
        industry === "beauty" ||
        industry === "restaurant" ||
        industry === "real-estate"
      ? "subtle"
      : "subtle";

  const layoutSeedPool = {
    fintech: [
      "hero-center-dashboard-below",
      "offset-bottom-left-copy",
      "framed-hero-with-floating-ui",
      "stacked-analytics-panels",
      "full-bleed-dark-hero-with-overlay-copy",
      "glassy-signal-columns",
    ],
    saas: [
      "hero-center-dashboard-below",
      "offset-bottom-left-copy",
      "stacked-storyflow",
      "grid-led-platform-layout",
      "observability-hub-layout",
      "floating-control-room-hero",
    ],
    realEstateCover: [
      "full-bleed-editorial-property-cover",
      "centered-crest-navigation-with-cover-image",
      "bottom-left-copy-over-architecture-shot",
      "oversized-serif-copy-on-airy-canvas",
      "gallery-led-development-microsite",
      "editorial-project-cover-with-thin-dividers",
    ],
    resort: [
      "full-bleed-photo-editorial",
      "bottom-left-copy-over-photo",
      "immersive-cinematic-hero",
      "story-led-split-panels",
      "framed-photo-window-hero",
      "layered-editorial-cover",
    ],
    restaurant: [
      "full-bleed-photo-editorial",
      "bottom-left-copy-over-photo",
      "editorial-story-menu-flow",
      "floating-reservation-panel",
      "hero-top-right-copy-over-image",
      "stacked-gallery-cover-hero",
    ],
    product: [
      "product-hero-with-packshot",
      "benefit-led-commerce-layout",
      "clean-product-split",
      "bento-product-panels",
      "bottom-anchored-product-copy",
      "hero-with-overlap-packshot-cards",
    ],
    automotiveCover: [
      "full-bleed-vehicle-cover",
      "clean-automotive-hero-cover",
      "centered-vehicle-showcase",
      "bottom-left-copy-over-car-shot",
      "angled-vehicle-cover-layout",
      "wide-vehicle-silhouette-hero",
    ],
    automotiveSplit: [
      "clean-automotive-hero",
      "trust-led-service-grid",
      "split-vehicle-showcase",
      "service-dashboard-clean",
      "bottom-left-copy-over-car-shot",
      "angled-vehicle-cover-layout",
    ],
    trades: [
      "trust-led-service-grid",
      "clean-process-layout",
      "split-service-hero",
      "practical-bento-layout",
      "bottom-left-copy-over-project-shot",
      "framed-construction-cover",
    ],
    luxury: [
      "editorial-cover-layout",
      "framed-luxury-hero",
      "bottom-left-copy-over-visual",
      "airy-serif-hero-with-gallery-rhythm",
      "layered-brand-story-layout",
      "offset-luxury-panels",
    ],
    generic: [
      "hero-center-dashboard-below",
      "stacked-storyflow",
      "asymmetric-panel-composition",
      "disciplined-bento-layout",
      "bottom-left-copy-over-visual",
      "hero-with-layered-overlap-cards",
    ],
  };

  const hardAvoidSplit =
    Boolean(fingerprint?.shouldAvoidSplitHero) ||
    Boolean(screenshotAnalysis?.shouldAvoidSplitHero) ||
    Boolean(screenshotAnalysis?.shouldKeepFullWidthHero);

  const seedChoices =
    industry === "fintech"
      ? layoutSeedPool.fintech
      : industry === "saas"
      ? layoutSeedPool.saas
      : industry === "real-estate"
      ? layoutSeedPool.realEstateCover
      : industry === "resort"
      ? layoutSeedPool.resort
      : industry === "restaurant" || industry === "catering"
      ? layoutSeedPool.restaurant
      : industry === "food-product" || industry === "ecommerce-product"
      ? layoutSeedPool.product
      : industry === "autoservis" || industry === "car-dealer"
      ? hardAvoidSplit
        ? layoutSeedPool.automotiveCover
        : layoutSeedPool.automotiveSplit
      : industry === "zednik"
      ? layoutSeedPool.trades
      : industry === "luxury-service" || industry === "beauty"
      ? layoutSeedPool.luxury
      : layoutSeedPool.generic;

  const layoutSeed = makeDeterministicChoice(`${prompt}-seed`, seedChoices);

  return {
    industry,
    imageMode: industryDefaults.imageMode,
    speedMode: prefs.speedMode || "premium",
    layoutPreference:
      prefs.layoutPreference && prefs.layoutPreference !== "auto"
        ? prefs.layoutPreference
        : industryDefaults.layoutPreference,
    visualStyle:
      prefs.visualStyle && prefs.visualStyle !== "auto"
        ? prefs.visualStyle
        : industryDefaults.visualStyle,
    animationLevel: prefs.animationLevel || fallbackAnimation,
    fontMood:
      prefs.fontMood && prefs.fontMood !== "auto"
        ? prefs.fontMood
        : industryDefaults.fontMood,
    iconStyle:
      prefs.iconStyle && prefs.iconStyle !== "auto"
        ? prefs.iconStyle
        : industryDefaults.iconStyle,
    designReference:
      prefs.designReference && prefs.designReference !== "auto"
        ? prefs.designReference
        : industryDefaults.designReference,
    buttonStyle: prefs.buttonStyle || "auto",
    promptEnhancerMode: prefs.promptEnhancerMode || "premium-brand",
    preferredPrimaryColor: prefs.preferredPrimaryColor?.trim() || "",
    preferredBackgroundColor: prefs.preferredBackgroundColor?.trim() || "",
    contactItems: Array.isArray(prefs.contactItems) ? prefs.contactItems : [],
    clientAnswers: prefs.clientAnswers || {},
    layoutSeed,
  };
}

function getDesignReferenceRecipe(designReference: DesignReference) {
  switch (designReference) {
    case "fintech-neon":
      return `
REFERENCE FAMILY: FINTECH NEON
- dark premium fintech look
- deep navy / black base with electric cyan, indigo or violet accents
- luminous vertical beams, soft glow columns or layered light bars
- large conversion headline on one side or bottom-anchored over visual if fitting seed
- product / analytics / payment mockups may sit beside, below or layered behind content
- pill navigation, glassy panels, elegant CTA glow`;

    case "signal-orchestration":
      return `
REFERENCE FAMILY: SIGNAL ORCHESTRATION
- dark interface-led system design
- glass navigation, cyan / teal glow, HUD feeling
- radial arcs, rings, targeting lines, orchestration grid overlays
- central hero or offset-copy hero with strong system-message headline
- product panel may be below hero instead of always to the right`;

    case "angled-enterprise":
      return `
REFERENCE FAMILY: ANGLED ENTERPRISE
- bold enterprise composition with angled section transitions
- dark premium bands with strong statistics and trust sections
- orbital glow, subtle sci-fi depth, clean readability`;

    case "cinematic-resort":
      return `
REFERENCE FAMILY: CINEMATIC RESORT
- immersive full-screen photography
- editorial luxury composition
- oversized display headline
- atmospheric overlays and cinematic mood`;

    case "luxury-editorial":
      return `
REFERENCE FAMILY: LUXURY EDITORIAL
- premium editorial composition
- refined serif or contrast typography
- strong image-led sections
- asymmetry, generous spacing, layered cards and elegant separators`;

    case "product-commerce":
      return `
REFERENCE FAMILY: PRODUCT COMMERCE
- clean commercial product presentation
- bright or softly premium background
- product packshots, ingredient / benefit visuals, lifestyle photos
- strong product CTA, variants, trust points, FAQ`;

    case "restaurant-editorial":
      return `
REFERENCE FAMILY: RESTAURANT EDITORIAL
- immersive food photography
- elegant dining mood
- refined editorial typography
- reservation CTA, menu highlights, atmosphere and story`;

    case "barber-premium":
      return `
REFERENCE FAMILY: BARBER PREMIUM
- masculine or premium grooming identity
- stronger contrast, sharp typography, dark or warm palette
- service cards, craft story, gallery, booking CTA`;

    case "clean-automotive":
      return `
REFERENCE FAMILY: CLEAN AUTOMOTIVE
- clean, trustworthy, corporate automotive styling
- strong service hierarchy
- useful for autoservis and dealers`;

    case "service-trades":
      return `
REFERENCE FAMILY: SERVICE TRADES
- clean commercial local service website
- practical trust-first structure
- clear services, realizace, process, references, contact`;

    case "clean-business":
      return `
REFERENCE FAMILY: CLEAN BUSINESS
- modern commercial website
- balanced spacing, structured sections, clear conversion hierarchy`;

    default:
      return `
REFERENCE FAMILY: AUTO
- choose the strongest fitting premium commercial family for the business
- do not fall back to a generic template`;
  }
}

function getIndustrySpecificRules(industry: IndustryKind, imageMode: string) {
  switch (industry) {
    case "food-product":
      return `
INDUSTRY RULES: FOOD PRODUCT
- commercial product website
- use 2 to 4 meaningful product / ingredient / packaging / lifestyle images
- product images are REQUIRED`;

    case "restaurant":
      return `
INDUSTRY RULES: RESTAURANT
- food photography is central
- reservation CTA should be clear
- menu highlights, atmosphere, story, visit section and map make sense
- for fine dining, prefer restraint, typography, editorial rhythm and refined luxury`;

    case "catering":
      return `
INDUSTRY RULES: CATERING
- use food and event imagery
- emphasize nabídka, akce, rozvoz, kontakt, poptávka`;

    case "barber":
      return `
INDUSTRY RULES: BARBER
- use craft / portrait / interior imagery
- focus on služby, styl, galerie, tým, rezervace`;

    case "hair-salon":
      return `
INDUSTRY RULES: HAIR SALON
- use salon / portrait / styling imagery
- focus on služby, proměny, rezervace, kontakt`;

    case "autoservis":
      return `
INDUSTRY RULES: AUTOSERVIS
- clean trustworthy company site
- use garage, mechanic, service bay or car maintenance imagery
- focus on služby, ceník, objednání, důvěra, kontakt
- if the reference is vehicle-led, the hero must be vehicle-led too`;

    case "car-dealer":
      return `
INDUSTRY RULES: CAR DEALER
- clean corporate vehicle sales site
- vehicle images are important
- structure can include nabídka vozů, výhody, financování, reference, kontakt
- if the reference is vehicle-led, the hero must be vehicle-led too`;

    case "zednik":
      return `
INDUSTRY RULES: MASONRY / CONSTRUCTION TRADES
- practical trustworthy local service website
- use project / facade / construction imagery
- include služby, realizace, proces, reference, kontakt`;

    case "ecommerce-product":
      return `
INDUSTRY RULES: E-COMMERCE PRODUCT
- product or category images are REQUIRED
- use a conversion-first commerce structure`;

    case "resort":
      return `
INDUSTRY RULES: RESORT / HOSPITALITY
- immersive image-led design
- atmosphere matters more than generic cards`;

    case "real-estate":
      return `
INDUSTRY RULES: REAL ESTATE / DEVELOPMENT PROJECT
- use architecture / interior / exterior imagery
- premium editorial composition
- large full-bleed visuals and airy sections are welcome`;

    case "fintech":
      return `
INDUSTRY RULES: FINTECH
- dark premium product direction is appropriate
- product mockups, data panels and trust blocks are allowed`;

    case "saas":
      return `
INDUSTRY RULES: SAAS / SOFTWARE
- interface-led design is appropriate
- richer gradients, glows, animated borders, polished microinteractions are welcome`;

    default:
      return `
INDUSTRY RULES:
- keep imagery and layout aligned with the business
- image mode: ${imageMode}`;
  }
}

function formatChatHistory(history: ChatHistoryItem[]) {
  if (!history?.length) return "Žádná historie chatu.";

  return history
    .slice(-4)
    .map((item, index) => `${index + 1}. [${item.role}] ${item.text}`)
    .join("\n");
}

function renderReferenceSummary(summary?: ReferenceSiteSummary | null) {
  if (!summary) {
    return `
REFERENCE SITE ANALYSIS:
- unavailable
- if URL fetch fails, use prompt only as a fallback source`;
  }

  return `
REFERENCE SITE ANALYSIS:
- Requested URL: ${summary.referenceUrl}
- Final URL after redirects: ${summary.finalUrl}
- Title: ${summary.title || "n/a"}
- Meta description: ${summary.metaDescription || "n/a"}
- Main headings: ${summary.headings.length ? summary.headings.join(" | ") : "n/a"}
- Navigation labels: ${summary.navLinks.length ? summary.navLinks.join(" | ") : "n/a"}
- CTA labels: ${summary.ctas.length ? summary.ctas.join(" | ") : "n/a"}
- First paragraphs: ${
    summary.firstParagraphs.length ? summary.firstParagraphs.join(" | ") : "n/a"
  }
- Estimated section count: ${summary.sectionCount || 0}
- CSS class hints: ${summary.classHints.length ? summary.classHints.join(", ") : "n/a"}
- ID hints: ${summary.idHints.length ? summary.idHints.join(", ") : "n/a"}
- Text sample:
${summary.textSample || "n/a"}

REFERENCE REBUILD RULES:
- the reference site analysis is the PRIMARY layout source
- rebuild a website that is structurally and visually close to the reference
- preserve the hero logic, navigation logic, CTA placement, section rhythm, spacing density and composition
- preserve the approximate section ordering when useful
- preserve the overall visual energy and dominant motif if present
- do NOT collapse into a generic industry template
- do NOT copy the original brand, company name, logo or exact copy
- create a fresh branded website inspired by the reference structure`;
}

function renderLayoutFingerprint(
  fingerprint?: ReferenceLayoutFingerprint | null
) {
  if (!fingerprint) {
    return `
REFERENCE LAYOUT FINGERPRINT:
- unavailable`;
  }

  return `
REFERENCE LAYOUT FINGERPRINT:
- Hero type: ${fingerprint.heroType}
- Visual dominance: ${fingerprint.visualDominance}
- Section sequence: ${
    fingerprint.sectionSequence.length
      ? fingerprint.sectionSequence.join(" -> ")
      : "unknown"
  }
- Density: ${fingerprint.density}
- Navigation style: ${fingerprint.navStyle}
- Likely accent style: ${fingerprint.likelyAccentStyle}
- Stats band after hero: ${fingerprint.shouldUseStatsBandAfterHero ? "yes" : "no"}
- Single dominant hero subject: ${
    fingerprint.heroNeedsSingleDominantSubject ? "yes" : "no"
  }
- Avoid split hero: ${fingerprint.shouldAvoidSplitHero ? "yes" : "no"}

ANTI-GENERIC REBUILD RULES:
- if the reference hero is full-bleed or cover-led, you MUST NOT switch to a left-text-right-image split hero
- if the reference uses one dominant subject across the hero, keep one dominant subject across the hero
- if the reference places stats directly under the hero, preserve a stats band immediately after the hero
- do not replace a wide-cover composition with a boxed side-image composition
- do not turn a minimal navigation reference into a heavy corporate nav

ASSET CONSISTENCY RULES:
- image queries must follow the detected industry AND the reference motif
- do not use unrelated lifestyle imagery
- for automotive references, never use coffee, restaurant, hotel, office or generic indoor imagery
- for vehicle-led references, the main hero image slot must be vehicle-led
- for architecture-led references, the main hero image slot must be architecture-led`;
}

function renderScreenshotAnalysis(
  analysis?: ReferenceScreenshotAnalysis | null
) {
  if (!analysis) {
    return `
REFERENCE SCREENSHOT ANALYSIS:
- unavailable`;
  }

  return `
REFERENCE SCREENSHOT ANALYSIS:
- Screenshot available: ${analysis.screenshotAvailable ? "yes" : "no"}
- Above the fold type: ${analysis.aboveTheFoldType}
- Hero content alignment: ${analysis.heroContentAlignment}
- Nav visual weight: ${analysis.navVisualWeight}
- First section after hero: ${analysis.firstSectionAfterHero}
- Dominant visual subject: ${analysis.dominantVisualSubject}
- Keep full width hero: ${analysis.shouldKeepFullWidthHero ? "yes" : "no"}
- Keep single dominant subject: ${
    analysis.shouldKeepSingleDominantSubject ? "yes" : "no"
  }
- Avoid split hero: ${analysis.shouldAvoidSplitHero ? "yes" : "no"}
- Must keep motifs: ${analysis.mustKeepMotifs.join(" | ") || "n/a"}
- Forbidden mistakes: ${analysis.forbiddenMistakes.join(" | ") || "n/a"}
- Color direction: ${analysis.colorDirection || "n/a"}
- Composition summary: ${analysis.compositionSummary || "n/a"}

SCREENSHOT REBUILD LOCK RULES:
- follow the screenshot composition more strongly than generic industry defaults
- if the screenshot reads as a cover hero, keep a cover hero
- if the screenshot reads as centered text over one dominant visual, preserve that family
- if the screenshot reads as a stats band after hero, keep that band after hero
- do not drift into unrelated photo themes or card layouts`;
}

function renderInputModeContext(params: {
  inputMode: InputMode;
  referenceUrl?: string;
  referenceHtml?: string;
  referenceSummary?: ReferenceSiteSummary | null;
  layoutFingerprint?: ReferenceLayoutFingerprint | null;
  screenshotAnalysis?: ReferenceScreenshotAnalysis | null;
  attachments: AttachmentInput[];
}) {
  const lines: string[] = [];

  lines.push(`INPUT MODE: ${params.inputMode}`);

  if (params.inputMode === "url" && params.referenceUrl?.trim()) {
    lines.push(`REFERENCE URL: ${params.referenceUrl.trim()}`);
  }

  if (params.inputMode === "html" && params.referenceHtml?.trim()) {
    lines.push("REFERENCE HTML PROVIDED: yes");
    lines.push(
      `REFERENCE HTML SNIPPET:\n${params.referenceHtml.trim().slice(0, 6000)}`
    );
  }

  if (
    params.inputMode === "screenshot" ||
    params.attachments.some((item) => item.kind === "screenshot")
  ) {
    lines.push("SCREENSHOT ATTACHMENTS PROVIDED: yes");
  }

  if (params.attachments.length > 0) {
    lines.push(
      `ATTACHMENTS: ${params.attachments
        .map((item) => `${item.kind || "file"}:${item.name || "unknown"}`)
        .join(", ")}`
    );
  }

  if (params.inputMode === "url") {
    lines.push(renderReferenceSummary(params.referenceSummary));
    lines.push(renderLayoutFingerprint(params.layoutFingerprint));
    lines.push(renderScreenshotAnalysis(params.screenshotAnalysis));
  }

  lines.push(`
PRIMARY SOURCE PRIORITY:
- if input mode is "url", the fetched and analyzed reference URL is the PRIMARY source of layout and visual direction
- if input mode is "html", the provided HTML is the PRIMARY source of structure and section logic
- if input mode is "screenshot", screenshot attachments are the PRIMARY source of visual composition
- if input mode is "prompt", the text prompt is the PRIMARY source

URL MODE RULES:
- when input mode is "url", do NOT generate a generic website based mainly on the text prompt
- use the text prompt only as a SECONDARY instruction layer
- rebuild from the fetched reference analysis first
- preserve section hierarchy, spacing rhythm, visual density, hero composition, navigation style and CTA placement
- do NOT copy the original brand, logo, company name, product names or exact text
- do NOT clone the original website literally
- create a fresh branded version with the user's own content, logo and direction

HTML MODE RULES:
- use the provided HTML as the main structural reference
- preserve the strongest layout logic and section ordering where sensible
- improve quality, spacing, consistency and premium feel
- do not simply echo raw HTML patterns without refinement

SCREENSHOT MODE RULES:
- use screenshots as the main source of composition, mood and hierarchy
- infer structure from the screenshot
- reproduce the visual direction in a cleaner and more production-ready way
`);

  return lines.join("\n");
}

function renderPrompt(params: {
  prompt: string;
  buildType?: string;
  model?: string;
  chatHistory?: ChatHistoryItem[];
  preferences: ReturnType<typeof resolveCreativeDirection>;
  brandLogo?: BrandLogoAsset | null;
  inputMode: InputMode;
  referenceUrl?: string;
  referenceHtml?: string;
  referenceSummary?: ReferenceSiteSummary | null;
  layoutFingerprint?: ReferenceLayoutFingerprint | null;
  screenshotAnalysis?: ReferenceScreenshotAnalysis | null;
  attachments: AttachmentInput[];
}) {
  const isAutomotiveReference =
    params.layoutFingerprint?.visualDominance === "vehicle" ||
    params.screenshotAnalysis?.dominantVisualSubject === "vehicle" ||
    params.preferences.industry === "autoservis" ||
    params.preferences.industry === "car-dealer";

  return `
You are a world-class commercial web designer, art director and senior frontend developer.

Return ONLY a structured JSON object matching the schema.

PRIMARY GOAL:
Create a premium commercial website that feels custom-designed for this exact business.
It must not feel like a recycled template.

MOST IMPORTANT PRIORITY:
If the client explicitly described a style, fonts, mood, contact details, content or visual direction,
those explicit client instructions OVERRIDE automatic defaults.

CLIENT EXPLICIT ANSWERS:
- Contact details: ${params.preferences.clientAnswers.contactDetails || "neuvedeno"}
- Style notes: ${params.preferences.clientAnswers.styleNotes || "neuvedeno"}
- Offer notes: ${params.preferences.clientAnswers.offerNotes || "neuvedeno"}
- Extra notes: ${params.preferences.clientAnswers.extras || "neuvedeno"}

OUTPUT RULES:
- html must contain ONLY body markup content
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
- navigation must be its own section with data-section-id="navigation"
- footer must be its own section with data-section-id="footer"
- add a fully working mobile hamburger navigation
- include a CTA button in the main navigation
- footer must be complete and visually polished

BRAND LOGO RULES:
${
  params.brandLogo
    ? `- a real uploaded logo exists for this project
- when rendering the navigation and any footer brand area, place the exact token __BRAND_LOGO__ where the real logo should appear
- wrap that token in a tasteful logo container or link
- do not invent a generic text logo if a real brand logo is available`
    : `- if no real logo is provided, create an elegant text or monogram logo treatment`
}

SELECTED CREATIVE DIRECTION:
- Detected industry: ${params.preferences.industry}
- Image mode: ${params.preferences.imageMode}
- Speed mode: ${params.preferences.speedMode}
- Layout preference: ${params.preferences.layoutPreference}
- Visual style: ${params.preferences.visualStyle}
- Animation level: ${params.preferences.animationLevel}
- Font mood: ${params.preferences.fontMood}
- Icon style: ${params.preferences.iconStyle}
- Design reference: ${params.preferences.designReference}
- Button style: ${params.preferences.buttonStyle}
- Prompt enhancer mode: ${params.preferences.promptEnhancerMode}
- Preferred primary color: ${params.preferences.preferredPrimaryColor || "auto"}
- Preferred background color: ${params.preferences.preferredBackgroundColor || "auto"}
- Layout seed: ${params.preferences.layoutSeed}
- Contact items to show: ${
    params.preferences.contactItems.length
      ? params.preferences.contactItems.join(", ")
      : "phone, email, office, CTA form"
  }

${getDesignReferenceRecipe(params.preferences.designReference)}

${getIndustrySpecificRules(
    params.preferences.industry,
    params.preferences.imageMode
  )}

INPUT CONTEXT:
${renderInputModeContext({
  inputMode: params.inputMode,
  referenceUrl: params.referenceUrl,
  referenceHtml: params.referenceHtml,
  referenceSummary: params.referenceSummary,
  layoutFingerprint: params.layoutFingerprint,
  screenshotAnalysis: params.screenshotAnalysis,
  attachments: params.attachments,
})}

HARD TECHNICAL LAYOUT CONSTRAINTS:
- the page must use stable wrappers and predictable layout primitives
- all important sections must use max-width container + auto margins, disciplined grid, or disciplined flexbox
- avoid fragile absolute positioning for primary readable copy
- every section must remain visually stable at desktop, tablet and mobile
- no section may look unfinished when content length changes moderately

MANDATORY SAFE CONTAINER RULES:
- all main content must sit inside a max-width container
- desktop content width target: width: min(1200px, calc(100% - 48px))
- tablet content width target: width: min(1200px, calc(100% - 32px))
- mobile content width target: width: calc(100% - 24px)
- no primary text block may sit flush against the viewport edge
- no meaningful content may be edge-to-edge without gutters unless intentionally decorative
- every hero and section must have protected horizontal gutters

NAV HEIGHT RULES:
- navigation should usually stay within min-height: 72px to max-height: 112px on desktop
- absolute hard limit is 124px
- do not allow brand text or logo to create giant nav height
- nav row should use flex alignment and controlled padding

LOGO FIT RULES:
- uploaded logos must NEVER render at uncontrolled natural size
- always create a dedicated logo shell with explicit sizing constraints
- actual img.brand-logo-image must use object-fit: contain
- never allow the uploaded logo to stretch the nav row height

SPACING AND COMPOSITION RULES:
- spacing must feel deliberate and premium
- desktop section spacing should usually land between 88px and 144px
- tablet spacing should stay generous
- mobile spacing must still breathe
- every hero, overlay card, floating panel and text block must have explicit safe inner padding
- never place text flush to viewport edges or image edges
- use horizontal gutters at minimum:
  - desktop: clamp(24px, 4vw, 56px)
  - tablet: clamp(20px, 5vw, 40px)
  - mobile: clamp(16px, 5vw, 24px)

OPTICAL ALIGNMENT RULES:
- text may not be only mathematically centered; it must also feel optically centered
- centered hero text blocks must have max-width and margin-inline auto
- avoid awkward half-centered layouts

HERO STABILITY RULES:
- hero content must never collide with navigation
- hero must have a predictable content wrapper
- the first screen must feel complete and intentional
- avoid giant accidental empty gaps
- hero text and CTA group must live inside a bounded wrapper with explicit max-width
- if hero uses background media, foreground copy must still remain readable and padded

REFERENCE HERO LOCK RULES:
- if reference fingerprint says avoid split hero, you MUST NOT use a left-copy / right-card split hero
- if screenshot analysis says cover-hero, you MUST keep a cover-led or full-width hero
- if reference uses one dominant subject, keep one dominant dominant subject in the hero
- if reference uses a stats band after hero, preserve that pattern immediately under hero
- if reference nav is minimal, keep the nav minimal and clean
- if screenshot says centered hero copy, keep centered or near-centered hero copy
- do not downgrade a cinematic or editorial hero into a boxed generic card layout

${
  isAutomotiveReference
    ? `
AUTOMOTIVE LOCK RULES:
- hero imagery MUST be automotive
- do not use coffee, food, lounge, restaurant, office desk, hotel or generic indoor lifestyle imagery
- hero should feel vehicle-led and premium
- if the reference feels like a wide automotive silhouette cover, preserve that cover composition family
- the main image slot must describe a premium car detailing / vehicle hero image in English`
    : ""
}

TYPOGRAPHY RULES:
- enforce clear H1 / H2 / H3 hierarchy
- headings must not always use extreme weight
- default body copy should usually live around weight 400 to 500
- display headlines may be strong, but keep them refined
- long text blocks must use bounded max-width for readability

BUTTON AND CONTRAST RULES:
- primary CTA must be clearly visible
- navigation links and CTA button must not visually merge
- if button style is gradient-glow, keep it elegant
- if button style is solid-premium, prioritize clarity and conversion
- CTA buttons must always have readable text contrast
- never use dark text on dark CTA buttons
- never use accent buttons whose label becomes unreadable
- nav CTA text must remain readable in all states
- hover states must not reduce readability

MOBILE NAV RULES:
- logo on the left, hamburger fully on the far right
- minimum tap target is 44x44
- hamburger animates into X
- mobile menu opens with refined fade, slide or scale

ANIMATION AND WOW RULES:
- use ${params.preferences.animationLevel} animation intensity
- animations must feel premium, not gimmicky
- allowed motion ideas:
  - gradient drift
  - subtle glow pulse
  - reveal on scroll
  - card hover lift
  - animated border shimmer
  - loading skeleton shimmer
  - staggered text reveal
  - animated underline / highlight pass
  - floating UI drift
- for SaaS / AI / product sites, richer motion is welcome
- for luxury / real estate / restaurant, motion should stay more restrained
- if prompt enhancer mode is wow-creative, push animation quality further

IMAGE RULES:
- also return assetPlan with at most 4 realistic images
- if an image is needed in html, use a normal <img> and add data-image-slot="<slot>"
- slot values in html must exactly match assetPlan.slot values
- queries must be concrete and in English
- if industry is food-product, ecommerce-product, restaurant, catering, car-dealer or resort, imagery is mandatory
- assetPlan must follow the reference motif and may not drift into unrelated image themes
- the first asset slot should support the hero motif when the reference hero is image-led

MANDATORY CSS IMPLEMENTATION DETAILS:
- define a container utility in CSS
- define a logo shell class
- define a nav shell with controlled min/max height
- define a stable hero inner wrapper with explicit max-widths
- define card classes with repeatable padding, radius and border logic
- define responsive breakpoints
- prevent horizontal overflow globally
- use box-sizing: border-box everywhere

COPY RULES:
- use Czech copy
- hero headline should be short, premium and easy to scan
- avoid lorem ipsum
- make sections relevant to the business

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
- visible design distinctiveness
- stronger motion and detail
- disciplined spacing
- strong hierarchy
- strong CTA contrast
- uploaded logo constrained by a logo shell
- hero remains structurally stable
- if the reference is cover-led, do not output a generic split hero`;
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
      maxItems: 4,
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

function sanitizeAssetPlan(assetPlan: unknown): AssetPlanItem[] {
  if (!Array.isArray(assetPlan)) return [];

  return assetPlan
    .slice(0, 4)
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
    assetPlan: sanitizeAssetPlan(bundle.assetPlan),
  };
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const routeStartedAt = nowMs();

  try {
    const bodyStartedAt = nowMs();
    const body = await req.json();
    logStep(requestId, "parse-body", bodyStartedAt);

    const rawPrompt =
      typeof body?.prompt === "string" ? body.prompt.trim().slice(0, 6000) : "";
    const buildType =
      typeof body?.buildType === "string" ? body.buildType : "";
    const model = typeof body?.model === "string" ? body.model : "";

    const inputMode: InputMode =
      body?.inputMode === "url" ||
      body?.inputMode === "screenshot" ||
      body?.inputMode === "html"
        ? body.inputMode
        : "prompt";

    const referenceUrl =
      typeof body?.referenceUrl === "string" ? body.referenceUrl.trim() : "";
    const referenceHtml =
      typeof body?.referenceHtml === "string"
        ? body.referenceHtml.trim().slice(0, 12000)
        : "";

    const attachments = sanitizeAttachments(body?.attachments);

    const chatHistory = Array.isArray(body?.chatHistory)
      ? (body.chatHistory as ChatHistoryItem[])
      : [];

    const rawPreferences =
      body?.generationPreferences &&
      typeof body.generationPreferences === "object"
        ? (body.generationPreferences as GenerationPreferences)
        : body?.landingPreferences && typeof body.landingPreferences === "object"
        ? (body.landingPreferences as GenerationPreferences)
        : {};

    const brandLogo = sanitizeBrandLogoAsset(body?.brandLogo);

    const hasPrompt = rawPrompt.length >= 8;
    const hasUrlReference = inputMode === "url" && referenceUrl.length > 0;
    const hasHtmlReference =
      inputMode === "html" && referenceHtml.trim().length > 0;
    const hasScreenshotReference =
      inputMode === "screenshot" &&
      attachments.some((item) => item.kind === "screenshot");

    if (
      !hasPrompt &&
      !hasUrlReference &&
      !hasHtmlReference &&
      !hasScreenshotReference
    ) {
      return Response.json(
        {
          error: "Chybí zadání. Zadejte prompt nebo referenční vstup.",
        },
        { status: 400 }
      );
    }

    const effectivePrompt =
      rawPrompt ||
      (inputMode === "url" && referenceUrl
        ? [
            `Vytvoř nový web podle této URL reference: ${referenceUrl}.`,
            "URL je hlavní zdroj layoutu, hierarchie, kompozice a vizuálního směru.",
            "Výsledek má být co nejpodobnější strukturou a dojmem, ale s vlastním brandem, vlastním obsahem a čistším prémiovým zpracováním.",
            "Neudělej obecný generický web. Primárně se řiď poskytnutou URL referencí.",
          ].join(" ")
        : inputMode === "html" && referenceHtml.trim()
        ? "Vytvoř nový web podle dodaného HTML souboru."
        : inputMode === "screenshot"
        ? "Vytvoř nový web podle dodaného screenshotu."
        : "");

    const referenceSummary =
      inputMode === "url" && referenceUrl
        ? await fetchReferenceSiteSummary(referenceUrl, requestId)
        : null;

    const layoutFingerprint =
      inputMode === "url"
        ? inferReferenceLayoutFingerprint(
            referenceSummary,
            inferIndustryKind(
              [
                effectivePrompt,
                referenceSummary?.title || "",
                ...(referenceSummary?.headings || []),
              ].join(" ")
            )
          )
        : null;

    const referenceScreenshotDataUrl =
      inputMode === "url" && referenceUrl
        ? await captureReferenceScreenshot(referenceUrl, requestId)
        : null;

    const screenshotAnalysis =
      referenceScreenshotDataUrl && inputMode === "url"
        ? await createVisionReferenceAnalysis({
            requestId,
            model: WEB_MODEL,
            screenshotDataUrl: referenceScreenshotDataUrl,
            referenceSummary,
            fingerprint: layoutFingerprint,
          })
        : null;

    const promptForDirection =
      effectivePrompt +
      (referenceSummary
        ? ` ${referenceSummary.title} ${referenceSummary.headings.join(" ")} ${referenceSummary.navLinks.join(" ")}`
        : "") +
      (layoutFingerprint
        ? ` hero:${layoutFingerprint.heroType} visual:${layoutFingerprint.visualDominance} nav:${layoutFingerprint.navStyle} density:${layoutFingerprint.density} sections:${layoutFingerprint.sectionSequence.join(" ")}`
        : "") +
      (screenshotAnalysis
        ? ` screenshotHero:${screenshotAnalysis.aboveTheFoldType} screenshotSubject:${screenshotAnalysis.dominantVisualSubject} screenshotAfterHero:${screenshotAnalysis.firstSectionAfterHero} screenshotAvoidSplit:${screenshotAnalysis.shouldAvoidSplitHero}`
        : "");

    const resolvedPreferences = resolveCreativeDirection(
      promptForDirection,
      rawPreferences,
      layoutFingerprint,
      screenshotAnalysis
    );

    console.log(
      JSON.stringify({
        scope: "api-generate",
        requestId,
        step: "start",
        model: WEB_MODEL,
        promptLength: effectivePrompt.length,
        chatHistoryCount: chatHistory.length,
        inputMode,
        referenceUrl: referenceUrl || null,
        hasReferenceHtml: Boolean(referenceHtml),
        hasReferenceSummary: Boolean(referenceSummary),
        hasReferenceScreenshot: Boolean(referenceScreenshotDataUrl),
        hasScreenshotAnalysis: Boolean(screenshotAnalysis),
        layoutFingerprint,
        attachmentCount: attachments.length,
        generationPreferences: resolvedPreferences,
        hasBrandLogo: Boolean(brandLogo),
      })
    );

    const renderStartedAt = nowMs();

    const renderedBundle = await createStructuredObject<GeneratedWebsiteBundle>({
      model: WEB_MODEL,
      system:
        "You are an elite web designer and frontend engineer. Return only valid JSON.",
      user: renderPrompt({
        prompt: effectivePrompt,
        buildType,
        model,
        chatHistory,
        preferences: resolvedPreferences,
        brandLogo,
        inputMode,
        referenceUrl,
        referenceHtml,
        referenceSummary,
        layoutFingerprint,
        screenshotAnalysis,
        attachments,
      }),
      schemaName: "website_bundle_creative_setup_v16",
      schema: generatedWebsiteSchema,
      requestId,
    });

    logStep(requestId, "render-finished", renderStartedAt, {
      htmlLength: renderedBundle?.html?.length || 0,
      cssLength: renderedBundle?.css?.length || 0,
      jsLength: renderedBundle?.js?.length || 0,
      assetPlanCount: renderedBundle?.assetPlan?.length || 0,
    });

    const sanitizeStartedAt = nowMs();
    const safeRendered = sanitizeBundle(renderedBundle);

    const htmlWithBrandLogo = injectBrandLogoMarkup(
      safeRendered.html,
      brandLogo
    );

    logStep(requestId, "sanitize-bundle", sanitizeStartedAt, {
      assetPlanCount: safeRendered.assetPlan.length,
      hasBrandLogo: Boolean(brandLogo),
    });

    logStep(requestId, "done", routeStartedAt, {
      totalMs: Date.now() - routeStartedAt,
      model: WEB_MODEL,
    });

    return Response.json({
      html: htmlWithBrandLogo,
      css: safeRendered.css,
      js: safeRendered.js,
      assetPlan: safeRendered.assetPlan,
      brief: {
        industry: resolvedPreferences.industry,
        audience: "",
        style: `${resolvedPreferences.visualStyle} • ${resolvedPreferences.fontMood} • ${resolvedPreferences.designReference}`,
        layoutTone: `${resolvedPreferences.layoutPreference} • ${resolvedPreferences.animationLevel} • ${resolvedPreferences.layoutSeed}`,
      },
      assets: [],
      twoStepMode: true,
      modelUsed: WEB_MODEL,
      requestId,
      generationPreferences: resolvedPreferences,
      inputMode,
      referenceUrl,
      referenceSummary,
      layoutFingerprint,
      screenshotAnalysis,
      hasReferenceScreenshot: Boolean(referenceScreenshotDataUrl),
    });
  } catch (e: any) {
    console.error(
      JSON.stringify({
        scope: "api-generate",
        requestId,
        step: "fatal-error",
        totalMs: Date.now() - routeStartedAt,
        error: e?.message ?? "Unknown error",
        stack: e?.stack || null,
      })
    );

    return Response.json(
      {
        error: e?.message ?? "Server error",
        requestId,
      },
      { status: 500 }
    );
  }
}