import { z } from "zod";

export const replySchema = z.object({
  id: z.string(),
  reply: z.string(),
  mentions: z.string().array(),
});

export const commentsSchema = z.object({
  tweetId: z.string(),
  cursor: z.string().nullish(),
  limit: z.number().min(1).max(100).default(3),
});
export const repliesSchema = z.object({
  commentId: z.string(),
  cursor: z.string().nullish(),
  limit: z.number().min(1).max(100).default(3),
});
export const commentSchema = z.object({
  id: z.string(),
  comment: z.string(),
  mentions: z.string().array(),
});
export const getSchema = z.object({ id: z.string() });
export const getReplySchema = z.object({ id: z.string() });
export const deleteCommentReplySchema = z.object({ id: z.string() });
export const deleteCommentSchema = z.object({ id: z.string() });

export const onTweetCommentSchema = z.object({
  uid: z.string(),
  tweetId: z.string(),
});
export const onCommentDeleteSchema = z.object({
  uid: z.string(),
  tweetId: z.string(),
});
export const onCommentReplySchema = z.object({
  uid: z.string(),
  commentId: z.string(),
});
export const onCommentReplyDeleteSchema = z.object({
  uid: z.string(),
  commentId: z.string(),
});
export const onNewCommentNotificationSchema = z.object({
  uid: z.string(),
});
