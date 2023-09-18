import { z } from "zod";
export const authProfileSchema = z.object({
  gender: z.enum(["MALE", "FEMALE", "UNDEFINED"]),
});
