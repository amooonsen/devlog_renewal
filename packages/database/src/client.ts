import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export function createClient() {
  const supabaseUrl =
    typeof import.meta !== "undefined"
      ? (import.meta as Record<string, Record<string, string>>).env
          ?.VITE_SUPABASE_URL
      : process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    typeof import.meta !== "undefined"
      ? (import.meta as Record<string, Record<string, string>>).env
          ?.VITE_SUPABASE_ANON_KEY
      : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createBrowserClient<Database>(supabaseUrl!, supabaseAnonKey!);
}
