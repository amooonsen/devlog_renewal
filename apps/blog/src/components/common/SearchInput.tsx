"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@repo/ui";

interface SearchInputProps {
  basePath: string;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchInput({
  basePath,
  placeholder = "검색... (초성 검색 가능)",
  debounceMs = 500,
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return (): void => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // 이전 타이머 취소
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // 디바운스 적용
    debounceRef.current = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams);
        if (value) {
          params.set("q", value);
          params.delete("page");
        } else {
          params.delete("q");
        }
        router.push(`${basePath}?${params.toString()}`);
      });
    }, debounceMs);
  };

  return (
    <Input
      type="search"
      value={query}
      onChange={handleChange}
      placeholder={placeholder}
      className="max-w-sm"
    />
  );
}
