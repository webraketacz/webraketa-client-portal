import { getBlueprint, inferIndustryKind, type IndustryKind } from "@/lib/ai/design-system";
import type { BrandLogoAsset } from "@/lib/ai/logo-session";

export type QuestionField =
  | "brandName"
  | "brandLogo"
  | "primaryGoal"
  | "targetAudience"
  | "offerNotes"
  | "styleNotes"
  | "contactDetails"
  | "sections"
  | "trustSignals"
  | "ctaLabel"
  | "references"
  | "extras";

export type QuestionInputType =
  | "text"
  | "textarea"
  | "chips"
  | "logo";

export type ProjectAnswers = {
  brandName?: string;
  brandLogo?: BrandLogoAsset | null;
  primaryGoal?: string;
  targetAudience?: string;
  offerNotes?: string;
  styleNotes?: string;
  contactDetails?: string;
  sections?: string;
  trustSignals?: string;
  ctaLabel?: string;
  references?: string;
  extras?: string;
};

export type QuestionConfig = {
  id: QuestionField;
  label: string;
  placeholder?: string;
  inputType: QuestionInputType;
  suggestedChips?: string[];
  required?: boolean;
};

const CORE_QUESTIONS: QuestionConfig[] = [
  {
    id: "brandName",
    label: "Jak se značka nebo firma jmenuje?",
    placeholder: "Např. Noble Estates, Dr. Novák Clinic, FlowPilot…",
    inputType: "text",
    required: true,
  },
  {
    id: "brandLogo",
    label: "Máte logo? Nahrajte PNG, JPG nebo SVG a použijeme ho rovnou v menu i footeru.",
    inputType: "logo",
  },
  {
    id: "primaryGoal",
    label: "Jaký je hlavní cíl webu?",
    placeholder: "Např. získávat poptávky, rezervace, objednání, demo, prodej produktu…",
    inputType: "text",
    required: true,
  },
  {
    id: "targetAudience",
    label: "Komu je web určený?",
    placeholder: "Např. movití klienti, soukromí pacienti, firmy, startupy…",
    inputType: "text",
  },
  {
    id: "contactDetails",
    label: "Jaké kontaktní údaje máme použít přesně do webu?",
    placeholder: "Telefon, email, adresa, otevírací doba, sociální sítě…",
    inputType: "textarea",
  },
  {
    id: "styleNotes",
    label: "Jak má web působit vizuálně?",
    placeholder: "Např. ultra premium, clean clinic, editorial luxury, dark wow SaaS…",
    inputType: "textarea",
  },
  {
    id: "references",
    label: "Máte inspiraci nebo konkrétní designový směr?",
    placeholder: "Např. editorial real-estate microsite, calm Apple-like clinic, dark Stripe-style SaaS…",
    inputType: "textarea",
  },
];

const INDUSTRY_QUESTIONS: Partial<Record<IndustryKind, QuestionConfig[]>> = {
  saas: [
    {
      id: "offerNotes",
      label: "Co je hlavní produkt nebo funkce, kterou máme nejvíc prodat?",
      placeholder: "Např. AI workflow, reporting, integrace, API, observability…",
      inputType: "textarea",
    },
    {
      id: "sections",
      label: "Jaké sekce chcete určitě na webu?",
      placeholder: "Např. hero, produkt, integrace, pricing, FAQ, demo CTA…",
      inputType: "textarea",
    },
    {
      id: "ctaLabel",
      label: "Jaká má být hlavní výzva k akci?",
      placeholder: "Např. Získat demo, Vyzkoušet zdarma, Rezervovat call…",
      inputType: "text",
    },
  ],
  healthcare: [
    {
      id: "offerNotes",
      label: "Jaké služby nebo specializace mají být nejvíc vidět?",
      placeholder: "Např. dermatologie, implantologie, estetika, preventivní péče…",
      inputType: "textarea",
    },
    {
      id: "trustSignals",
      label: "Jaké důvěryhodné prvky chcete zdůraznit?",
      placeholder: "Např. certifikace, roky praxe, tým lékařů, reference, moderní vybavení…",
      inputType: "textarea",
    },
    {
      id: "ctaLabel",
      label: "Jaká má být hlavní akce?",
      placeholder: "Např. Objednat se, Zavolat, Odeslat poptávku…",
      inputType: "text",
    },
  ],
  "real-estate": [
    {
      id: "offerNotes",
      label: "Je to osobní značka makléře, developerský projekt, nebo realitní kancelář?",
      placeholder: "Např. osobní značka, prémiová kancelář, nový rezidenční projekt…",
      inputType: "text",
    },
    {
      id: "sections",
      label: "Co má být na webu určitě vidět?",
      placeholder: "Např. hero, projekt, lokalita, galerie, dispozice, poptávka, kontakt…",
      inputType: "textarea",
    },
    {
      id: "trustSignals",
      label: "Co má vytvářet důvěru a premium dojem?",
      placeholder: "Např. exkluzivita, lokalita, architektura, zkušenosti, prodané jednotky…",
      inputType: "textarea",
    },
  ],
  restaurant: [
    {
      id: "offerNotes",
      label: "Co chcete zdůraznit nejvíc?",
      placeholder: "Např. degustační menu, rezervace, atmosféra, signature dishes…",
      inputType: "textarea",
    },
    {
      id: "sections",
      label: "Jaké sekce chcete na webu?",
      placeholder: "Např. menu highlights, galerie, o nás, rezervace, návštěva…",
      inputType: "textarea",
    },
    {
      id: "ctaLabel",
      label: "Jaká má být hlavní akce?",
      placeholder: "Např. Rezervovat stůl, Zavolat, Zobrazit menu…",
      inputType: "text",
    },
  ],
};

const SHARED_FINISH_QUESTIONS: QuestionConfig[] = [
  {
    id: "sections",
    label: "Jaké sekce musí na webu určitě být?",
    placeholder: "Např. hero, služby, reference, FAQ, kontakt, tým, galerie…",
    inputType: "textarea",
  },
  {
    id: "trustSignals",
    label: "Jaké prvky důvěry nebo prestiže máme ukázat?",
    placeholder: "Např. reference, čísla, certifikace, média, realizace, partneři…",
    inputType: "textarea",
  },
  {
    id: "ctaLabel",
    label: "Jaká má být hlavní CTA věta?",
    placeholder: "Např. Začít zdarma, Domluvit prohlídku, Objednat se, Zavolat…",
    inputType: "text",
  },
  {
    id: "extras",
    label: "Je ještě něco důležitého navíc?",
    placeholder: "Např. mapa, více fotek, video, pricing, jazykové mutace…",
    inputType: "textarea",
  },
];

export function getPreGenerationQuestions(prompt: string): QuestionConfig[] {
  const industry = inferIndustryKind(prompt);
  const specific = INDUSTRY_QUESTIONS[industry] || [];

  return [
    ...CORE_QUESTIONS,
    ...specific,
    ...SHARED_FINISH_QUESTIONS.filter(
      (question) => !specific.some((item) => item.id === question.id)
    ),
  ];
}

export function getAfterGeneratePrompts(prompt: string) {
  const blueprint = getBlueprint(prompt);

  return [
    "Co chcete upravit jako první?",
    ...blueprint.afterGeneratePrompts,
    "Chcete silnější hero, lepší spacing, lepší typografii, nebo více premium feeling?",
    "Má být web více prodejní, více minimalistický, nebo více wow?",
  ];
}