import path from "path";
import {fileURLToPath} from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  transpilePackages: ["@repo/ui", "@repo/database", "@repo/types", "@repo/date-utils"],

  // React Compiler (stable) - 자동 메모이제이션으로 useMemo/useCallback 불필요
  reactCompiler: true,

  // Cache Components - PPR + "use cache" 기반 명시적 캐싱 모델
  cacheComponents: true,

  experimental: {
    // Turbopack 파일 시스템 캐싱 (beta) - 개발 서버 재시작 시 컴파일 속도 향상
    turbopackFileSystemCacheForDev: true,
    // Router Cache TTL - Next.js 15 기본값(dynamic: 0)으로 매 이동마다 로딩 화면 노출되는 문제 해결
    staleTimes: {
      dynamic: 30, // 동적 라우트: 30초간 클라이언트 캐시 유지
      static: 180, // 정적 라우트: 3분간 클라이언트 캐시 유지
    },
  },
};

export default nextConfig;
