import { isAuth } from "../../middleware/isAuth.middleware";
import { authProfileSchema } from "../../schema/profile.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { signJwt } from "../../utils/jwt";

export const profileRouter = router({
  authProfile: publicProcedure
    .input(authProfileSchema)
    .use(isAuth)
    .mutation(async ({ ctx: { prisma, me }, input: { gender, bio } }) => {
      try {
        if (!!!me) {
          return {
            error:
              "Failed to update the user because there's no user with that account.",
          };
        }
        const user = await prisma.user.update({
          where: { id: me.id },
          data: {
            isAuthenticated: true,
            gender,
            bio: bio?.trim() || "",
          },
        });
        const _jwt = await signJwt(user);
        return {
          jwt: _jwt,
        };
      } catch (error) {
        return {
          error: "Unable to update the profile.",
        };
      }
    }),
});
