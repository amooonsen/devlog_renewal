import { getChoseong, disassemble } from "es-hangul";
import type { PostListQueryResult } from "@repo/types";

/**
 * 한글 특화 퍼지 검색을 수행합니다.
 *
 * 3단계 매칭 전략:
 * 1. 일반 문자열 포함 검색 (대소문자 무시)
 * 2. 초성 검색 - 입력이 모두 자음인 경우 (예: "ㅎㄱ" → "한글")
 * 3. 자모 분해 검색 - 입력 도중 부분 매칭 (예: "한ㄱ" → "한글")
 *
 * @param text - 검색 대상 텍스트
 * @param query - 검색어
 * @returns 매칭 여부
 */
export function matchesKoreanSearch(text: string, query: string): boolean {
  if (!query.trim()) return true;

  const normalizedQuery = query.trim().toLowerCase();
  const normalizedText = text.toLowerCase();

  // 1. 일반 문자열 포함 검색
  if (normalizedText.includes(normalizedQuery)) return true;

  // 2. 초성 검색 (입력이 모두 자음인 경우)
  const isChoseongOnly = /^[ㄱ-ㅎ]+$/.test(normalizedQuery);
  if (isChoseongOnly) {
    const choseong = getChoseong(text);
    return choseong.includes(normalizedQuery);
  }

  // 3. 자모 분해 검색 (입력 도중 부분 매칭)
  const decomposedText = disassemble(normalizedText);
  const decomposedQuery = disassemble(normalizedQuery);
  return decomposedText.includes(decomposedQuery);
}

/**
 * 포스트 목록에 한글 검색 필터를 적용하고 페이지네이션합니다.
 *
 * 검색어가 없으면 posts를 그대로 반환합니다.
 * 검색어가 있으면 title/excerpt 기준으로 필터링 후 클라이언트 페이지네이션을 적용합니다.
 *
 * @param posts - 필터링할 포스트 목록
 * @param totalCount - 검색 전 전체 개수 (DB 반환값)
 * @param query - 검색어
 * @param page - 현재 페이지
 * @param perPage - 페이지당 개수
 */
export function applySearchFilter(
  posts: PostListQueryResult[],
  totalCount: number,
  query: string | undefined,
  page: number,
  perPage: number
): { posts: PostListQueryResult[]; totalCount: number } {
  if (!query?.trim()) return { posts, totalCount };

  const filtered = posts.filter(
    (post) =>
      matchesKoreanSearch(post.title, query) ||
      (post.excerpt != null && matchesKoreanSearch(post.excerpt, query))
  );
  const offset = (page - 1) * perPage;
  return {
    posts: filtered.slice(offset, offset + perPage),
    totalCount: filtered.length,
  };
}
