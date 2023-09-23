import { publicProcedure, router } from "../../trpc/trpc";
import { verifyJwt } from "../../utils/jwt";

export const userRouter = router({
  me: publicProcedure.query(async ({ ctx: { req, prisma } }) => {
    try {
      const jwt = req.headers.authorization?.split(/\s/)[1];
      if (!!!jwt) return null;
      const { id } = await verifyJwt(jwt);
      const me = await prisma.user.findFirst({ where: { id } });
      return me;
    } catch (err) {
      return null;
    }
  }),
  updateNickname: publicProcedure.mutation(() => {}),
  updateEmail: publicProcedure.mutation(() => {}),
  updateGender: publicProcedure.mutation(() => {}),
  tweets: publicProcedure.query(async ({ ctx: { req, prisma } }) => {
    try {
      const jwt = req.headers.authorization?.split(/\s/)[1];
      if (!!!jwt) return [];
      const { id } = await verifyJwt(jwt);
      const me = await prisma.user.findFirst({
        where: { id },
        select: { tweets: { select: { id: true } } },
      });
      if (!!!me) return [];
      return me.tweets ?? [];
    } catch (error) {
      console.log(error);
      return { tweets: [] };
    }
  }),
});
