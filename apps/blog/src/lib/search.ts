import { getChoseong, disassemble } from "es-hangul";

export function matchesKoreanSearch(text: string, query: string): boolean {
  if (!query.trim()) return true;

  const normalizedQuery = query.trim().toLowerCase();
  const normalizedText = text.toLowerCase();

  // 일반 문자열 포함 검색
  if (normalizedText.includes(normalizedQuery)) return true;

  // 초성 검색 (입력이 모두 자음인 경우)
  const isChoseongOnly = /^[ㄱ-ㅎ]+$/.test(normalizedQuery);
  if (isChoseongOnly) {
    const choseong = getChoseong(text);
    return choseong.includes(normalizedQuery);
  }

  // 자모 분해 검색 (입력 도중 부분 매칭)
  const decomposedText = disassemble(normalizedText);
  const decomposedQuery = disassemble(normalizedQuery);
  return decomposedText.includes(decomposedQuery);
}
