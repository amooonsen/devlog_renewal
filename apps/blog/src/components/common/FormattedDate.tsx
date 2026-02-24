"use client";

import { formatDate, formatKoreanDate, formatDateTime } from "@repo/date-utils";

interface Props {
  date: string;
  format?: "date" | "korean" | "datetime";
  className?: string;
}

/**
 * dayjs 기반 날짜 포맷 컴포넌트.
 * cacheComponents 모드에서 Server Component의 Date.now() 호출 제한을 피하기 위해
 * "use client" 경계 안에서 실행합니다.
 */
export function FormattedDate({ date, format = "date", className }: Props) {
  const formatted =
    format === "korean"
      ? formatKoreanDate(date)
      : format === "datetime"
        ? formatDateTime(date)
        : formatDate(date);

  return <span className={className}>{formatted}</span>;
}
