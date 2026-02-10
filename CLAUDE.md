# DevLog Renewal - Project Context

> Turborepo 모노레포 기반 개발 블로그 v2 (Next.js 16 + React 19 + Supabase)

## Quick Reference

| 항목 | 값 |
|------|-----|
| 프로젝트 | 개인 개발 블로그 리뉴얼 (v1 → v2) |
| 모노레포 | Turborepo + pnpm workspace |
| Blog | Next.js 16 + React 19 + Tailwind v4 |
| Admin | React 19 + Vite + React Router v7 + TanStack Query |
| Backend | Supabase (Auth, DB, Storage, RLS) |
| 패키지 매니저 | pnpm |
| 현재 브랜치 | dev (작업용), main (배포용) |

## Project Status

**현재 단계**: Phase 1 - 프로젝트 초기화 (모노레포 세팅 전)
- [x] 프로젝트 분석 완료 (PROJECT_ANALYSIS.md)
- [x] 시스템 설계 완료 (DESIGN.md)
- [ ] Phase 1: 모노레포 + Supabase + 공유 패키지 초기화
- [ ] Phase 2: Blog 앱 기본 구조
- [ ] Phase 3: Admin 앱
- [ ] Phase 4: 마무리 및 배포

## Key Decisions (v1 → v2 변경)

- Repository 패턴 → `lib/posts.ts` 단일 모듈 + Supabase 직접 쿼리
- 파일 기반 MDX → Supabase DB + Admin 패널
- 3단 라우팅 → 2단 (`/post/[category]/[slug]`)
- Webpack → Turbopack
- 암시적 캐싱 → `"use cache"` 명시적 캐싱
- `ignoreBuildErrors: true` → 엄격한 TypeScript

## Documentation Map

### 프로젝트 문서
| 문서 | 경로 | 내용 |
|------|------|------|
| 워크플로우 | `.claude/workflow.md` | Phase 0-4 작업 목록 및 진행 상태 |
| 아키텍처 | `.claude/architecture.md` | 모노레포 구조, DB 스키마, 설계 결정, 배포 전략 |
| 기술 스택 | `.claude/tech-stack.md` | 의존성, 버전, 환경변수 레퍼런스 |
| 코딩 컨벤션 | `.claude/conventions.md` | 네이밍, 패턴, 파일 조직 규칙 |

### 구현 스펙 (specs/)
| 문서 | 경로 | 내용 |
|------|------|------|
| DB 스키마 | `.claude/specs/db-schema.md` | 전체 DDL, RLS, 인덱스, 시드 SQL |
| Blog 스펙 | `.claude/specs/blog-spec.md` | 라우팅, 캐싱, 데이터 페칭, SEO, API 코드 |
| Admin 스펙 | `.claude/specs/admin-spec.md` | 인증, 페이지 기능, TanStack Query, Zod 스키마 |
| 패키지 스펙 | `.claude/specs/packages-spec.md` | Turbo/pnpm 설정, 공유 패키지 코드 |

### 반복 작업 스킬 (skills/)
| 문서 | 경로 | 내용 |
|------|------|------|
| 컴포넌트 생성 | `.claude/skills/new-component.md` | Server/Client 컴포넌트 템플릿 |
| 페이지 생성 | `.claude/skills/new-page.md` | Blog(Next.js)/Admin(Router) 페이지 패턴 |
| API 라우트 | `.claude/skills/new-api-route.md` | Next.js API Route 템플릿 |
| Supabase 작업 | `.claude/skills/supabase-ops.md` | 마이그레이션, 타입 생성, 시드 |
| 패키지 관리 | `.claude/skills/new-package.md` | 모노레포 패키지 생성/연결 |

### 원본 설계서
| 문서 | 경로 | 내용 |
|------|------|------|
| 전체 설계서 | `DESIGN.md` | 상세 시스템 설계 (specs/의 원본) |
| v1 분석 | `PROJECT_ANALYSIS.md` | 이전 버전 분석 및 마이그레이션 가이드 |

## Dev Commands

```bash
# 개발 서버
pnpm dev              # 전체 앱 실행
pnpm dev:blog         # 블로그만
pnpm dev:admin        # 어드민만

# 빌드/린트
pnpm build            # 전체 빌드
pnpm lint             # 린트
pnpm typecheck        # 타입 체크

# Supabase
pnpm db:start         # 로컬 Supabase 시작
pnpm db:stop          # 로컬 Supabase 종료
pnpm db:generate      # DB 타입 자동 생성
pnpm db:migrate       # 마이그레이션 적용
pnpm db:reset         # DB 리셋
```

## Rules

- 한국어 주석/커밋 메시지 사용
- 모든 컴포넌트는 TypeScript strict 모드
- Server Component 기본, 필요한 경우만 `"use client"`
- Supabase RLS로 데이터 접근 제어 (어드민: JWT role 검증)
- 공유 코드는 `packages/`에, 앱 전용 코드는 `apps/`에 배치
- `@repo/*` 네임스페이스로 내부 패키지 참조
