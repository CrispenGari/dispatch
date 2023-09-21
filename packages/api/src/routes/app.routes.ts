import { router } from "../trpc/trpc";
import { authRouter } from "./auth/auth.routes";
import { commentRoute } from "./comment/comment.routes";
import { helloRouter } from "./hello/hello.routes";
import { pollRouter } from "./poll/poll.routes";
import { profileRouter } from "./profile/profile.routes";
import { reactionRoute } from "./reaction/reaction.routes";
import { tweetRouter } from "./tweet/tweet.routes";
import { userRouter } from "./user/user.routes";

export const appRouter = router({
  hello: helloRouter,
  user: userRouter,
  auth: authRouter,
  profile: profileRouter,
  tweet: tweetRouter,
  poll: pollRouter,
  reaction: reactionRoute,
  comment: commentRoute,
});

export type AppRouter = typeof appRouter;
