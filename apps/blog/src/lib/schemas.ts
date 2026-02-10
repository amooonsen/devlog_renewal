import { z } from "zod";

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

export type ContactFormValues = z.infer<typeof contactSchema>;
export type CommentFormValues = z.infer<typeof commentSchema>;
