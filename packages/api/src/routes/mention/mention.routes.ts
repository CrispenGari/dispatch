import { mentionSchema, mentionsSchema } from "../../schema/mention.schema";
import { publicProcedure, router } from "../../trpc/trpc";

export const mentionRouter = router({
  mention: publicProcedure
    .input(mentionSchema)
    .query(async ({ ctx: { prisma }, input: { id } }) => {
      try {
        const mention = await prisma.mention.findFirst({
          where: { id },
          include: {
            user: true,
            tweet: {
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
                },
                comments: {
                  select: { id: true },
                  orderBy: {
                    createdAt: "desc",
                  },
                },
              },
            },
          },
        });
        return mention;
      } catch (error) {
        return undefined;
      }
    }),
  mentions: publicProcedure
    .input(mentionsSchema)
    .query(
      async ({
        ctx: { prisma, me },
        input: { cursor, limit, orderBy, id },
      }) => {
        try {
          if (!!!me)
            return {
              mentions: [],
              nextCursor: undefined,
            };
          const mentions = await prisma.mention.findMany({
            take: limit + 1,
            orderBy: { createdAt: orderBy },
            where: { userId: id, AND: { type: "tweet" } },
            select: {
              id: true,
            },
            cursor: cursor ? { id: cursor } : undefined,
          });
          let nextCursor: typeof cursor | undefined = undefined;
          if (mentions.length > limit) {
            const nextItem = mentions.pop() as (typeof mentions)[number];
            nextCursor = nextItem.id;
          }
          return { mentions, nextCursor };
        } catch (error) {
          console.log(error);
          return { mentions: [], nextCursor: undefined };
        }
      }
    ),
});
