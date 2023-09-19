import { z } from "zod";

export const createSchema = z.object({
  text: z.string(),
  cords: z.object({ lat: z.number(), lon: z.number() }),
  polls: z.object({ text: z.string() }).array(),
});
