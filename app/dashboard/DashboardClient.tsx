"use client";

import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";

type PlanTier = "start" | "pro" | "premium";

type NavItem = {
  id: string;
  label: string;
  icon: string;
};

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "solar:widget-4-linear" },
  { id: "proposal", label: "Návrh webu", icon: "solar:laptop-minimalistic-linear" },
  { id: "files", label: "Podklady", icon: "solar:folder-with-files-linear" },
  { id: "cms", label: "CMS", icon: "solar:pen-new-square-linear" },
  { id: "billing", label: "Fakturace", icon: "solar:card-linear" },
  { id: "support", label: "Podpora", icon: "solar:chat-round-dots-linear" },
];

const projects = [
  {
    id: 1,
    name: "Webraketa klientská zóna",
    status: "preparing",
    progress: 24,
    phase: "Příprava prvního návrhu",
    eta: "Do 48 hodin",
    active: true,
  },
  {
    id: 2,
    name: "Landing page kampaně",
    status: "queued",
    progress: 0,
    phase: "Čeká na zahájení",
    eta: "Naváže později",
    active: false,
  },
  {
    id: 3,
    name: "Microsite pro nový produkt",
    status: "queued",
    progress: 0,
    phase: "Připraveno do fronty",
    eta: "Po dokončení hlavního webu",
    active: false,
  },
];

function hasCmsAccess(plan: PlanTier) {
  return plan === "pro" || plan === "premium";
}

function hasPrivateChatAccess(plan: PlanTier) {
  return plan === "premium";
}

function planLabel(plan: PlanTier) {
  if (plan === "premium") return "PREMIUM";
  if (plan === "pro") return "PRO";
  return "START";
}

function planDescription(plan: PlanTier) {
  if (plan === "premium") {
    return "Prémiový balíček s rozšířenou podporou, soukromým chatem a plným klientským workflow.";
  }
  if (plan === "pro") {
    return "Rozšířený balíček s lepším workflow, přístupem do CMS a silnější správou projektu.";
  }
  return "Základní balíček pro rychlé spuštění webu a přehled zakázky v klientské zóně.";
}

export default function DashboardClient() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // DEMO – později napojíme na DB
  const currentPlan: PlanTier = "start";

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login");
      }
    });
  }, [router]);

  const activeProject = useMemo(() => {
    return projects.find((p) => p.active) ?? projects[0];
  }, []);

  const cmsUnlocked = hasCmsAccess(currentPlan);
  const privateChatUnlocked = hasPrivateChatAccess(currentPlan);

  return (
    <>
      {/* Ambient */}
      <div className="pointer-events-none fixed left-[8%] top-0 h-[30rem] w-[30rem] -translate-y-1/3 rounded-full bg-violet-600/20 blur-[130px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-[36rem] w-[36rem] translate-y-1/3 rounded-full bg-blue-600/10 blur-[130px]" />

      {/* Grid */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 mx-auto max-w-[1550px] px-5 py-6 md:px-8 md:py-8">
        {/* TOP APP BAR */}
        <header className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.06] px-4 py-4 backdrop-blur-xl md:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white">
                  <Icon icon="solar:rocket-2-linear" width={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Webraketa.cz</div>
                  <div className="text-xs text-zinc-500">Klientská zóna</div>
                </div>
              </div>

              <div className="hidden h-8 w-px bg-white/10 xl:block" />

              <nav className="flex flex-wrap items-center gap-2">
                {NAV_ITEMS.map((item) => {
                  const active = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                        active
                          ? "border-violet-400/30 bg-white/[0.10] text-white"
                          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      <Icon icon={item.icon} width={16} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <Icon icon="solar:user-circle-linear" width={18} />
                Profil
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <Icon icon="solar:settings-linear" width={18} />
                Nastavení
              </button>

              <button
                onClick={async () => {
                  const supabase = getSupabaseBrowserClient();
                  await supabase.auth.signOut();
                  router.push("/login");
                }}
                className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
                aria-label="Odhlásit"
                title="Odhlásit"
              >
                <Icon
                  icon="solar:logout-2-linear"
                  className="text-zinc-400 transition-colors group-hover:text-white"
                  width={18}
                />
              </button>
            </div>
          </div>
        </header>

        {/* PAGE HEADER */}
        <section className="mb-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-4xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-violet-300">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />
                Klientská aplikace
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-white md:text-6xl">
                Vítejte v klientské zóně
              </h1>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
                Tady uvidíte aktuální stav vašeho webu, návrhy, připomínky, podklady,
                přístup do CMS i další kroky až po finální spuštění na doméně.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
                Balíček: <span className="font-semibold text-white">{planLabel(currentPlan)}</span>
              </div>
              <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
                Aktivní projekt: <span className="font-semibold text-white">{activeProject.name}</span>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.6fr)_390px]">
          {/* LEFT */}
          <div className="space-y-8">
            {/* HERO PROJECT */}
            <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
              <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_380px]">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-blue-300">
                      Aktuální projekt
                    </span>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                      Aktivní
                    </span>
                  </div>

                  <h2 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
                    {activeProject.name}
                  </h2>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
                    Vaše zadání jsme přijali a aktuálně připravujeme první návrh webu.
                    Jakmile bude návrh připravený, zobrazí se zde možnost schválení,
                    připomínek a následných kroků ke spuštění.
                  </p>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-zinc-950/30 p-4">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">Aktuální fáze</div>
                      <div className="mt-2 text-sm font-medium text-white">{activeProject.phase}</div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-zinc-950/30 p-4">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">Předpoklad</div>
                      <div className="mt-2 text-sm font-medium text-white">{activeProject.eta}</div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-zinc-950/30 p-4">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">Další krok</div>
                      <div className="mt-2 text-sm font-medium text-white">Zveřejnění návrhu</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-blue-500/10 to-violet-500/10 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                        Stav zakázky
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-white">
                        Váš web se připravuje
                      </div>
                    </div>

                    <div className="relative flex h-12 w-12 items-center justify-center">
                      <div className="absolute inset-0 rounded-full bg-violet-500/20 blur-md animate-pulse" />
                      <div className="h-9 w-9 rounded-full border-2 border-violet-400/40 border-t-violet-300 animate-spin" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between text-sm text-zinc-400">
                      <span>Postup projektu</span>
                      <span>{activeProject.progress}%</span>
                    </div>

                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                        style={{ width: `${activeProject.progress}%` }}
                      />
                    </div>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-zinc-400">
                    Pokud budeme potřebovat doplnit informace, ozveme se vám z čísla{" "}
                    <span className="font-medium text-white">777 777 777</span>.
                  </p>
                </div>
              </div>
            </section>

            {/* QUICK ACTIONS */}
            <section className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-violet-300">
                  <Icon icon="solar:laptop-minimalistic-linear" width={22} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">Návrh webu</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  Až bude návrh připravený, zobrazí se zde náhled, schválení a připomínky.
                </p>
                <button
                  disabled
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-zinc-500"
                >
                  Zatím se připravuje
                </button>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-blue-300">
                  <Icon icon="solar:folder-with-files-linear" width={22} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">Podklady</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  Nahrajte texty, logo, fotky i další soubory pro co nejrychlejší realizaci.
                </p>
                <button className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white">
                  Otevřít podklady
                </button>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-emerald-300">
                  <Icon icon="solar:pen-new-square-linear" width={22} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">Upravit web pomocí CMS</h3>
                  {!cmsUnlocked && (
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-300">
                      Od PRO
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  Správa textů, sekcí a obsahu webu přes jednoduché CMS rozhraní.
                </p>
                <button
                  disabled={!cmsUnlocked}
                  className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                    cmsUnlocked
                      ? "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                      : "border-white/10 bg-zinc-900 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  {cmsUnlocked ? "Otevřít CMS" : "Dostupné od balíčku PRO"}
                </button>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-pink-300">
                  <Icon icon="solar:chat-round-dots-linear" width={22} />
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">Soukromý chat</h3>
                  {!privateChatUnlocked && (
                    <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-300">
                      Od PREMIUM
                    </span>
                  )}
                </div>
                <p className="mt-2 text-sm leading-7 text-zinc-400">
                  Přímý soukromý chat s týmem pro rychlejší komunikaci a prioritní podporu.
                </p>
                <button
                  disabled={!privateChatUnlocked}
                  className={`mt-5 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition ${
                    privateChatUnlocked
                      ? "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                      : "border-white/10 bg-zinc-900 text-zinc-500 cursor-not-allowed"
                  }`}
                >
                  {privateChatUnlocked ? "Otevřít chat" : "Dostupné od balíčku PREMIUM"}
                </button>
              </div>
            </section>

            {/* PROJECT WORKFLOW + FILES */}
            <section className="grid grid-cols-1 gap-8 2xl:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
              {/* workflow */}
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      Workflow projektu
                    </div>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      Přehled všech kroků
                    </h3>
                  </div>

                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm text-zinc-300">
                    Fáze 2 z 6
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { title: "Zadání a onboarding", state: "done", icon: "solar:check-circle-linear" },
                    { title: "Příprava prvního návrhu", state: "active", icon: "solar:pen-new-square-linear" },
                    { title: "Schválení nebo připomínky", state: "waiting", icon: "solar:chat-round-linear" },
                    { title: "Finalizace webu", state: "waiting", icon: "solar:code-circle-linear" },
                    { title: "Platba před spuštěním", state: "waiting", icon: "solar:card-linear" },
                    { title: "Nasazení na doménu", state: "waiting", icon: "solar:rocket-linear" },
                  ].map((item) => {
                    const active = item.state === "active";
                    const done = item.state === "done";

                    return (
                      <div
                        key={item.title}
                        className={`flex items-start gap-4 rounded-3xl border p-4 ${
                          active
                            ? "border-blue-500/30 bg-blue-500/10"
                            : done
                            ? "border-emerald-500/20 bg-emerald-500/5"
                            : "border-white/10 bg-zinc-950/20"
                        }`}
                      >
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                            active
                              ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                              : done
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                              : "border-white/10 bg-white/[0.04] text-zinc-500"
                          }`}
                        >
                          <Icon icon={item.icon} width={20} />
                        </div>

                        <div>
                          <div className="text-sm font-medium text-white">{item.title}</div>
                          <div className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
                            {done ? "Dokončeno" : active ? "Probíhá" : "Čeká"}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* files / proposal block */}
              <div className="space-y-8">
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Návrh webu
                  </div>
                  <h3 className="mt-2 text-2xl font-semibold text-white">
                    Připraveno pro schválení
                  </h3>

                  <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-zinc-950/30 p-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-500">
                      <Icon icon="solar:laptop-minimalistic-linear" width={28} />
                    </div>

                    <div className="mt-4 text-base font-medium text-white">
                      Návrh zatím není zveřejněný
                    </div>
                    <p className="mt-2 text-sm leading-7 text-zinc-400">
                      Jakmile bude první verze hotová, objeví se zde náhled webu, tlačítko pro
                      schválení a možnost požádat o úpravy.
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      disabled
                      className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-5 py-3 text-sm font-medium text-zinc-500"
                    >
                      <Icon icon="solar:check-circle-linear" width={18} />
                      Schválit návrh
                    </button>

                    <button
                      disabled
                      className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-5 py-3 text-sm font-medium text-zinc-500"
                    >
                      <Icon icon="solar:pen-linear" width={18} />
                      Požádat o úpravy
                    </button>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-zinc-400">
                    Po schválení návrhu vás provedeme posledními kroky před spuštěním webu.
                  </p>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Podklady
                      </div>
                      <h3 className="mt-2 text-xl font-semibold text-white">
                        Nahrané soubory
                      </h3>
                    </div>

                    <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white">
                      <Icon icon="solar:upload-linear" width={16} />
                      Nahrát další
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-950/30 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                          <Icon icon="solar:file-text-linear" width={20} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Texty_homepage_final.docx</div>
                          <div className="mt-1 text-xs text-zinc-500">14.3 KB • Přijato</div>
                        </div>
                      </div>

                      <button className="p-2 text-zinc-600 transition-colors hover:text-red-400">
                        <Icon icon="solar:trash-bin-trash-linear" width={18} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-zinc-950/30 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 text-orange-300">
                          <Icon icon="solar:gallery-linear" width={20} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Logo_vektor.svg</div>
                          <div className="mt-1 text-xs text-zinc-500">2.1 MB • Přijato</div>
                        </div>
                      </div>

                      <button className="p-2 text-zinc-600 transition-colors hover:text-red-400">
                        <Icon icon="solar:trash-bin-trash-linear" width={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="space-y-8">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Aktuální projekt
              </div>
              <h3 className="mt-2 text-2xl font-semibold text-white">{activeProject.name}</h3>

              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Hlavní aktivní projekt, na kterém nyní pracujeme. Všechny další připravené projekty
                najdete níže.
              </p>

              <div className="mt-6 rounded-3xl border border-white/10 bg-zinc-950/30 p-5">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Aktuální stav</div>
                <div className="mt-2 text-base font-medium text-white">Příprava prvního návrhu</div>
                <div className="mt-2 text-sm text-zinc-400">Očekávaný návrh: {activeProject.eta}</div>
              </div>

              <div className="mt-4 rounded-3xl border border-white/10 bg-zinc-950/30 p-5">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Balíček</div>
                <div className="mt-2 text-base font-medium text-white">{planLabel(currentPlan)}</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {planDescription(currentPlan)}
                </p>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Další připravené projekty
              </div>

              <div className="mt-5 space-y-3">
                {projects
                  .filter((project) => !project.active)
                  .map((project) => (
                    <button
                      key={project.id}
                      className="w-full rounded-3xl border border-white/10 bg-zinc-950/30 p-4 text-left transition hover:bg-white/[0.05]"
                    >
                      <div className="text-sm font-medium text-white">{project.name}</div>
                      <div className="mt-1 text-xs text-zinc-500">{project.phase}</div>
                    </button>
                  ))}
              </div>

              <p className="mt-5 text-sm leading-7 text-zinc-400">
                Jakmile budete mít více aktivních zakázek, budete se mezi nimi přepínat právě zde.
              </p>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Fakturace a podpora
              </div>

              <div className="mt-5 rounded-3xl border border-white/10 bg-zinc-950/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/10 text-violet-300">
                    <Icon icon="solar:card-linear" width={18} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">Platba zatím není vyžadována</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Platba proběhne až po schválení návrhu
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-white/10 bg-zinc-950/30 p-5">
                <div className="text-sm font-medium text-white">Potřebujete pomoci?</div>
                <div className="mt-3 space-y-2 text-sm text-zinc-400">
                  <a
                    href="mailto:podpora@webraketa.cz"
                    className="flex items-center gap-2 transition-colors hover:text-white"
                  >
                    <Icon icon="solar:letter-linear" width={16} />
                    podpora@webraketa.cz
                  </a>

                  <div className="flex items-center gap-2">
                    <Icon icon="solar:phone-linear" width={16} />
                    777 777 777
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <footer className="mt-16 border-t border-white/5 pt-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 opacity-50">
            <span className="h-1 w-1 rounded-full bg-violet-500" />
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Webraketa</span>
            <span className="h-1 w-1 rounded-full bg-violet-500" />
          </div>
          <p className="text-xs text-zinc-600">
            © 2026 Webraketa.cz. Všechna práva vyhrazena.
            <br />
            Klientská zóna pro přehled zakázek, schvalování návrhů a správu dalšího postupu.
          </p>
        </footer>
      </div>
    </>
  );
}