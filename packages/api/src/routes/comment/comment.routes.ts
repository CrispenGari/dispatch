import {
  commentSchema,
  getReplySchema,
  getSchema,
  onCommentReplySchema,
  onNewCommentNotificationSchema,
  onTweetCommentSchema,
  replySchema,
} from "../../schema/comment.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { verifyJwt } from "../../utils/jwt";
import { Events } from "../../constants";
import EventEmitter from "events";
import { Tweet, User, Notification, Comment } from "@prisma/client";
import { observable } from "@trpc/server/observable";

const ee = new EventEmitter();
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
    .subscription(async ({ ctx: {}, input: { uid, tweetId } }) => {
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
    .subscription(async ({ ctx: {}, input: { uid, commentId } }) => {
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
  comment: publicProcedure
    .input(commentSchema)
    .mutation(async ({ ctx: { prisma, req }, input: { id, comment } }) => {
      try {
        const token = req.headers.authorization?.split(/\s/)[1];
        if (!!!token) return false;
        const { id: uid } = await verifyJwt(token);
        const me = await prisma.user.findFirst({ where: { id: uid } });
        if (!!!me) return false;
        const twt = await prisma.tweet.findFirst({
          where: { id },
        });
        if (!!!twt) return false;
        const cmt = await prisma.comment.create({
          data: { text: comment.trim(), creator: { connect: { id: me.id } } },
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
              title: `new comment`,
              message: `@${cmt.creator.nickname} - commented on your tweet.`,
              user: { connect: { id: tweet.creator.id } },
            },
            include: { user: true },
          });
          ee.emit(Events.ON_NEW_NOTIFICATION, notification);
        }
        ee.emit(Events.ON_TWEET_COMMENT, tweet);
        return true;
      } catch (error) {
        return false;
      }
    }),
  reply: publicProcedure
    .input(replySchema)
    .mutation(
      async ({ ctx: { prisma, req }, input: { id, reply, mention } }) => {
        try {
          const token = req.headers.authorization?.split(/\s/)[1];
          if (!!!token) return false;
          const { id: uid } = await verifyJwt(token);
          const me = await prisma.user.findFirst({ where: { id: uid } });
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
          if (!!!comment) return false;
          const commentReply = await prisma.reply.create({
            data: {
              text: reply.trim(),
              creator: { connect: { id: me.id } },
              comment: { connect: { id: comment.id } },
            },
            include: { creator: true },
          });
          if (comment.creator.id !== me.id) {
            if (mention) {
              // const notification = await prisma.notification.create({
              //   data: {
              //     title: `comment reply`,
              //     message:
              //       me.id === comment.tweet?.creator.id
              //         ? `@${commentReply.creator.nickname} - reply to your comment on your tweet.`
              //         : `@${commentReply.creator.nickname} - reply to your comment on ${comment.tweet?.creator.nickname}'s tweet.`,
              //     user: { connect: { id: comment.creator.id } },
              //   },
              //   include: { user: true },
              // });
              // ee.emit(Events.ON_NEW_NOTIFICATION, notification);
            } else {
              const notification = await prisma.notification.create({
                data: {
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
          }
          ee.emit(Events.ON_COMMENT_REPLY, comment);
          return true;
        } catch (error) {
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
            replies: { select: { id: true, userId: true } },
            reactions: { select: { id: true, creatorId: true } },
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
          },
        });
        return reply;
      } catch (error) {
        return null;
      }
    }),
});
