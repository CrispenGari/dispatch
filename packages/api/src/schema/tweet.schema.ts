import { z } from "zod";

export const createSchema = z.object({
  text: z.string(),
  cords: z.object({ lat: z.number(), lon: z.number() }),
  polls: z.object({ text: z.string() }).array(),
});

export const editSchema = z.object({
  text: z.string(),
  cords: z.object({ lat: z.number(), lon: z.number() }),
  polls: z.object({ text: z.string() }).array(),
  id: z.string(),
});

export const onNewTweetSchema = z.object({ uid: z.string() });
export const onDeleteTweetSchema = z.object({ uid: z.string() });
export const onTweetUpdateSchema = z.object({ uid: z.string() });

export const delSchema = z.object({ id: z.string() });
export const tweetSchema = z.object({ id: z.string() });
