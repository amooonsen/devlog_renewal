import type { Database } from "@repo/database";

// Supabase 생성 타입 재사용
export type Contact = Database["public"]["Tables"]["contacts"]["Row"];

export interface CreateContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}
