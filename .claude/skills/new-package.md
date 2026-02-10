# Skill: 공유 패키지 관리

> 모노레포 내부 패키지 생성/수정 및 의존성 연결 패턴

## 패키지 구조 기본 템플릿

```
packages/{name}/
├── src/
│   ├── index.ts      # 배럴 export
│   └── ...           # 소스 파일
├── tsconfig.json
└── package.json
```

## package.json 템플릿

```json
{
  "name": "@repo/{name}",
  "version": "0.0.0",
  "private": true,
  "exports": {
    ".": "./src/index.ts"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.1.0"
  }
}
```

## tsconfig.json 템플릿

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

## 앱에서 패키지 참조

### 1. 앱의 package.json에 의존성 추가
```json
{
  "dependencies": {
    "@repo/{name}": "workspace:*"
  }
}
```

### 2. pnpm install 실행
```bash
pnpm install
```

### 3. 앱에서 import
```typescript
import { Something } from '@repo/{name}';
```

## 서브 패스 export (ex: @repo/database)

### package.json
```json
{
  "exports": {
    "./client": "./src/client.ts",
    "./server": "./src/server.ts",
    "./types": "./src/types.ts"
  }
}
```

### import
```typescript
import { createClient } from '@repo/database/server';
import type { Database } from '@repo/database/types';
```

## 체크리스트

### 새 패키지 생성 시
1. [ ] `packages/{name}/` 디렉토리 생성
2. [ ] `package.json` 작성 (`@repo/{name}`, private: true)
3. [ ] `tsconfig.json` 작성 (extends @repo/typescript-config)
4. [ ] `src/index.ts` 배럴 export 작성
5. [ ] 사용하는 앱의 `package.json`에 의존성 추가
6. [ ] `pnpm install` 실행
7. [ ] 빌드 확인 (`pnpm build`)

### 패키지 수정 시
1. [ ] 소스 파일 수정
2. [ ] `src/index.ts` export 확인
3. [ ] 의존하는 앱에서 import 확인
4. [ ] 타입 체크 (`pnpm typecheck`)
