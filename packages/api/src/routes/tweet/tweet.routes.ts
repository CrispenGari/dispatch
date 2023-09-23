import { Tweet, User } from "@prisma/client";
import {
  createSchema,
  delSchema,
  editSchema,
  onDeleteTweetSchema,
  onNewTweetSchema,
  onTweetUpdateSchema,
  onViewSchema,
  tweetSchema,
  viewSchema,
} from "../../schema/tweet.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { verifyJwt } from "../../utils/jwt";
import { observable } from "@trpc/server/observable";
import EventEmitter from "events";
import { Events } from "../../constants";

const ee = new EventEmitter();
export const tweetRouter = router({
  onView: publicProcedure
    .input(onViewSchema)
    .subscription(async ({ ctx: {}, input: { uid, tweetId } }) => {
      return observable<Tweet & { creator: User }>((emit) => {
        const handler = (tweet: Tweet & { creator: User }) => {
          if (tweetId === tweet.id) {
            emit.next(tweet);
          }
        };
        ee.on(Events.ON_TWEET_VIEW, handler);
        return () => {
          ee.off(Events.ON_TWEET_VIEW, handler);
        };
      });
    }),
  onNewTweet: publicProcedure
    .input(onNewTweetSchema)
    .subscription(async ({ ctx: {}, input: { uid } }) => {
      return observable<Tweet & { creator: User }>((emit) => {
        const handler = (tweet: Tweet & { creator: User }) => {
          if (tweet.userId !== uid) {
            emit.next(tweet);
          }
        };
        ee.on(Events.ON_NEW_TWEET, handler);
        return () => {
          ee.off(Events.ON_NEW_TWEET, handler);
        };
      });
    }),
  onTweetUpdate: publicProcedure
    .input(onTweetUpdateSchema)
    .subscription(async ({ ctx: {}, input: { uid, tweetId } }) => {
      return observable<Tweet & { creator: User }>((emit) => {
        const handler = (tweet: Tweet & { creator: User }) => {
          if (tweet.userId !== uid && tweet.id === tweetId) {
            emit.next(tweet);
          }
        };
        ee.on(Events.ON_TWEET_UPDATE, handler);
        return () => {
          ee.off(Events.ON_TWEET_UPDATE, handler);
        };
      });
    }),
  onDeleteTweet: publicProcedure
    .input(onDeleteTweetSchema)
    .subscription(async ({ ctx: {}, input: { uid } }) => {
      return observable<Tweet>((emit) => {
        const handler = (tweet: Tweet) => {
          emit.next(tweet);
        };
        ee.on(Events.ON_TWEET_DELETE, handler);
        return () => {
          ee.off(Events.ON_TWEET_DELETE, handler);
        };
      });
    }),
  create: publicProcedure
    .input(createSchema)
    .mutation(
      async ({ input: { text, polls, cords }, ctx: { prisma, req } }) => {
        try {
          const token = req.headers.authorization?.split(/\s/)[1];
          if (!!!token)
            return {
              error:
                "Failed to create a tweet because you are not authenticated.",
            };
          const { id } = await verifyJwt(token);
          const me = await prisma.user.findFirst({ where: { id } });

          if (!!!me)
            return {
              error:
                "Failed to create a tweet because you are not authenticated.",
            };
          const tweet = await prisma.tweet.create({
            data: {
              text: text.trim(),
              creator: { connect: { id: me.id } },
              ...cords,
              polls: {
                createMany: {
                  data: [...polls.map((p) => ({ text: p.text.trim() }))],
                },
              },
            },
            include: {
              creator: true,
            },
          });
          ee.emit(Events.ON_NEW_TWEET, tweet);
          return { tweet };
        } catch (err) {
          console.log(err);
          return {
            error: "Failed to create a tweet for whatever reason.",
          };
        }
      }
    ),

  del: publicProcedure
    .input(delSchema)
    .mutation(async ({ ctx: { prisma, req }, input: { id } }) => {
      try {
        const token = req.headers.authorization?.split(/\s/)[1];
        if (!!!token)
          return {
            error: "You can not delete the tweet if you are not authenticated.",
          };
        const { id: uid } = await verifyJwt(token);
        const tweet = await prisma.tweet.findFirst({ where: { id } });
        if (!!!tweet) return { error: "This tweet is no longer available." };
        if (uid !== tweet.userId)
          return {
            error: "You can not delete the tweet that does't belong to you.",
          };
        await prisma.tweet.delete({ where: { id: tweet.id } });
        ee.emit(Events.ON_TWEET_DELETE, tweet);
        return { tweet };
      } catch (error) {
        return { error: "Unable to delete the tweet for whatever reason." };
      }
    }),
  edit: publicProcedure
    .input(editSchema)
    .mutation(
      async ({ ctx: { req, prisma }, input: { cords, polls, text, id } }) => {
        try {
          const token = req.headers.authorization?.split(/\s/)[1];
          if (!!!token)
            return {
              error:
                "Failed to update a tweet because you are not authenticated.",
            };
          const { id: uid } = await verifyJwt(token);
          const me = await prisma.user.findFirst({ where: { id: uid } });

          if (!!!me)
            return {
              error:
                "Failed to update a tweet because you are not authenticated.",
            };
          const tt = await prisma.tweet.findFirst({
            where: { id },
            include: { polls: { select: { id: true } } },
          });
          const pollsIds = tt?.polls ? tt.polls.map((p) => p.id) : [];
          await prisma.poll.deleteMany({ where: { id: { in: pollsIds } } });
          const tweet = await prisma.tweet.update({
            where: { id },
            data: {
              text: text.trim(),
              ...cords,
              polls: {
                createMany: {
                  data: [...polls.map((p) => ({ text: p.text.trim() }))],
                },
              },
            },
            include: { creator: true },
          });

          ee.emit(Events.ON_TWEET_UPDATE, tweet);
          return { tweet };
        } catch (err) {
          console.log(err);
          return {
            error: "Failed to update a tweet for whatever reason.",
          };
        }
      }
    ),
  tweets: publicProcedure.query(async ({ ctx: { prisma } }) => {
    try {
      const tweets = await prisma.tweet.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          polls: { include: { votes: true } },
          creator: true,
          reactions: { include: { creator: true } },
          comments: {
            include: {
              creator: true,
              reactions: { include: { creator: true } },
              replies: {
                include: {
                  creator: true,
                  reactions: { include: { creator: true } },
                },
              },
            },
          },
        },
      });
      return { tweets };
    } catch (error) {
      console.log(error);
      return { tweets: [] };
    }
  }),
  tweet: publicProcedure
    .input(tweetSchema)
    .query(async ({ ctx: { prisma }, input: { id } }) => {
      try {
        const tweet = await prisma.tweet.findFirst({
          where: { id },
          include: {
            polls: { include: { votes: true } },
            creator: true,
            reactions: { include: { creator: true } },
            comments: {
              include: {
                creator: true,
                reactions: { include: { creator: true } },
                replies: {
                  include: {
                    creator: true,
                    reactions: { include: { creator: true } },
                  },
                },
              },
            },
          },
        });
        return { tweet };
      } catch (error) {
        return { tweet: undefined };
      }
    }),

  view: publicProcedure
    .input(viewSchema)
    .mutation(async ({ ctx: { req, prisma }, input: { id } }) => {
      try {
        const token = req.headers.authorization?.split(/\s/)[1];
        if (!!!token) return false;
        const { id: uid } = await verifyJwt(token);
        const me = await prisma.user.findFirst({ where: { id: uid } });
        if (!!!me) return false;
        // const tt = await prisma.tweet.findFirst({ where: { id } });
        // if (!!!tt) return false;
        // if (me.id === tt.userId) return false;
        const tweet = await prisma.tweet.update({
          where: { id },
          data: {
            views: { increment: 1 },
          },
          include: { creator: true },
        });
        ee.emit(Events.ON_TWEET_VIEW, tweet);
        return true;
      } catch (error) {
        return false;
      }
    }),
});
