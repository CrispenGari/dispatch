import { publicProcedure, router } from "../../trpc/trpc";
import { registerSchema } from "../../schema/user.schema";
import { hash } from "bcryptjs";
import { sendVerificationCodeAsEmail } from "../../utils/mail";

export const userRouter = router({
  me: publicProcedure.query(({ ctx }) => {}),
  register: publicProcedure
    .input(registerSchema)
    .mutation(
      async ({ input: { email, password, nickname }, ctx: { prisma } }) => {
        const hashed = await hash(password, 12);
        await sendVerificationCodeAsEmail("bob1@gmail.com", "Hi", "Hello");
        try {
          const user = await prisma.user.create({
            data: {
              email,
              password: hashed,
              nickname,
            },
          });
          console.log({ user });
        } catch (error) {
          console.log(error);
          return false;
        }

        return true;
      }
    ),
  verify: publicProcedure.mutation(() => {}),
  login: publicProcedure.mutation(() => {}),
  logout: publicProcedure.mutation(() => {}),
});
