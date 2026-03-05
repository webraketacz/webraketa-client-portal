"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

export default function Dashboard() {
  const router = useRouter();

  // 🔐 ochrana stránky – nepřihlášený → login
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login");
      }
    });
  }, [router]);

  return (
    <>
      {/* Ambient Background Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] translate-y-1/3 pointer-events-none" />

      {/* Grid Overlay */}
      <div className="fixed inset-0 bg-grid z-0 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-8 md:py-16">
        {/* 1️⃣ Top Section – Welcome */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs uppercase tracking-widest text-violet-400 font-medium">
                Klientská zóna
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-medium text-white tracking-tight">
              Vítejte, Lukáši
            </h1>
            <div className="mt-1 mb-3 flex items-center gap-2">
              <span className="text-sm text-zinc-500">Projekt:</span>
              <div className="flex items-center gap-1 group cursor-pointer">
                <span className="text-sm text-zinc-300 font-medium group-hover:text-white transition-colors">
                  Redesign webu TechStart
                </span>
                <iconify-icon
                  icon="solar:alt-arrow-down-linear"
                  class="text-zinc-600 group-hover:text-zinc-400 transition-colors"
                  width="12"
                ></iconify-icon>
              </div>
            </div>
            <p className="mt-2 text-zinc-500 text-sm md:text-base max-w-md">
              Zde najdete aktuální stav vašeho webu, můžete nahrávat podklady a
              sledovat vývoj v reálném čase.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm text-white font-medium">Lukáš Novák</p>
              <p className="text-xs text-zinc-500">TechStart s.r.o.</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 border border-white/10 flex items-center justify-center text-white text-sm font-medium shadow-lg">
              LN
            </div>

            {/* ✅ Logout tlačítko (nahrazuje původní button z HTML) */}
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push("/login");
              }}
              className="group h-10 w-10 flex items-center justify-center rounded-full border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all duration-300"
              aria-label="Odhlásit"
              title="Odhlásit"
            >
              <iconify-icon
                icon="solar:logout-2-linear"
                class="text-zinc-400 group-hover:text-white transition-colors"
                width="20"
              ></iconify-icon>
            </button>
          </div>
        </header>

        {/* 2️⃣ Main Project Card */}
        <div className="glass-card rounded-3xl p-6 md:p-10 mb-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent opacity-50"></div>

          <div className="mb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-medium mb-1">
                  Název projektu
                </h3>
                <h2 className="text-2xl text-white font-medium tracking-tight">
                  Redesign webu TechStart
                </h2>
                <div className="flex items-center gap-4 mt-4">
                  <div className="w-32 md:w-48 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-violet-500 to-blue-500 w-[65%]"></div>
                  </div>
                  <span className="text-xs text-zinc-400 font-medium">
                    65 % dokončeno
                  </span>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-medium text-emerald-400 tracking-wide">
                  Projekt aktivní
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 to-violet-500/5 border border-blue-500/20 p-6 md:p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <iconify-icon icon="solar:code-circle-bold" width="80"></iconify-icon>
              </div>
              <div className="relative z-10">
                <h4 className="text-blue-400 text-xs font-semibold uppercase tracking-widest mb-2">
                  Aktuální stav projektu
                </h4>
                <h3 className="text-3xl md:text-4xl text-white font-medium tracking-tight mb-2">
                  Web ve vývoji
                </h3>
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-widest text-zinc-500 font-medium mb-1">
                    Fáze 4 ze 6
                  </p>
                  <p className="text-lg text-zinc-200 font-medium">
                    Programování front-endu
                  </p>
                </div>
                <p className="text-zinc-500 text-sm max-w-2xl leading-relaxed">
                  Momentálně pracujeme na programování vašeho webu. Jakmile bude
                  připraven náhled, dostanete notifikaci.
                </p>
              </div>
            </div>
          </div>

          {/* 3️⃣ Progress Timeline Component */}
          <div className="relative mt-12">
            <div className="hidden md:block absolute top-[15px] left-0 w-full h-[2px] bg-zinc-800/50 rounded-full z-0"></div>
            <div className="hidden md:block absolute top-[15px] left-0 w-[60%] h-[2px] bg-gradient-to-r from-violet-600 to-blue-600 rounded-full z-0 shadow-[0_0_10px_rgba(124,58,237,0.3)]"></div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
              <div className="flex md:flex-col items-center gap-4 md:gap-4 group cursor-default">
                <div className="h-8 w-8 rounded-full bg-zinc-900 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shadow-[0_0_10px_-2px_rgba(16,185,129,0.2)]">
                  <iconify-icon icon="solar:check-circle-linear" width="18"></iconify-icon>
                </div>
                <div className="text-left md:text-center">
                  <p className="text-sm font-medium text-zinc-300">Objednávka</p>
                  <p className="text-[10px] uppercase tracking-wider text-emerald-500/80 mt-0.5">
                    Dokončeno
                  </p>
                </div>
              </div>

              <div className="flex md:flex-col items-center gap-4 md:gap-4 group cursor-default">
                <div className="h-8 w-8 rounded-full bg-zinc-900 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shadow-[0_0_10px_-2px_rgba(16,185,129,0.2)]">
                  <iconify-icon icon="solar:bill-check-linear" width="18"></iconify-icon>
                </div>
                <div className="text-left md:text-center">
                  <p className="text-sm font-medium text-zinc-300">Platba</p>
                  <p className="text-[10px] uppercase tracking-wider text-emerald-500/80 mt-0.5">
                    Přijata
                  </p>
                </div>
              </div>

              <div className="flex md:flex-col items-center gap-4 md:gap-4 group cursor-default">
                <div className="h-8 w-8 rounded-full bg-zinc-900 border border-emerald-500/30 text-emerald-500 flex items-center justify-center shadow-[0_0_10px_-2px_rgba(16,185,129,0.2)]">
                  <iconify-icon icon="solar:folder-check-linear" width="18"></iconify-icon>
                </div>
                <div className="text-left md:text-center">
                  <p className="text-sm font-medium text-zinc-300">Podklady</p>
                  <p className="text-[10px] uppercase tracking-wider text-emerald-500/80 mt-0.5">
                    Dodány
                  </p>
                </div>
              </div>

              <div className="flex md:flex-col items-center gap-4 md:gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-500/30 rounded-full blur animate-pulse"></div>
                  <div className="h-8 w-8 relative rounded-full bg-zinc-900 border border-blue-500 text-blue-400 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(59,130,246,0.4)]">
                    <iconify-icon icon="solar:code-circle-linear" width="18"></iconify-icon>
                  </div>
                </div>
                <div className="text-left md:text-center">
                  <p className="text-sm font-medium text-white">Vývoj</p>
                  <p className="text-[10px] uppercase tracking-wider text-blue-400 mt-0.5">
                    Probíhá
                  </p>
                </div>
              </div>

              <div className="flex md:flex-col items-center gap-4 md:gap-4 opacity-50">
                <div className="h-8 w-8 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-600 flex items-center justify-center">
                  <iconify-icon icon="solar:smartphone-linear" width="18"></iconify-icon>
                </div>
                <div className="text-left md:text-center">
                  <p className="text-sm font-medium text-zinc-500">Testování</p>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600 mt-0.5">
                    Čeká
                  </p>
                </div>
              </div>

              <div className="flex md:flex-col items-center gap-4 md:gap-4 opacity-50">
                <div className="h-8 w-8 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-600 flex items-center justify-center">
                  <iconify-icon icon="solar:rocket-linear" width="18"></iconify-icon>
                </div>
                <div className="text-left md:text-center">
                  <p className="text-sm font-medium text-zinc-500">Spuštění</p>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-600 mt-0.5">
                    Připraveno
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 4️⃣ Upload Section */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <iconify-icon icon="solar:cloud-upload-linear" class="text-violet-400"></iconify-icon>
                Podklady pro váš web
              </h3>
              <span className="text-xs text-zinc-500 border border-white/5 bg-white/5 px-2 py-1 rounded-md">
                Max 50MB
              </span>
            </div>

            <p className="text-sm text-zinc-400 mb-4">
              Nahrajte logo, texty nebo obrázky. Čím dříve podklady obdržíme, tím
              rychleji web dokončíme.
            </p>

            <div className="border border-dashed border-zinc-700 bg-zinc-900/30 hover:bg-zinc-800/30 hover:border-violet-500/30 transition-all rounded-2xl p-8 text-center cursor-pointer group mb-8">
              <div className="h-12 w-12 mx-auto bg-zinc-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <iconify-icon
                  icon="solar:add-folder-linear"
                  class="text-zinc-400 group-hover:text-violet-400 transition-colors"
                  width="24"
                ></iconify-icon>
              </div>
              <p className="text-sm text-zinc-300 font-medium">
                Klikněte pro nahrání nebo přetáhněte soubory
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Logo (SVG, PNG), Texty (DOCX), Obrázky
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-widest text-zinc-600 font-medium mb-3 pl-1">
                Nahrané soubory
              </h4>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                    <iconify-icon icon="solar:file-text-linear" width="20"></iconify-icon>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-sm text-zinc-200 font-medium">
                        Texty_homepage_final.docx
                      </p>
                      <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Přijato
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      14.3 KB • Nahráno včera
                    </p>
                  </div>
                </div>
                <button className="text-zinc-600 hover:text-red-400 transition-colors p-2">
                  <iconify-icon icon="solar:trash-bin-trash-linear" width="18"></iconify-icon>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
                    <iconify-icon icon="solar:gallery-linear" width="20"></iconify-icon>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <p className="text-sm text-zinc-200 font-medium">
                        Logo_vektor.svg
                      </p>
                      <span className="inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wide font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Přijato
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      2.1 MB • Nahráno 12.10.2023
                    </p>
                  </div>
                </div>
                <button className="text-zinc-600 hover:text-red-400 transition-colors p-2">
                  <iconify-icon icon="solar:trash-bin-trash-linear" width="18"></iconify-icon>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 opacity-20">
                <iconify-icon icon="solar:laptop-minimalistic-linear" width="100"></iconify-icon>
              </div>

              <div className="h-14 w-14 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-4 text-zinc-500">
                <iconify-icon icon="solar:lock-password-linear" width="24"></iconify-icon>
              </div>

              <h3 className="text-lg font-medium text-white mb-2">Vývojová verze</h3>
              <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                Web je momentálně ve výstavbě. Přístup k náhledu bude uvolněn po
                dokončení 1. fáze.
              </p>

              <button
                disabled
                className="w-full py-3 px-4 rounded-xl border border-white/5 bg-zinc-800 text-zinc-500 font-medium text-sm cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Přístup uzamčen</span>
                <iconify-icon icon="solar:lock-keyhole-linear"></iconify-icon>
              </button>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden">
              <button className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors text-left group">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center">
                    <iconify-icon icon="solar:card-linear" width="16"></iconify-icon>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Stav fakturace</p>
                    <p className="text-xs text-zinc-500">Zálohová faktura uhrazena</p>
                  </div>
                </div>
                <iconify-icon
                  icon="solar:alt-arrow-down-linear"
                  class="text-zinc-500 group-hover:text-white transition-colors"
                  width="18"
                ></iconify-icon>
              </button>
            </div>

            <div className="rounded-3xl border border-white/5 p-6 bg-gradient-to-br from-zinc-900 to-black">
              <h4 className="text-sm font-medium text-white mb-1">
                Potřebujete pomoci?
              </h4>
              <p className="text-xs text-zinc-500 mb-4">
                Jsme tu pro vás na chatu nebo emailu.
              </p>
              <a
                href="#"
                className="text-xs text-zinc-300 hover:text-white flex items-center gap-1 transition-colors"
              >
                podpora@webraketa.cz
                <iconify-icon icon="solar:arrow-right-linear"></iconify-icon>
              </a>
            </div>
          </div>
        </div>

        <footer className="mt-16 text-center border-t border-white/5 pt-8 pb-8">
          <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
            <span className="h-1 w-1 rounded-full bg-violet-500"></span>
            <span className="text-xs tracking-[0.2em] uppercase text-zinc-500">
              Webraketa
            </span>
            <span className="h-1 w-1 rounded-full bg-violet-500"></span>
          </div>
          <p className="text-xs text-zinc-600">
            © 2023 Webraketa.cz. Všechna práva vyhrazena.
            <br />
            Designováno pro maximální klientský zážitek.
          </p>
        </footer>
      </div>
    </>
  );
}
