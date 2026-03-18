"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/app/lib/supabase";

export const dynamic = "force-dynamic";

const VALID_PLANS = new Set(["start", "pro", "premium", "enterprise"]);
const VALID_BILLING = new Set(["monthly", "yearly"]);

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("Dokončuji přihlášení...");

  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/dashboard";
  const planParam = (searchParams.get("plan") || "").toLowerCase();
  const billingParam = (searchParams.get("billing") || "").toLowerCase();

  const safePlan = useMemo(
    () => (VALID_PLANS.has(planParam) ? planParam : null),
    [planParam]
  );

  const safeBilling = useMemo(
    () => (VALID_BILLING.has(billingParam) ? billingParam : null),
    [billingParam]
  );

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = getSupabaseBrowserClient();

        if (!code) {
          router.replace("/login");
          return;
        }

        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("OAuth exchange error:", exchangeError);
          router.replace("/login");
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("Get user error:", userError);
          router.replace("/login");
          return;
        }

        if (safePlan && safeBilling) {
          setMessage("Dokončuji registraci...");

          const { error: upsertError } = await supabase.from("profiles").upsert(
            {
              id: user.id,
              email: user.email,
              plan: safePlan,
              billing_type: safeBilling,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

          if (upsertError) {
            console.error("Profile upsert after Google auth failed:", upsertError);
          }
        }

        router.replace(next);
      } catch (err) {
        console.error("Auth callback failed:", err);
        router.replace("/login");
      }
    };

    void run();
  }, [code, next, router, safeBilling, safePlan]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-300 backdrop-blur-xl">
        {message}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-slate-300 backdrop-blur-xl">
            Dokončuji přihlášení...
          </div>
        </div>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}