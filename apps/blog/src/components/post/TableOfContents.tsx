"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/lib/mdx";

interface TableOfContentsProps {
  headings: Heading[];
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // 현재 보고 있는 섹션을 감지하는 IntersectionObserver 설정
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        // 헤더 높이(56px) + 여유(24px) = 80px
        rootMargin: "-80px 0px -80% 0px",
      }
    );

    // 모든 헤딩 요소를 관찰
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="space-y-1">
      <p className="mb-4 text-sm font-semibold">목차</p>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{
              paddingLeft: `${(heading.level - 1) * 0.75}rem`,
            }}
          >
            <a
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className={`block py-1 transition-colors hover:text-foreground ${
                activeId === heading.id
                  ? "text-primary font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
