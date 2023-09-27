import { authProfileSchema } from "../../schema/profile.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { signJwt, verifyJwt } from "../../utils/jwt";

export const profileRouter = router({
  authProfile: publicProcedure
    .input(authProfileSchema)
    .mutation(async ({ ctx: { prisma, req }, input: { gender, bio } }) => {
      try {
        const jwt = req.headers?.authorization?.split(/\s/)[1];
        if (!!!jwt) {
          return { error: "The was no token passed in this request." };
        }
        const { id } = await verifyJwt(jwt);
        const me = await prisma.user.findFirst({ where: { id } });

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
