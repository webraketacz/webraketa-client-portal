"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";

type ProfileRow = {
  id: string;
  email: string | null;
  plan: string | null;
  billing_type: string | null;
  business: string | null;
  domain: string | null;
  domain_owned: boolean | null;
  website_desc: string | null;
  materials_note: string | null;
  updated_at: string | null;
};

const PLAN_OPTIONS = [
  {
    id: "start",
    label: "START",
    desc: "Základ pro rychlý web do 48 hodin. Ideální pro jednoduchou prezentaci podnikání.",
  },
  {
    id: "pro",
    label: "PRO",
    desc: "Rozšířený balíček pro firmy, které chtějí silnější prezentaci, více sekcí a lepší konverze.",
  },
  {
    id: "premium",
    label: "PREMIUM",
    desc: "Prémiové řešení s větším důrazem na design, značku, vizuální styl a klientský zážitek.",
  },
  {
    id: "enterprise",
    label: "ENTERPRISE",
    desc: "Řešení na míru pro náročnější projekty a firmy, které chtějí individuální přístup.",
  },
];

const STYLE_OPTIONS = [
  "Moderní",
  "Prémiový",
  "Minimalistický",
  "Tmavý",
  "Luxusní",
  "Technologický",
  "Čistý a firemní",
];

function RocketLogoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M14.5 4.5c1.9-.6 3.9-.6 5.8-.2.4 1.9.4 3.9-.2 5.8-.6 2-1.7 3.8-3.2 5.3l-3.2 3.2a3 3 0 0 1-4.2 0l-4-4a3 3 0 0 1 0-4.2l3.2-3.2c1.5-1.5 3.3-2.6 5.3-3.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14.5 9.5h.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path
        d="M8.5 15.5 6 18c-.7.7-1.8.8-2.8.8.2-1 .5-2.1 1.2-2.8l2.5-2.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 8.5 18 6c.7-.7 1-1.8.8-2.8-1-.2-2.1.1-2.8.8l-2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}

function MiniRocket(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M13.8 4.8c1.4-.4 2.8-.4 4.1-.1.3 1.3.3 2.7-.1 4.1-.4 1.4-1.2 2.7-2.3 3.8l-2.3 2.3a2.1 2.1 0 0 1-3 0l-2.8-2.8a2.1 2.1 0 0 1 0-3l2.3-2.3c1.1-1.1 2.4-1.9 4.1-2.3Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M13.7 8.5h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path
        d="M8.3 14.2 6.4 16c-.5.5-1.2.7-1.9.6.1-.7.3-1.4.8-1.9l1.8-1.9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M5 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 7.5h.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function SpinnerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M20 12a8 8 0 1 1-2.34-5.66"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function normalizePlanLabel(plan: string | null) {
  const p = (plan ?? "start").toLowerCase();
  if (p === "pro") return "PRO";
  if (p === "premium") return "PREMIUM";
  if (p === "enterprise") return "ENTERPRISE";
  return "START";
}

function normalizeBillingLabel(billing: string | null) {
  const b = (billing ?? "monthly").toLowerCase();
  if (b === "yearly") return "Roční předplatné";
  return "Měsíční předplatné";
}

function planDescription(plan: string | null) {
  const p = (plan ?? "start").toLowerCase();
  const found = PLAN_OPTIONS.find((item) => item.id === p);
  return found?.desc ?? PLAN_OPTIONS[0].desc;
}

const inputBaseStyle: React.CSSProperties = {
  backgroundColor: "rgba(2, 6, 23, 0.72)",
  WebkitBoxShadow: "0 0 0 1000px rgba(2, 6, 23, 0.72) inset",
  boxShadow:
    "0 0 0 1000px rgba(2, 6, 23, 0.72) inset, inset 0 1px 0 rgba(255,255,255,0.04)",
  WebkitTextFillColor: "#ffffff",
  color: "#ffffff",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
};

export default function OnboardingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [improvingText, setImprovingText] = useState(false);

  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [business, setBusiness] = useState("");
  const [domain, setDomain] = useState("");
  const [domainOwned, setDomainOwned] = useState<boolean | null>(null);
  const [websiteDesc, setWebsiteDesc] = useState("");
  const [materialsNote, setMaterialsNote] = useState("");

  const [selectedPlan, setSelectedPlan] = useState("start");
  const [selectedBilling, setSelectedBilling] = useState("monthly");

  const [businessType, setBusinessType] = useState("");
  const [preferredStyle, setPreferredStyle] = useState("");
  const [brandColors, setBrandColors] = useState("");
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [materialFiles, setMaterialFiles] = useState<File[]>([]);

  const [domainCheckMessage, setDomainCheckMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const progress = useMemo(() => Math.round((step / totalSteps) * 100), [step]);

  useEffect(() => {
    let mounted = true;

    async function init() {
      setLoading(true);
      setError(null);
      setInfo(null);

      const supabase = getSupabaseBrowserClient();

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        if (!mounted) return;
        setLoading(false);
        setError(sessionError.message);
        return;
      }

      const session = sessionData.session;

      if (!session) {
        router.push("/login");
        return;
      }

      const userId = session.user.id;
      const email = session.user.email ?? null;

      if (!mounted) return;
      setSessionEmail(email);

      const { data: existing, error: fetchError } = await supabase
        .from("profiles")
        .select(
          "id,email,plan,billing_type,business,domain,domain_owned,website_desc,materials_note,updated_at"
        )
        .eq("id", userId)
        .maybeSingle();

      if (fetchError) {
        if (!mounted) return;
        setLoading(false);
        setError(fetchError.message);
        return;
      }

      if (!existing) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: userId,
          email,
          updated_at: new Date().toISOString(),
        });

        if (insertError) {
          if (!mounted) return;
          setLoading(false);
          setError(insertError.message);
          return;
        }

        const { data: afterInsert, error: afterInsertError } = await supabase
          .from("profiles")
          .select(
            "id,email,plan,billing_type,business,domain,domain_owned,website_desc,materials_note,updated_at"
          )
          .eq("id", userId)
          .single();

        if (afterInsertError) {
          if (!mounted) return;
          setLoading(false);
          setError(afterInsertError.message);
          return;
        }

        if (!mounted) return;

        setProfile(afterInsert);
        setBusiness(afterInsert.business ?? "");
        setDomain(afterInsert.domain ?? "");
        setDomainOwned(afterInsert.domain_owned ?? null);
        setWebsiteDesc(afterInsert.website_desc ?? "");
        setMaterialsNote(afterInsert.materials_note ?? "");
        setSelectedPlan((afterInsert.plan ?? "start").toLowerCase());
        setSelectedBilling((afterInsert.billing_type ?? "monthly").toLowerCase());
        setLoading(false);
        return;
      }

      if (!mounted) return;
      setProfile(existing);
      setBusiness(existing.business ?? "");
      setDomain(existing.domain ?? "");
      setDomainOwned(existing.domain_owned ?? null);
      setWebsiteDesc(existing.website_desc ?? "");
      setMaterialsNote(existing.materials_note ?? "");
      setSelectedPlan((existing.plan ?? "start").toLowerCase());
      setSelectedBilling((existing.billing_type ?? "monthly").toLowerCase());
      setLoading(false);
    }

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  function buildWebsiteDescPayload() {
    const parts = [
      business.trim() ? `Stručně o podnikání: ${business.trim()}` : "",
      businessType.trim() ? `Obor podnikání: ${businessType.trim()}` : "",
      preferredStyle.trim() ? `Preferovaný styl: ${preferredStyle.trim()}` : "",
      brandColors.trim() ? `Vlastní barvy: ${brandColors.trim()}` : "",
      websiteDesc.trim() ? `Detailní popis webu: ${websiteDesc.trim()}` : "",
      logoFiles.length ? `Nahrané logo: ${logoFiles.map((f) => f.name).join(", ")}` : "",
    ].filter(Boolean);

    return parts.join("\n\n");
  }

  function buildMaterialsPayload() {
    const parts = [
      materialsNote.trim() ? `Poznámka k podkladům: ${materialsNote.trim()}` : "",
      materialFiles.length ? `Vybrané soubory: ${materialFiles.map((f) => f.name).join(", ")}` : "",
    ].filter(Boolean);

    return parts.join("\n\n");
  }

  async function savePartial(nextStep?: number) {
    const supabase = getSupabaseBrowserClient();

    try {
      setSaving(true);
      setError(null);
      setInfo(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session) {
        router.push("/login");
        return;
      }

      const userId = session.user.id;

      const payload: Partial<ProfileRow> = {
        plan: selectedPlan,
        billing_type: selectedBilling,
        business: business.trim() ? business.trim() : null,
        domain: domain.trim() ? domain.trim() : null,
        domain_owned: domainOwned,
        website_desc: buildWebsiteDescPayload() || null,
        materials_note: buildMaterialsPayload() || null,
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error: upsertError } = await supabase
        .from("profiles")
        .upsert({ id: userId, ...payload }, { onConflict: "id" })
        .select(
          "id,email,plan,billing_type,business,domain,domain_owned,website_desc,materials_note,updated_at"
        )
        .single();

      if (upsertError) {
        setError(upsertError.message);
        return;
      }

      setProfile(updated);
      setInfo("Uloženo ✅");

      if (typeof nextStep === "number") setStep(nextStep);
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function improveDescriptionDemo() {
    if (!websiteDesc.trim()) {
      setInfo("Nejdřív napište alespoň základní popis webu.");
      return;
    }

    try {
      setImprovingText(true);
      setError(null);
      setInfo(null);

      const res = await fetch("/api/improve-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: websiteDesc,
          businessType,
          preferredStyle,
          brandColors,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error ?? "Nepodařilo se vylepšit text.");
      }

      setWebsiteDesc(data.text);
      setInfo("Popis byl vylepšen pomocí AI ✅");
    } catch (e: any) {
      setError(e?.message ?? "Nepodařilo se vylepšit text.");
    } finally {
      setImprovingText(false);
    }
  }

  function handleLogoFiles(files: FileList | null) {
    if (!files) return;
    setLogoFiles(Array.from(files));
  }

  function handleMaterialFiles(files: FileList | null) {
    if (!files) return;
    setMaterialFiles(Array.from(files));
  }

  function simulateDomainCheck() {
    if (!domain.trim()) {
      setDomainCheckMessage("Nejdřív zadejte doménu.");
      return;
    }

    const clean = domain.trim().toLowerCase();

    if (!clean.includes(".")) {
      setDomainCheckMessage("Doména musí být ve formátu např. moje-domena.cz");
      return;
    }

    setDomainCheckMessage(
      "UI je připravené. Reálné ověření dostupnosti domény napojíme v dalším kroku přes API."
    );
  }

  function canContinue() {
    if (step === 1) return true;
    if (step === 2) {
      if (domainOwned === null) return false;
      return domain.trim().length >= 3;
    }
    if (step === 3) {
      return (
        business.trim().length >= 2 &&
        businessType.trim().length >= 2 &&
        websiteDesc.trim().length >= 10
      );
    }
    return true;
  }

  function goBackStep() {
    setStep((s) => Math.max(1, s - 1));
  }

  function goHome() {
    window.location.href = "https://webraketa.cz";
  }

  if (loading) {
    return (
      <div
        className="min-h-dvh bg-slate-950 text-slate-200 antialiased selection:bg-indigo-500 selection:text-white"
        style={{
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
        }}
      >
        <div className="relative min-h-dvh overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-0 animate-gradient-xy bg-[linear-gradient(45deg,#020617,#1e1b4b,#3b0764,#1d4ed8,#020617)]" />
          <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(129,140,248,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(129,140,248,0.045)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent via-slate-950/28 to-slate-950/90" />
          <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.52)_100%)]" />

          <div className="relative z-10 flex min-h-dvh items-center justify-center px-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] px-6 py-4 text-sm text-slate-300 backdrop-blur-xl">
              Načítám onboarding…
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const planLabel = normalizePlanLabel(selectedPlan);
  const billingLabel = normalizeBillingLabel(selectedBilling);

  return (
    <>
      <div
        className="min-h-dvh bg-slate-950 text-slate-200 antialiased selection:bg-indigo-500 selection:text-white"
        style={{
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
        }}
      >
        <div className="relative min-h-dvh overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-0 animate-gradient-xy bg-[linear-gradient(45deg,#020617,#1e1b4b,#3b0764,#1d4ed8,#020617)]" />
          <div className="pointer-events-none absolute inset-0 z-0 bg-[linear-gradient(to_right,rgba(129,140,248,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(129,140,248,0.045)_1px,transparent_1px)] bg-[size:72px_72px]" />

          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <div className="absolute left-[10%] top-[18%] h-40 w-40 rounded-[10px] bg-violet-500/8 blur-3xl" />
            <div className="absolute right-[12%] top-[20%] h-44 w-44 rounded-[10px] bg-blue-500/8 blur-3xl" />
            <div className="absolute bottom-[10%] left-[28%] h-36 w-36 rounded-[10px] bg-fuchsia-500/8 blur-3xl" />
          </div>

          <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent via-slate-950/28 to-slate-950/90" />
          <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.52)_100%)]" />

          <main className="relative z-10 flex min-h-dvh flex-col items-center px-6 py-6">
            <div className="w-full max-w-6xl">
              <div className="mb-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={goBackStep}
                  disabled={step === 1}
                  className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-xl transition hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Zpět
                </button>

                <Link href="/" className="group inline-flex items-center gap-2.5">
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-[10px] border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 shadow-[0_0_18px_rgba(99,102,241,0.2)] transition-colors duration-300 group-hover:bg-indigo-500/20">
                    <RocketLogoIcon className="h-[22px] w-[22px]" />
                  </span>
                  <span className="text-lg font-semibold tracking-tight text-white">
                    Webraketa<span className="text-indigo-400">.cz</span>
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={goHome}
                  className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-xl transition hover:bg-white/[0.10]"
                >
                  Zpátky na hlavní stránku
                </button>
              </div>

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl md:p-10">
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />
                <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[28rem] -translate-x-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/6 to-transparent blur-2xl" />

                <div className="relative">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-[10px] border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80">
                          Přihlášen: {sessionEmail ?? "—"}
                        </span>
                        <span className="rounded-[10px] border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80">
                          Balíček: {planLabel}
                        </span>
                        <span className="rounded-[10px] border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80">
                          Typ: {billingLabel}
                        </span>
                      </div>

                      <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                        {step === 1
                          ? "Teď už jen pár informací"
                          : step === 2
                          ? "Doména a základní nastavení"
                          : "Podnikání, styl a podklady"}
                      </h1>

                      <p className="mt-3 text-sm text-slate-400 md:text-base">
                        {step === 1
                          ? "Nezabere to více než pár minut. Hned potom se pustíme do přípravy vašeho webu."
                          : step === 2
                          ? "Potřebujeme vědět, jakou doménu budeme řešit a jestli ji už vlastníte."
                          : "Na závěr doplníte informace o podnikání, stylu webu a případné podklady."}
                      </p>
                    </div>

                    <div className="lg:min-w-[140px] lg:text-right">
                      <div className="text-xs uppercase tracking-wide text-slate-400">Postup</div>
                      <div className="text-3xl font-semibold text-white">{progress}%</div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="relative h-3 w-full overflow-hidden rounded-[10px] bg-white/10">
                      <div
                        className="h-3 rounded-[10px] bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                      <div
                        className="absolute top-1/2 z-10 -translate-y-1/2 transition-all duration-500"
                        style={{ left: `calc(${progress}% - 14px)` }}
                      >
                        <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-[10px] bg-indigo-400/15 blur-xl" />
                        <MiniRocket className="relative h-7 w-7 rotate-[18deg] text-indigo-200 drop-shadow-[0_0_10px_rgba(129,140,248,0.45)]" />
                      </div>
                    </div>
                  </div>

                  {(error || info) && (
                    <div className="mt-5 rounded-[10px] border border-white/10 bg-white/[0.04] p-4 text-sm">
                      {error ? (
                        <span className="text-red-300">{error}</span>
                      ) : (
                        <span className="text-emerald-300">{info}</span>
                      )}
                    </div>
                  )}

                  <div className="mt-8">
                    {step === 1 && (
                      <div className="space-y-6">
                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                          <div className="text-xs uppercase tracking-wider text-slate-500">
                            Vybrali jste si
                          </div>

                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <span className="rounded-[10px] bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white">
                              {planLabel}
                            </span>
                            <span className="rounded-[10px] border border-white/10 px-4 py-2 text-sm text-slate-300">
                              {billingLabel}
                            </span>
                          </div>

                          <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">
                            {planDescription(selectedPlan)}
                          </p>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                          <div className="text-sm font-semibold text-white">
                            Pokračujte dále a během pár minut nám doplníte vše potřebné pro přípravu webu.
                          </div>
                          <p className="mt-2 text-sm leading-6 text-slate-400">
                            V dalších krocích vyplníte doménu, informace o podnikání, stylu a podkladech.
                          </p>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="space-y-6">
                        <div>
                          <div className="text-base font-semibold text-white">1) Doména</div>
                          <p className="mt-2 text-sm text-slate-400">
                            Nejprve zvolte, jestli už doménu máte, nebo ji teprve chcete zajistit.
                          </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => {
                              setDomainOwned(true);
                              setDomainCheckMessage(null);
                            }}
                            className={`rounded-3xl border p-5 text-left transition ${
                              domainOwned === true
                                ? "border-violet-400/40 bg-white/[0.08]"
                                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                            }`}
                          >
                            <div className="text-base font-semibold text-white">Mám doménu</div>
                            <p className="mt-2 text-sm text-slate-400">
                              Už vlastníte doménu a chcete ji použít pro nový web.
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDomainOwned(false);
                              setDomainCheckMessage(null);
                            }}
                            className={`rounded-3xl border p-5 text-left transition ${
                              domainOwned === false
                                ? "border-violet-400/40 bg-white/[0.08]"
                                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                            }`}
                          >
                            <div className="text-base font-semibold text-white">Nemám doménu</div>
                            <p className="mt-2 text-sm text-slate-400">
                              Doménu zatím nemáte a chcete, abychom ji pomohli zajistit.
                            </p>
                          </button>
                        </div>

                        {domainOwned === true && (
                          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                            <div className="text-sm font-semibold text-white">Zadejte vaši doménu</div>
                            <input
                              value={domain}
                              onChange={(e) => setDomain(e.target.value)}
                              placeholder="např. garagelabs.cz"
                              style={inputBaseStyle}
                              className="mt-4 w-full rounded-[10px] border border-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                            />

                            <div className="mt-4 rounded-[10px] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
                              Instrukce pro přidání domény zobrazíme až v klientské zóně po hotovém návrhu.
                            </div>
                          </div>
                        )}

                        {domainOwned === false && (
                          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                            <div className="text-sm font-semibold text-white">Vyberte požadovanou doménu</div>
                            <input
                              value={domain}
                              onChange={(e) => setDomain(e.target.value)}
                              placeholder="např. garagelabs.cz"
                              style={inputBaseStyle}
                              className="mt-4 w-full rounded-[10px] border border-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                            />

                            <div className="mt-4 flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={simulateDomainCheck}
                                className="rounded-[10px] border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.10]"
                              >
                                Ověřit dostupnost
                              </button>
                            </div>

                            {domainCheckMessage && (
                              <div className="mt-4 rounded-[10px] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
                                {domainCheckMessage}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-6">
                        <div>
                          <div className="text-base font-semibold text-white">
                            2) Podnikání, styl a podklady
                          </div>
                          <p className="mt-2 text-sm text-slate-400">
                            Tady nám řeknete, jak má web působit vizuálně a co přesně má obsahovat.
                          </p>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                          <label className="text-sm font-semibold text-white">O vašem podnikání</label>
                          <textarea
                            value={business}
                            onChange={(e) => setBusiness(e.target.value)}
                            placeholder="Jednou větou popište, co děláte. Např. Svatební salon zaměřený na moderní šaty a doplňky..."
                            style={inputBaseStyle}
                            className="mt-3 min-h-[160px] w-full rounded-[10px] border border-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                          />
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                            <label className="text-sm font-semibold text-white">Obor podnikání</label>
                            <input
                              value={businessType}
                              onChange={(e) => setBusinessType(e.target.value)}
                              placeholder="Např. Svatební salon, realitní kancelář, kosmetika..."
                              style={inputBaseStyle}
                              className="mt-3 w-full rounded-[10px] border border-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                            />
                          </div>

                          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                            <label className="text-sm font-semibold text-white">Preferovaný styl</label>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {STYLE_OPTIONS.map((style) => {
                                const active = preferredStyle === style;
                                return (
                                  <button
                                    key={style}
                                    type="button"
                                    onClick={() => setPreferredStyle(style)}
                                    className={`rounded-[10px] border px-4 py-2 text-sm transition ${
                                      active
                                        ? "border-violet-400/40 bg-white/[0.10] text-white"
                                        : "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
                                    }`}
                                  >
                                    {style}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                          <label className="text-sm font-semibold text-white">
                            Máte vlastní barvy? Přidejte je tady
                          </label>
                          <input
                            value={brandColors}
                            onChange={(e) => setBrandColors(e.target.value)}
                            placeholder="Např. černá, bílá, fialová / #111111 #ffffff #7c3aed"
                            style={inputBaseStyle}
                            className="mt-3 w-full rounded-[10px] border border-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                          />
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                            <label className="text-sm font-semibold text-white">Nahrajte logo</label>
                            <input
                              type="file"
                              accept="image/*,.svg,.pdf"
                              multiple
                              onChange={(e) => handleLogoFiles(e.target.files)}
                              className="mt-3 block w-full text-sm text-slate-300 file:mr-4 file:rounded-[10px] file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/15"
                            />

                            {logoFiles.length > 0 ? (
                              <div className="mt-3 rounded-[10px] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                                {logoFiles.map((file) => file.name).join(", ")}
                              </div>
                            ) : (
                              <div className="mt-3 rounded-[10px] border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
                                Pokud logo nemáte, doplníme později i AI variantu.
                              </div>
                            )}
                          </div>

                          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                            <label className="text-sm font-semibold text-white">
                              Popis webu co nejdetailněji
                            </label>
                            <textarea
                              value={websiteDesc}
                              onChange={(e) => setWebsiteDesc(e.target.value)}
                              placeholder="Jaké sekce má web mít, jak má působit, co má obsahovat, jaký je cíl webu..."
                              style={inputBaseStyle}
                              className="mt-3 min-h-[220px] w-full rounded-[10px] border border-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                            />

                            <button
                              type="button"
                              onClick={improveDescriptionDemo}
                              disabled={improvingText}
                              className="mt-4 rounded-[10px] bg-gradient-to-r from-violet-500 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {improvingText ? "AI vylepšuje..." : "Vylepšit s AI"}
                            </button>
                          </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                          <label className="text-sm font-semibold text-white">Nahrát další soubory</label>
                          <input
                            type="file"
                            multiple
                            onChange={(e) => handleMaterialFiles(e.target.files)}
                            className="mt-3 block w-full text-sm text-slate-300 file:mr-4 file:rounded-[10px] file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/15"
                          />

                          {materialFiles.length > 0 && (
                            <div className="mt-4 rounded-[10px] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-300">
                              {materialFiles.map((file) => file.name).join(", ")}
                            </div>
                          )}
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                          <label className="text-sm font-semibold text-white">Poznámka k podkladům</label>
                          <textarea
                            value={materialsNote}
                            onChange={(e) => setMaterialsNote(e.target.value)}
                            placeholder="Např. texty pošlu později, logo zatím nemám, fotky dodám do 2 dnů..."
                            style={inputBaseStyle}
                            className="mt-3 min-h-[140px] w-full rounded-[10px] border border-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      onClick={logout}
                      className="inline-flex items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.10]"
                    >
                      Odhlásit
                    </button>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <button
                        type="button"
                        onClick={() => savePartial()}
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? "Ukládám…" : "Uložit"}
                      </button>

                      {step < totalSteps ? (
                        <button
                          type="button"
                          onClick={() => savePartial(step + 1)}
                          disabled={saving || !canContinue()}
                          className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_40px_-18px_rgba(139,92,246,0.7)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving ? "Ukládám…" : "Pokračovat"}
                          <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={async () => {
                            await savePartial();
                            router.push("/preparing");
                            router.refresh();
                          }}
                          disabled={saving}
                          className="inline-flex items-center justify-center rounded-[10px] bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_40px_-18px_rgba(139,92,246,0.7)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Dokončit a pokračovat
                          <ArrowRightIcon className="ml-2 h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center text-[0.625rem] font-medium text-slate-600">
                © {currentYear} Webraketa.cz • Všechna práva vyhrazena
              </div>
            </div>
          </main>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient-xy {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 15s ease infinite;
        }

        input,
        textarea,
        select {
          color-scheme: dark;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active,
        textarea:-webkit-autofill,
        textarea:-webkit-autofill:hover,
        textarea:-webkit-autofill:focus,
        textarea:-webkit-autofill:active {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0 1000px rgba(2, 6, 23, 0.72) inset !important;
          box-shadow: 0 0 0 1000px rgba(2, 6, 23, 0.72) inset !important;
          caret-color: #ffffff !important;
          transition: background-color 9999s ease-in-out 0s;
          border-radius: 1rem;
        }
      `}</style>
    </>
  );
}