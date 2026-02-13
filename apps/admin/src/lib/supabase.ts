import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Admin SPA용 Supabase 브라우저 클라이언트 (싱글톤).
 *
 * Vite 환경변수로 URL과 Anon Key를 주입받으며,
 * Supabase Auth를 통한 어드민 인증에 사용됩니다.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
