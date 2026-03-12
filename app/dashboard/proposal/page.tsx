import { Icon } from "@iconify/react/dist/iconify.js";

export default function ProposalPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Návrh webu</div>
            <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
              Připraveno pro schválení
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
              Jakmile bude první verze webu připravená, zobrazí se zde náhled návrhu, možnost schválení
              i zaslání připomínek.
            </p>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
            Stav: <span className="font-semibold text-white">Čeká na zveřejnění návrhu</span>
          </div>
        </div>

        <div className="rounded-[2rem] border border-dashed border-white/10 bg-zinc-950/30 p-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-500">
            <Icon icon="solar:laptop-minimalistic-linear" width={34} />
          </div>

          <h3 className="mt-5 text-xl font-semibold text-white">Návrh zatím není zveřejněný</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
            Po zveřejnění zde uvidíte plný náhled webu, workflow schválení a formulář pro připomínky.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-xl mx-auto">
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
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
              Workflow projektu
            </div>
            <h3 className="mt-2 text-2xl font-semibold text-white">Přehled všech kroků</h3>
          </div>

          <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm text-zinc-300">
            Fáze 2 z 6
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
      </section>
    </div>
  );
}