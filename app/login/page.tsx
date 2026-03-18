"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";

function RocketIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M14.5 4.5c1.9-.6 3.9-.6 5.8-.2.4 1.9.4 3.9-.2 5.8-.6 2-1.7 3.8-3.2 5.3l-3.2 3.2a3 3 0 0 1-4.2 0l-4-4a3 3 0 0 1 0-4.2l3.2-3.2c1.5-1.5 3.3-2.6 5.3-3.2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14.5 9.5h.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <path
        d="M8.5 15.5 6 18c-.7.7-1.8 1-2.8.8.2-1 .5-2.1 1.2-2.8l2.5-2.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 8.5 18 6c.7-.7 1-1.8.8-2.8-1-.2-2.1.1-2.8.8l-2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}

function MailIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M4 7.5l8 5 8-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 6.5h13A1.5 1.5 0 0 1 20 8v8a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16V8a1.5 1.5 0 0 1 1.5-1.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        opacity="0.9"
      />
    </svg>
  );
}

function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M7 11V8.5a5 5 0 0 1 10 0V11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.5 11h11A1.5 1.5 0 0 1 19 12.5v6A1.5 1.5 0 0 1 17.5 20h-11A1.5 1.5 0 0 1 5 18.5v-6A1.5 1.5 0 0 1 6.5 11Z"
        stroke="currentColor"
        strokeWidth="1.8"
        opacity="0.9"
      />
    </svg>
  );
}

function ArrowRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M5 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 10v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 7.5h.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function SpinnerIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M20 12a8 8 0 1 1-2.34-5.66"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M21.805 10.023H12v3.955h5.617a4.807 4.807 0 0 1-2.086 3.155v2.62h3.37c1.972-1.816 3.104-4.493 3.104-7.687 0-.68-.061-1.334-.2-2.043Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.808 0 5.16-.93 6.88-2.52l-3.37-2.62c-.936.63-2.134 1.01-3.51 1.01-2.697 0-4.98-1.821-5.797-4.27H2.72v2.703A10.39 10.39 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.203 13.6A6.24 6.24 0 0 1 5.88 11.99c0-.56.098-1.104.323-1.61V7.677H2.72A10.007 10.007 0 0 0 2 11.99c0 1.605.385 3.125 1.08 4.313L6.203 13.6Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.11c1.53 0 2.904.526 3.985 1.56l2.99-2.99C17.155 2.99 14.803 2 12 2A10.39 10.39 0 0 0 2.72 7.677L6.203 10.38C7.02 7.931 9.303 6.11 12 6.11Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function WindowCardA() {
  return (
    <div className="w-full rounded-xl border border-white/10 bg-slate-900/90 p-3 shadow-2xl">
      <div className="mb-3 flex gap-1.5 border-b border-white/5 pb-2">
        <div className="h-2 w-2 rounded-full bg-slate-700" />
        <div className="h-2 w-2 rounded-full bg-slate-700" />
        <div className="h-2 w-2 rounded-full bg-slate-700" />
      </div>
      <div className="mb-2 h-16 w-full rounded-lg bg-indigo-500/20" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-20 rounded bg-white/5" />
        <div className="h-20 rounded bg-white/5" />
        <div className="h-20 rounded bg-white/5" />
        <div className="h-20 rounded bg-white/5" />
      </div>
    </div>
  );
}

function WindowCardB() {
  return (
    <div className="w-full rounded-xl border border-white/10 bg-slate-900/90 p-3 shadow-2xl">
      <div className="mb-3 flex gap-1.5 border-b border-white/5 pb-2">
        <div className="h-2 w-2 rounded-full bg-slate-700" />
        <div className="h-2 w-2 rounded-full bg-slate-700" />
        <div className="h-2 w-2 rounded-full bg-slate-700" />
      </div>
      <div className="flex gap-2">
        <div className="h-32 w-1/4 rounded bg-white/5" />
        <div className="flex flex-1 flex-col gap-2">
          <div className="h-8 rounded bg-white/5" />
          <div className="flex gap-2">
            <div className="h-10 flex-1 rounded bg-purple-500/20" />
            <div className="h-10 flex-1 rounded bg-fuchsia-500/20" />
          </div>
          <div className="h-10 rounded bg-white/5" />
        </div>
      </div>
    </div>
  );
}

function WindowCardC() {
  return (
    <div className="w-full rounded-xl border border-white/10 bg-slate-900/90 p-3 shadow-2xl">
      <div className="mb-3 flex gap-1.5 border-b border-white/5 pb-2">
        <div className="h-2 w-2 rounded-full bg-slate-700" />
        <div className="h-2 w-2 rounded-full bg-slate-700" />
        <div className="h-2 w-2 rounded-full bg-slate-700" />
      </div>
      <div className="mb-3 h-4 w-1/3 rounded bg-white/10" />
      <div className="mb-2 flex h-20 items-end gap-1">
        <div className="h-1/3 w-1/6 rounded-t bg-indigo-500/40" />
        <div className="h-2/3 w-1/6 rounded-t bg-indigo-500/40" />
        <div className="h-1/2 w-1/6 rounded-t bg-indigo-500/40" />
        <div className="h-[90%] w-1/6 rounded-t bg-indigo-500/40" />
        <div className="h-3/4 w-1/6 rounded-t bg-indigo-500/40" />
        <div className="h-full w-1/6 rounded-t bg-indigo-500/40" />
      </div>
      <div className="h-8 rounded bg-white/5" />
    </div>
  );
}

function WindowCardD() {
  return (
    <div className="w-full rounded-xl border border-white/10 bg-slate-900/90 p-3 shadow-2xl">
      <div className="mb-3 flex gap-1.5 border-b border-white/5 pb-2">
        <div className="h-2 w-2 rounded-full bg-slate-700" />
        <div className="h-2 w-2 rounded-full bg-slate-700" />
        <div className="h-2 w-2 rounded-full bg-slate-700" />
      </div>
      <div className="mb-3 flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-blue-500/20" />
        <div className="h-3 w-16 rounded bg-white/10" />
        <div className="ml-auto flex gap-1">
          <div className="h-2 w-6 rounded bg-white/5" />
          <div className="h-2 w-6 rounded bg-white/5" />
        </div>
      </div>
      <div className="mb-2 h-24 w-full rounded-lg bg-blue-500/20" />
      <div className="mb-1 h-3 w-3/4 rounded bg-white/5" />
      <div className="h-3 w-1/2 rounded bg-white/5" />
    </div>
  );
}

function Column({
  direction = "up",
  pt = "",
}: {
  direction?: "up" | "down";
  pt?: string;
}) {
  const animation =
    direction === "up" ? "animate-scroll-y-up" : "animate-scroll-y-down";

  return (
    <div className={`flex w-48 flex-col gap-4 sm:w-64 sm:gap-6 ${animation} ${pt}`}>
      <WindowCardA />
      <WindowCardB />
      <WindowCardC />
      <WindowCardD />
      <WindowCardA />
      <WindowCardB />
      <WindowCardC />
      <WindowCardD />
    </div>
  );
}

const inputBaseStyle: React.CSSProperties = {
  backgroundColor: "rgba(2, 6, 23, 0.72)",
  WebkitBoxShadow: "0 0 0 1000px rgba(2, 6, 23, 0.72) inset",
  boxShadow:
    "0 0 0 1000px rgba(2, 6, 23, 0.72) inset, inset 0 1px 0 rgba(255,255,255,0.04)",
  WebkitTextFillColor: "#ffffff",
  color: "#ffffff",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
};

export default function LoginPage() {
  const router = useRouter();
  const currentYear = new Date().getFullYear();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowserClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <>
      <div
        className="min-h-dvh bg-slate-950 text-slate-200 antialiased selection:bg-indigo-500 selection:text-white"
        style={{
          fontFamily:
            "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
        }}
      >
        <div className="relative min-h-dvh overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-0 animate-gradient-xy bg-[linear-gradient(45deg,#0f172a,#312e81,#581c87,#1e3a8a,#0f172a)]" />

          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden [perspective:1000px] opacity-40 sm:opacity-60">
            <div className="absolute top-1/2 left-1/2 flex w-[150%] -translate-x-1/2 -translate-y-1/2 gap-4 [transform:rotateX(20deg)_rotateZ(-20deg)_scale(1.5)] sm:gap-6">
              <Column direction="up" />
              <Column direction="down" pt="pt-12" />
              <Column direction="up" pt="pt-24" />
              <Column direction="down" pt="pt-8" />
              <Column direction="up" pt="pt-16" />
            </div>
          </div>

          <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950/90" />
          <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.5)_100%)]" />

          <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center p-6">
            <div className="w-full">
              <section className="max-w-full lg:col-span-6">
                <div className="mx-auto w-full max-w-md">
                  <div className="mb-8 flex justify-center">
                    <Link href="/" className="group inline-flex items-center gap-2.5">
                      <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 shadow-[0_0_18px_rgba(99,102,241,0.2)] transition-colors duration-300 group-hover:bg-indigo-500/20">
                        <RocketIcon className="h-[22px] w-[22px]" />
                      </span>
                      <span className="text-lg font-semibold tracking-tight text-white">
                        Webraketa<span className="text-indigo-400">.cz</span>
                      </span>
                    </Link>
                  </div>

                  <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl sm:p-8">
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent" />
                    <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[28rem] -translate-x-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-2xl" />

                    <div className="relative">
                      <div className="mb-6">
                        <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                          Vítejte zpět
                        </h2>
                        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                          Přihlaste se a pokračujte tam, kde jste skončili.
                        </p>
                      </div>

                      <form onSubmit={onSubmit} className="space-y-5">
                        <div className="space-y-2">
                          <label
                            htmlFor="email"
                            className="block text-xs font-semibold uppercase tracking-wide text-slate-400"
                          >
                            Email
                          </label>
                          <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-slate-400">
                              <MailIcon className="h-[18px] w-[18px]" />
                            </span>
                            <input
                              id="email"
                              name="email"
                              type="email"
                              autoComplete="email"
                              placeholder="vas@email.cz"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              required
                              style={inputBaseStyle}
                              className="relative z-[1] w-full rounded-2xl border border-white/10 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label
                            htmlFor="password"
                            className="block text-xs font-semibold uppercase tracking-wide text-slate-400"
                          >
                            Heslo
                          </label>
                          <div className="relative">
                            <span className="pointer-events-none absolute inset-y-0 left-3 z-10 flex items-center text-slate-400">
                              <LockIcon className="h-[18px] w-[18px]" />
                            </span>
                            <input
                              id="password"
                              name="password"
                              type="password"
                              autoComplete="current-password"
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                              style={inputBaseStyle}
                              className="relative z-[1] w-full rounded-2xl border border-white/10 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
                            />
                          </div>
                        </div>

                        <div className="pt-1">
                          <button
                            type="submit"
                            disabled={loading}
                            className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />
                            <span
                              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                              style={{
                                background:
                                  "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 100%)",
                              }}
                            />
                            <span className="relative flex items-center gap-2">
                              {loading && (
                                <SpinnerIcon className="h-[18px] w-[18px] animate-spin" />
                              )}
                              <span>{loading ? "Přihlašuji…" : "Přihlásit"}</span>
                              <ArrowRightIcon className="relative h-[18px] w-[18px] transition-transform group-hover:translate-x-0.5" />
                            </span>
                          </button>

                          {error && (
                            <p className="mt-3 text-xs font-medium text-red-300/90">
                              {error}
                            </p>
                          )}

                          {!error && (
                            <div className="mt-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 text-[0.625rem] text-slate-500">
                              <div className="flex items-start gap-2">
                                <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                                <p>
                                  Přihlaste se stejnými údaji, které jste dostali od{" "}
                                  <span className="text-slate-300">Webraketa.cz</span>.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="mb-5 flex items-center">
                            <div className="flex-grow border-t border-white/10" />
                            <span className="mx-4 text-[0.625rem] font-semibold uppercase tracking-wider text-slate-500">
                              Nebo
                            </span>
                            <div className="flex-grow border-t border-white/10" />
                          </div>

                          <button
                            type="button"
                            className="group relative flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                          >
                            <GoogleIcon className="h-[18px] w-[18px]" />
                            Přihlásit se pomocí Google
                          </button>
                        </div>
                      </form>

                      <div className="mt-6 space-y-4 border-t border-white/5 pt-6">
                        <div className="flex flex-col gap-2 text-sm">
                          <Link
                            href="/forgot-password"
                            className="w-fit text-xs font-medium text-indigo-300 transition-colors hover:text-white"
                          >
                            Zapomněli jste heslo?
                          </Link>

                          <p className="text-xs text-slate-500">
                            Nemáte účet? Kontaktujte podporu:{" "}
                            <a
                              href="mailto:podpora@webraketa.cz"
                              className="font-medium text-slate-300 transition-colors hover:text-white"
                            >
                              podpora@webraketa.cz
                            </a>
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-[0.625rem] text-slate-600">
                          <span className="inline-flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                            Zabezpečeno
                          </span>
                          <span className="inline-flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                            Klientská zóna Webraketa
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-center">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <ArrowLeftIcon className="h-4 w-4 text-slate-300" />
                      Zpět na homepage
                    </Link>
                  </div>

                  <div className="mt-6 text-center text-[0.625rem] font-medium text-slate-600">
                    © {currentYear} Webraketa.cz • Všechna práva vyhrazena
                  </div>
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      <style jsx global>{`
        @keyframes gradient-xy {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 15s ease infinite;
        }

        @keyframes scroll-y-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        @keyframes scroll-y-down {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }

        .animate-scroll-y-up {
          animation: scroll-y-up 50s linear infinite;
        }

        .animate-scroll-y-down {
          animation: scroll-y-down 50s linear infinite;
        }

        input,
        textarea,
        select {
          color-scheme: dark;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-text-fill-color: #ffffff !important;
          -webkit-box-shadow: 0 0 0 1000px rgba(2, 6, 23, 0.72) inset !important;
          box-shadow: 0 0 0 1000px rgba(2, 6, 23, 0.72) inset !important;
          caret-color: #ffffff !important;
          transition: background-color 9999s ease-in-out 0s;
          border-radius: 1rem;
        }
      `}</style>
    </>
  );
}