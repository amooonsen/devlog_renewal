import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchContacts,
  markContactAsRead,
  type ContactFilter,
} from "@/lib/api";

export function useContacts(filter?: ContactFilter) {
  return useQuery({
    queryKey: ["contacts", filter],
    queryFn: () => fetchContacts(filter),
  });
}

export function useMarkContactAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => markContactAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
