import { z } from "zod";

export const mentionsSchema = z.object({
  cursor: z.string().nullish(),
  limit: z.number().min(1).max(100).default(3),
  orderBy: z.enum(["asc", "desc"]),
  id: z.string(),
});

export const mentionSchema = z.object({ id: z.string() });
