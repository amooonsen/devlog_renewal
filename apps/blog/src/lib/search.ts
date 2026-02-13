import { getChoseong, disassemble } from "es-hangul";

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
