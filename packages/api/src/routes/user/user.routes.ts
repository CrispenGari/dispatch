import { generateVerificationCode } from "@crispengari/random-verification-codes";
import {
  changePasswordSchema,
  updateEmailSchema,
  updateGenderSchema,
  updateNicknameSchema,
} from "../../schema/user.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { signJwt, verifyJwt } from "../../utils/jwt";
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
} from "../../utils/regex";
import { __verify__prefix__, __code__exp__ } from "../../constants";
import { sendVerificationCodeAsEmail } from "../../utils/mail";
import { verificationEmailTemplate } from "../../utils/templates";
import { compare, hash } from "bcryptjs";

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
    .mutation(async ({ ctx: { req, prisma }, input: { nickname } }) => {
      try {
        const token = req.headers.authorization?.split(/\s/)[1];
        if (!!!token)
          return {
            error:
              "Failed to update the username because you are not authenticated.",
          };
        const { id } = await verifyJwt(token);
        const me = await prisma.user.findFirst({ where: { id } });
        if (!!!me)
          return {
            error:
              "Failed to update the username because you are not authenticated.",
          };
        const exist = await prisma.user.findFirst({
          where: { nickname: nickname.trim().toLocaleLowerCase() },
        });
        if (!!exist && exist.confirmed)
          return { error: "The nickname is already taken by someone else." };
        const valid = isValidUsername(nickname.trim().toLocaleLowerCase());
        if (!valid) return { error: "The nickname is invalid." };
        const user = await prisma.user.update({
          where: { id: me.id },
          data: { nickname: nickname.trim().toLowerCase() },
        });
        const jwt = await signJwt(user);
        return { jwt };
      } catch (error) {
        return { error: "Failed to update the nickname for whatever reason." };
      }
    }),
  updateEmail: publicProcedure
    .input(updateEmailSchema)
    .mutation(async ({ ctx: { req, prisma, redis }, input: { email } }) => {
      try {
        const token = req.headers.authorization?.split(/\s/)[1];
        if (!!!token)
          return {
            error:
              "Failed to update the username because you are not authenticated.",
          };
        const { id } = await verifyJwt(token);
        const me = await prisma.user.findFirst({ where: { id } });
        if (!!!me)
          return {
            error:
              "Failed to update the username because you are not authenticated.",
          };
        if (!isValidEmail(email.trim())) {
          return {
            error: "The email address that you provide is invalid.",
          };
        }
        const exist = await prisma.user.findFirst({
          where: {
            email: email.trim().toLowerCase(),
          },
        });
        if (!!exist && exist.confirmed) {
          return {
            error: "The email address is already in use by another account.",
          };
        }

        const user = await prisma.user.update({
          where: { id: me.id },
          data: { confirmed: false, email: email.trim().toLocaleLowerCase() },
        });
        const code = await generateVerificationCode(6, false, true);
        const value = JSON.stringify({
          nickname: user.nickname,
          code,
          email: user.email,
          id: user.id,
        });
        await redis.setex(
          __verify__prefix__ + user.nickname,
          __code__exp__,
          value
        );
        await sendVerificationCodeAsEmail(
          user.email,
          verificationEmailTemplate(code.toString(), user),
          "Verify your Email"
        );
        const jwt = await signJwt(user);
        return {
          jwt,
        };
      } catch (error) {
        return { error: "Failed to update the email for whatever reason." };
      }
    }),
  updateGender: publicProcedure
    .input(updateGenderSchema)
    .mutation(async ({ ctx: { req, prisma }, input: { gender } }) => {
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
              "Failed to update the profile because you are not authenticated.",
          };
        }
        const user = await prisma.user.update({
          where: { id: me.id },
          data: {
            gender,
          },
        });
        const _jwt = await signJwt(user);
        return {
          jwt: _jwt,
        };
      } catch (error) {
        return {
          error: "Unable to update the user gender for whatever reason.",
        };
      }
    }),

  changePassword: publicProcedure
    .input(changePasswordSchema)
    .mutation(
      async ({
        ctx: { req, prisma, redis },
        input: { password, confirmPassword },
      }) => {
        try {
          const jwt = req.headers?.authorization?.split(/\s/)[1];
          if (!!!jwt) {
            return {
              error:
                "Failed to update the user password because you are not authenticated.",
            };
          }
          const { id } = await verifyJwt(jwt);
          const me = await prisma.user.findFirst({ where: { id } });
          if (!!!me) {
            return {
              error:
                "Failed to update the user password because you are not authenticated.",
            };
          }
          if (password.trim() !== confirmPassword.trim()) {
            return {
              error:
                "Failed to update the user password. The two password must match.",
            };
          }
          if (!isValidPassword(password.trim())) {
            return {
              error:
                "The password is not secure. Password must contain minimum of 8 characters with least 1 digit.",
            };
          }
          const correct = await compare(password.trim(), me.password);
          if (correct) {
            return {
              error:
                "Failed to update the user password. You can not change your password to the current account password. ",
            };
          }

          const hashed = await hash(password.trim(), 12);
          const user = await prisma.user.update({
            where: { id: me.id },
            data: {
              isAuthenticated: false,
              password: hashed,
            },
          });
          const _jwt = await signJwt(user);

          return {
            jwt: _jwt,
          };
        } catch (error) {
          return {
            error: "Failed to update the user password.",
          };
        }
      }
    ),
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
