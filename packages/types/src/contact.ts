import type { Database } from "@repo/database";

// Supabase 생성 타입 재사용
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];

