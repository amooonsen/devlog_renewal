import dayjs from "dayjs";

/** 포맷 상수 */
export const DATE_FORMAT = {
  /** YYYY.MM.DD */
  DATE: "YYYY.MM.DD",
  /** YYYY.MM.DD HH:mm */
  DATETIME: "YYYY.MM.DD HH:mm",
  /** MM.DD */
  SHORT: "MM.DD",
  /** YYYY년 MM월 DD일 */
  KOREAN: "YYYY년 MM월 DD일",
} as const;

/** 날짜 → YYYY.MM.DD */
export function formatDate(date: string | Date): string {
  return dayjs(date).format(DATE_FORMAT.DATE);
}

/** 날짜 → YYYY.MM.DD HH:mm */
export function formatDateTime(date: string | Date): string {
  return dayjs(date).format(DATE_FORMAT.DATETIME);
}

/** 날짜 → MM.DD */
export function formatShortDate(date: string | Date): string {
  return dayjs(date).format(DATE_FORMAT.SHORT);
}

/** 날짜 → YYYY년 MM월 DD일 */
export function formatKoreanDate(date: string | Date): string {
  return dayjs(date).format(DATE_FORMAT.KOREAN);
}

export { dayjs };
