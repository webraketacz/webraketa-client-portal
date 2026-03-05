"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "./lib/supabase";

export default function Home() {
  const [status, setStatus] = useState("Loading...");

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        setStatus(`Error: ${error.message}`);
        return;
      }
      setStatus(data.session ? "Logged in ✅" : "Not logged in ❌");
    });
  }, []);

  return (
    <main className="min-h-dvh bg-zinc-950 text-white flex items-center justify-center p-10">
      <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-xl">
        <h1 className="text-2xl font-semibold">Webraketa Client Portal</h1>
        <p className="mt-3 text-zinc-300">{status}</p>
      </div>
    </main>
  );
}