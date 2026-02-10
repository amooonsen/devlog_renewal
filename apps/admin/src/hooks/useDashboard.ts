import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats, fetchRecentComments } from "@/lib/api";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: fetchDashboardStats,
  });
}

export function useRecentComments() {
  return useQuery({
    queryKey: ["dashboard", "recentComments"],
    queryFn: fetchRecentComments,
  });
}
