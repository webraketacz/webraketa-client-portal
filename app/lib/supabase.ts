// app/lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  // Zabráníme běhu na serveru (prerender/build)
  if (typeof window === "undefined") {
    throw new Error("Supabase browser client called on the server.");
  }

  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL is required.");
  if (!supabaseAnonKey) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is required.");

  _client = createClient(supabaseUrl, supabaseAnonKey);
  return _client;
}