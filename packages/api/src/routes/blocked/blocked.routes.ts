import { isAuth } from "../../middleware/isAuth.middleware";
import {
  blockSchema,
  blockedSchema,
  unblockSchema,
} from "../../schema/blocked.schema";
import { publicProcedure, router } from "../../trpc/trpc";

export const blockedRouter = router({
  blocked: publicProcedure
    .input(blockedSchema)
    .use(isAuth)
    .query(async ({ ctx: { me, prisma }, input: { limit, cursor } }) => {
      try {
        if (!!!me)
          return {
            blocked: [],
            nextCursor: undefined,
          };
        const blocked = await prisma.blocked.findMany({
          take: limit + 1,
          orderBy: { createdAt: "asc" },
          include: {
            user: true,
          },
          cursor: cursor ? { id: cursor } : undefined,
        });
        let nextCursor: typeof cursor | undefined = undefined;
        if (blocked.length > limit) {
          const nextItem = blocked.pop() as (typeof blocked)[number];
          nextCursor = nextItem.id;
        }
        return { blocked, nextCursor };
      } catch (error) {
        console.log(error);
        return { blocked: [], nextCursor: undefined };
      }
    }),
  block: publicProcedure
    .input(blockSchema)
    .use(isAuth)
    .mutation(async ({ ctx: { prisma, me: usr }, input: { uid } }) => {
      try {
        if (!!!usr)
          return {
            error:
              "Failed to block the user because you are not authenticated.",
          };
        const me = await prisma.user.findFirst({
          where: { id: usr.id },
          include: { blocked: true },
        });
        if (!!!me)
          return {
            error:
              "Failed to block the user because you are not authenticated.",
          };
        const user = await prisma.user.findFirst({ where: { id: uid } });
        if (!!!user)
          return {
            error:
              "Failed to block the user, that user account is no longer on dispatch.",
          };

        const blocked = !!me.blocked.find((usr) => usr.uid === user.id);
        if (blocked)
          return {
            error:
              "Failed to block the user, you have already blocked this user.",
          };
        await prisma.blocked.create({
          data: {
            uid: user.id,
            user: { connect: { id: me.id } },
          },
        });
        return true;
      } catch (error) {
        return { error: "Failed to block the user for whatever reason." };
      }
    }),
  unblock: publicProcedure
    .input(unblockSchema)
    .use(isAuth)
    .mutation(async ({ ctx: { prisma, me: usr }, input: { uid } }) => {
      try {
        if (!!!usr)
          return {
            error:
              "Failed to unblock the user because you are not authenticated.",
          };
        const me = await prisma.user.findFirst({
          where: { id: usr.id },
          include: { blocked: true },
        });
        if (!!!me)
          return {
            error:
              "Failed to unblock the user because you are not authenticated.",
          };
        const user = await prisma.user.findFirst({ where: { id: uid } });
        if (!!!user)
          return {
            error:
              "Failed to unblock the user, that user account is no longer on dispatch.",
          };

        const blocked = !!me.blocked.find((usr) => usr.uid === user.id);
        if (!blocked)
          return {
            error:
              "Failed to unblock the user, because this user is not on your blocked list.",
          };
        const u = await prisma.blocked.findFirst({ where: { uid } });
        await prisma.blocked.delete({
          where: { id: u?.id },
        });
        return true;
      } catch (error) {
        return { error: "Failed to block the user for whatever reason." };
      }
    }),
});
