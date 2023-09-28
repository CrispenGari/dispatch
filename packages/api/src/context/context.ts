import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { inferAsyncReturnType } from "@trpc/server";
import { prisma } from "../prisma";
import Redis from "ioredis";
import { verifyJwt } from "../utils/jwt";
import { User } from "@prisma/client";

const getMe = async (jwt: string | undefined): Promise<User | null> => {
  if (!!!jwt) return null;
  try {
    const { id } = await verifyJwt(jwt);
    const me = await prisma.user.findFirst({ where: { id } });
    return me;
  } catch (error) {
    return null;
  }
};
export const createContext = async ({
  req,
  res,
}: CreateFastifyContextOptions) => {
  const redis = new Redis({
    host: process.env.REDIS_HOST,
  });
  const jwt = req.headers.authorization?.split(/\s/)[1];
  const me = await getMe(jwt);
  return {
    req,
    res,
    prisma,
    redis,
    me,
  };
};

export type CtxType = inferAsyncReturnType<typeof createContext>;
