import type { HTMLAttributes, ReactNode } from "react";

interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
  children: ReactNode;
}

export function CodeBlock({ children, ...props }: CodeBlockProps) {
  return (
    <pre
      className="mb-4 overflow-x-auto rounded-lg border border-border p-4 text-sm leading-relaxed [&>code]:bg-transparent [&>code]:p-0"
      {...props}
    >
      {children}
    </pre>
  );
}
