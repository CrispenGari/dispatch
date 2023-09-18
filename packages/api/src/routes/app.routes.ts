import { router } from "../trpc/trpc";
import { authRouter } from "./auth/auth.routes";
import { helloRouter } from "./hello/hello.routes";
import { profileRouter } from "./profile/profile.routes";
import { userRouter } from "./user/user.routes";

export const appRouter = router({
  hello: helloRouter,
  user: userRouter,
  auth: authRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
