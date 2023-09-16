import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { CtxType } from "../context/context";

const t = initTRPC.context<CtxType>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const publicProcedure = t.procedure;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;
export const router = t.router;
