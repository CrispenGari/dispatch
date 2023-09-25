import { z } from "zod";

export const replySchema = z.object({
  id: z.string(),
  reply: z.string(),
});
export const commentSchema = z.object({ id: z.string(), comment: z.string() });
export const getSchema = z.object({ id: z.string() });
export const getReplySchema = z.object({ id: z.string() });

export const onTweetCommentSchema = z.object({
  uid: z.string(),
  tweetId: z.string(),
});
export const onCommentReplySchema = z.object({
  uid: z.string(),
  commentId: z.string(),
});
export const onNewCommentNotificationSchema = z.object({
  uid: z.string(),
});
