"use client";

import { Icon } from "@iconify/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";

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

const activeProject = projects.find((p) => p.active) ?? projects[0];

export default function DashboardClient() {
  const router = useRouter();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login");
      }
    });
  }, [router]);

  return (
    <>
      {/* Ambient Background Glows */}
      <div className="fixed left-[10%] top-0 h-[28rem] w-[28rem] -translate-y-1/3 rounded-full bg-violet-600/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 h-[34rem] w-[34rem] translate-y-1/3 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* Main */}
      <div className="relative z-10 mx-auto max-w-[1500px] px-6 py-8 md:px-8 md:py-12">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-violet-300 backdrop-blur-xl">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-violet-400" />
              Klientská zóna
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white md:text-5xl">
              Vítejte v klientské zóně
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
              Tady uvidíte aktuální stav vašeho webu, návrhy, požadavky na úpravy,
              podklady a všechny důležité kroky až po finální spuštění na doméně.
            </p>
          </div>

          <div className="flex items-center gap-4 self-start xl:self-auto">
            <div className="hidden text-right md:block">
              <p className="text-sm font-medium text-white">Klient Webraketa</p>
              <p className="text-xs text-zinc-500">Přístup do klientské zóny</p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-zinc-700 to-zinc-800 text-sm font-semibold text-white shadow-lg">
              WR
            </div>

            <button
              onClick={async () => {
                const supabase = getSupabaseBrowserClient();
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="group flex h-11 w-11 items-center justify-center rounded-full border border-white/5 bg-white/5 transition-all duration-300 hover:border-white/10 hover:bg-white/10"
              aria-label="Odhlásit"
              title="Odhlásit"
            >
              <Icon
                icon="solar:logout-2-linear"
                className="text-zinc-400 transition-colors group-hover:text-white"
                width={20}
              />
            </button>
          </div>
        </header>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.55fr)_380px]">
          {/* LEFT CONTENT */}
          <div className="space-y-8">
            {/* Hero project card */}
            <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
              <div className="flex flex-col gap-8 2xl:flex-row 2xl:items-start 2xl:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-blue-300">
                      Aktuální projekt
                    </span>
                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                      Aktivní
                    </span>
                  </div>

                  <h2 className="text-2xl font-semibold tracking-tight text-white md:text-4xl">
                    {activeProject.name}
                  </h2>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                    Vaše zadání jsme přijali a aktuálně připravujeme první návrh webu.
                    Jakmile bude návrh hotový, uvidíte ho zde v klientské zóně a dostanete oznámení.
                  </p>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-zinc-950/30 p-4">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">
                        Aktuální fáze
                      </div>
                      <div className="mt-2 text-sm font-medium text-white">
                        {activeProject.phase}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-zinc-950/30 p-4">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">
                        Předpoklad
                      </div>
                      <div className="mt-2 text-sm font-medium text-white">
                        {activeProject.eta}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-zinc-950/30 p-4">
                      <div className="text-xs uppercase tracking-wide text-zinc-500">
                        Další krok
                      </div>
                      <div className="mt-2 text-sm font-medium text-white">
                        Zveřejnění návrhu ke schválení
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-blue-500/10 to-violet-500/10 p-6">
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
                      <div className="absolute inset-0 animate-pulse rounded-full bg-violet-500/20 blur-md" />
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
                    Pokud s vámi budeme potřebovat projít doplňující informace, ozveme se vám z čísla{" "}
                    <span className="font-medium text-white">777 777 777</span>.
                  </p>
                </div>
              </div>
            </section>

            {/* Workflow + current state */}
            <section className="grid grid-cols-1 gap-8 2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              {/* Progress timeline */}
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                      Postup realizace
                    </div>
                    <h3 className="mt-2 text-xl font-semibold text-white">
                      Kde se aktuálně nacházíme
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
                    { title: "Klientské připomínky", state: "waiting", icon: "solar:chat-round-linear" },
                    { title: "Finalizace webu", state: "waiting", icon: "solar:code-circle-linear" },
                    { title: "Platba a schválení spuštění", state: "waiting", icon: "solar:card-linear" },
                    { title: "Nasazení na doménu", state: "waiting", icon: "solar:rocket-linear" },
                  ].map((item) => {
                    const active = item.state === "active";
                    const done = item.state === "done";

                    return (
                      <div
                        key={item.title}
                        className={`flex items-start gap-4 rounded-3xl border p-4 transition ${
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

              {/* Draft approval card */}
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  Návrh webu
                </div>
                <h3 className="mt-2 text-xl font-semibold text-white">
                  Až bude připraven, objeví se zde
                </h3>

                <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-zinc-950/30 p-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-500">
                    <Icon icon="solar:laptop-minimalistic-linear" width={28} />
                  </div>

                  <div className="mt-4 text-base font-medium text-white">
                    Návrh zatím není zveřejněný
                  </div>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    Jakmile bude první verze webu připravena, zobrazí se zde náhled, schválení návrhu
                    a možnost požádat o úpravy.
                  </p>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    disabled
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-5 py-3 text-sm font-medium text-zinc-500"
                  >
                    <Icon icon="solar:check-circle-linear" width={18} />
                    Schválit návrh
                  </button>

                  <button
                    disabled
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-5 py-3 text-sm font-medium text-zinc-500"
                  >
                    <Icon icon="solar:pen-linear" width={18} />
                    Požádat o úpravy
                  </button>
                </div>

                <p className="mt-5 text-sm leading-7 text-zinc-400">
                  Po schválení návrhu vás provedeme posledním krokem — platbou a spuštěním webu na
                  ostré doméně.
                </p>
              </div>
            </section>

            {/* Uploads + support */}
            <section className="grid grid-cols-1 gap-8 2xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
              {/* Uploads */}
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">Podklady pro váš web</h3>
                    <p className="mt-2 text-sm text-zinc-400">
                      Nahrajte logo, texty, fotky nebo další podklady. Čím dříve je máme, tím rychleji
                      můžeme pokračovat.
                    </p>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
                    Max 50MB
                  </span>
                </div>

                <div className="mb-8 rounded-[1.75rem] border border-dashed border-zinc-700 bg-zinc-900/30 p-8 text-center transition-all hover:border-violet-500/30 hover:bg-zinc-800/30">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-800 text-zinc-400">
                    <Icon icon="solar:add-folder-linear" width={24} />
                  </div>
                  <p className="text-sm font-medium text-zinc-200">
                    Klikněte pro nahrání nebo přetáhněte soubory
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    Logo (SVG, PNG), Texty (DOCX), Obrázky, PDF, další podklady
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Nahrané soubory
                  </div>

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

              {/* Support / status */}
              <div className="space-y-8">
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Aktuální projekt
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-white">{activeProject.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    {activeProject.phase}. Až bude připraven první návrh, uvidíte ho právě zde jako
                    hlavní aktivní projekt.
                  </p>

                  <div className="mt-6 rounded-3xl border border-white/10 bg-zinc-950/30 p-5">
                    <div className="text-xs uppercase tracking-wide text-zinc-500">
                      Aktuální stav
                    </div>
                    <div className="mt-2 text-base font-medium text-white">
                      Příprava prvního návrhu
                    </div>
                    <div className="mt-2 text-sm text-zinc-400">
                      Očekávané doručení: {activeProject.eta}
                    </div>
                  </div>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
                  <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Další projekty
                  </div>

                  <div className="mt-5 space-y-3">
                    {projects
                      .filter((p) => !p.active)
                      .map((project) => (
                        <div
                          key={project.id}
                          className="rounded-3xl border border-white/10 bg-zinc-950/30 p-4"
                        >
                          <div className="text-sm font-medium text-white">{project.name}</div>
                          <div className="mt-1 text-xs text-zinc-500">{project.phase}</div>
                        </div>
                      ))}
                  </div>

                  <p className="mt-5 text-sm leading-7 text-zinc-400">
                    Jakmile budete mít více projektů, všechny se vám zobrazí zde v pravém panelu.
                    Aktuální aktivní projekt vždy zůstane nahoře.
                  </p>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-6 md:p-8">
                  <h4 className="text-lg font-medium text-white">Potřebujete pomoci?</h4>
                  <p className="mt-2 text-sm leading-7 text-zinc-400">
                    Jsme tu pro vás na emailu i telefonu. Pokud budeme potřebovat projít zadání,
                    ozveme se z čísla 777 777 777.
                  </p>

                  <div className="mt-6 space-y-2 text-sm text-zinc-300">
                    <a
                      href="mailto:podpora@webraketa.cz"
                      className="flex items-center gap-2 transition-colors hover:text-white"
                    >
                      <Icon icon="solar:letter-linear" width={18} />
                      podpora@webraketa.cz
                    </a>

                    <div className="flex items-center gap-2 text-zinc-400">
                      <Icon icon="solar:phone-linear" width={18} />
                      777 777 777
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
                Přehled
              </div>

              <div className="mt-5 space-y-4">
                <div className="rounded-3xl border border-white/10 bg-zinc-950/30 p-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Aktivní projekt</div>
                  <div className="mt-2 text-base font-medium text-white">{activeProject.name}</div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-zinc-950/30 p-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Fáze</div>
                  <div className="mt-2 text-base font-medium text-white">{activeProject.phase}</div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-zinc-950/30 p-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Návrh webu</div>
                  <div className="mt-2 text-base font-medium text-white">Zatím se připravuje</div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                Fakturace
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
            Klientská zóna pro průběh zakázky, schvalování návrhů a další kroky.
          </p>
        </footer>
      </div>
    </>
  );
}