import { z } from "zod";

export const delSchema = z.object({ id: z.string() });
export const readSchema = z.object({ id: z.string() });
export const onReadSchema = z.object({ uid: z.string(), id: z.string() });
export const onNotificationReadSchema = z.object({ uid: z.string() });
export const onDeleteSchema = z.object({ uid: z.string() });
export const notificationSchema = z.object({ id: z.string() });
export const notificationsSchema = z.object({
  category: z.enum(["general", "mention"]),
  cursor: z.string().nullish(),
  limit: z.number().min(1).max(100).default(3),
});
