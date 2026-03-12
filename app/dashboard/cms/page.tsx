"use client";

import { Icon } from "@iconify/react";
import { useState } from "react";

const CMS_SECTIONS = [
  { id: "pages", label: "Stránky", icon: "solar:document-text-linear" },
  { id: "seo", label: "SEO nastavení", icon: "solar:magnifer-linear" },
  { id: "branding", label: "Branding", icon: "solar:pallete-2-linear" },
  { id: "navigation", label: "Navigace", icon: "solar:hamburger-menu-linear" },
  { id: "contact", label: "Kontaktní údaje", icon: "solar:phone-linear" },
  { id: "forms", label: "Formuláře", icon: "solar:checklist-linear" },
  { id: "scripts", label: "Kódy a integrace", icon: "solar:code-linear" },
];

const PAGE_ITEMS = [
  "Domovská stránka",
  "Služby",
  "O nás",
  "Reference",
  "Kontakt",
];

export default function CmsPage() {
  const [activeSection, setActiveSection] = useState("pages");
  const [activePage, setActivePage] = useState("Domovská stránka");

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">CMS</div>
            <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
              Správa webu a obsahu
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
              Zde si klient může upravovat obsah webu, stránky, SEO nastavení, navigaci,
              branding, kontaktní údaje a další části webu. Napojení na finální HTML doděláme později.
            </p>
          </div>

          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-300">
            Dostupné od balíčku PRO
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          {/* LEFT MENU */}
          <div className="rounded-[1.75rem] border border-white/10 bg-zinc-950/30 p-4">
            <div className="mb-4 text-xs uppercase tracking-[0.18em] text-zinc-500">
              CMS menu
            </div>

            <div className="space-y-2">
              {CMS_SECTIONS.map((section) => {
                const active = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      active
                        ? "border-violet-400/30 bg-white/[0.10] text-white"
                        : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    <Icon icon={section.icon} width={18} />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT EDITOR */}
          <div className="space-y-6">
            {activeSection === "pages" && (
              <div className="grid grid-cols-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
                <div className="rounded-[1.75rem] border border-white/10 bg-zinc-950/30 p-4">
                  <div className="mb-4 text-xs uppercase tracking-[0.18em] text-zinc-500">
                    Stránky webu
                  </div>

                  <div className="space-y-2">
                    {PAGE_ITEMS.map((item) => {
                      const active = item === activePage;

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setActivePage(item)}
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            active
                              ? "border-violet-400/30 bg-white/[0.10] text-white"
                              : "border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                          }`}
                        >
                          <span>{item}</span>
                          <span className="text-xs text-zinc-500">Upravit</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-zinc-950/30 p-6">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                        Editor stránky
                      </div>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{activePage}</h3>
                    </div>

                    <button className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white">
                      Uložit změny
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-medium text-white">Hlavní nadpis</label>
                      <input
                        defaultValue="Moderní web pro vaši firmu"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-white">Podnadpis</label>
                      <textarea
                        defaultValue="Tady bude hlavní popis hero sekce. Klient si zde může upravit hlavní texty stránky."
                        className="mt-2 min-h-[120px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-white">Tlačítko CTA</label>
                      <input
                        defaultValue="Nezávazná konzultace"
                        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-white">Další textový blok</label>
                      <textarea
                        defaultValue="Sem přijde další obsah sekce. Později se to napojí na exportované HTML a klient bude moci měnit texty přímo v jednotlivých částech webu."
                        className="mt-2 min-h-[180px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "seo" && (
              <div className="rounded-[1.75rem] border border-white/10 bg-zinc-950/30 p-6">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">SEO nastavení</div>
                <h3 className="mt-2 text-2xl font-semibold text-white">Title, meta a indexace</h3>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="text-sm font-medium text-white">SEO Title</label>
                    <input
                      defaultValue="Webraketa.cz | Tvorba moderních webů"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white">Meta description</label>
                    <textarea
                      defaultValue="Moderní weby pro firmy, podnikatele a značky. Rychlé dodání, špičkový design a klientská zóna."
                      className="mt-2 min-h-[140px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white">Indexace</label>
                    <select className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none">
                      <option>Indexovat stránku</option>
                      <option>Neindexovat stránku</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "branding" && (
              <div className="rounded-[1.75rem] border border-white/10 bg-zinc-950/30 p-6">
                <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Branding</div>
                <h3 className="mt-2 text-2xl font-semibold text-white">Barvy, logo a styl</h3>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-white">Primární barva</label>
                    <input
                      defaultValue="#7C3AED"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-white">Sekundární barva</label>
                    <input
                      defaultValue="#2563EB"
                      className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-white">Nahrát logo</label>
                    <input
                      type="file"
                      className="mt-2 block w-full text-sm text-zinc-300 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeSection !== "pages" &&
              activeSection !== "seo" &&
              activeSection !== "branding" && (
                <div className="rounded-[1.75rem] border border-white/10 bg-zinc-950/30 p-8 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-500">
                    <Icon icon="solar:settings-linear" width={26} />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">Sekce připravena pro další rozšíření</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    Tady doplníme detailní správu navigace, kontaktů, formulářů a integrací.
                  </p>
                </div>
              )}
          </div>
        </div>
      </section>
    </div>
  );
}