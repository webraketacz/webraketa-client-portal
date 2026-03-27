import { Icon } from "@iconify/react/dist/iconify.js";

export default function FilesPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">Podklady</div>
            <h2 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
              Nahrání podkladů k webu
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400">
              Nahrajte texty, logo, obrázky, PDF nebo další materiály. Čím více podkladů máme,
              tím rychleji připravíme kvalitní návrh webu.
            </p>
          </div>

          <span className="rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
            Max 50MB na soubor
          </span>
        </div>

        <div className="rounded-[2rem] border border-dashed border-zinc-700 bg-zinc-900/30 p-10 text-center transition-all hover:border-violet-500/30 hover:bg-zinc-800/30">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[10px] bg-zinc-800 text-zinc-400">
            <Icon icon="solar:add-folder-linear" width={28} />
          </div>
          <p className="text-base font-medium text-zinc-200">
            Klikněte pro nahrání nebo přetáhněte soubory
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Logo, texty, obrázky, PDF, brand manuály, zadání, podklady k obsahu
          </p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 backdrop-blur-xl md:p-8">
        <div className="mb-6">
          <div className="text-xs uppercase tracking-[0.18em] text-zinc-500">
            Už nahrané soubory
          </div>
          <h3 className="mt-2 text-2xl font-semibold text-white">Přehled podkladů</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-[10px] border border-white/10 bg-zinc-950/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-indigo-500/10 text-indigo-300">
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

          <div className="flex items-center justify-between rounded-[10px] border border-white/10 bg-zinc-950/30 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-orange-500/10 text-orange-300">
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
      </section>
    </div>
  );
}