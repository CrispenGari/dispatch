import {
  commentSchema,
  onTweetCommentSchema,
  replySchema,
} from "../../schema/comment.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { verifyJwt } from "../../utils/jwt";
import { Events } from "../../constants";
import EventEmitter from "events";
import { Tweet, User } from "@prisma/client";
import { observable } from "@trpc/server/observable";

const ee = new EventEmitter();
export const commentRoute = router({
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
  comment: publicProcedure
    .input(commentSchema)
    .mutation(async ({ ctx: { prisma, req }, input: { id, comment } }) => {
      try {
        const token = req.headers.authorization?.split(/\s/)[1];
        if (!!!token) return false;
        const { id: uid } = await verifyJwt(token);
        const me = await prisma.user.findFirst({ where: { id: uid } });
        if (!!!me) return false;
        const tweet = await prisma.tweet.update({
          where: { id },
          data: {
            comments: {
              create: {
                text: comment.trim(),
                creator: { connect: { id: me.id } },
              },
            },
          },
          include: { creator: true },
        });
        ee.emit(Events.ON_TWEET_COMMENT, tweet);
        ee.emit(Events.ON_NEW_TWEET, tweet);
        return true;
      } catch (error) {
        return false;
      }
    }),
  reply: publicProcedure
    .input(replySchema)
    .mutation(async ({ ctx: { prisma, req }, input: { id, reply } }) => {
      try {
        const token = req.headers.authorization?.split(/\s/)[1];
        if (!!!token) return false;
        const { id: uid } = await verifyJwt(token);
        const me = await prisma.user.findFirst({ where: { id: uid } });
        if (!!!me) return false;
        const comment = await prisma.comment.update({
          where: { id },
          data: {
            replies: {
              create: {
                text: reply.trim(),
                creator: { connect: { id: me.id } },
              },
            },
          },
          include: {
            creator: true,
          },
        });
        ee.emit(Events.ON_COMMENT_REPLY, comment);
        return true;
      } catch (error) {
        return false;
      }
    }),
});
