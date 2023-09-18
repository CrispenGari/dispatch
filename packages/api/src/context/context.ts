import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { inferAsyncReturnType } from "@trpc/server";
import { prisma } from "../prisma";
import Redis from "ioredis";

export const createContext = ({ req, res }: CreateFastifyContextOptions) => {
  const redis = new Redis({
    host: process.env.REDIS_HOST,
  });
  return {
    req,
    res,
    prisma,
    redis,
  };
};

export type CtxType = inferAsyncReturnType<typeof createContext>;
