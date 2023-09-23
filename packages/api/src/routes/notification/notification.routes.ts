import { delSchema, readSchema } from "../../schema/notification.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { verifyJwt } from "../../utils/jwt";

export const notificationRouter = router({
  read: publicProcedure
    .input(readSchema)
    .mutation(async ({ ctx: { prisma, req }, input: { id } }) => {
      try {
        const token = req.headers.authorization?.split(/\s/)[1];
        if (!!!token)
          return {
            error:
              "Failed to read a notification because you are not authenticated.",
          };
        const { id: uid } = await verifyJwt(token);
        const me = await prisma.user.findFirst({ where: { id: uid } });
        if (!!!me)
          return {
            error:
              "Failed to read a notification because you are not authenticated.",
          };
        const notification = await prisma.notification.update({
          where: { id },
          data: { read: true },
        });
        return { notification };
      } catch (error) {
        return {
          error: "Failed to read a notification for whatever reason.",
        };
      }
    }),
  del: publicProcedure
    .input(delSchema)
    .mutation(async ({ ctx: { prisma, req }, input: { id } }) => {
      try {
        const token = req.headers.authorization?.split(/\s/)[1];
        if (!!!token)
          return {
            error:
              "Failed to delete a notification because you are not authenticated.",
          };
        const { id: uid } = await verifyJwt(token);
        const me = await prisma.user.findFirst({ where: { id: uid } });
        if (!!!me)
          return {
            error:
              "Failed to delete a notification because you are not authenticated.",
          };
        await prisma.notification.delete({
          where: { id },
        });
        return true;
      } catch (error) {
        return {
          error: "Failed to delete a notification for whatever reason.",
        };
      }
    }),
  notifications: publicProcedure.query(async ({ ctx: { req, prisma } }) => {
    try {
      const token = req.headers.authorization?.split(/\s/)[1];
      if (!!!token) return [];
      const { id } = await verifyJwt(token);
      const me = await prisma.user.findFirst({ where: { id } });
      if (!!!me) return [];
      const notifications = await prisma.notification.findMany({
        where: { userId: me.id },
      });
      return notifications;
    } catch (error) {
      return [];
    }
  }),
});
