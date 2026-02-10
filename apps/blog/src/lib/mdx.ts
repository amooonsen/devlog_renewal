import { compileMDX } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import type { Options } from "rehype-pretty-code";
import { mdxComponents } from "@/components/mdx/MDXComponents";

const prettyCodeOptions: Options = {
  theme: "one-dark-pro",
  keepBackground: true,
};

export async function renderMDX(source: string) {
  const { content } = await compileMDX({
    source,
    options: {
      mdxOptions: {
        rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
      },
    },
    components: mdxComponents,
  });

  return content;
}
