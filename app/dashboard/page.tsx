import { Icon } from "@iconify/react/dist/iconify.js";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.55fr)_390px]">
      <div className="space-y-8">
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
                Webraketa klientská zóna
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
                Vaše zadání jsme přijali a aktuálně připravujeme první návrh webu.
                Jakmile bude návrh připravený, zobrazí se zde možnost schválení,
                připomínek a následných kroků ke spuštění.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-white/10 bg-zinc-950/30 p-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Aktuální fáze</div>
                  <div className="mt-2 text-sm font-medium text-white">Příprava prvního návrhu</div>
                </div>

                <div className="rounded-3xl border border-white/10 bg-zinc-950/30 p-4">
                  <div className="text-xs uppercase tracking-wide text-zinc-500">Předpoklad</div>
                  <div className="mt-2 text-sm font-medium text-white">Do 48 hodin</div>
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
                  <span>24%</span>
                </div>

                <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                    style={{ width: "24%" }}
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
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-300">
                Od PRO
              </span>
            </div>
            <p className="mt-2 text-sm leading-7 text-zinc-400">
              Správa textů, sekcí a obsahu webu přes jednoduché CMS rozhraní.
            </p>
            <button
              disabled
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-zinc-500 cursor-not-allowed"
            >
              Dostupné od balíčku PRO
            </button>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-pink-300">
              <Icon icon="solar:chat-round-dots-linear" width={22} />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">Soukromý chat</h3>
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-amber-300">
                Od PREMIUM
              </span>
            </div>
            <p className="mt-2 text-sm leading-7 text-zinc-400">
              Přímý soukromý chat s týmem pro rychlejší komunikaci a prioritní podporu.
            </p>
            <button
              disabled
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-zinc-500 cursor-not-allowed"
            >
              Dostupné od balíčku PREMIUM
            </button>
          </div>
        </section>
      </div>

      <aside className="space-y-8">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Aktuální projekt
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-white">Webraketa klientská zóna</h3>

          <p className="mt-3 text-sm leading-7 text-zinc-400">
            Hlavní aktivní projekt, na kterém nyní pracujeme. Všechny další připravené projekty
            najdete níže.
          </p>

          <div className="mt-6 rounded-3xl border border-white/10 bg-zinc-950/30 p-5">
            <div className="text-xs uppercase tracking-wide text-zinc-500">Balíček</div>
            <div className="mt-2 text-base font-medium text-white">START</div>
            <p className="mt-2 text-sm leading-6 text-zinc-400">
              Základní balíček pro rychlé spuštění webu a přehled zakázky v klientské zóně.
            </p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Další připravené projekty
          </div>

          <div className="mt-5 space-y-3">
            <button className="w-full rounded-3xl border border-white/10 bg-zinc-950/30 p-4 text-left transition hover:bg-white/[0.05]">
              <div className="text-sm font-medium text-white">Landing page kampaně</div>
              <div className="mt-1 text-xs text-zinc-500">Čeká na zahájení</div>
            </button>

            <button className="w-full rounded-3xl border border-white/10 bg-zinc-950/30 p-4 text-left transition hover:bg-white/[0.05]">
              <div className="text-sm font-medium text-white">Microsite pro nový produkt</div>
              <div className="mt-1 text-xs text-zinc-500">Připraveno do fronty</div>
            </button>
          </div>
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
  );
}