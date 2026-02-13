/**
 * 텍스트의 예상 읽기 시간을 계산합니다.
 * 한글: 분당 약 400-500자
 * 영문: 분당 약 200-250 단어
 * 코드 블록: 읽기 속도가 50% 느림
 */
export function calculateReadTime(content: string): number {
  // MDX/Markdown 문법 제거
  const text = content
    // 코드 블록 제거 (단, 코드는 읽기 속도가 느리므로 가중치 적용)
    .replace(/```[\s\S]*?```/g, (match) => {
      // 코드 블록은 일반 텍스트보다 2배 느리게 읽음
      return " ".repeat(match.length * 2);
    })
    // 인라인 코드
    .replace(/`[^`]+`/g, (match) => " ".repeat(match.length * 1.5))
    // HTML 태그 제거
    .replace(/<[^>]+>/g, "")
    // Markdown 링크 [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Markdown 이미지 제거
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    // Markdown 헤딩 기호 제거
    .replace(/^#{1,6}\s+/gm, "")
    // Markdown 강조 기호 제거
    .replace(/[*_~]/g, "")
    // 연속된 공백을 하나로
    .replace(/\s+/g, " ")
    .trim();

  // 한글과 영문 분리
  const koreanChars = text.match(/[가-힣]/g) || [];
  const englishWords = text.match(/[a-zA-Z]+/g) || [];

  // 한글: 분당 450자
  const koreanReadTime = koreanChars.length / 450;

  // 영문: 분당 225 단어
  const englishReadTime = englishWords.length / 225;

  // 총 읽기 시간 (분)
  const totalMinutes = koreanReadTime + englishReadTime;

  // 최소 1분
  return Math.max(1, Math.ceil(totalMinutes));
}

/**
 * 읽기 시간을 한글 문자열로 포맷팅
 */
export function formatReadTime(minutes: number): string {
  return `${minutes}분`;
}
