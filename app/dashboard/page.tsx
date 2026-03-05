import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-10">Načítám dashboard…</div>}>
      <DashboardClient />
    </Suspense>
  );
}