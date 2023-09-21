import { z } from "zod";

export const reactToTweetSchema = z.object({ id: z.string() });
export const onTweetReactionSchema = z.object({ uid: z.string() });
