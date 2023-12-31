import { z } from "zod";

export const createSchema = z.object({
  text: z.string(),
  cords: z.object({ lat: z.number(), lon: z.number() }),
  polls: z.object({ text: z.string() }).array(),
  pollExpiresIn: z.string(),
  mentions: z.string().array(),
});
export const tweetsSchema = z.object({
  cursor: z.string().nullish(),
  limit: z.number().min(1).max(100).default(3),
  orderBy: z.enum(["asc", "desc"]),
  radius: z.number(),
  coord: z.object({
    lat: z.number(),
    lon: z.number(),
  }),
});

export const editSchema = z.object({
  text: z.string(),
  cords: z.object({ lat: z.number(), lon: z.number() }),
  polls: z.object({ text: z.string() }).array(),
  id: z.string(),
  mentions: z.string().array(),
  pollExpiresIn: z.string(),
});
export const delSchema = z.object({ id: z.string() });
export const tweetSchema = z.object({ id: z.string() });
export const viewSchema = z.object({
  id: z.string(),
});

export const onNewTweetSchema = z.object({
  uid: z.string(),
});
export const onDeleteTweetSchema = z.object({
  uid: z.string(),
});
export const onTweetUpdateSchema = z.object({
  uid: z.string(),
  tweetId: z.string(),
});
export const onViewSchema = z.object({
  uid: z.string(),
  tweetId: z.string(),
});
export const onNewTweetNotificationSchema = z.object({
  uid: z.string(),
});
export const onTweetMentionSchema = z.object({
  uid: z.string(),
});
