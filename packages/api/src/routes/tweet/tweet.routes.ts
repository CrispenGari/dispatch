import { createSchema } from "../../schema/tweet.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { verifyJwt } from "../../utils/jwt";

export const tweetRouter = router({
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
          const tweet = prisma.tweet.create({
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
        include: { polls: { include: { votes: true } }, creator: true },
      });
      return { tweets };
    } catch (error) {
      console.log(error);
      return [];
    }
  }),
});
