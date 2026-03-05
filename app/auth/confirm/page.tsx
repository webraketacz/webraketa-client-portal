"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase";

function AuthConfirmContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState<string>("Ověřuji registraci…");

  useEffect(() => {
    const token_hash = params.get("token_hash");
    const type = params.get("type");

    if (!token_hash || !type) {
      setStatus("error");
      setMessage("Chybí potvrzovací údaje v odkazu.");
      return;
    }

    (async () => {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      });

      if (error) {
        setStatus("error");
        setMessage(`Nepodařilo se ověřit e-mail: ${error.message}`);
        return;
      }

      if (data?.session) {
        setStatus("ok");
        setMessage("Hotovo! Přesměrovávám do průvodce…");
        router.replace("/onboarding");
        return;
      }

      setStatus("ok");
      setMessage("E-mail ověřen. Přesměrovávám…");
      router.replace("/onboarding");
    })();
  }, [params, router]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-slate-950 text-white px-6">
      <div className="max-w-md w-full rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl">
        <h1 className="text-xl font-semibold">Potvrzení registrace</h1>
        <p className="mt-3 text-slate-300">{message}</p>

        {status === "error" && (
          <button
            onClick={() => router.replace("/login")}
            className="mt-6 w-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 py-3 font-semibold text-white"
          >
            Přejít na přihlášení
          </button>
        )}
      </div>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Ověřuji…</div>}>
      <AuthConfirmContent />
    </Suspense>
  );
}