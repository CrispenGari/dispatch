import { middleware } from "../trpc/trpc";
export const isAuth = middleware(async ({ ctx, next }) => {
  // https://trpc.io/docs/server/middlewares
  return next({ ctx: { ...ctx, me: ctx.me } });
});
