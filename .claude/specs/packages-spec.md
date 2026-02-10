# Shared Packages & Config Specification

> 모노레포 공유 패키지, Turborepo 설정, 공유 TypeScript/ESLint 구현 스펙

## Turborepo 설정

### turbo.json
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "db:generate": {
      "cache": false
    }
  }
}
```

### pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 루트 package.json 스크립트
```json
{
  "scripts": {
    "dev": "turbo dev",
    "dev:blog": "turbo dev --filter=blog",
    "dev:admin": "turbo dev --filter=admin",
    "build": "turbo build",
    "lint": "turbo lint",
    "typecheck": "turbo typecheck",
    "db:start": "supabase start",
    "db:stop": "supabase stop",
    "db:generate": "supabase gen types typescript --local > packages/database/src/types.ts",
    "db:migrate": "supabase db push",
    "db:reset": "supabase db reset"
  }
}
```

---

## @repo/database

Supabase 클라이언트 팩토리 + 자동 생성 DB 타입.

### 파일 구조
```
packages/database/
├── src/
│   ├── client.ts    # 브라우저용 (Admin SPA)
│   ├── server.ts    # 서버용 (Next.js)
│   ├── types.ts     # 자동 생성 DB 타입
│   └── index.ts     # 배럴 export
├── tsconfig.json
└── package.json
```

### client.ts (브라우저용)
```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export function createClient() {
  return createBrowserClient<Database>(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
  );
}
```

### server.ts (서버용 - Next.js)
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    },
  );
}
```

### 타입 자동 생성
```bash
pnpm supabase gen types typescript --local > packages/database/src/types.ts
```

### package.json
```json
{
  "name": "@repo/database",
  "version": "0.0.0",
  "private": true,
  "exports": {
    "./client": "./src/client.ts",
    "./server": "./src/server.ts",
    "./types": "./src/types.ts"
  },
  "dependencies": {
    "@supabase/ssr": "latest",
    "@supabase/supabase-js": "latest"
  },
  "devDependencies": {
    "@repo/typescript-config": "workspace:*",
    "typescript": "^5.1.0"
  }
}
```

---

## @repo/types

앱 간 공유 비즈니스 타입.

### 파일 구조
```
packages/types/
├── src/
│   ├── post.ts
│   ├── comment.ts
│   ├── contact.ts
│   └── index.ts
├── tsconfig.json
└── package.json
```

### post.ts
```typescript
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  category: Category;
  tags: Tag[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}
```

### comment.ts
```typescript
export interface Comment {
  id: number;
  post_id: string;
  author_name: string;
  content: string;
  is_approved: boolean;
  parent_id: number | null;
  created_at: string;
  replies?: Comment[];
}
```

### contact.ts
```typescript
export interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
```

---

## @repo/ui

shadcn/ui 기반 공유 UI 컴포넌트.

### 공유 대상
- Button, Input, Textarea, Select
- Dialog, Dropdown, Toast
- Badge, Skeleton, Spinner
- Tailwind 기본 설정 (색상, 폰트, 간격)

### 비공유 (앱별 관리)
- 블로그 전용: PostCard, MDX 컴포넌트 등
- 어드민 전용: DataTable, Sidebar 등

### package.json
```json
{
  "name": "@repo/ui",
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

---

## @repo/typescript-config

### base.json
```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "moduleResolution": "bundler",
    "module": "ESNext",
    "target": "ES2022",
    "lib": ["ES2022"]
  }
}
```

### nextjs.json
```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "preserve",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### react-vite.json
```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## @repo/eslint-config

### base.js
- TypeScript strict rules
- no-unused-vars: error
- no-explicit-any: error

### nextjs.js
- extends: base + next/core-web-vitals

### react.js
- extends: base + react-hooks + react/recommended
