import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/**
 * Supabase Auth 기반 인증 상태 관리 훅입니다.
 *
 * 마운트 시 현재 세션을 확인하고,
 * onAuthStateChange로 인증 상태 변경을 실시간 구독합니다.
 *
 * @returns user - 현재 인증 사용자 (미인증 시 null)
 * @returns loading - 초기 세션 확인 중 여부
 * @returns signIn - 이메일/비밀번호 로그인 함수
 * @returns signOut - 로그아웃 함수
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /** 이메일/비밀번호로 로그인합니다. */
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  /** 현재 세션을 종료합니다. */
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return { user, loading, signIn, signOut };
}
