"use client";

import { useEffect, useRef } from "react";

interface ViewCounterProps {
  postId: string;
}

export function ViewCounter({ postId }: ViewCounterProps) {
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;

    fetch(`/api/views/${postId}`, { method: "POST" }).catch(() => {
      // 조회수 증가 실패는 무시
    });
  }, [postId]);

  return null;
}
