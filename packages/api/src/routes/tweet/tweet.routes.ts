import { Tweet, User } from "@prisma/client";
import {
  createSchema,
  delSchema,
  editSchema,
  onDeleteTweetSchema,
  onNewTweetNotificationSchema,
  onNewTweetSchema,
  onTweetMentionSchema,
  onTweetUpdateSchema,
  onViewSchema,
  tweetSchema,
  tweetsSchema,
  viewSchema,
} from "../../schema/tweet.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { observable } from "@trpc/server/observable";
import EventEmitter from "events";
import { Events } from "../../constants";
import { isAuth } from "../../middleware/isAuth.middleware";
import { expiryDate } from "../../utils";
import { calculateDistance } from "@dispatch/shared";

const ee = new EventEmitter();
ee.setMaxListeners(100);
export const tweetRouter = router({
  onNewTweetNotification: publicProcedure
    .input(onNewTweetNotificationSchema)
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
  onTweetMention: publicProcedure
    .input(onTweetMentionSchema)
    .subscription(async ({ ctx: {}, input: { uid } }) => {
      return observable<Notification & { user: User }>((emit) => {
        const handler = (notification: Notification & { user: User }) => {
          if (uid === notification.user.id) {
            emit.next(notification);
          }
        };
        ee.on(Events.ON_TWEET_MENTION, handler);
        return () => {
          ee.off(Events.ON_TWEET_MENTION, handler);
        };
      });
    }),
  onView: publicProcedure
    .input(onViewSchema)
    .subscription(async ({ ctx: {}, input: { tweetId } }) => {
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
    .subscription(async ({ ctx: {}, input: {} }) => {
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
    .use(isAuth)
    .mutation(
      async ({
        input: { text, polls, cords, pollExpiresIn, mentions },
        ctx: { prisma, me },
      }) => {
        try {
          if (!!!me)
            return {
              error:
                "Failed to create a tweet because you are not authenticated.",
            };

          const mentioned = await prisma.user.findMany({
            where: { nickname: { in: mentions } },
            select: { id: true },
          });
          const _polls = polls
            .map((p) => p.text.trim())
            .filter(Boolean)
            .map((text) => ({ text }));
          const tweet = await prisma.tweet.create({
            data: {
              text: text.trim(),
              creator: { connect: { id: me.id } },
              ...cords,
              polls: {
                createMany: {
                  data: _polls,
                },
              },
              pollExpiresIn: expiryDate(pollExpiresIn),
              mentions: {
                create: mentioned.map(({ id }) => ({
                  userId: id,
                  type: "tweet",
                })),
              },
            },
            include: {
              creator: true,
            },
          });

          const blocked = await prisma.blocked.findMany({
            where: {
              userId: me.id,
            },
            select: { uid: true },
          });

          const toBeNotified = await prisma.user.findMany({
            where: {
              AND: [
                {
                  id: {
                    not: me.id,
                  },
                },
                {
                  id: {
                    notIn: blocked.map((b) => b.uid),
                  },
                },
                {
                  confirmed: true,
                },
              ],
            },
            select: { id: true, nickname: true },
          });

          ee.emit(Events.ON_NEW_TWEET, tweet);
          toBeNotified.forEach(async (usr) => {
            const notification = await prisma.notification.create({
              data: {
                title: `new tweet`,
                message: `@${me.nickname} - ${tweet.text}`,
                user: { connect: { id: usr.id } },
                category: "general",
                type: "new_tweet",
                tweetId: tweet.id,
              },
              include: { user: true },
            });
            ee.emit(Events.ON_NEW_NOTIFICATION, notification);
          });
          mentioned.forEach(async (mention) => {
            const notification = await prisma.notification.create({
              data: {
                tweetId: tweet.id,
                category: "mention",
                type: "new_tweet",
                title: `new mention`,
                message: `@${me.nickname} - mentioned you on ${
                  me.gender === "FEMALE" ? "her" : "his"
                } tweet.`,
                user: { connect: { id: mention.id } },
              },
              include: { user: true },
            });
            ee.emit(Events.ON_TWEET_MENTION, notification);
            ee.emit(Events.ON_NEW_NOTIFICATION, notification);
          });
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
    .use(isAuth)
    .mutation(async ({ ctx: { prisma, me }, input: { id } }) => {
      try {
        if (!!!me)
          return {
            error: "You can not delete the tweet if you are not authenticated.",
          };
        const tweet = await prisma.tweet.findFirst({ where: { id } });
        if (!!!tweet) return { error: "This tweet is no longer available." };
        if (me.id !== tweet.userId)
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
    .use(isAuth)
    .mutation(
      async ({
        ctx: { me, prisma },
        input: { cords, polls, text, id, mentions, pollExpiresIn },
      }) => {
        try {
          if (!!!me)
            return {
              error:
                "Failed to update a tweet because you are not authenticated.",
            };
          const mentioned = await prisma.user.findMany({
            where: { nickname: { in: mentions } },
            select: { id: true },
          });
          const tt = await prisma.tweet.findFirst({
            where: { id },
            include: { polls: { select: { id: true } } },
          });
          const pollsIds = tt?.polls ? tt.polls.map((p) => p.id) : [];
          await prisma.poll.deleteMany({ where: { id: { in: pollsIds } } });

          const _polls = polls
            .map((p) => p.text.trim())
            .filter(Boolean)
            .map((text) => ({ text }));
          const tweet = await prisma.tweet.update({
            where: { id },
            data: {
              text: text.trim(),
              ...cords,
              polls: {
                createMany: {
                  data: _polls,
                },
              },
              pollExpiresIn: expiryDate(pollExpiresIn),
              mentions: {
                create: mentioned.map(({ id }) => ({
                  userId: id,
                  type: "tweet",
                })),
              },
            },
            include: { creator: true },
          });
          ee.emit(Events.ON_TWEET_UPDATE, tweet);
          mentioned.forEach(async (mention) => {
            const notification = await prisma.notification.create({
              data: {
                tweetId: tweet.id,
                category: "mention",
                type: "new_tweet",
                title: `new mention`,
                message: `@${me.nickname} - mentioned you on ${
                  me.gender === "FEMALE" ? "her" : "his"
                } edited tweet.`,
                user: { connect: { id: mention.id } },
              },
              include: { user: true },
            });
            ee.emit(Events.ON_NEW_NOTIFICATION, notification);
          });
          return { tweet };
        } catch (err) {
          console.log(err);
          return {
            error: "Failed to update a tweet for whatever reason.",
          };
        }
      }
    ),

  tweets: publicProcedure
    .input(tweetsSchema)
    .use(isAuth)
    .query(
      async ({
        ctx: { prisma, me },
        input: { cursor, limit, orderBy, radius, coord },
      }) => {
        /*
      fetch only the ids of recent tweets.
    */
        try {
          if (!!!me) return { tweets: [], nextCursor: undefined };
          const blocked = await prisma.blocked.findMany({
            where: {
              userId: me.id,
            },
            select: { uid: true },
          });
          const tweets = await prisma.tweet.findMany({
            take: limit + 1,
            orderBy: { createdAt: orderBy },
            select: {
              id: true,
              lat: true,
              lon: true,
            },
            cursor: cursor ? { id: cursor } : undefined,
            where: {
              userId: {
                notIn: blocked.map((u) => u.uid),
              },
            },
          });
          let nextCursor: typeof cursor | undefined = undefined;
          if (tweets.length > limit) {
            const nextItem = tweets.pop() as (typeof tweets)[number];
            nextCursor = nextItem.id;
          }
          const _tweets = tweets.filter(
            (tweet) =>
              calculateDistance(coord, { lat: tweet.lat, lon: tweet.lon }) <=
              radius * 1000 // should be in metres.
          );
          return { tweets: _tweets, nextCursor };
        } catch (error) {
          console.log(error);
          return { tweets: [], nextCursor: undefined };
        }
      }
    ),
  tweet: publicProcedure
    .input(tweetSchema)
    .use(isAuth)
    .query(async ({ ctx: { prisma, me }, input: { id } }) => {
      try {
        if (!!!me) return undefined;

        const blocked = await prisma.blocked.findMany({
          where: {
            userId: me.id,
          },
          select: { uid: true },
        });
        const tweet = await prisma.tweet.findFirst({
          where: {
            AND: [{ id }, { userId: { notIn: blocked.map((u) => u.uid) } }],
          },
          include: {
            polls: { include: { votes: true } },
            creator: true,
            mentions: {
              include: { user: { select: { nickname: true, id: true } } },
            },
            reactions: {
              include: { creator: true },
              orderBy: {
                createdAt: "desc",
              },
              where: {
                creatorId: {
                  notIn: blocked.map((u) => u.uid),
                },
              },
            },
            comments: {
              select: { id: true },
              orderBy: {
                createdAt: "desc",
              },
              where: {
                userId: { notIn: blocked.map((u) => u.uid) },
              },
            },
          },
        });
        return tweet;
      } catch (error) {
        return undefined;
      }
    }),

  view: publicProcedure
    .input(viewSchema)
    .use(isAuth)
    .mutation(async ({ ctx: { me, prisma }, input: { id } }) => {
      try {
        if (!!!me) return false;
        const tt = await prisma.tweet.findFirst({ where: { id } });
        if (!!!tt) return false;
        if (me.id === tt.userId) return false;
        const viewed = !!tt.views.find((_id) => _id === me.id);
        if (viewed) return false;
        const tweet = await prisma.tweet.update({
          where: { id },
          data: {
            views: [...new Set([...tt.views, me.id])],
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
