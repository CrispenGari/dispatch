import { z } from "zod";

export const voteSchema = z.object({ id: z.string(), tweetId: z.string() });

export const onVoteNotificationSchema = z.object({ uid: z.string() });
export const onVoteSchema = z.object({ uid: z.string(), tweetId: z.string() });
