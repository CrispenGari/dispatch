import { z } from "zod";
export const registerSchema = z.object({
  nickname: z.string(),
  email: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
});
export const changePasswordSchema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
  token: z.string(),
});
export const loginSchema = z.object({
  emailOrNickname: z.string(),
  password: z.string(),
});

export const verifySchema = z.object({
  code: z.string(),
});

export const sendForgotPasswordLinkSchema = z.object({ email: z.string() });
export const resendForgotPasswordLinkSchema = z.object({ email: z.string() });
