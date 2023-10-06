import { z } from "zod";
export const blockSchema = z.object({ uid: z.string() });
export const unblockSchema = z.object({ uid: z.string() });
export const onUserUnBlockSchema = z.object({ uid: z.string() });
export const onUserBlockSchema = z.object({ uid: z.string() });
export const blockedSchema = z.object({
  cursor: z.string().nullish(),
  limit: z.number().min(1).max(100).default(3),
});
