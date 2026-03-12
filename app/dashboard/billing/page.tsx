export default function BillingPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Fakturace</div>
            <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
              Předplatné a správa fakturace
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
              Přehled aktivního předplatného, možnosti upgradu a budoucí správa plateb.
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-[1.75rem] border border-white/10 bg-zinc-950/30 p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Aktivní předplatné</div>
            <h3 className="mt-2 text-2xl font-semibold text-white">START</h3>
            <p className="mt-3 text-sm leading-7 text-zinc-400">
              Základní balíček pro rychlé spuštění webu a přehled zakázky v klientské zóně.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Stav</div>
                <div className="mt-2 text-sm font-medium text-white">Aktivní</div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Typ</div>
                <div className="mt-2 text-sm font-medium text-white">Měsíční předplatné</div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95">
                Upgradovat balíček
              </button>

              <button className="rounded-full border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/15">
                Zrušit předplatné
              </button>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-zinc-950/30 p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Možnosti upgradu</div>

            <div className="mt-5 space-y-3">
              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-semibold text-white">PRO</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Přístup do CMS, rozšířený workflow a větší možnosti správy webu.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm font-semibold text-white">PREMIUM</div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  Soukromý chat, prioritní podpora a rozšířená klientská péče.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}