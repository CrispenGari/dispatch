import { z } from "zod";

export const reactToTweetSchema = z.object({ id: z.string() });
export const reactToCommentSchema = z.object({ id: z.string() });
export const reactToCommentReplySchema = z.object({ id: z.string() });

export const onTweetReactionSchema = z.object({
  uid: z.string(),
  tweetId: z.string(),
});
export const onNewReactionNotificationSchema = z.object({
  uid: z.string(),
});
