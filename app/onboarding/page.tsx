"use client";

import { useEffect, useMemo, useState } from "react";
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

function normalizePlanLabel(plan: string | null) {
  const p = (plan ?? "start").toLowerCase();
  if (p === "pro") return "PRO";
  if (p === "premium") return "PREMIUM";
  if (p === "enterprise") return "ENTERPRISE";
  return "START";
}

function normalizeBillingLabel(billing: string | null) {
  const b = (billing ?? "subscription").toLowerCase();
  return b === "one_time" ? "Jednorázově" : "Měsíční předplatné";
}

function planDescription(plan: string | null) {
  const p = (plan ?? "start").toLowerCase();
  const found = PLAN_OPTIONS.find((item) => item.id === p);
  return found?.desc ?? PLAN_OPTIONS[0].desc;
}

export default function OnboardingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [improvingText, setImprovingText] = useState(false);

  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [business, setBusiness] = useState("");
  const [domain, setDomain] = useState("");
  const [domainOwned, setDomainOwned] = useState<boolean | null>(null);
  const [websiteDesc, setWebsiteDesc] = useState("");
  const [materialsNote, setMaterialsNote] = useState("");

  const [selectedPlan, setSelectedPlan] = useState("start");
  const [selectedBilling, setSelectedBilling] = useState("subscription");
  const [planExpanded, setPlanExpanded] = useState(false);

  const [businessType, setBusinessType] = useState("");
  const [preferredStyle, setPreferredStyle] = useState("");
  const [brandColors, setBrandColors] = useState("");
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [materialFiles, setMaterialFiles] = useState<File[]>([]);

  const [domainCheckMessage, setDomainCheckMessage] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const progress = useMemo(() => {
    return Math.round((step / totalSteps) * 100);
  }, [step]);

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
        setSelectedBilling((afterInsert.billing_type ?? "subscription").toLowerCase());
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
      setSelectedBilling((existing.billing_type ?? "subscription").toLowerCase());
      setLoading(false);
    }

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  function buildWebsiteDescPayload() {
    const parts = [
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

  function goToZone() {
    router.push("/dashboard");
    router.refresh();
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
    if (step === 1) return business.trim().length >= 2;
    if (step === 2) {
      if (domainOwned === null) return false;
      return domain.trim().length >= 3;
    }
    if (step === 3) {
      return businessType.trim().length >= 2 && websiteDesc.trim().length >= 10;
    }
    return true;
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-zinc-950 text-zinc-200 antialiased">
        <div className="relative min-h-dvh overflow-hidden">
          <div className="pointer-events-none absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-violet-600/20 blur-[6rem]" />
          <div className="pointer-events-none absolute top-10 right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-blue-600/15 blur-[7rem]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />

          <div className="relative z-10 mx-auto max-w-7xl px-6 py-16">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl">
              Načítám onboarding…
            </div>
          </div>
        </div>
      </div>
    );
  }

  const planLabel = normalizePlanLabel(selectedPlan);
  const billingLabel = normalizeBillingLabel(selectedBilling);

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-200 antialiased">
      <div className="relative min-h-dvh overflow-hidden">
        <div className="pointer-events-none absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-violet-600/20 blur-[6rem]" />
        <div className="pointer-events-none absolute top-10 right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-blue-600/15 blur-[7rem]" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />

        <header className="relative z-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-xl" />
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-semibold text-white">Webraketa.cz</span>
                <span className="text-xs text-zinc-400">Onboarding</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={goToZone}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-xl transition hover:bg-white/[0.10]"
              >
                Přeskočit a jít do zóny
              </button>

              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-xl transition hover:bg-white/[0.10]"
              >
                Odhlásit
              </button>
            </div>
          </div>
        </header>

        <main className="relative z-10">
          <div className="mx-auto max-w-7xl px-6 py-10 md:py-14">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-8 md:p-10 backdrop-blur-xl">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <h1 className="text-3xl font-semibold text-white md:text-5xl">
                    Řekněte nám něco o vašem podnikání
                  </h1>
                  <p className="mt-3 text-sm text-zinc-400 md:text-base">
                    Abychom mohli připravit váš web do 48 hodin, potřebujeme od vás tyto informace
                    co nejpřesněji vyplnit.
                  </p>

                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80">
                      Přihlášen: {sessionEmail ?? "—"}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80">
                      Balíček: {planLabel}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium text-white/80">
                      Typ: {billingLabel}
                    </span>
                  </div>
                </div>

                <div className="lg:min-w-[120px] lg:text-right">
                  <div className="text-xs uppercase tracking-wide text-zinc-400">Postup</div>
                  <div className="text-3xl font-semibold text-white">{progress}%</div>
                </div>
              </div>

              <div className="mt-6 h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {(error || info) && (
                <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm">
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
                    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                      <button
                        type="button"
                        onClick={() => setPlanExpanded((prev) => !prev)}
                        className="flex w-full items-start justify-between gap-4 text-left"
                      >
                        <div>
                          <div className="text-xs uppercase tracking-wider text-zinc-400">
                            Vybraný balíček
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white/[0.08] px-3 py-1 text-sm font-semibold text-white">
                              {planLabel}
                            </span>
                            <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-300">
                              {billingLabel}
                            </span>
                          </div>
                          <p className="mt-3 max-w-3xl text-sm text-zinc-400">
                            {planDescription(selectedPlan)}
                          </p>
                        </div>

                        <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-white/80">
                          {planExpanded ? "Skrýt" : "Změnit"}
                        </span>
                      </button>

                      {planExpanded && (
                        <div className="mt-5 grid gap-4 lg:grid-cols-3">
                          {PLAN_OPTIONS.map((option) => {
                            const active = selectedPlan === option.id;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() => setSelectedPlan(option.id)}
                                className={`rounded-3xl border p-5 text-left transition ${
                                  active
                                    ? "border-violet-400/40 bg-white/[0.08]"
                                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                                }`}
                              >
                                <div className="text-sm font-semibold text-white">{option.label}</div>
                                <p className="mt-2 text-sm leading-6 text-zinc-400">{option.desc}</p>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {planExpanded && (
                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => setSelectedBilling("subscription")}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                              selectedBilling === "subscription"
                                ? "border-violet-400/40 bg-white/[0.10] text-white"
                                : "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
                            }`}
                          >
                            Měsíční předplatné
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedBilling("one_time")}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                              selectedBilling === "one_time"
                                ? "border-violet-400/40 bg-white/[0.10] text-white"
                                : "border-white/10 bg-white/[0.04] text-white/80 hover:bg-white/[0.08]"
                            }`}
                          >
                            Jednorázově
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="text-base font-semibold text-white">1) O vašem podnikání</div>
                      <p className="text-sm text-zinc-400">
                        Jednou větou popište, co děláte. Čím přesnější budete, tím rychleji
                        připravíme správný návrh webu.
                      </p>

                      <textarea
                        value={business}
                        onChange={(e) => setBusiness(e.target.value)}
                        placeholder="Např. Autoservis a pneuservis v Praze, specializace na prémiové vozy..."
                        className="min-h-[180px] w-full rounded-3xl border border-white/10 bg-zinc-950/40 px-5 py-4 text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <div>
                      <div className="text-base font-semibold text-white">2) Doména</div>
                      <p className="mt-2 text-sm text-zinc-400">
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
                        <p className="mt-2 text-sm text-zinc-400">
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
                        <p className="mt-2 text-sm text-zinc-400">
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
                          className="mt-4 w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                        />

                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
                          Instrukce pro přidání domény zobrazíme až v klientské zóně po hotovém
                          návrhu. Teď jen uložíme, kterou doménu budeme řešit.
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
                          className="mt-4 w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                        />

                        <div className="mt-4 flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={simulateDomainCheck}
                            className="rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.10]"
                          >
                            Ověřit dostupnost
                          </button>

                          <button
                            type="button"
                            className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
                          >
                            Chci tuto doménu
                          </button>
                        </div>

                        {domainCheckMessage && (
                          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
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
                      <div className="text-base font-semibold text-white">3) Brand, styl a zadání webu</div>
                      <p className="mt-2 text-sm text-zinc-400">
                        Tady nám řeknete, jak má web působit vizuálně a co přesně má obsahovat.
                      </p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-2">
                      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                        <label className="text-sm font-semibold text-white">Obor podnikání</label>
                        <input
                          value={businessType}
                          onChange={(e) => setBusinessType(e.target.value)}
                          placeholder="Např. Autoservis, realitní kancelář, kosmetika..."
                          className="mt-3 w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
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
                                className={`rounded-full border px-4 py-2 text-sm transition ${
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
                        className="mt-3 w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
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
                          className="mt-3 block w-full text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/15"
                        />

                        {logoFiles.length > 0 ? (
                          <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-300">
                            {logoFiles.map((file) => file.name).join(", ")}
                          </div>
                        ) : (
                          <div className="mt-3 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
                            Pokud logo nemáte, v dalším kroku sem doplníme AI generování loga.
                          </div>
                        )}
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                        <label className="text-sm font-semibold text-white">Popis webu co nejdetailněji</label>
                        <textarea
                          value={websiteDesc}
                          onChange={(e) => setWebsiteDesc(e.target.value)}
                          placeholder="Jaké sekce má web mít, jak má působit, co má obsahovat, jaký je cíl webu..."
                          className="mt-3 min-h-[220px] w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                        />

                        <button
                          type="button"
                          onClick={improveDescriptionDemo}
                          disabled={improvingText}
                          className="mt-4 rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {improvingText ? "AI vylepšuje..." : "Vylepšit s AI"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <div className="text-base font-semibold text-white">4) Podklady a shrnutí</div>
                      <p className="mt-2 text-sm text-zinc-400">
                        Nahrajte texty, fotky, loga a další soubory, které k webu chcete použít.
                      </p>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                      <label className="text-sm font-semibold text-white">Nahrát soubory</label>
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleMaterialFiles(e.target.files)}
                        className="mt-3 block w-full text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-white/15"
                      />

                      {materialFiles.length > 0 && (
                        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-300">
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
                        className="mt-3 min-h-[140px] w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                      />
                    </div>

                    <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.03] p-6">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-[0.18em] text-zinc-400">
                            Shrnutí zadání
                          </div>
                          <h3 className="mt-2 text-2xl font-semibold text-white">
                            Připraveno pro návrh webu
                          </h3>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
                            Tohle je souhrn informací, se kterými bude náš tým pracovat při přípravě
                            prvního návrhu vašeho webu.
                          </p>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white">
                          {planLabel} · {billingLabel}
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-3xl border border-white/10 bg-zinc-950/30 p-5">
                          <div className="text-xs uppercase tracking-wide text-zinc-500">Podnikání</div>
                          <div className="mt-2 text-base font-medium text-white">
                            {business.trim() || "—"}
                          </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-zinc-950/30 p-5">
                          <div className="text-xs uppercase tracking-wide text-zinc-500">Doména</div>
                          <div className="mt-2 text-base font-medium text-white">
                            {domain.trim() || "—"}{" "}
                            {domainOwned === null
                              ? ""
                              : domainOwned
                              ? "(už vlastní)"
                              : "(chce registrovat)"}
                          </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-zinc-950/30 p-5">
                          <div className="text-xs uppercase tracking-wide text-zinc-500">Obor a styl</div>
                          <div className="mt-2 text-base font-medium text-white">
                            {businessType.trim() || "—"}
                          </div>
                          <div className="mt-2 text-sm text-zinc-400">
                            Styl: {preferredStyle || "—"}
                          </div>
                          <div className="mt-1 text-sm text-zinc-400">
                            Barvy: {brandColors.trim() || "—"}
                          </div>
                        </div>

                        <div className="rounded-3xl border border-white/10 bg-zinc-950/30 p-5">
                          <div className="text-xs uppercase tracking-wide text-zinc-500">Podklady</div>
                          <div className="mt-2 text-base font-medium text-white">
                            {materialFiles.length > 0
                              ? `${materialFiles.length} souborů připraveno`
                              : "Zatím bez souborů"}
                          </div>
                          <div className="mt-2 text-sm text-zinc-400">
                            Logo:{" "}
                            {logoFiles.length > 0
                              ? logoFiles.map((f) => f.name).join(", ")
                              : "nenahráno"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 rounded-3xl border border-white/10 bg-zinc-950/30 p-5">
                        <div className="text-xs uppercase tracking-wide text-zinc-500">
                          Detailní popis webu
                        </div>
                        <div className="mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                          {websiteDesc.trim() || "Zatím nevyplněno"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={step === 1 || saving}
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Zpět
                </button>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => savePartial()}
                    disabled={saving}
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 text-sm font-medium text-white/90 transition hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Ukládám…" : "Uložit"}
                  </button>

                  {step < totalSteps ? (
                    <button
                      type="button"
                      onClick={() => savePartial(step + 1)}
                      disabled={saving || !canContinue()}
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_40px_-18px_rgba(139,92,246,0.7)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saving ? "Ukládám…" : "Pokračovat"}
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
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_40px_-18px_rgba(139,92,246,0.7)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Dokončit a pokračovat
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-zinc-500">
              © 2026 Webraketa.cz · Všechna práva vyhrazena
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}