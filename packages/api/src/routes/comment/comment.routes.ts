import {
  commentSchema,
  commentsSchema,
  deleteCommentReplySchema,
  deleteCommentSchema,
  getReplySchema,
  getSchema,
  onCommentDeleteSchema,
  onCommentReplyDeleteSchema,
  onCommentReplySchema,
  onNewCommentNotificationSchema,
  onTweetCommentSchema,
  repliesSchema,
  replySchema,
} from "../../schema/comment.schema";
import { publicProcedure, router } from "../../trpc/trpc";

import { Events } from "../../constants";
import EventEmitter from "events";
import { Tweet, User, Notification, Comment, Reply } from "@prisma/client";
import { observable } from "@trpc/server/observable";
import { isAuth } from "../../middleware/isAuth.middleware";

const ee = new EventEmitter();
ee.setMaxListeners(100);
export const commentRoute = router({
  onNewCommentNotification: publicProcedure
    .input(onNewCommentNotificationSchema)
    .subscription(async ({ ctx: {}, input: { uid } }) => {
      return observable<Notification & { user: User }>((emit) => {
        const handler = (notification: Notification & { user: User }) => {
          if (uid === notification.user.id) {
            emit.next(notification);
          }
        };
        ee.on(Events.ON_NEW_NOTIFICATION, handler);
        return () => {
          ee.off(Events.ON_NEW_NOTIFICATION, handler);
        };
      });
    }),

  onTweetComment: publicProcedure
    .input(onTweetCommentSchema)
    .subscription(async ({ ctx: {}, input: { tweetId } }) => {
      return observable<Tweet & { creator: User }>((emit) => {
        const handler = (tweet: Tweet & { creator: User }) => {
          if (tweet.id === tweetId) {
            emit.next(tweet);
          }
        };
        ee.on(Events.ON_TWEET_COMMENT, handler);
        return () => {
          ee.off(Events.ON_TWEET_COMMENT, handler);
        };
      });
    }),
  onCommentReply: publicProcedure
    .input(onCommentReplySchema)
    .subscription(async ({ ctx: {}, input: { commentId } }) => {
      return observable<Comment & { creator: User }>((emit) => {
        const handler = (comment: Comment & { creator: User }) => {
          if (comment.id === commentId) {
            emit.next(comment);
          }
        };
        ee.on(Events.ON_COMMENT_REPLY, handler);
        return () => {
          ee.off(Events.ON_COMMENT_REPLY, handler);
        };
      });
    }),

  onCommentDelete: publicProcedure
    .input(onCommentDeleteSchema)
    .subscription(async ({ ctx: {}, input: { tweetId } }) => {
      return observable<Comment>((emit) => {
        const handler = (comment: Comment) => {
          if (comment.tweetId === tweetId) {
            emit.next(comment);
          }
        };
        ee.on(Events.ON_COMMENT_DELETE, handler);
        return () => {
          ee.off(Events.ON_COMMENT_DELETE, handler);
        };
      });
    }),
  onCommentReplyDelete: publicProcedure
    .input(onCommentReplyDeleteSchema)
    .subscription(async ({ ctx: {}, input: { commentId } }) => {
      return observable<Reply>((emit) => {
        const handler = (reply: Reply) => {
          if (reply.commentId === commentId) {
            emit.next(reply);
          }
        };
        ee.on(Events.ON_COMMENT_REPLY_DELETE, handler);
        return () => {
          ee.off(Events.ON_COMMENT_REPLY_DELETE, handler);
        };
      });
    }),

  comment: publicProcedure
    .input(commentSchema)
    .use(isAuth)
    .mutation(
      async ({ ctx: { prisma, me }, input: { id, comment, mentions } }) => {
        try {
          if (!!!me) return false;
          const twt = await prisma.tweet.findFirst({
            where: { id },
          });
          if (!!!twt) return false;
          const mentioned = await prisma.user.findMany({
            where: { nickname: { in: mentions } },
            select: { id: true },
          });

          const cmt = await prisma.comment.create({
            data: {
              text: comment.trim(),
              creator: { connect: { id: me.id } },
              mentions: {
                create: mentioned.map(({ id }) => ({
                  userId: id,
                })),
              },
            },
            include: { creator: true },
          });
          const tweet = await prisma.tweet.update({
            where: { id },
            data: {
              comments: {
                connect: { id: cmt.id },
              },
            },
            include: { creator: true },
          });
          if (tweet.creator.id !== me.id) {
            const notification = await prisma.notification.create({
              data: {
                tweetId: tweet.id,
                category: "general",
                type: "comment",
                title: `new comment`,
                message: `@${cmt.creator.nickname} - commented on your tweet.`,
                user: { connect: { id: tweet.creator.id } },
              },
              include: { user: true },
            });
            ee.emit(Events.ON_NEW_NOTIFICATION, notification);
          }
          ee.emit(Events.ON_TWEET_COMMENT, tweet);
          mentioned.forEach(async (mention) => {
            const notification = await prisma.notification.create({
              data: {
                tweetId: tweet.id,
                category: "mention",
                type: "comment",
                title: `new mention`,
                message: `@${cmt.creator.nickname} - mentioned you in ${
                  me.gender === "FEMALE" ? "her" : "his"
                } comment on ${
                  tweet.userId === me.id
                    ? me.gender === "FEMALE"
                      ? "her"
                      : "his"
                    : tweet.creator.nickname + "'s"
                } tweet.`,
                user: { connect: { id: mention.id } },
              },
              include: { user: true },
            });
            ee.emit(Events.ON_NEW_NOTIFICATION, notification);
          });

          return true;
        } catch (error) {
          console.log(error);
          return false;
        }
      }
    ),
  reply: publicProcedure
    .input(replySchema)
    .use(isAuth)
    .mutation(
      async ({ ctx: { prisma, me }, input: { id, reply, mentions } }) => {
        try {
          if (!!!me) return false;
          const comment = await prisma.comment.findFirst({
            where: { id },
            include: {
              creator: true,
              tweet: {
                include: { creator: true },
              },
            },
          });
          const mentioned = await prisma.user.findMany({
            where: { nickname: { in: mentions } },
            select: { id: true },
          });
          if (!!!comment) return false;

          const commentReply = await prisma.reply.create({
            data: {
              text: reply.trim(),
              creator: { connect: { id: me.id } },
              comment: { connect: { id: comment.id } },
              mentions: {
                create: mentioned.map(({ id }) => ({
                  userId: id,
                })),
              },
            },
            include: { creator: true },
          });

          if (comment.creator.id !== me.id) {
            const notification = await prisma.notification.create({
              data: {
                category: "general",
                type: "reply",
                tweetId: comment.tweetId as any,
                title: `comment reply`,
                message:
                  me.id === comment.tweet?.creator.id
                    ? `@${commentReply.creator.nickname} - reply to your comment on your tweet.`
                    : `@${commentReply.creator.nickname} - reply to your comment on ${comment.tweet?.creator.nickname}'s tweet.`,
                user: { connect: { id: comment.creator.id } },
              },
              include: { user: true },
            });
            ee.emit(Events.ON_NEW_NOTIFICATION, notification);
          }
          ee.emit(Events.ON_COMMENT_REPLY, comment);

          mentioned.forEach(async (mention) => {
            const notification = await prisma.notification.create({
              data: {
                tweetId: comment.tweetId!,
                category: "mention",
                type: "reply",
                title: `new mention`,
                message: `@${
                  commentReply.creator.nickname
                } - mentioned you in ${
                  me.gender === "FEMALE" ? "her" : "his"
                } reply on ${
                  comment.tweet?.userId === me.id
                    ? me.gender === "FEMALE"
                      ? "her"
                      : "his"
                    : comment?.tweet?.creator.nickname + "'s"
                } tweet.`,
                user: { connect: { id: mention.id } },
              },
              include: { user: true },
            });
            ee.emit(Events.ON_NEW_NOTIFICATION, notification);
          });

          return true;
        } catch (error) {
          console.log(error);
          return false;
        }
      }
    ),
  get: publicProcedure
    .input(getSchema)
    .query(async ({ ctx: { prisma }, input: { id } }) => {
      try {
        const comment = await prisma.comment.findFirst({
          where: { id },
          include: {
            creator: true,
            replies: {
              include: { creator: true },
            },
            reactions: { include: { creator: true } },
            mentions: {
              include: { user: { select: { nickname: true, id: true } } },
            },
          },
        });

        return comment;
      } catch (error) {
        return null;
      }
    }),

  getReply: publicProcedure
    .input(getReplySchema)
    .query(async ({ ctx: { prisma }, input: { id } }) => {
      try {
        const reply = await prisma.reply.findFirst({
          where: { id },
          include: {
            creator: true,
            reactions: { include: { creator: true } },
            mentions: {
              include: { user: { select: { nickname: true, id: true } } },
            },
          },
        });
        return reply;
      } catch (error) {
        return null;
      }
    }),

  deleteComment: publicProcedure
    .input(deleteCommentSchema)
    .use(isAuth)
    .mutation(async ({ ctx: { prisma, me }, input: { id } }) => {
      try {
        if (!!!me)
          return {
            error:
              "You can not delete the comment if you are not authenticated.",
          };
        const comment = await prisma.comment.findFirst({ where: { id } });
        if (!!!comment)
          return { error: "This comment is no longer available." };
        if (me.id !== comment.userId)
          return {
            error: "You can not delete the comment that does't belong to you.",
          };
        await prisma.comment.delete({ where: { id: comment.id } });
        ee.emit(Events.ON_COMMENT_DELETE, comment);
        return { comment };
      } catch (error) {
        return { error: "Unable to delete the comment for whatever reason." };
      }
    }),

  deleteCommentReply: publicProcedure
    .input(deleteCommentReplySchema)
    .use(isAuth)
    .mutation(async ({ ctx: { prisma, me }, input: { id } }) => {
      try {
        if (!!!me)
          return {
            error:
              "You can not delete a comment reply if you are not authenticated.",
          };
        const reply = await prisma.reply.findFirst({ where: { id } });
        if (!!!reply)
          return { error: "This comment reply is no longer available." };
        if (me.id !== reply.userId)
          return {
            error:
              "You can not delete the comment reply that does't belong to you.",
          };
        await prisma.reply.delete({ where: { id: reply.id } });
        ee.emit(Events.ON_COMMENT_REPLY_DELETE, reply);
        return { reply };
      } catch (error) {
        return {
          error: "Unable to delete the comment reply for whatever reason.",
        };
      }
    }),

  comments: publicProcedure
    .input(commentsSchema)
    .query(async ({ ctx: { prisma }, input: { cursor, limit, tweetId } }) => {
      /*
      fetch only the ids of recent comments.
    */
      try {
        const comments = await prisma.comment.findMany({
          take: limit + 1,
          where: { tweetId },
          orderBy: { createdAt: "desc" },
          cursor: cursor ? { id: cursor } : undefined,
          select: { id: true },
        });
        let nextCursor: typeof cursor | undefined = undefined;
        if (comments.length > limit) {
          const nextItem = comments.pop() as (typeof comments)[number];
          nextCursor = nextItem.id;
        }
        return { comments, nextCursor };
      } catch (error) {
        console.log(error);
        return { comments: [], nextCursor: undefined };
      }
    }),
  replies: publicProcedure
    .input(repliesSchema)
    .query(async ({ ctx: { prisma }, input: { cursor, limit, commentId } }) => {
      /*
      fetch only the ids of recent replies.
    */
      try {
        const replies = await prisma.reply.findMany({
          take: limit + 1,
          where: { commentId },
          orderBy: { createdAt: "asc" },
          cursor: cursor ? { id: cursor } : undefined,
          select: { id: true },
        });
        let nextCursor: typeof cursor | undefined = undefined;
        if (replies.length > limit) {
          const nextItem = replies.pop() as (typeof replies)[number];
          nextCursor = nextItem.id;
        }
        return { replies, nextCursor };
      } catch (error) {
        console.log(error);
        return { replies: [], nextCursor: undefined };
      }
    }),
});
