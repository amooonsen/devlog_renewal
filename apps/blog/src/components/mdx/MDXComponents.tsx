// @ts-nocheck

import type {MDXComponents as MDXComponentsType} from "mdx/types";
import Image from "next/image";
import Link from "next/link";
import {Callout} from "./Callout";
import {CodeBlock} from "./CodeBlock";

export const mdxComponents: MDXComponentsType = {
  h1: ({children, ...props}) => (
    <h1 className="mt-8 mb-4 text-3xl font-bold tracking-tight" {...props}>
      {children}
    </h1>
  ),
  h2: ({children, ...props}) => (
    <h2
      className="mt-8 mb-3 text-2xl font-semibold tracking-tight border-b border-border pb-2"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({children, ...props}) => (
    <h3 className="mt-6 mb-3 text-xl font-semibold" {...props}>
      {children}
    </h3>
  ),
  p: ({children, ...props}) => (
    <p className="mb-4 leading-7" {...props}>
      {children}
    </p>
  ),
  a: ({href, children, ...props}) => {
    const isExternal = href?.startsWith("http");
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-4 hover:text-primary/80"
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href ?? "#"}
        className="text-primary underline underline-offset-4 hover:text-primary/80"
        {...props}
      >
        {children}
      </Link>
    );
  },
  ul: ({children, ...props}) => (
    <ul className="mb-4 ml-6 list-disc space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({children, ...props}) => (
    <ol className="mb-4 ml-6 list-decimal space-y-1" {...props}>
      {children}
    </ol>
  ),
  li: ({children, ...props}) => (
    <li className="leading-7" {...props}>
      {children}
    </li>
  ),
  blockquote: ({children, ...props}) => (
    <blockquote
      className="mb-4 border-l-4 border-primary/30 pl-4 italic text-muted-foreground"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({children, ...props}) => (
    <code className="rounded-md bg-muted px-1.5 py-0.5 text-sm font-mono" {...props}>
      {children}
    </code>
  ),
  pre: ({children, ...props}) => <CodeBlock {...props}>{children}</CodeBlock>,
  img: ({src, alt, ...props}) => {
    if (!src) return null;
    return (
      <span className="my-6 block overflow-hidden rounded-lg">
        <Image src={src} alt={alt ?? ""} width={800} height={450} className="w-full" {...props} />
      </span>
    );
  },
  hr: () => <hr className="my-8 border-border" />,
  table: ({children, ...props}) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({children, ...props}) => (
    <th className="border border-border bg-muted px-3 py-2 text-left font-semibold" {...props}>
      {children}
    </th>
  ),
  td: ({children, ...props}) => (
    <td className="border border-border px-3 py-2" {...props}>
      {children}
    </td>
  ),
  Callout,
};
