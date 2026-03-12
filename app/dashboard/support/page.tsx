export default function SupportPage() {
  const premium = false;

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Podpora</div>
          <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
            Kontaktujte náš tým
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
            Napište nám zprávu přímo z klientské zóny. Pro premium uživatele bude dostupný i přímý chat a prioritní telefonická linka.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="rounded-[1.75rem] border border-white/10 bg-zinc-950/30 p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Formulář podpory</div>

            <div className="mt-5 space-y-5">
              <div>
                <label className="text-sm font-medium text-white">Předmět</label>
                <input
                  placeholder="Např. Potřebuji doplnit informace k návrhu"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white">Zpráva</label>
                <textarea
                  placeholder="Sem napište svůj požadavek..."
                  className="mt-2 min-h-[220px] w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
                />
              </div>

              <button className="rounded-full bg-gradient-to-r from-violet-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95">
                Odeslat zprávu
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.75rem] border border-white/10 bg-zinc-950/30 p-6">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Kontakt</div>
              <div className="mt-5 space-y-3 text-sm text-zinc-300">
                <div>Email: podpora@webraketa.cz</div>
                <div>Telefon: 777 777 777</div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-zinc-950/30 p-6">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Soukromý chat</div>

              {premium ? (
                <div className="mt-4 rounded-3xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-300">
                  Zde bude embedded chat pro PREMIUM klienty.
                </div>
              ) : (
                <div className="mt-4 rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5 text-sm text-amber-200">
                  Soukromý chat je dostupný od balíčku PREMIUM.
                </div>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-zinc-950/30 p-6">
              <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Prémiová podpora</div>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                Pro vyšší balíčky zde zobrazíme přímý chat, prioritu zpracování a speciální kontaktní linku.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}