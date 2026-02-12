import { compileMDX } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { Options } from "rehype-pretty-code";
import { mdxComponents } from "@/components/mdx/MDXComponents";

const prettyCodeOptions: Options = {
  theme: "one-dark-pro",
  keepBackground: true,
};

export interface Heading {
  id: string;
  text: string;
  level: number;
}

/**
 * MDX 컨텐츠에서 헤딩을 추출하여 TOC 데이터 생성
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

export async function renderMDX(source: string) {
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
