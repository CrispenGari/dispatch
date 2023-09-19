import { Tweet, User } from "@prisma/client";
import { createSchema, onNewTweetSchema } from "../../schema/tweet.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { verifyJwt } from "../../utils/jwt";
import { observable } from "@trpc/server/observable";
import EventEmitter from "events";
import { Events } from "../../constants";

const ee = new EventEmitter();
export const tweetRouter = router({
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
            select: { creator: true },
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

  del: publicProcedure.mutation(() => {}),
  edit: publicProcedure.mutation(() => {}),
  tweets: publicProcedure.query(async ({ ctx: { prisma } }) => {
    try {
      const tweets = await prisma.tweet.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          polls: { include: { votes: true } },
          creator: true,
          reactions: true,
          comments: {
            include: {
              creator: true,
              reactions: true,
              replies: { include: { creator: true, reactions: true } },
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
});
