import { Suspense } from "react";
import RegisterClient from "./RegisterClient";

export const dynamic = "force-dynamic";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-white p-10">Načítám registraci…</div>}>
      <RegisterClient />
    </Suspense>
  );
}