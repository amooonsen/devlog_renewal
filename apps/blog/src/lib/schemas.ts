import { z } from "zod";

/** 문의하기 폼 검증 스키마 (이름, 이메일, 제목, 내용) */
export const contactSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요.").max(50),
  email: z
    .string()
    .min(1, "이메일을 입력해주세요.")
    .email("올바른 이메일을 입력해주세요."),
  subject: z
    .string()
    .min(1, "제목을 입력해주세요.")
    .max(200, "제목은 200자 이내로 입력해주세요."),
  message: z.string().min(1, "내용을 입력해주세요."),
});

/** 댓글 작성 폼 검증 스키마 (작성자, 내용, 비밀번호) */
export const commentSchema = z.object({
  author_name: z
    .string()
    .min(1, "이름을 입력해주세요.")
    .max(50, "이름은 50자 이내로 입력해주세요."),
  content: z
    .string()
    .min(1, "댓글을 입력해주세요.")
    .max(1000, "댓글은 1000자 이내로 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

/** 문의하기 폼 데이터 타입 (contactSchema 기반 추론) */
export type ContactFormValues = z.infer<typeof contactSchema>;

/** 댓글 폼 데이터 타입 (commentSchema 기반 추론) */
export type CommentFormValues = z.infer<typeof commentSchema>;
