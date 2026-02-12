import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats, fetchRecentComments } from "@/lib/api";

/**
 * 대시보드 통계 데이터를 조회하는 쿼리 훅입니다.
 *
 * 포스트/댓글/문의의 상태별 개수를 집계하여 반환합니다.
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
  });
}

/**
 * 최근 댓글 5개를 조회하는 쿼리 훅입니다.
 *
 * 대시보드 최근 활동 섹션에 사용됩니다.
 */
export function useRecentComments() {
  return useQuery({
    queryKey: ["dashboard", "recentComments"],
    queryFn: fetchRecentComments,
  });
}
