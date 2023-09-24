import {
  updateEmailSchema,
  updateGenderSchema,
  updateNicknameSchema,
} from "../../schema/user.schema";
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
  updateNickname: publicProcedure
    .input(updateNicknameSchema)
    .mutation(async ({ ctx: { req, prisma }, input: { nickname } }) => {}),
  updateEmail: publicProcedure
    .input(updateEmailSchema)
    .mutation(async ({ ctx: { req, prisma }, input: { email } }) => {}),
  updateGender: publicProcedure
    .input(updateGenderSchema)
    .mutation(async ({ ctx: { req, prisma }, input: { gender } }) => {}),
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
      return [];
    }
  }),
});
