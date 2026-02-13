import { createClient } from "@supabase/supabase-js";
import type { Database } from "@repo/database";

/**
 * 공개 데이터 읽기 전용 Supabase 클라이언트입니다.
 *
 * cookies()를 사용하지 않아 "use cache" 함수 내에서 안전하게 사용할 수 있습니다.
 * RLS public SELECT 정책으로 보호되는 데이터만 접근 가능합니다.
 *
 * @returns Supabase 클라이언트 (환경변수 미설정 시 null)
 */
export function createReadOnlyClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient<Database>(url, key);
}
