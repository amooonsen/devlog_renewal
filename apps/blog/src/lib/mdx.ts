import { compileMDX } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { Options } from "rehype-pretty-code";
import { mdxComponents } from "@/components/mdx/MDXComponents";
import type { JSX } from "react";

/** rehype-pretty-code 코드 하이라이팅 설정 */
const prettyCodeOptions: Options = {
  theme: "one-dark-pro",
  keepBackground: true,
};

/** 목차(TOC) 항목 타입 */
export interface Heading {
  id: string;
  text: string;
  level: number;
}

/**
 * MDX 원본 텍스트에서 마크다운 헤딩(h1~h3)을 파싱하여 TOC 데이터를 생성합니다.
 *
 * 헤딩 텍스트를 kebab-case ID로 변환하며, 한글과 영문 모두 지원합니다.
 *
 * @param source - MDX 원본 문자열
 * @returns 헤딩 배열 (id, text, level)
 */
export function extractHeadings(source: string): Heading[] {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;

  while ((match = headingRegex.exec(source)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    // 헤딩 텍스트를 kebab-case ID로 변환
    const id = text
      .toLowerCase()
      .replace(/[^\w\s가-힣-]/g, "")
      .replace(/\s+/g, "-");

    headings.push({ id, text, level });
  }

  return headings;
}

/**
 * MDX 문자열을 React 엘리먼트로 컴파일합니다.
 *
 * rehype 플러그인 파이프라인:
 * 1. rehype-slug: 헤딩에 자동 ID 부여
 * 2. rehype-autolink-headings: 헤딩을 앵커 링크로 래핑
 * 3. rehype-pretty-code: 코드 블록 구문 강조 (one-dark-pro 테마)
 *
 * @param source - MDX 원본 문자열
 * @returns 렌더링된 React 엘리먼트
 */
export async function renderMDX(source: string): Promise<JSX.Element> {
  const { content } = await compileMDX({
    source,
    options: {
      mdxOptions: {
        rehypePlugins: [
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              behavior: "wrap",
              properties: {
                className: ["anchor"],
              },
            },
          ],
          [rehypePrettyCode, prettyCodeOptions],
        ],
      },
    },
    components: mdxComponents,
  });

  return content;
}
