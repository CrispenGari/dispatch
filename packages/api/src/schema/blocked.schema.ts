import { z } from "zod";
export const blockSchema = z.object({ uid: z.string() });
export const unblockSchema = z.object({ uid: z.string() });
