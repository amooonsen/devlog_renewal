# Dev Blog 프로젝트 분석 및 Next.js 16 마이그레이션 가이드

> 분석 일자: 2026-02-10
> 현재 스택: Next.js 14.2.11 / React 18 / TypeScript 5 / Tailwind CSS 3 / shadcn/ui

---

## 1. 현재 프로젝트 구조

```
dev-blog/
├── app/                          # App Router 페이지
│   ├── layout.tsx                # 루트 레이아웃 (Analytics, ThemeProvider)
│   ├── page.tsx                  # / → /home 리다이렉트
│   ├── globals.css               # 전역 스타일 (CSS Variables, 다크모드)
│   ├── loading.tsx / not-found.tsx / error.tsx
│   ├── _components/              # 공유 컴포넌트 (PostList, Filter, Sort)
│   ├── home/                     # 메인 홈 페이지
│   │   ├── page.tsx
│   │   └── _components/          # BlogMainCards, BlogMainRecent
│   └── post/[onedepth]/[category]/[slug]/  # 동적 포스트 라우팅
│       ├── page.tsx
│       └── _components/          # PostHead, PostBody, PostFooter, PostImage
│
├── components/                   # 공통 컴포넌트
│   ├── ui/                       # shadcn/ui 컴포넌트 (30+ 파일)
│   ├── screen/                   # Header, Footer, SearchPost, ThemeToogle
│   ├── context/                  # ThemeProvider, DialogProvider
│   ├── markdown/                 # MDX 렌더링 (Link, Image, Callout)
│   ├── motion/                   # 애니메이션 (FlipWords, DestoryText, AnimatedTooltip)
│   └── loading/                  # 스켈레톤 UI (6종)
│
├── service/                      # 데이터 접근 레이어 (Repository 패턴)
│   ├── BaseRepository.ts
│   ├── PostRepository.ts / IPostRepository.ts
│   ├── PostDetailRepository.ts / IPostDetailRepository.ts
│   ├── parser.ts                 # (전체 주석 처리 - 미사용)
│   └── PostParser.ts             # (전체 주석 처리 - 미사용)
│
├── lib/                          # 유틸리티 함수
│   ├── post.ts                   # 포스트 데이터 fetch 핵심 로직
│   ├── utils.ts                  # cn(), openDialog()
│   ├── date.ts                   # dayjs 포맷
│   ├── path.ts                   # 경로 유틸
│   └── sharp.ts                  # 이미지 blur placeholder 생성
│
├── hooks/                        # 커스텀 훅
│   ├── use-toast.ts
│   ├── usePreventSameLinkNav.ts
│   ├── useSortCategory.tsx
│   └── useViewSameTagPost.ts     # (미구현 - console.log만 존재)
│
├── constants/                    # 상수 데이터 (10개 파일)
├── types/                        # TypeScript 타입 (Post, Page, UI)
├── store/                        # Zustand 상태관리 (dialogStore)
├── post/                         # MDX 포스트 파일 저장소 (비어있음)
├── assets/                       # 정적 자원 (비어있음)
├── public/                       # 퍼블릭 자원 (비어있음)
└── scripts/                      # 스크립트 (비어있음)
```

### 파일 통계
| 구분 | 파일 수 |
|------|---------|
| 페이지/레이아웃 (app/) | 27 |
| 공통 컴포넌트 (components/) | 49 |
| 서비스 레이어 (service/) | 7 |
| 라이브러리 (lib/) | 5 |
| 훅 (hooks/) | 4 |
| 상수 (constants/) | 10 |
| 타입 (types/) | 3 |
| 스토어 (store/) | 1 |
| **총 소스 파일** | **~106** |

### 주요 의존성
| 패키지 | 버전 | 용도 |
|--------|------|------|
| next | 14.2.11 | 프레임워크 |
| react / react-dom | ^18 | UI 라이브러리 |
| next-mdx-remote | ^5.0.0 | MDX 렌더링 |
| rehype-pretty-code + shikiji | ^0.14 / ^0.10 | 코드 하이라이팅 |
| framer-motion | ^11.5.4 | 애니메이션 |
| zustand | 5.0.0-rc.2 | 상태관리 |
| shadcn/ui (radix-ui) | 다수 | UI 컴포넌트 |
| tailwindcss + tailwindcss-animate | ^3.4 | 스타일링 |
| gray-matter | ^4.0.3 | MDX frontmatter 파싱 |
| dayjs | ^1.11 | 날짜 처리 |
| sharp | ^0.33.5 | 이미지 최적화 |
| zod + react-hook-form | ^3.23 / ^7.53 | 폼 유효성 |

---

## 2. 발견된 문제점 (심각도별)

### 🔴 Critical (즉시 수정 필요)

#### C1. Google Analytics 하드코딩
**파일**: `app/layout.tsx`
```
"G-내계정키 환경변수로 넣을꺼임"
```
→ GA/GTM ID가 환경변수가 아닌 플레이스홀더 문자열로 하드코딩됨. 분석 데이터 미수집 상태.

#### C2. TypeScript 빌드 에러 무시
**파일**: `next.config.mjs`
```js
typescript: { ignoreBuildErrors: true }
```
→ 타입 에러가 빌드를 통과함. 런타임 에러 위험.

#### C3. ESLint 핵심 규칙 비활성화
**파일**: `.eslintrc.json`
```json
"@typescript-eslint/no-unused-vars": "off",
"@typescript-eslint/no-explicit-any": "off"
```
→ 미사용 변수와 any 타입 허용으로 코드 품질 저하.

#### C4. 데이터 레이어 중복
`lib/post.ts`와 `service/` 레이어가 동일한 기능을 중복 구현. 어떤 파일이 실제 사용 중인지 혼란 발생.

#### C5. .env 파일 포맷 오류
**파일**: `.env`
```
ANALYZE=true npm run build
```
→ 환경변수 파일에 명령어가 들어가 있음. `ANALYZE=true`만 있어야 함.

---

### 🟡 Important (품질 개선 필요)

#### I1. 대량의 주석 처리된 코드 (~1000줄 이상)
| 파일 | 내용 |
|------|------|
| `service/parser.ts` | 전체 파일 주석 처리 |
| `service/PostParser.ts` | 전체 파일 주석 처리 |
| `app/home/_components/BlogMainRecent.tsx` | 50줄+ 주석 블록 |
| `app/_components/PostListPage.tsx` | FilterCategory, SortCategory, SearchPost 주석 |
| `app/post/.../PostFooter.tsx` | useViewSameTagPost 주석 |
| `app/post/.../[category]/page.tsx` | generateMetadata 주석 |

#### I2. 미구현/미완성 기능
| 기능 | 상태 |
|------|------|
| SearchPost 검색 | `console.log`만 존재, 실제 검색 미구현 |
| PostFooter 관련 포스트 | useViewSameTagPost 훅이 `console.log(123)`만 실행 |
| FilterCategory | 주석 처리됨 |
| SortCategoryContainer | 주석 처리됨 |
| Markdown Image 컴포넌트 | 내부 완전히 빈 상태 |

#### I3. 디버그 코드 잔존
```
BlogMainRecent.tsx → console.log(posts.length)
PostRepository.ts → console.log() (디버깅)
useViewSameTagPost.ts → console.log(123)
SearchPost.tsx → console.log()
```

#### I4. 하드코딩된 값
| 위치 | 내용 |
|------|------|
| `PostHead.tsx` | 카테고리 링크에 `/tech/` 하드코딩 |
| `BlogMainCards.tsx` | 카테고리 목록 하드코딩, placeholder.svg 이미지 |
| `PostListPage.tsx` | `selectedTags = ['TEST']` 테스트 데이터 |
| `use-toast.ts` | `TOAST_REMOVE_DELAY = 1000000` (16분, 비정상) |

#### I5. 잘못된 컨텐츠
| 파일 | 문제 |
|------|------|
| `constants/termsConst.ts` | "면접 부스터" 이용약관 (다른 프로젝트 컨텐츠) |
| `constants/privacyConst.ts` | "면접 부스터" 개인정보처리방침 (다른 프로젝트 컨텐츠) |
| `BlogMainRecent.tsx` | "뉴스테러" 오타 → "뉴스레터" |

#### I6. 오타/네이밍
| 현재 | 수정 필요 |
|------|-----------|
| `ThemeToogle.tsx` | `ThemeToggle.tsx` |
| `DestoryText.tsx` | `DestroyText.tsx` |
| `destoryTextConst.ts` | `destroyTextConst.ts` |

---

### 🟢 Recommended (개선 권장)

#### R1. 미사용 의존성 정리
- `path` (Node.js 내장 모듈, npm 패키지 불필요)
- `react-hook-form` + `@hookform/resolvers` + `zod` (폼이 없는 블로그)
- `shikiji` (rehype-pretty-code가 내부적으로 shiki 사용)
- `zustand 5.0.0-rc.2` (RC 버전 → 안정 버전 필요)
- 다수의 미사용 shadcn/ui 컴포넌트 (form, checkbox, textarea, alert-dialog 등)

#### R2. 빈 디렉토리/파일 정리
- `post/` 디렉토리 비어있음
- `assets/` 디렉토리 비어있음
- `public/` 디렉토리 비어있음
- `scripts/` 디렉토리 비어있음
- `middleware.ts` 빈 함수

#### R3. 과도한 Repository 패턴
파일 기반 블로그에 Repository + Interface 패턴은 오버엔지니어링. `lib/post.ts` 단일 모듈로 충분.

#### R4. 타입 불일치
`TypePost.ts`에서 `tag?` 와 `tags?` 프로퍼티 혼재. 일관된 네이밍 필요.

#### R5. 배열 안전성
`BlogMainRecent.tsx`에서 `posts[0]` 접근 시 bounds 체크 없음.

#### R6. .env 파일이 .gitignore에 미포함
`.env` 파일이 Git에 트래킹될 수 있음. `.env`도 `.gitignore`에 추가 필요.

---

## 3. Next.js 16 마이그레이션 가이드

### 3.1 주요 변경사항 요약

| 항목 | Next.js 14 (현재) | Next.js 16 |
|------|-------------------|------------|
| **React** | 18 | 19.2 |
| **번들러** | Webpack (기본) | Turbopack (기본) |
| **미들웨어** | `middleware.ts` | `proxy.ts` (middleware 지원중단 예고) |
| **캐싱** | 암시적 (기본 캐시) | 명시적 (`"use cache"` 지시어) |
| **params/searchParams** | 동기 | 비동기 (`await` 필요) |
| **cookies/headers** | 동기 | 비동기 (`await` 필요) |
| **Node.js** | 18+ | 20.9+ (LTS) |
| **TypeScript** | 5+ | 5.1.0+ |
| **ESLint** | next lint 포함 | 직접 ESLint/Biome 사용 |
| **이미지 캐시 TTL** | 60초 | 4시간 (14400초) |

### 3.2 필수 마이그레이션 작업

#### Step 1: 의존성 업그레이드
```bash
# 자동 마이그레이션 도구 사용
npx @next/codemod@canary upgrade latest

# 또는 수동 설치
npm install next@latest react@latest react-dom@latest
```

#### Step 2: middleware.ts → proxy.ts 변환
```typescript
// Before (현재): middleware.ts
import { NextRequest, NextResponse } from 'next/server';
export function middleware(request: NextRequest) {}

// After: proxy.ts
import { NextRequest, NextResponse } from 'next/server';
export default function proxy(request: NextRequest) {
  // 리다이렉트/리라이트 로직
}
```

#### Step 3: params/searchParams 비동기화
현재 프로젝트에서 영향받는 파일:
```
app/post/[onedepth]/page.tsx
app/post/[onedepth]/[category]/page.tsx
app/post/[onedepth]/[category]/[slug]/page.tsx
```

```typescript
// Before
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params;
}

// After
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
}
```

#### Step 4: next.config 업데이트
```typescript
// next.config.ts (mjs → ts 권장)
const nextConfig = {
  // experimental.serverActions 제거 (기본 활성화)
  // typescript.ignoreBuildErrors 제거 (타입 에러 수정 후)
  cacheComponents: true, // 새로운 캐시 모델 활성화
};
export default nextConfig;
```

#### Step 5: ESLint 설정 마이그레이션
```bash
# next lint 명령 제거됨 → ESLint 직접 사용
npm install eslint @eslint/js --save-dev
```
`package.json`의 `"lint": "next lint"` → `"lint": "eslint ."` 변경

#### Step 6: Tailwind CSS v4 호환성 확인
Next.js 16은 Tailwind CSS v4와 최적화됨. `tailwind.config.ts`의 `require()` 구문을 ESM import로 변경 필요.

---

## 4. 신규 프로젝트 권장 구조 (Next.js 16)

```
dev-blog-v2/
├── src/                              # src 디렉토리 사용 권장
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # 메인 페이지 (리다이렉트 제거)
│   │   ├── globals.css
│   │   ├── (home)/                   # Route Group
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   └── post/
│   │       ├── [category]/
│   │       │   ├── page.tsx          # 카테고리별 목록
│   │       │   └── [slug]/
│   │       │       ├── page.tsx      # 포스트 상세
│   │       │       └── _components/
│   │       └── page.tsx              # 전체 포스트 목록
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui (필요한 것만)
│   │   ├── layout/                   # Header, Footer, Navigation
│   │   ├── post/                     # 포스트 관련 컴포넌트
│   │   ├── mdx/                      # MDX 렌더링 컴포넌트
│   │   └── common/                   # 공통 컴포넌트 (ThemeToggle 등)
│   │
│   ├── lib/
│   │   ├── posts.ts                  # 포스트 데이터 접근 (단일 모듈)
│   │   ├── mdx.ts                    # MDX 설정/파싱
│   │   ├── utils.ts                  # 유틸리티
│   │   └── constants.ts              # 상수 (또는 /config)
│   │
│   ├── hooks/                        # 커스텀 훅
│   ├── types/                        # 타입 정의
│   └── config/                       # 사이트 설정
│       ├── site.ts                   # 사이트 메타 정보
│       └── navigation.ts             # 네비게이션 메뉴
│
├── content/                          # MDX 포스트 파일 (src 외부)
│   ├── tech/
│   ├── newsletter/
│   └── life/
│
├── public/
│   └── images/
│
├── proxy.ts                          # Next.js 16 프록시 (구 미들웨어)
├── next.config.ts                    # .mjs → .ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### 구조 변경 포인트

| 현재 | 권장 | 이유 |
|------|------|------|
| `/app`, `/components` (루트) | `/src/app`, `/src/components` | 소스코드 분리 |
| `post/[onedepth]/[category]/[slug]` | `post/[category]/[slug]` | 3단 → 2단 라우팅 간소화 |
| `service/` (Repository 패턴) | `lib/posts.ts` (단일 모듈) | 파일 기반 블로그에 과도한 추상화 제거 |
| `constants/` (10개 파일) | `config/site.ts` + `config/navigation.ts` | 상수 통합 |
| `store/` (Zustand) | React Context 또는 URL State | 다이얼로그 정도는 Zustand 불필요 |
| `components/screen/` | `components/layout/` | 명확한 네이밍 |
| 빈 `middleware.ts` | `proxy.ts` (필요 시) | Next.js 16 규약 |

---

## 5. Next.js 16에서 활용할 수 있는 개선사항

### 5.1 `"use cache"` 활용
```typescript
// 포스트 목록 캐싱
"use cache";
import { cacheLife } from 'next/cache';

export default async function PostListPage() {
  cacheLife('hours'); // 시간 단위 캐시
  const posts = await getPosts();
  return <PostList posts={posts} />;
}
```

### 5.2 React 19 기능 활용
```typescript
// React Compiler로 자동 메모이제이션 (useMemo, useCallback 제거)
// View Transitions로 페이지 전환 애니메이션 (framer-motion 의존도 감소)
// useEffectEvent로 이벤트 핸들러 안정화
```

### 5.3 Turbopack 기본 적용
- Webpack 설정 (`next.config.mjs`의 webpack 콜백) 제거 가능
- 빌드 속도 2~5배 향상
- HMR 10배 빠른 Fast Refresh

### 5.4 개선된 이미지 최적화
- 이미지 캐시 TTL 기본 4시간 → `sharp.ts`의 blur placeholder 로직 단순화 가능
- `next/image` 컴포넌트 개선으로 커스텀 이미지 로딩 로직 감소

### 5.5 DevTools MCP 연동
- AI 기반 디버깅 지원
- 통합 로그 확인
- 자동 에러 분석

---

## 6. 현재 프로젝트 즉시 개선 체크리스트

### Phase 1: 즉시 수정 (1~2시간)
- [ ] `app/layout.tsx` - GA/GTM 환경변수 적용
- [ ] `next.config.mjs` - `ignoreBuildErrors: true` 제거 후 타입 에러 수정
- [ ] `.env` - 포맷 수정
- [ ] `.gitignore` - `.env` 추가
- [ ] 모든 `console.log` 제거
- [ ] `middleware.ts` - 빈 파일이면 삭제

### Phase 2: 코드 정리 (반나절)
- [ ] 주석 처리된 코드 전체 삭제 (service/parser.ts, PostParser.ts 등)
- [ ] `useViewSameTagPost.ts` 삭제 또는 구현
- [ ] 하드코딩된 값 → 상수/환경변수로 추출
- [ ] 오타 수정 (ThemeToogle → ThemeToggle 등)
- [ ] `termsConst.ts`, `privacyConst.ts` 블로그용 컨텐츠로 교체
- [ ] 미사용 shadcn/ui 컴포넌트 정리

### Phase 3: 아키텍처 개선 (1~2일)
- [ ] `service/` 레이어 제거 → `lib/post.ts`로 통합
- [ ] 라우팅 구조 단순화 (3단 → 2단 검토)
- [ ] 미사용 의존성 제거 (react-hook-form, zod 등)
- [ ] ESLint 규칙 활성화 (no-unused-vars, no-explicit-any)
- [ ] SearchPost 기능 구현 또는 제거

### Phase 4: Next.js 16 마이그레이션 (2~3일)
- [ ] Next.js 16 + React 19 업그레이드
- [ ] params/searchParams 비동기화
- [ ] middleware.ts → proxy.ts
- [ ] next.config.mjs → next.config.ts
- [ ] Turbopack 호환성 확인
- [ ] `"use cache"` 적용
- [ ] Tailwind CSS v4 마이그레이션 검토

---

## 7. 의존성 정리 권장

### 제거 권장
| 패키지 | 이유 |
|--------|------|
| `path` | Node.js 내장 모듈, npm 패키지 불필요 |
| `react-hook-form` | 블로그에 폼 기능 없음 |
| `@hookform/resolvers` | react-hook-form 의존 |
| `zod` | 폼 유효성 검증 미사용 |
| `shikiji` | rehype-pretty-code가 자체 shiki 내장 |
| `glob` / `@types/glob` | Node.js 22+ 내장 또는 fast-glob 대체 |

### 업그레이드 권장
| 패키지 | 현재 | 권장 |
|--------|------|------|
| `zustand` | 5.0.0-rc.2 | 5.x 정식 릴리스 |
| `next` | 14.2.11 | 16.x |
| `react` | ^18 | ^19 |
| `tailwindcss` | ^3.4 | ^4 (Next.js 16 최적화) |

### 추가 권장
| 패키지 | 용도 |
|--------|------|
| `@next/mdx` | next-mdx-remote 대신 빌트인 MDX 지원 검토 |
| `contentlayer2` 또는 `velite` | 타입 안전한 컨텐츠 관리 |

---

## 8. 종합 평가

### 강점
- Next.js App Router 컨벤션을 잘 따르는 구조
- Server/Client 컴포넌트 분리 적절
- shadcn/ui 기반 일관된 UI 시스템
- 다크모드 지원 (CSS Variables + next-themes)
- 스켈레톤 UI로 로딩 경험 고려
- rehype/remark 플러그인 체계적 구성

### 약점
- 미완성 기능이 주석으로 산재 (기술 부채)
- 데이터 레이어 중복 (lib vs service)
- 타입 안전성 비활성화 (ignoreBuildErrors, ESLint off)
- 다른 프로젝트 컨텐츠 혼입 (면접 부스터)
- 과도한 의존성 (사용하지 않는 패키지 다수)

### 코드 품질 점수
| 항목 | 점수 (10점 만점) |
|------|:-:|
| 구조/아키텍처 | 6 |
| 코드 청결도 | 4 |
| 타입 안전성 | 3 |
| 컴포넌트 설계 | 7 |
| 에러 처리 | 5 |
| 성능 최적화 | 5 |
| 접근성 | 6 |
| **종합** | **5.1** |

> Next.js 16으로 신규 프로젝트를 시작하면서 위 개선사항들을 반영하면, 유지보수성과 성능 모두 크게 향상될 것입니다.

---

## 참고 자료
- [Next.js 16 공식 블로그](https://nextjs.org/blog/next-16)
- [Next.js 16.1 업데이트](https://nextjs.org/blog/next-16-1)
- [Next.js 16 마이그레이션 가이드](https://nextjs.org/docs/app/guides/upgrading/version-16)
