// app/auth/confirm/page.tsx
import { Suspense } from "react";
import AuthConfirmClient from "./AuthConfirmClient";

export const dynamic = "force-dynamic";
// revalidate tady klidně vůbec nedávej (není potřeba), případně:
// export const revalidate = 0;

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Ověřuji…</div>}>
      <AuthConfirmClient />
    </Suspense>
  );
}