export type TypographyPresetId =
  | "tech-sans"
  | "enterprise-sans"
  | "trust-sans"
  | "editorial-serif"
  | "luxury-serif"
  | "soft-premium-sans"
  | "commerce-sans"
  | "boutique-contrast";

export type TypographyPreset = {
  id: TypographyPresetId;
  label: string;
  displayFontVar: string;
  bodyFontVar: string;
  uiFontVar: string;
  bodyWeight: number;
  bodyStrongWeight: number;
  headingWeight: number;
  displayWeight: number;
  trackingBody: string;
  trackingHeading: string;
  trackingDisplay: string;
  promptGuidance: string[];
};

export const TYPOGRAPHY_PRESETS: Record<TypographyPresetId, TypographyPreset> = {
  "tech-sans": {
    id: "tech-sans",
    label: "Tech Sans",
    displayFontVar: "var(--font-tech-body)",
    bodyFontVar: "var(--font-tech-body)",
    uiFontVar: "var(--font-ui)",
    bodyWeight: 430,
    bodyStrongWeight: 560,
    headingWeight: 640,
    displayWeight: 760,
    trackingBody: "-0.005em",
    trackingHeading: "-0.025em",
    trackingDisplay: "-0.045em",
    promptGuidance: [
      "Use a sharp modern sans feeling.",
      "Do not overuse 800+ outside hero moments.",
      "Hero may feel bold, but keep section headings more controlled.",
    ],
  },
  "enterprise-sans": {
    id: "enterprise-sans",
    label: "Enterprise Sans",
    displayFontVar: "var(--font-tech-body)",
    bodyFontVar: "var(--font-trust-body)",
    uiFontVar: "var(--font-ui)",
    bodyWeight: 420,
    bodyStrongWeight: 540,
    headingWeight: 620,
    displayWeight: 700,
    trackingBody: "-0.003em",
    trackingHeading: "-0.02em",
    trackingDisplay: "-0.035em",
    promptGuidance: [
      "Feels premium enterprise, not startup chaotic.",
      "Use controlled weight rhythm and cleaner hierarchy.",
    ],
  },
  "trust-sans": {
    id: "trust-sans",
    label: "Trust Sans",
    displayFontVar: "var(--font-trust-body)",
    bodyFontVar: "var(--font-trust-body)",
    uiFontVar: "var(--font-ui)",
    bodyWeight: 420,
    bodyStrongWeight: 520,
    headingWeight: 590,
    displayWeight: 650,
    trackingBody: "0em",
    trackingHeading: "-0.015em",
    trackingDisplay: "-0.028em",
    promptGuidance: [
      "Calm trustworthy typography.",
      "Avoid aggressive boldness.",
      "Prioritize readability, clarity and confidence.",
    ],
  },
  "editorial-serif": {
    id: "editorial-serif",
    label: "Editorial Serif",
    displayFontVar: "var(--font-display-editorial)",
    bodyFontVar: "var(--font-soft-body)",
    uiFontVar: "var(--font-ui)",
    bodyWeight: 410,
    bodyStrongWeight: 520,
    headingWeight: 560,
    displayWeight: 620,
    trackingBody: "0em",
    trackingHeading: "-0.018em",
    trackingDisplay: "-0.04em",
    promptGuidance: [
      "Elegant editorial serif display.",
      "Large headlines can be luxurious without becoming too heavy.",
      "Body should stay modern and quiet.",
    ],
  },
  "luxury-serif": {
    id: "luxury-serif",
    label: "Luxury Serif",
    displayFontVar: "var(--font-display-luxury)",
    bodyFontVar: "var(--font-soft-body)",
    uiFontVar: "var(--font-ui)",
    bodyWeight: 410,
    bodyStrongWeight: 510,
    headingWeight: 550,
    displayWeight: 610,
    trackingBody: "0em",
    trackingHeading: "-0.02em",
    trackingDisplay: "-0.05em",
    promptGuidance: [
      "High-end luxury typography.",
      "Refined contrast, not loud fashion magazine chaos.",
      "Use lots of whitespace and elegant rhythm.",
    ],
  },
  "soft-premium-sans": {
    id: "soft-premium-sans",
    label: "Soft Premium Sans",
    displayFontVar: "var(--font-soft-body)",
    bodyFontVar: "var(--font-soft-body)",
    uiFontVar: "var(--font-ui)",
    bodyWeight: 400,
    bodyStrongWeight: 520,
    headingWeight: 580,
    displayWeight: 640,
    trackingBody: "0em",
    trackingHeading: "-0.018em",
    trackingDisplay: "-0.032em",
    promptGuidance: [
      "Smooth premium sans without hard tech feeling.",
      "Great for clinics, beauty and calm service websites.",
    ],
  },
  "commerce-sans": {
    id: "commerce-sans",
    label: "Commerce Sans",
    displayFontVar: "var(--font-commerce-body)",
    bodyFontVar: "var(--font-commerce-body)",
    uiFontVar: "var(--font-ui)",
    bodyWeight: 420,
    bodyStrongWeight: 540,
    headingWeight: 640,
    displayWeight: 720,
    trackingBody: "-0.003em",
    trackingHeading: "-0.024em",
    trackingDisplay: "-0.04em",
    promptGuidance: [
      "Strong conversion-first sans system.",
      "Use assertive but polished CTA hierarchy.",
    ],
  },
  "boutique-contrast": {
    id: "boutique-contrast",
    label: "Boutique Contrast",
    displayFontVar: "var(--font-display-contrast)",
    bodyFontVar: "var(--font-soft-body)",
    uiFontVar: "var(--font-ui)",
    bodyWeight: 410,
    bodyStrongWeight: 520,
    headingWeight: 580,
    displayWeight: 650,
    trackingBody: "0em",
    trackingHeading: "-0.02em",
    trackingDisplay: "-0.05em",
    promptGuidance: [
      "Boutique premium with stronger display personality.",
      "Use with restraint and high-quality spacing.",
    ],
  },
};

export function getTypographyPreset(id: TypographyPresetId): TypographyPreset {
  return TYPOGRAPHY_PRESETS[id];
}

export function buildTypographyPromptFragment(id: TypographyPresetId) {
  const preset = getTypographyPreset(id);

  return `
TYPOGRAPHY PRESET:
- Name: ${preset.label}
- Display font variable: ${preset.displayFontVar}
- Body font variable: ${preset.bodyFontVar}
- UI font variable: ${preset.uiFontVar}
- Body weight: ${preset.bodyWeight}
- Body strong weight: ${preset.bodyStrongWeight}
- Heading weight: ${preset.headingWeight}
- Display weight: ${preset.displayWeight}
- Body tracking: ${preset.trackingBody}
- Heading tracking: ${preset.trackingHeading}
- Display tracking: ${preset.trackingDisplay}

TYPOGRAPHY DIRECTION RULES:
${preset.promptGuidance.map((item) => `- ${item}`).join("\n")}
- Use CSS variables named --font-display and --font-body in the output.
- Use more refined font-weight rhythm instead of defaulting to 800/900.
- Body should usually remain between 400 and 500.
- Section headings usually work best between 540 and 680 depending on preset.
- The hero may be stronger, but must still feel premium.
`.trim();
}