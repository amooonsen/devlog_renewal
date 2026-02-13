import path from "path";
import { fileURLToPath } from "url";

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
  },
};

export default nextConfig;
