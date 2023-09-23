import { blockSchema, unblockSchema } from "../../schema/blocked.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { verifyJwt } from "../../utils/jwt";

export const blockedRouter = router({
  block: publicProcedure
    .input(unblockSchema)
    .mutation(async ({ ctx: { prisma, req }, input: { uid } }) => {
      try {
        const token = req.headers.authorization?.split(/\s/)[1];
        if (!!!token)
          return {
            error:
              "Failed to block the user because you are not authenticated.",
          };
        const { id } = await verifyJwt(token);
        const me = await prisma.user.findFirst({
          where: { id },
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
    .mutation(async ({ ctx: { prisma, req }, input: { uid } }) => {
      try {
        const token = req.headers.authorization?.split(/\s/)[1];
        if (!!!token)
          return {
            error:
              "Failed to unblock the user because you are not authenticated.",
          };
        const { id } = await verifyJwt(token);
        const me = await prisma.user.findFirst({
          where: { id },
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

        await prisma.blocked.delete({
          where: {
            uid: user.id,
          },
        });
        return true;
      } catch (error) {
        return { error: "Failed to block the user for whatever reason." };
      }
    }),
});
