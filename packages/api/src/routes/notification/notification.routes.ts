import EventEmitter from "events";
import { isAuth } from "../../middleware/isAuth.middleware";
import {
  delSchema,
  notificationSchema,
  notificationsSchema,
  onDeleteSchema,
  onReadSchema,
  readSchema,
} from "../../schema/notification.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { Events } from "../../constants";
import { Notification } from "@prisma/client";
import { observable } from "@trpc/server/observable";
const ee = new EventEmitter();
export const notificationRouter = router({
  onDelete: publicProcedure
    .input(onDeleteSchema)
    .subscription(async ({ ctx: {}, input: { uid } }) => {
      return observable<Notification>((emit) => {
        const handler = (notification: Notification) => {
          if (uid === notification.userId) {
            emit.next(notification);
          }
        };
        ee.on(Events.ON_NOTIFICATION_DELETE, handler);
        return () => {
          ee.off(Events.ON_NOTIFICATION_DELETE, handler);
        };
      });
    }),
  onRead: publicProcedure
    .input(onReadSchema)
    .subscription(async ({ ctx: {}, input: { id } }) => {
      return observable<Notification>((emit) => {
        const handler = (notification: Notification) => {
          if (id === notification.id) {
            emit.next(notification);
          }
        };
        ee.on(Events.ON_NOTIFICATION_READ, handler);
        return () => {
          ee.off(Events.ON_NOTIFICATION_READ, handler);
        };
      });
    }),
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
        ee.emit(Events.ON_NOTIFICATION_READ, notification);
        return { notification };
      } catch (error) {
        return {
          error: "Failed to read a notification for whatever reason.",
        };
      }
    }),
  unread: publicProcedure
    .input(readSchema)
    .use(isAuth)
    .mutation(async ({ ctx: { prisma, me }, input: { id } }) => {
      try {
        if (!!!me)
          return {
            error:
              "Failed to unread a notification because you are not authenticated.",
          };
        const notification = await prisma.notification.update({
          where: { id },
          data: { read: false },
        });
        ee.emit(Events.ON_NOTIFICATION_READ, notification);
        return { notification };
      } catch (error) {
        return {
          error: "Failed to unread a notification for whatever reason.",
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
        const notification = await prisma.notification.findFirst({
          where: { id },
        });
        await prisma.notification.delete({
          where: { id },
        });
        ee.emit(Events.ON_NOTIFICATION_DELETE, notification);
        return true;
      } catch (error) {
        return {
          error: "Failed to delete a notification for whatever reason.",
        };
      }
    }),
  notifications: publicProcedure
    .input(notificationsSchema)
    .use(isAuth)
    .query(async ({ ctx: { me, prisma }, input: { category } }) => {
      try {
        if (!!!me) return [];
        const notifications = await prisma.notification.findMany({
          where: { userId: me.id, AND: { category } },
          select: { id: true, read: true },
        });
        return notifications;
      } catch (error) {
        return [];
      }
    }),

  notification: publicProcedure
    .input(notificationSchema)
    .use(isAuth)
    .query(async ({ ctx: { me, prisma }, input: { id } }) => {
      try {
        if (!!!me) return null;
        const notification = await prisma.notification.findFirst({
          where: { id },
        });
        return notification;
      } catch (error) {
        return null;
      }
    }),
});
