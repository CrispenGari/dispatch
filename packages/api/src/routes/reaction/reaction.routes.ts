import EventEmitter from "events";
import {
  onNewReactionNotificationSchema,
  onTweetReactionSchema,
  reactToCommentReplySchema,
  reactToCommentSchema,
  reactToTweetSchema,
} from "../../schema/reaction.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { verifyJwt } from "../../utils/jwt";
import { Events } from "../../constants";
import { Tweet, User, Notification } from "@prisma/client";
import { observable } from "@trpc/server/observable";

const ee = new EventEmitter();
export const reactionRoute = router({
  onTweetReaction: publicProcedure
    .input(onTweetReactionSchema)
    .subscription(async ({ ctx: {}, input: { uid, tweetId } }) => {
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
    .mutation(async ({ ctx: { prisma, req }, input: { id } }) => {
      try {
        const token = req.headers.authorization?.split(/\s/)[1];
        if (!!!token) return false;
        const { id: uid } = await verifyJwt(token);
        const me = await prisma.user.findFirst({ where: { id: uid } });
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
          if (_tweet.creator.id === me.id) {
            const notification = await prisma.notification.create({
              data: {
                title: `new reaction`,
                message: `@${reaction.creator.nickname} - reacted on your tweet.`,
                user: { connect: { id: _tweet.creator.id } },
              },
              include: { user: true },
            });
            ee.emit(Events.ON_NEW_NOTIFICATION, notification);
          }
          ee.emit(Events.ON_TWEET_REACTION, _tweet);
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
    .mutation(async ({ ctx: { req, prisma }, input: { id } }) => {
      try {
        const token = req.headers.authorization?.split(/\s/)[1];
        if (!!!token) return false;
        const { id: uid } = await verifyJwt(token);
        const me = await prisma.user.findFirst({ where: { id: uid } });
        if (!!!me) return false;
        const comment = await prisma.comment.findFirst({
          where: { id },
          include: {
            reactions: true,
          },
        });
        if (!!!comment) return false;

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
                title: `new comment reaction`,
                message:
                  me.id === _comment.tweet?.creator.id
                    ? `@${reaction.creator.nickname} - reacted to your comment on your tweet.`
                    : `@${reaction.creator.nickname} - reacted to your comment on ${_comment.tweet?.creator.nickname}'s tweet.`,
                user: { connect: { id: _comment.creator.id } },
              },
              include: { user: true },
            });
            ee.emit(Events.ON_NEW_NOTIFICATION, notification);
          }
          ee.emit(Events.ON_TWEET_REACTION, _comment.tweet);
        } else {
          // dislike
          await prisma.reaction.delete({ where: { id: reacted.id } });
          const _comment = await prisma.comment.findFirst({
            where: { id: comment.id },
            include: { tweet: { include: { creator: true } }, creator: true },
          });

          ee.emit(Events.ON_TWEET_REACTION, _comment?.tweet);
        }
        return true;
      } catch (error) {
        console.log({ error });
        return false;
      }
    }),
  reactToCommentReply: publicProcedure
    .input(reactToCommentReplySchema)
    .mutation(async ({ ctx: { req, prisma }, input: { id } }) => {
      try {
        const token = req.headers.authorization?.split(/\s/)[1];
        if (!!!token) return false;
        const { id: uid } = await verifyJwt(token);
        const me = await prisma.user.findFirst({ where: { id: uid } });
        if (!!!me) return false;
        const reply = await prisma.reply.findFirst({
          where: { id },
          include: {
            reactions: true,
          },
        });
        if (!!!reply) return false;

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
                message:
                  me.id === _reply.comment?.tweet?.creator.id
                    ? `@${reaction.creator.nickname} - reacted to your reply on your tweet.`
                    : `@${reaction.creator.nickname} - reacted to your reply on ${_reply.comment?.tweet?.creator.nickname}'s tweet.`,
                user: { connect: { id: _reply.creator.id } },
              },
              include: { user: true },
            });
            ee.emit(Events.ON_NEW_NOTIFICATION, notification);
          }
          ee.emit(Events.ON_TWEET_REACTION, _reply.comment?.tweet);
        } else {
          // dislike
          await prisma.reaction.delete({ where: { id: reacted.id } });
          const _reply = await prisma.reply.findFirst({
            where: { id: reply.id },
            include: {
              comment: {
                include: {
                  tweet: { include: { creator: true } },
                  creator: true,
                },
              },
              creator: true,
            },
          });
          ee.emit(Events.ON_TWEET_REACTION, _reply?.comment?.tweet);
        }
        return true;
      } catch (error) {
        console.log({ error });
        return false;
      }
    }),
});
