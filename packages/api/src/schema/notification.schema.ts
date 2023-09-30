import { z } from "zod";

export const delSchema = z.object({ id: z.string() });
export const readSchema = z.object({ id: z.string() });
export const onReadSchema = z.object({ uid: z.string(), id: z.string() });
export const onDeleteSchema = z.object({ uid: z.string() });
export const notificationSchema = z.object({ id: z.string() });
export const notificationsSchema = z.object({
  category: z.enum(["general", "mention"]),
});
