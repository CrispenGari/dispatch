import { z } from "zod";

export const delSchema = z.object({ id: z.string() });
export const readSchema = z.object({ id: z.string() });
