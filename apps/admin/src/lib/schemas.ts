import { z } from "zod";

/** 포스트 작성/수정 폼 검증 스키마 */
export const postSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요").max(200, "제목은 200자 이내"),
  slug: z
    .string()
    .min(1, "슬러그를 입력하세요")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "소문자, 숫자, 하이픈만 사용 가능"),
  content: z.string().min(1, "내용을 입력하세요"),
  excerpt: z.string().max(500, "요약은 500자 이내").optional().or(z.literal("")),
  thumbnail_url: z.string().url().optional().or(z.literal("")),
  status: z.enum(["draft", "published", "archived"]),
  is_featured: z.boolean(),
  category_id: z.number().positive("카테고리를 선택하세요"),
  tag_ids: z.array(z.number()),
  published_at: z.string().optional().or(z.literal("")),
});

/** 포스트 폼 데이터 타입 (postSchema 기반 추론) */
export type PostSchemaValues = z.infer<typeof postSchema>;

/** 관리자 로그인 폼 검증 스키마 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .email("올바른 이메일을 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

/** 로그인 폼 데이터 타입 (loginSchema 기반 추론) */
export type LoginFormValues = z.infer<typeof loginSchema>;
