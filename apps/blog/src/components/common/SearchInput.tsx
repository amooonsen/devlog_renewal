"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@repo/ui";

interface SearchInputProps {
  basePath: string;
  placeholder?: string;
}

export function SearchInput({
  basePath,
  placeholder = "검색... (초성 검색 가능)",
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

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
