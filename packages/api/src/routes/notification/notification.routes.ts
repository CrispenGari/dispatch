import { isAuth } from "../../middleware/isAuth.middleware";
import { delSchema, readSchema } from "../../schema/notification.schema";
import { publicProcedure, router } from "../../trpc/trpc";

export const notificationRouter = router({
  read: publicProcedure
    .input(readSchema)
    .use(isAuth)
    .mutation(async ({ ctx: { prisma, me }, input: { id } }) => {
      try {
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
    .use(isAuth)
    .mutation(async ({ ctx: { prisma, me }, input: { id } }) => {
      try {
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
  notifications: publicProcedure
    .use(isAuth)
    .query(async ({ ctx: { me, prisma } }) => {
      try {
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
