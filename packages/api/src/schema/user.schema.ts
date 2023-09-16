import { z } from "zod";
export const registerSchema = z.object({
  nickname: z.string(),
  email: z.string(),
  password: z.string(),
});
