import { z } from "zod";

export const updateNicknameSchema = z.object({ nickname: z.string() });
export const userSchema = z.object({ id: z.string() });
export const viewProfile = z.object({ id: z.string() });
export const tweetsSchema = z.object({ id: z.string() });
export const onViewProfileSchema = z.object({ uid: z.string() });
export const onUpdateSchema = z.object({ uid: z.string() });
export const updateEmailSchema = z.object({ email: z.string() });
export const updateGenderSchema = z.object({
  gender: z.enum(["MALE", "FEMALE", "UNDEFINED"]),
});
export const updateBioSchema = z.object({
  bio: z.string(),
});
export const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
  confirmNewPassword: z.string(),
});
