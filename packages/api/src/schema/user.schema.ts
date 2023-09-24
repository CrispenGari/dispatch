import { z } from "zod";

export const updateNicknameSchema = z.object({ nickname: z.string() });
export const updateEmailSchema = z.object({ email: z.string() });
export const updateGenderSchema = z.object({
  gender: z.enum(["MALE", "FEMALE", "UNDEFINED"]),
});
