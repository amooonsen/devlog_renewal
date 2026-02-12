# Vercel 배포 체크리스트

> 단계별로 체크하면서 진행하세요

## ⚠️ 중요: 배포 방식 이해

**핵심**: 하나의 GitHub 리포지토리에서 **2개의 Vercel 프로젝트**를 만듭니다.

```
📦 GitHub: devlog_renewal (1개)
    ├── apps/blog/   → 🚀 Vercel 프로젝트 1: devlog-blog
    └── apps/admin/  → 🚀 Vercel 프로젝트 2: devlog-admin

= 동일한 리포지토리를 2번 Import
= Root Directory만 다르게 설정
```

**배포 순서**:
1. Phase 2: Blog 프로젝트 생성 (`apps/blog`)
2. Phase 3: Admin 프로젝트 생성 (`apps/admin`) ← 같은 리포 재사용!

---

## 📋 Phase 1: 사전 준비

### Vercel 계정
- [ ] Vercel 계정 생성 완료
- [ ] GitHub 계정 연동 완료

### Supabase 환경 변수
- [ ] Supabase 프로젝트 생성 완료
- [ ] Production URL 확인: `https://_____.supabase.co`
- [ ] Anon Key 확인: `eyJhbGc...`
- [ ] 환경 변수 복사 완료 (메모장에 저장)

### Git 리포지토리
- [ ] 모든 변경사항 커밋 완료
- [ ] dev 브랜치 푸시 완료
- [ ] (선택) main 브랜치 병합 및 푸시

```bash
# 실행할 명령어
git add .
git commit -m "feat: Next.js 16 마이그레이션 및 Vercel 배포 설정"
git push origin dev
```

---

## 🚀 Phase 2: Blog 앱 배포 (프로젝트 1/2)

> **목표**: `apps/blog`를 별도 Vercel 프로젝트로 배포

### 2.1 프로젝트 생성 (1번째 Import)
- [ ] Vercel 대시보드 접속
- [ ] "Add New..." → "Project" 클릭
- [ ] GitHub 리포지토리 `devlog_renewal` 선택
- [ ] "Import" 클릭

### 2.2 프로젝트 설정
- [ ] **Project Name**: `devlog-blog`
- [ ] **Framework Preset**: `Next.js`
- [ ] **Root Directory**: `apps/blog`
- [ ] **Build Command**: `cd ../.. && pnpm turbo build --filter=blog...`
- [ ] **Output Directory**: `.next`
- [ ] **Install Command**: `cd ../.. && pnpm install`

### 2.3 환경 변수 설정
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 추가 (Production + Preview)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가 (Production + Preview)

### 2.4 빌드 최적화
- [ ] **Ignored Build Step** 설정:
  ```bash
  git diff --quiet HEAD^ HEAD apps/blog/ packages/
  ```

### 2.5 배포 실행
- [ ] "Deploy" 버튼 클릭
- [ ] 빌드 로그 확인
- [ ] 배포 성공 확인
- [ ] 배포 URL 접속 테스트: `https://devlog-blog.vercel.app`

---

## 🛠️ Phase 3: Admin 앱 배포 (프로젝트 2/2)

> **목표**: `apps/admin`을 별도 Vercel 프로젝트로 배포
>
> ⚠️ **중요**: 동일한 GitHub 리포지토리를 다시 Import 합니다!

### 3.1 프로젝트 생성 (2번째 Import)
- [ ] Vercel 대시보드 **홈으로 돌아가기**
- [ ] "Add New..." → "Project" 클릭
- [ ] **동일한** GitHub 리포지토리 `devlog_renewal` 선택 ← 같은 리포!
- [ ] "Import" 클릭

### 3.2 프로젝트 설정 (Blog와 다른 경로!)
- [ ] **Project Name**: `devlog-admin`
- [ ] **Framework Preset**: `Other`
- [ ] **Root Directory**: `apps/admin` ← Blog는 `apps/blog`였음!
- [ ] **Build Command**: `cd ../.. && pnpm turbo build --filter=admin...`
- [ ] **Output Directory**: `dist` ← Blog는 `.next`였음!
- [ ] **Install Command**: `cd ../.. && pnpm install`

### 3.3 환경 변수 설정
- [ ] `VITE_SUPABASE_URL` 추가 (Production + Preview)
- [ ] `VITE_SUPABASE_ANON_KEY` 추가 (Production + Preview)

### 3.4 빌드 최적화
- [ ] **Ignored Build Step** 설정:
  ```bash
  git diff --quiet HEAD^ HEAD apps/admin/ packages/
  ```

### 3.5 배포 실행
- [ ] "Deploy" 버튼 클릭
- [ ] 빌드 로그 확인
- [ ] 배포 성공 확인
- [ ] 배포 URL 접속 테스트: `https://devlog-admin.vercel.app`

---

## 🌐 Phase 4: 도메인 설정 (선택)

### 4.1 도메인 구매 (필요한 경우)
- [ ] 도메인 등록 업체에서 도메인 구매
  - 추천: Cloudflare, Namecheap, GoDaddy

### 4.2 Blog 도메인 연결
- [ ] devlog-blog 프로젝트 → Settings → Domains
- [ ] 도메인 추가: `devlog.dev` (또는 원하는 도메인)
- [ ] DNS 설정 (도메인 등록 업체에서):
  - [ ] A 레코드: `@` → `76.76.21.21`
  - [ ] CNAME: `www` → `cname.vercel-dns.com`
- [ ] DNS 전파 대기 (최대 48시간, 보통 몇 분)
- [ ] 도메인 접속 테스트: `https://devlog.dev`

### 4.3 Admin 서브도메인 연결
- [ ] devlog-admin 프로젝트 → Settings → Domains
- [ ] 서브도메인 추가: `admin.devlog.dev`
- [ ] DNS 설정:
  - [ ] CNAME: `admin` → `cname.vercel-dns.com`
- [ ] 서브도메인 접속 테스트: `https://admin.devlog.dev`

### 4.4 SSL 인증서 확인
- [ ] Blog SSL 자동 활성화 확인 (🔒 자물쇠 아이콘)
- [ ] Admin SSL 자동 활성화 확인

---

## ✅ Phase 5: 배포 검증

### 5.1 Blog 사이트 테스트
- [ ] 홈페이지 로딩 확인
- [ ] 포스트 목록 조회
- [ ] 포스트 상세 페이지 조회
- [ ] 검색 기능 테스트
- [ ] 연락처 폼 제출 테스트
- [ ] 댓글 작성 테스트

### 5.2 Admin 사이트 테스트
- [ ] 로그인 페이지 접속
- [ ] Supabase 인증 테스트
- [ ] 포스트 목록 조회
- [ ] 포스트 생성/수정/삭제 테스트
- [ ] 썸네일 업로드 테스트
- [ ] MDX 미리보기 테스트

### 5.3 Supabase 연동 확인
- [ ] Blog에서 데이터 조회 성공
- [ ] Admin에서 데이터 생성 성공
- [ ] RLS 정책 작동 확인
- [ ] Admin 권한 검증 (JWT role 체크)

### 5.4 성능 확인
- [ ] Lighthouse 점수 확인 (목표: 90+ Performance)
- [ ] Core Web Vitals 확인
- [ ] 이미지 최적화 확인
- [ ] 번들 크기 확인

---

## 📊 Phase 6: 모니터링 설정 (선택)

### 6.1 Vercel Analytics
- [ ] devlog-blog → Analytics → Enable
- [ ] devlog-admin → Analytics → Enable
- [ ] 대시보드에서 데이터 확인

### 6.2 Speed Insights
- [ ] devlog-blog → Settings → Speed Insights → Enable
- [ ] devlog-admin → Settings → Speed Insights → Enable

### 6.3 알림 설정
- [ ] Settings → Notifications
- [ ] 배포 알림 활성화 (이메일, Slack 등)
- [ ] 에러 알림 활성화

---

## 🔄 Phase 7: CI/CD 워크플로우 테스트

### 7.1 Preview 배포 테스트
- [ ] dev 브랜치에 코드 변경
- [ ] Git 푸시
- [ ] Vercel Preview 배포 자동 생성 확인
- [ ] Preview URL로 변경사항 확인

```bash
# 실행할 명령어
git checkout dev
# 파일 수정...
git add .
git commit -m "test: Preview 배포 테스트"
git push origin dev
# → Preview URL 생성됨
```

### 7.2 Production 배포 테스트
- [ ] main 브랜치로 병합
- [ ] Git 푸시
- [ ] Vercel Production 배포 자동 생성 확인
- [ ] Production URL에서 변경사항 확인

```bash
# 실행할 명령어
git checkout main
git merge dev
git push origin main
# → Production 배포 트리거
```

### 7.3 Ignored Build Step 테스트
- [ ] 관련 없는 파일 변경 (예: README.md)
- [ ] Git 푸시
- [ ] Vercel 빌드 스킵 확인 (로그: "Build skipped")

---

## 🎉 Phase 8: 배포 완료

### 최종 확인
- [ ] ✅ Blog 사이트 정상 작동
- [ ] ✅ Admin 사이트 정상 작동
- [ ] ✅ 도메인 연결 완료 (선택)
- [ ] ✅ SSL 인증서 활성화
- [ ] ✅ 자동 배포 워크플로우 작동
- [ ] ✅ 모니터링 설정 완료

### 문서화
- [ ] 배포 URL 기록
- [ ] 환경 변수 백업 (안전한 곳에 보관)
- [ ] 도메인 DNS 설정 백업
- [ ] Vercel 프로젝트 ID 기록

---

## 📝 배포 정보 기록

### URLs
```
Blog Production: https://________________
Admin Production: https://________________
Blog Preview: https://________________
Admin Preview: https://________________
```

### Vercel 프로젝트
```
Blog Project ID: ________________
Admin Project ID: ________________
```

### Supabase
```
Project URL: https://________________.supabase.co
Database URL: ________________
```

### 도메인 (선택)
```
등록 업체: ________________
도메인: ________________
네임서버: ________________
```

---

## 🆘 문제 발생 시

### 빌드 실패
1. Vercel 대시보드 → Deployments → 실패한 빌드 클릭
2. 빌드 로그 확인
3. 에러 메시지 복사
4. `.claude/deployment/vercel-setup-guide.md` 문제 해결 섹션 참고

### 환경 변수 문제
1. Settings → Environment Variables → 재확인
2. 재배포 (Deployments → ... → Redeploy)

### 긴급 롤백
1. Deployments → 이전 성공 배포 선택
2. ... → "Promote to Production"

---

## 🎯 다음 단계

배포 완료 후:
- [ ] 팀원 초대 (Settings → General → Members)
- [ ] Slack/Discord 알림 연동
- [ ] 커스텀 에러 페이지 설정
- [ ] Edge Config 설정 (선택)
- [ ] Vercel KV/Postgres 연동 (선택)

---

## 📑 빠른 참고: 핵심 설정 차이

### Blog vs Admin 비교표

| 항목 | Blog (프로젝트 1) | Admin (프로젝트 2) |
|------|-------------------|-------------------|
| Project Name | `devlog-blog` | `devlog-admin` |
| Root Directory | `apps/blog` | `apps/admin` |
| Framework | Next.js | Other (Vite) |
| Output Directory | `.next` | `dist` |
| 환경 변수 | `NEXT_PUBLIC_*` | `VITE_*` |
| Ignored Build Step | `apps/blog/ packages/` | `apps/admin/ packages/` |

### 자주 하는 실수

- ❌ **실수 1**: Admin 프로젝트를 만들지 않음
  - ✅ **해결**: 같은 리포지토리를 2번 Import 해야 함

- ❌ **실수 2**: Root Directory를 설정하지 않음
  - ✅ **해결**: Blog는 `apps/blog`, Admin은 `apps/admin`

- ❌ **실수 3**: Admin 환경 변수를 `NEXT_PUBLIC_`로 설정
  - ✅ **해결**: Admin은 `VITE_` 접두사 사용

- ❌ **실수 4**: Output Directory를 동일하게 설정
  - ✅ **해결**: Blog는 `.next`, Admin은 `dist`

---

**배포 완료 시간**: ____________
**배포자**: ____________
**비고**: ____________
