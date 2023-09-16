import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { inferAsyncReturnType } from "@trpc/server";
import { prisma } from "../prisma";

export const createContext = ({ req, res }: CreateFastifyContextOptions) => {
  return {
    req,
    res,
    prisma,
  };
};

export type CtxType = inferAsyncReturnType<typeof createContext>;
