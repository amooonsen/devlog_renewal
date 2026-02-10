import { useState } from "react";
import { Skeleton, Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui";
import { toast } from "sonner";
import { useContacts, useMarkContactAsRead } from "@/hooks/useContacts";
import { ContactTable } from "@/components/contact/ContactTable";
import { Pagination } from "@/components/common/Pagination";

const PER_PAGE = 20;

type ReadFilter = "all" | "read" | "unread";

export function ContactListPage() {
  const [filter, setFilter] = useState<ReadFilter>("all");
  const [page, setPage] = useState(1);

  const queryFilter = {
    isRead: filter === "all" ? undefined : filter === "read",
    page,
    perPage: PER_PAGE,
  };

  const { data, isLoading } = useContacts(queryFilter);
  const markAsRead = useMarkContactAsRead();

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead.mutateAsync(id);
    } catch {
      toast.error("읽음 처리에 실패했습니다.");
    }
  };

  const totalPages = data ? Math.ceil(data.total / PER_PAGE) : 0;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Contacts</h2>

      <Tabs
        value={filter}
        onValueChange={(val) => {
          setFilter(val as ReadFilter);
          setPage(1);
        }}
      >
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="unread">미읽음</TabsTrigger>
          <TabsTrigger value="read">읽음</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <>
              <ContactTable
                contacts={data?.contacts ?? []}
                onMarkAsRead={handleMarkAsRead}
              />
              <div className="mt-4">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
