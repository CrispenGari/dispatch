import EventEmitter from "events";
import {
  onNewReactionNotificationSchema,
  onTweetCommentReplyReactionSchema,
  onTweetCommentReactionSchema,
  onTweetReactionSchema,
  reactToCommentReplySchema,
  reactToCommentSchema,
  reactToTweetSchema,
} from "../../schema/reaction.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { Events } from "../../constants";
import { Tweet, User, Notification, Comment, Reply } from "@prisma/client";
import { observable } from "@trpc/server/observable";
import { isAuth } from "../../middleware/isAuth.middleware";
const ee = new EventEmitter();
ee.setMaxListeners(100);
export const reactionRoute = router({
  onTweetReaction: publicProcedure
    .input(onTweetReactionSchema)
    .subscription(async ({ ctx: {}, input: { tweetId } }) => {
      return observable<Tweet & { creator: User }>((emit) => {
        const handler = (tweet: Tweet & { creator: User }) => {
          if (tweetId === tweet.id) {
            emit.next(tweet);
          }
        };
        ee.on(Events.ON_TWEET_REACTION, handler);
        return () => {
          ee.off(Events.ON_TWEET_REACTION, handler);
        };
      });
    }),
  onTweetCommentReaction: publicProcedure
    .input(onTweetCommentReactionSchema)
    .subscription(async ({ ctx: {}, input: { commentId } }) => {
      return observable<Comment & { creator: User }>((emit) => {
        const handler = (comment: Comment & { creator: User }) => {
          if (commentId === comment.id) {
            emit.next(comment);
          }
        };
        ee.on(Events.ON_COMMENT_REACTION, handler);
        return () => {
          ee.off(Events.ON_COMMENT_REACTION, handler);
        };
      });
    }),
  onTweetCommentReplyReaction: publicProcedure
    .input(onTweetCommentReplyReactionSchema)
    .subscription(async ({ ctx: {}, input: { replyId } }) => {
      return observable<Reply & { creator: User }>((emit) => {
        const handler = (reply: Reply & { creator: User }) => {
          if (replyId === reply.id) {
            emit.next(reply);
          }
        };
        ee.on(Events.ON_COMMENT_REPLY_REACTION, handler);
        return () => {
          ee.off(Events.ON_COMMENT_REPLY_REACTION, handler);
        };
      });
    }),
  onNewReactionNotification: publicProcedure
    .input(onNewReactionNotificationSchema)
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
  reactToTweet: publicProcedure
    .input(reactToTweetSchema)
    .use(isAuth)
    .mutation(async ({ ctx: { prisma, me }, input: { id } }) => {
      try {
        if (!!!me) return false;
        const tweet = await prisma.tweet.findFirst({
          where: { id },
          include: {
            reactions: true,
          },
        });
        if (!!!tweet) return false;

        const reacted = tweet.reactions.find((r) => r.creatorId === me.id);

        if (!!!reacted) {
          // you should like
          const reaction = await prisma.reaction.create({
            data: {
              creator: { connect: { id: me.id } },
            },
            include: { creator: true },
          });
          const _tweet = await prisma.tweet.update({
            where: { id: tweet.id },
            data: {
              reactions: { connect: { id: reaction.id } },
            },
            include: { creator: true },
          });

          const mentions = await prisma.mention.findMany({
            where: { tweetId: _tweet.id },
            select: { userId: true },
          });
          if (_tweet.creator.id !== me.id) {
            const notification = await prisma.notification.create({
              data: {
                title: `new reaction`,
                message: `@${reaction.creator.nickname} - reacted on your tweet.`,
                user: { connect: { id: _tweet.creator.id } },
                category: "general",
                type: "reaction",
                tweetId: _tweet.id,
              },
              include: { user: true },
            });
            ee.emit(Events.ON_NEW_NOTIFICATION, notification);
          }
          ee.emit(Events.ON_TWEET_REACTION, _tweet);
          mentions.forEach(async (usr) => {
            const notification = await prisma.notification.create({
              data: {
                title: `new reaction`,
                message: `@${reaction.creator.nickname} - reacted on a tweet that you are mentioned in.`,
                user: { connect: { id: usr.userId } },
                category: "mention",
                type: "reaction",
                tweetId: _tweet.id,
              },
              include: { user: true },
            });
            ee.emit(Events.ON_NEW_NOTIFICATION, notification);
          });
        } else {
          // dislike
          await prisma.reaction.delete({ where: { id: reacted.id } });
          const _tweet = await prisma.tweet.findFirst({
            where: { id: tweet.id },
            include: { creator: true },
          });
          ee.emit(Events.ON_TWEET_REACTION, _tweet);
        }
        return true;
      } catch (error) {
        console.log({ error });
        return false;
      }
    }),
  reactToComment: publicProcedure
    .input(reactToCommentSchema)
    .use(isAuth)
    .mutation(async ({ ctx: { me, prisma }, input: { id } }) => {
      try {
        if (!!!me) return false;
        const comment = await prisma.comment.findFirst({
          where: { id },
          include: {
            reactions: true,
          },
        });
        if (!!!comment) return false;
        const mentions = await prisma.mention.findMany({
          where: { commentId: comment.id },
          select: { userId: true },
        });
        const reacted = comment.reactions.find((r) => r.creatorId === me.id);
        if (!!!reacted) {
          // you should like
          const reaction = await prisma.reaction.create({
            data: { creator: { connect: { id: me.id } } },
            include: { creator: true },
          });
          const _comment = await prisma.comment.update({
            where: { id: comment.id },
            data: {
              reactions: { connect: { id: reaction.id } },
            },
            include: { tweet: { include: { creator: true } }, creator: true },
          });
          if (_comment.creator.id !== me.id) {
            const notification = await prisma.notification.create({
              data: {
                category: "general",
                type: "comment",
                title: `new comment reaction`,
                tweetId: _comment.tweetId as any,
                message: `@${reaction.creator.nickname} - reacted to your comment on a tweet.`,
                user: { connect: { id: _comment.creator.id } },
              },
              include: { user: true },
            });
            ee.emit(Events.ON_NEW_NOTIFICATION, notification);
          }
          ee.emit(Events.ON_COMMENT_REACTION, _comment);
          mentions.forEach(async (usr) => {
            const notification = await prisma.notification.create({
              data: {
                category: "mention",
                type: "comment",
                title: `new comment reaction`,
                tweetId: _comment.tweetId as any,
                message: `@${reaction.creator.nickname} - reacted to a comment that you are mentioned in.`,
                user: { connect: { id: usr.userId } },
              },
              include: { user: true },
            });
            ee.emit(Events.ON_NEW_NOTIFICATION, notification);
          });
        } else {
          // dislike
          await prisma.reaction.delete({ where: { id: reacted.id } });
          const _comment = await prisma.comment.findFirst({
            where: { id: comment.id },
            include: { creator: true },
          });
          ee.emit(Events.ON_COMMENT_REACTION, _comment);
        }

        return true;
      } catch (error) {
        console.log({ error });
        return false;
      }
    }),
  reactToCommentReply: publicProcedure
    .input(reactToCommentReplySchema)
    .use(isAuth)
    .mutation(async ({ ctx: { me, prisma }, input: { id } }) => {
      try {
        if (!!!me) return false;
        const reply = await prisma.reply.findFirst({
          where: { id },
          include: {
            reactions: true,
          },
        });
        if (!!!reply) return false;

        const mentions = await prisma.mention.findMany({
          where: { replyId: reply.id },
          select: { userId: true },
        });
        const reacted = reply.reactions.find((r) => r.creatorId === me.id);
        if (!!!reacted) {
          // you should like
          const reaction = await prisma.reaction.create({
            data: { creator: { connect: { id: me.id } } },
            include: { creator: true },
          });
          const _reply = await prisma.reply.update({
            where: { id: reply.id },
            data: {
              reactions: { connect: { id: reaction.id } },
            },
            include: {
              comment: {
                include: { tweet: { include: { creator: true } } },
              },
              creator: true,
            },
          });
          if (_reply.creator.id !== me.id) {
            const notification = await prisma.notification.create({
              data: {
                title: `new reply reaction`,
                category: "general",
                type: "reply",
                tweetId: _reply.comment?.tweetId ?? "",
                message: `@${reaction.creator.nickname} - reacted to your reply on a tweet.`,
                user: { connect: { id: _reply.creator.id } },
              },
              include: { user: true },
            });
            ee.emit(Events.ON_NEW_NOTIFICATION, notification);
          }
          ee.emit(Events.ON_COMMENT_REPLY_REACTION, _reply);
          mentions.forEach(async (usr) => {
            const notification = await prisma.notification.create({
              data: {
                title: `new reply reaction`,
                category: "mention",
                type: "reply",
                tweetId: _reply.comment?.tweetId ?? "",
                message: `@${reaction.creator.nickname} - reacted to a reply on a comment that you are mentioned in.`,
                user: { connect: { id: usr.userId } },
              },
              include: { user: true },
            });
            ee.emit(Events.ON_NEW_NOTIFICATION, notification);
          });
        } else {
          // dislike
          await prisma.reaction.delete({ where: { id: reacted.id } });
          const _reply = await prisma.reply.findFirst({
            where: { id: reply.id },
            include: {
              creator: true,
            },
          });
          ee.emit(Events.ON_COMMENT_REPLY_REACTION, _reply);
        }
        return true;
      } catch (error) {
        console.log({ error });
        return false;
      }
    }),
});
