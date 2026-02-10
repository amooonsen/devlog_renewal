import dayjs from "dayjs";
import {
  FileText,
  Send,
  MessageSquare,
  Mail,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  Badge,
} from "@repo/ui";
import { useDashboardStats, useRecentComments } from "@/hooks/useDashboard";
import type { ReactNode } from "react";

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recentComments, isLoading: commentsLoading } =
    useRecentComments();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="전체 포스트"
          value={stats?.totalPosts}
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          loading={statsLoading}
        />
        <StatCard
          title="발행된 포스트"
          value={stats?.publishedPosts}
          icon={<Send className="h-4 w-4 text-muted-foreground" />}
          loading={statsLoading}
        />
        <StatCard
          title="대기 중 댓글"
          value={stats?.pendingComments}
          icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
          loading={statsLoading}
        />
        <StatCard
          title="미읽은 문의"
          value={stats?.unreadContacts}
          icon={<Mail className="h-4 w-4 text-muted-foreground" />}
          loading={statsLoading}
        />
      </div>

      {/* 최근 댓글 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">최근 댓글</CardTitle>
        </CardHeader>
        <CardContent>
          {commentsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentComments && recentComments.length > 0 ? (
            <div className="space-y-3">
              {recentComments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start justify-between rounded-md border p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {comment.author_name}
                      </span>
                      <Badge
                        variant={
                          comment.is_approved ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {comment.is_approved ? "승인" : "대기"}
                      </Badge>
                    </div>
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      {comment.content}
                    </p>
                    {comment.posts && (
                      <p className="text-xs text-muted-foreground">
                        {comment.posts.title}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {dayjs(comment.created_at).format("MM.DD")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              최근 댓글이 없습니다.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  loading,
}: {
  title: string;
  value?: number;
  icon: ReactNode;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-2xl font-bold">{value ?? 0}</p>
        )}
      </CardContent>
    </Card>
  );
}
