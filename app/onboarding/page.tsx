"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

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

export default function OnboardingPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);

  // kroky
  const [step, setStep] = useState(1);

  // form state
  const [business, setBusiness] = useState("");
  const [domain, setDomain] = useState("");
  const [domainOwned, setDomainOwned] = useState<boolean | null>(null);
  const [websiteDesc, setWebsiteDesc] = useState("");
  const [materialsNote, setMaterialsNote] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const totalSteps = 4;

  const progress = useMemo(() => {
    return Math.round((step / totalSteps) * 100);
  }, [step]);

  // 1) ochrana + načtení profilu
  useEffect(() => {
    let mounted = true;

    async function init() {
      setLoading(true);
      setError(null);
      setInfo(null);

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

      // načti profil
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

      // pokud profil neexistuje, vytvoříme
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

        // znovu načti
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
        // naplníme formulář
        setBusiness(afterInsert.business ?? "");
        setDomain(afterInsert.domain ?? "");
        setDomainOwned(afterInsert.domain_owned ?? null);
        setWebsiteDesc(afterInsert.website_desc ?? "");
        setMaterialsNote(afterInsert.materials_note ?? "");
        setLoading(false);
        return;
      }

      // existuje
      if (!mounted) return;
      setProfile(existing);
      setBusiness(existing.business ?? "");
      setDomain(existing.domain ?? "");
      setDomainOwned(existing.domain_owned ?? null);
      setWebsiteDesc(existing.website_desc ?? "");
      setMaterialsNote(existing.materials_note ?? "");
      setLoading(false);
    }

    init();

    return () => {
      mounted = false;
    };
  }, [router]);

  async function savePartial(nextStep?: number) {
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
        business: business.trim() ? business.trim() : null,
        domain: domain.trim() ? domain.trim() : null,
        domain_owned: domainOwned,
        website_desc: websiteDesc.trim() ? websiteDesc.trim() : null,
        materials_note: materialsNote.trim() ? materialsNote.trim() : null,
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
    await supabase.auth.signOut();
    router.push("/login");
  }

  function goToZone() {
    router.push("/dashboard");
    router.refresh();
  }

  // validace per krok (lehce)
  function canContinue() {
    if (step === 1) return business.trim().length >= 2; // aspoň něco
    if (step === 2) return domain.trim().length >= 3 && domainOwned !== null;
    if (step === 3) return websiteDesc.trim().length >= 10; // něco smysluplného
    return true;
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-zinc-950 text-zinc-200 antialiased">
        <div className="relative min-h-dvh overflow-hidden">
          <div className="pointer-events-none absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-violet-600/20 blur-[6rem]" />
          <div className="pointer-events-none absolute top-10 right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-blue-600/15 blur-[7rem]" />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />

          <div className="relative z-10 mx-auto max-w-4xl px-6 py-16">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl">
              Načítám onboarding…
            </div>
          </div>
        </div>
      </div>
    );
  }

  const planLabel = normalizePlanLabel(profile?.plan ?? null);
  const billingLabel = normalizeBillingLabel(profile?.billing_type ?? null);

  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-200 antialiased">
      <div className="relative min-h-dvh overflow-hidden">
        {/* Glow */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[32rem] w-[32rem] rounded-full bg-violet-600/20 blur-[6rem]" />
        <div className="pointer-events-none absolute top-10 right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-blue-600/15 blur-[7rem]" />

        {/* Grid */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:linear-gradient(to_bottom,black_40%,transparent_100%)]" />

        {/* Header */}
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

        {/* Content */}
        <main className="relative z-10">
          <div className="mx-auto max-w-5xl px-6 py-10 md:py-14">
            <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl">
              {/* Title Row */}
              <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold text-white md:text-3xl">
                    Řekněte nám něco o vašem podnikání
                  </h1>
                  <p className="mt-2 text-sm text-zinc-400">
                    Tyto kroky můžete kdykoliv přeskočit a doplnit později.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
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

                <div className="text-right">
                  <div className="text-xs uppercase tracking-wide text-zinc-400">Postup</div>
                  <div className="text-2xl font-semibold text-white">{progress}%</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-6 h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Info/Error */}
              {(error || info) && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm">
                  {error ? (
                    <span className="text-red-300">{error}</span>
                  ) : (
                    <span className="text-emerald-300">{info}</span>
                  )}
                </div>
              )}

              {/* Steps */}
              <div className="mt-8">
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-white">
                      1) O vašem podnikání
                    </div>
                    <p className="text-sm text-zinc-400">
                      Jednou větou popište, co děláte (např. “Kosmetický salon v Brně”, “Autoservis
                      a pneuservis”, “Realitní makléř”…).
                    </p>

                    <textarea
                      value={business}
                      onChange={(e) => setBusiness(e.target.value)}
                      placeholder="Napište stručně, čím se zabýváte…"
                      className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-white">2) Doména</div>
                    <p className="text-sm text-zinc-400">
                      Máte už doménu? Pokud ano, zadejte ji. Pokud ne, zadejte doménu, kterou chcete
                      (dostupnost budeme řešit později – teď jen ukládáme vstup).
                    </p>

                    <input
                      value={domain}
                      onChange={(e) => setDomain(e.target.value)}
                      placeholder="např. moje-domena.cz"
                      className="w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                    />

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setDomainOwned(true)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          domainOwned === true
                            ? "border-violet-400/40 bg-white/[0.10] text-white"
                            : "border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]"
                        }`}
                      >
                        Doménu už mám
                      </button>

                      <button
                        type="button"
                        onClick={() => setDomainOwned(false)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          domainOwned === false
                            ? "border-violet-400/40 bg-white/[0.10] text-white"
                            : "border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/[0.10]"
                        }`}
                      >
                        Doménu nemám
                      </button>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400">
                      <span className="text-zinc-300 font-medium">Poznámka:</span> DNS a ověření domény
                      doplníme až v další fázi. Teď jen uložíme, co klient chce / má.
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-white">3) Popis webu</div>
                    <p className="text-sm text-zinc-400">
                      Napište, jaký web chcete: sekce, styl, co má obsahovat, inspirace, cíle…
                    </p>

                    <textarea
                      value={websiteDesc}
                      onChange={(e) => setWebsiteDesc(e.target.value)}
                      placeholder="Např. chci one-page prezentaci, sekce: služby, reference, kontakt… styl moderní, tmavý…"
                      className="min-h-[160px] w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                    />

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400">
                      AI “Vylepšit popis” doplníme později (tlačítko + API route).
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-4">
                    <div className="text-sm font-semibold text-white">4) Materiály a poznámky</div>
                    <p className="text-sm text-zinc-400">
                      Co ještě máte / dodáte? (logo, texty, fotky, přístupy…). Uploady do storage doděláme
                      později – teď jen poznámka.
                    </p>

                    <textarea
                      value={materialsNote}
                      onChange={(e) => setMaterialsNote(e.target.value)}
                      placeholder="Např. logo dodám, fotky mám, texty pošlu v DOCX…"
                      className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-zinc-950/40 px-4 py-3 text-white outline-none placeholder:text-zinc-500 focus:border-violet-400/40 focus:ring-2 focus:ring-violet-500/20"
                    />

                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300">
                      <div className="font-semibold text-white">Shrnutí</div>
                      <div className="mt-2 grid gap-2 text-sm text-zinc-300">
                        <div>
                          <span className="text-zinc-400">Balíček:</span> {planLabel} ·{" "}
                          {billingLabel}
                        </div>
                        <div>
                          <span className="text-zinc-400">Podnikání:</span>{" "}
                          {business?.trim() || "—"}
                        </div>
                        <div>
                          <span className="text-zinc-400">Doména:</span>{" "}
                          {domain?.trim() || "—"}{" "}
                          {domainOwned === null
                            ? ""
                            : domainOwned
                            ? "(vlastní)"
                            : "(chci koupit)"}
                        </div>
                        <div>
                          <span className="text-zinc-400">Popis webu:</span>{" "}
                          {websiteDesc?.trim() ? "✅ vyplněno" : "—"}
                        </div>
                        <div>
                          <span className="text-zinc-400">Materiály:</span>{" "}
                          {materialsNote?.trim() ? "✅ vyplněno" : "—"}
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-zinc-400">
                        Platbu (ověření karty / Stripe) přidáme jako další krok na konci onboardingu, až doladíte
                        balíčky.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer controls */}
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
                        goToZone();
                      }}
                      disabled={saving}
                      className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_40px_-18px_rgba(139,92,246,0.7)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Dokončit a jít do zóny
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