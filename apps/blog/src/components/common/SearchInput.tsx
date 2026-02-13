"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@repo/ui";
import { Loader2 } from "lucide-react";

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
  const [isPending, startTransition] = useTransition();
  const [isSearching, setIsSearching] = useState(false);
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

    // 입력 즉시 로딩 표시
    setIsSearching(true);

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
        // 라우팅 완료 후 로딩 종료
        setIsSearching(false);
      });
    }, debounceMs);
  };

  const showLoading = isSearching || isPending;

  return (
    <div className="relative max-w-sm">
      <Input
        type="search"
        value={query}
        onChange={handleChange}
        placeholder={placeholder}
        className="pr-10"
      />
      {showLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
