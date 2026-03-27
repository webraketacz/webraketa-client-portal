"use client";

import { ReactNode, useEffect } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "solar:widget-4-linear" },
  { href: "/dashboard/proposal", label: "Návrh webu", icon: "solar:laptop-minimalistic-linear" },
  { href: "/dashboard/files", label: "Podklady", icon: "solar:folder-with-files-linear" },
  { href: "/dashboard/cms", label: "CMS", icon: "solar:pen-new-square-linear" },
  { href: "/dashboard/billing", label: "Fakturace", icon: "solar:card-linear" },
  { href: "/dashboard/support", label: "Podpora", icon: "solar:chat-round-dots-linear" },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
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
    <div className="min-h-dvh bg-zinc-950 text-zinc-100 antialiased">
      <div className="pointer-events-none fixed left-[8%] top-0 h-[30rem] w-[30rem] -translate-y-1/3 rounded-[10px] bg-violet-600/20 blur-[130px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-[36rem] w-[36rem] translate-y-1/3 rounded-[10px] bg-blue-600/10 blur-[130px]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10 mx-auto max-w-[1550px] px-5 py-6 md:px-8 md:py-8">
        <header className="mb-6 rounded-[2rem] border border-white/10 bg-white/[0.06] px-4 py-4 backdrop-blur-xl md:px-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
              <Link href="/dashboard" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.06] text-white">
                  <Icon icon="solar:rocket-2-linear" width={20} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">Webraketa.cz</div>
                  <div className="text-xs text-zinc-500">Klientská zóna</div>
                </div>
              </Link>

              <div className="hidden h-8 w-px bg-white/10 xl:block" />

              <nav className="flex flex-wrap items-center gap-2">
                {NAV_ITEMS.map((item) => {
                  const active = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-2 rounded-[10px] border px-4 py-2 text-sm transition ${
                        active
                          ? "border-violet-400/30 bg-white/[0.10] text-white"
                          : "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      <Icon icon={item.icon} width={16} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <Icon icon="solar:user-circle-linear" width={18} />
                Profil
              </button>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
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
                className="group flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/10 bg-white/[0.04] transition hover:bg-white/[0.08]"
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

        <section className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-[10px] border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-violet-300">
              <span className="inline-block h-1.5 w-1.5 rounded-[10px] bg-violet-400" />
              Klientská aplikace
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-4xl">
              Klientská zóna Webraketa
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-400 md:text-base">
              Přehled zakázky, návrhy, podklady, CMS a další kroky až po finální spuštění webu.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
              Balíček: <span className="font-semibold text-white">START</span>
            </div>
            <div className="rounded-[10px] border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-zinc-300">
              Aktivní projekt: <span className="font-semibold text-white">Webraketa klientská zóna</span>
            </div>
          </div>
        </section>

        {children}

        <footer className="mt-16 border-t border-white/5 pt-8 text-center">
          <div className="mb-4 flex items-center justify-center gap-2 opacity-50">
            <span className="h-1 w-1 rounded-[10px] bg-violet-500" />
            <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">Webraketa</span>
            <span className="h-1 w-1 rounded-[10px] bg-violet-500" />
          </div>
          <p className="text-xs text-zinc-600">
            © 2026 Webraketa.cz. Všechna práva vyhrazena.
            <br />
            Klientská zóna pro přehled zakázek, schvalování návrhů a správu dalšího postupu.
          </p>
        </footer>
      </div>
    </div>
  );
}