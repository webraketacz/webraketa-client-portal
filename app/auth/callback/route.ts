import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

const VALID_PLANS = new Set(["start", "pro", "premium", "enterprise"]);
const VALID_BILLING = new Set(["monthly", "yearly"]);

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";
  const planParam = (requestUrl.searchParams.get("plan") || "").toLowerCase();
  const billingParam = (requestUrl.searchParams.get("billing") || "").toLowerCase();

  const safePlan = VALID_PLANS.has(planParam) ? planParam : null;
  const safeBilling = VALID_BILLING.has(billingParam) ? billingParam : null;

  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login`);
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data?.user) {
    console.error("OAuth exchange error:", error);
    return NextResponse.redirect(`${origin}/login`);
  }

  if (safePlan && safeBilling) {
    const { error: upsertError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        email: data.user.email,
        plan: safePlan,
        billing_type: safeBilling,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (upsertError) {
      console.error("Profile upsert after Google auth failed:", upsertError);
    }

    return NextResponse.redirect(`${origin}/onboarding`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}