import { EventEmitter } from "stream";
import { onVoteSchema, voteSchema } from "../../schema/poll.schema";
import { router, publicProcedure } from "../../trpc/trpc";
import { verifyJwt } from "../../utils/jwt";
import { Events } from "../../constants";
import { Tweet, User } from "@prisma/client";
import { observable } from "@trpc/server/observable";

const ee = new EventEmitter();
export const pollRouter = router({
  onVote: publicProcedure
    .input(onVoteSchema)
    .subscription(async ({ ctx: {}, input: { uid, tweetId } }) => {
      return observable<Tweet & { creator: User }>((emit) => {
        const handler = (tweet: Tweet & { creator: User }) => {
          if (tweet.id === tweetId) {
            emit.next(tweet);
          }
        };
        ee.on(Events.ON_POLL_VOTE, handler);
        return () => {
          ee.off(Events.ON_POLL_VOTE, handler);
        };
      });
    }),
  vote: publicProcedure
    .input(voteSchema)
    .mutation(async ({ ctx: { req, prisma }, input: { id, tweetId } }) => {
      try {
        const token = req.headers.authorization?.split(/\s/)[1];
        if (!!!token) return false;
        const { id: uid } = await verifyJwt(token);
        const me = await prisma.user.findFirst({ where: { id: uid } });
        if (!!!me) return false;
        const tweet = await prisma.tweet.findFirst({
          where: { id: tweetId },
          include: {
            creator: true,
            polls: {
              include: {
                votes: { include: { creator: true } },
              },
            },
          },
        });
        if (!!!tweet) return false;
        if (me.id === tweet.creator.id) return false;
        const voted = tweet.polls
          .flatMap((p) => p.votes)
          .find((v) => v.creator.id == me.id);

        if (!!voted) return false;
        await prisma.poll.update({
          where: { id },
          data: {
            votes: {
              create: {
                creator: { connect: { id: me.id } },
                tweet: {
                  connect: { id: tweet.id },
                },
              },
            },
          },
        });
        const tt = await prisma.tweet.findFirst({
          where: { id: tweet.id },
          include: {
            creator: true,
          },
        });

        ee.emit(Events.ON_POLL_VOTE, tt);
        return true;
      } catch (err) {
        console.log(err);
        return false;
      }
    }),
});