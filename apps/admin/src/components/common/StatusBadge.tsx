import { Badge } from "@repo/ui";
import type { PostStatus } from "@repo/types";

const statusConfig: Record<
  PostStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  published: { label: "발행", variant: "default" },
  draft: { label: "초안", variant: "secondary" },
  archived: { label: "보관", variant: "outline" },
};

interface StatusBadgeProps {
  status: PostStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
