import EventEmitter from "events";
import {
  onTweetReactionSchema,
  reactToTweetSchema,
} from "../../schema/reaction.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { verifyJwt } from "../../utils/jwt";
import { Events } from "../../constants";
import { Tweet, User } from "@prisma/client";
import { observable } from "@trpc/server/observable";

const ee = new EventEmitter();
export const reactionRoute = router({
  onTweetReaction: publicProcedure
    .input(onTweetReactionSchema)
    .subscription(async ({ ctx: {}, input: { uid } }) => {
      return observable<Tweet & { creator: User }>((emit) => {
        const handler = (tweet: Tweet & { creator: User }) => {
          emit.next(tweet);
        };
        ee.on(Events.ON_TWEET_REACTION, handler);
        return () => {
          ee.off(Events.ON_TWEET_REACTION, handler);
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
          const _tweet = await prisma.tweet.update({
            where: { id: tweet.id },
            data: {
              reactions: { create: { creator: { connect: { id: me.id } } } },
            },
            include: { creator: true },
          });
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
  reactToComment: publicProcedure.mutation(() => {}),
});
