# Vercel 배포 문제 해결 가이드

> 배포 중 발생하는 일반적인 문제와 해결 방법

## 🔴 Ignored Build Step 에러

### 에러 메시지
```
Command failed with exit code 128: git diff --quiet HEAD^ HEAD apps/admin/ packages/
fatal: ambiguous argument 'apps/admin/': unknown revision or path not in the working tree.
```

### 원인
- 첫 배포라서 이전 커밋(`HEAD^`)이 없음
- Git 히스토리가 없는 새 브랜치
- `HEAD^` 명령어가 실패

### 해결 방법

#### 방법 1: Ignored Build Step 제거 (첫 배포 시)

**Vercel 대시보드**:
1. 프로젝트 → **Settings** → **Git**
2. **Ignored Build Step** 섹션
3. 명령어를 **비워두기**
4. **Save** → **Deployments** → **Redeploy**

#### 방법 2: 안전한 명령어로 변경

**권장 명령어** (에러 방지):
```bash
bash -c 'git diff --quiet HEAD~1 HEAD apps/admin/ packages/ 2>/dev/null || exit 1'
```

**변경 전** (에러 발생):
```bash
git diff --quiet HEAD^ HEAD apps/admin/ packages/
```

**변경 후** (안전):
```bash
bash -c 'git diff --quiet HEAD~1 HEAD apps/admin/ packages/ 2>/dev/null || exit 1'
```

**차이점**:
- `HEAD^` → `HEAD~1` (더 안전)
- `2>/dev/null` 추가 (에러 메시지 숨김)
- `bash -c` 래핑 (명령어 안전 실행)

#### 방법 3: vercel.json 수정

로컬에서 파일 수정 후 재배포:

```json
// apps/admin/vercel.json
{
  "ignoreCommand": "bash -c 'git diff --quiet HEAD~1 HEAD apps/admin/ packages/ 2>/dev/null || exit 1'"
}
```

### 추천 워크플로우

```
1. 첫 배포: Ignored Build Step 비우기
   → 무조건 빌드 진행
   → 배포 성공

2. 이후 배포: 안전한 명령어 설정
   → bash -c 'git diff --quiet HEAD~1 HEAD ...'
   → 변경 시에만 빌드
```

---

## 🟡 모노레포 빌드 에러

### 에러 메시지
```
Cannot find module '@repo/ui'
Cannot resolve '@repo/database'
```

### 원인
- Root Directory 설정 누락
- Install Command가 잘못됨
- 모노레포 구조를 인식하지 못함

### 해결 방법

#### Vercel 설정 확인

**Root Directory**: `apps/blog` 또는 `apps/admin`으로 설정
**Install Command**: `cd ../.. && pnpm install`
**Build Command**: `cd ../.. && pnpm turbo build --filter=blog...`

#### vercel.json 확인

```json
{
  "buildCommand": "cd ../.. && pnpm turbo build --filter=blog...",
  "installCommand": "cd ../.. && pnpm install"
}
```

**핵심**: `cd ../..`로 루트로 이동 후 실행

---

## 🟡 환경 변수 접근 불가

### 에러 메시지
```
TypeError: Cannot read property 'SUPABASE_URL' of undefined
Missing required environment variable
```

### 원인
- 환경 변수 미설정
- 접두사 오류 (Blog: `NEXT_PUBLIC_`, Admin: `VITE_`)
- Environment 선택 오류 (Production vs Preview)

### 해결 방법

#### 1. Vercel 대시보드 확인

**Settings** → **Environment Variables**

**Blog 환경 변수**:
```
NEXT_PUBLIC_SUPABASE_URL = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJxxx...

✅ Production 체크
✅ Preview 체크
```

**Admin 환경 변수**:
```
VITE_SUPABASE_URL = https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJxxx...

✅ Production 체크
✅ Preview 체크
```

#### 2. 접두사 확인

| 앱 | 접두사 | 예시 |
|-----|--------|------|
| Blog (Next.js) | `NEXT_PUBLIC_` | `NEXT_PUBLIC_SUPABASE_URL` |
| Admin (Vite) | `VITE_` | `VITE_SUPABASE_URL` |

#### 3. 재배포

환경 변수 추가 후:
- **Deployments** → **...** → **Redeploy**

---

## 🟡 Admin SPA 라우팅 404

### 에러 메시지
```
404: This page could not be found
(브라우저 새로고침 시)
```

### 원인
- SPA 라우팅 설정 누락
- Vercel이 `/admin/posts` 같은 경로를 파일로 인식

### 해결 방법

#### apps/admin/vercel.json 확인

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

이미 설정되어 있으면 재배포:
- **Deployments** → **Redeploy**

---

## 🟡 Build Output Directory 에러

### 에러 메시지
```
Error: No Output Directory named ".next" found after the Build completed.
```

### 원인
- Output Directory 설정 오류
- Blog: `.next`, Admin: `dist`

### 해결 방법

#### Vercel 설정 확인

**Blog**:
```
Output Directory: .next
```

**Admin**:
```
Output Directory: dist
```

#### vercel.json 확인

```json
// Blog
{
  "outputDirectory": ".next"
}

// Admin
{
  "outputDirectory": "dist"
}
```

---

## 🟡 빌드 시간 초과

### 에러 메시지
```
Error: Command timed out after 15 minutes
```

### 원인
- 모노레포 전체를 빌드하려고 함
- Turbo 필터 설정 누락

### 해결 방법

#### Build Command 확인

**Blog**:
```bash
cd ../.. && pnpm turbo build --filter=blog...
```

**Admin**:
```bash
cd ../.. && pnpm turbo build --filter=admin...
```

**핵심**: `--filter=blog...` 또는 `--filter=admin...` 필수!

---

## 🟠 도메인 연결 문제

### 에러 메시지
```
Invalid Configuration
Domain is not correctly configured
```

### 원인
- DNS 설정 오류
- DNS 전파 대기 중

### 해결 방법

#### DNS 설정 확인

**A 레코드** (루트 도메인):
```
Type: A
Name: @
Value: 76.76.21.21
```

**CNAME** (서브도메인):
```
Type: CNAME
Name: admin
Value: cname.vercel-dns.com
```

#### DNS 전파 확인

```bash
# DNS 조회
nslookup devlog.dev
dig devlog.dev

# 대기 시간: 최대 48시간 (보통 10분~1시간)
```

---

## 🔴 빌드는 성공했지만 페이지 500 에러

### 에러 메시지
```
500: Internal Server Error
Application error: a server-side exception has occurred
```

### 원인
- 런타임 에러 (환경 변수, Supabase 연결 등)
- Serverless Function 메모리 부족

### 해결 방법

#### 1. 로그 확인

```bash
# Vercel CLI
vercel logs [deployment-url]

# 또는 Vercel 대시보드
Deployments → 클릭 → Runtime Logs
```

#### 2. 환경 변수 재확인

Settings → Environment Variables → 모두 설정되었는지 확인

#### 3. Serverless Function 설정

```json
// apps/blog/vercel.json
{
  "functions": {
    "app/api/**": {
      "memory": 1024,  // 메모리 증가
      "maxDuration": 10
    }
  }
}
```

---

## 🟢 캐시 문제

### 증상
- 최신 코드가 반영되지 않음
- 이전 버전이 계속 보임

### 해결 방법

#### Vercel 대시보드

1. **Deployments** → 최신 배포 선택
2. **...** → **Redeploy**
3. **Clear cache and redeploy** 체크 ✅
4. **Redeploy** 클릭

#### 브라우저 캐시

```
Chrome/Edge: Ctrl + Shift + R (Windows) / Cmd + Shift + R (Mac)
Safari: Cmd + Option + R
```

---

## 긴급 롤백

### 상황: 배포 후 사이트 다운

#### 즉시 롤백

1. **Deployments** 탭
2. **이전 성공 배포** 클릭
3. **...** → **Promote to Production**
4. 몇 초 내 이전 버전으로 복구

---

## 유용한 디버깅 명령어

```bash
# 로컬에서 프로덕션 빌드 테스트
cd apps/blog
pnpm build

# Vercel CLI로 로그 확인
vercel logs

# 환경 변수 다운로드
vercel env pull .env.local

# 로컬에서 Vercel 환경 재현
vercel dev

# 배포 상태 확인
vercel ls

# 특정 배포 정보
vercel inspect [deployment-url]
```

---

## 도움 받기

### 1. Vercel 대시보드
- **Deployments** → 빌드 로그 확인
- **Runtime Logs** → 실행 중 에러 확인

### 2. Vercel 문서
- https://vercel.com/docs
- https://vercel.com/docs/errors

### 3. 프로젝트 문서
- `.claude/deployment/vercel-setup-guide.md`
- `.claude/deployment/QUICK_REFERENCE.md`

### 4. 커뮤니티
- Vercel Discord: https://vercel.com/discord
- GitHub Issues: Vercel/Next.js 리포지토리
