import { generateVerificationCode } from "@crispengari/random-verification-codes";
import { hash, compare } from "bcryptjs";
import {
  __verify__prefix__,
  __code__exp__,
  __reset__password__prefix__,
  __token__exp__,
} from "../../constants";
import {
  loginSchema,
  registerSchema,
  resendForgotPasswordLinkSchema,
  sendForgotPasswordLinkSchema,
  verifySchema,
} from "../../schema/auth.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { sendVerificationCodeAsEmail } from "../../utils/mail";
import {
  isValidEmail,
  isValidUsername,
  isValidPassword,
} from "../../utils/regex";
import {
  resetPasswordLinkEmailTemplate,
  verificationEmailTemplate,
} from "../../utils/templates";
import { decodeFromBase64 } from "@crispengari/utils";
import { verifyJwt, signJwt } from "../../utils/jwt";
import { v4 as uuid_v4 } from "uuid";

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(
      async ({
        input: { email, password, nickname, confirmPassword },
        ctx: { prisma, redis },
      }) => {
        if (!isValidEmail(email.trim())) {
          return {
            error: "The email address that you provide is invalid.",
          };
        }
        if (!isValidUsername(nickname.trim())) {
          return {
            error: "The nickname that you provide is invalid.",
          };
        }
        if (password.trim() !== confirmPassword.trim()) {
          return {
            error: "The two password must match.",
          };
        }
        if (!isValidPassword(password.trim())) {
          return {
            error:
              "The password is not secure. Password must contain minimum of 8 characters with least 1 digit.",
          };
        }

        const _exists_1 = await prisma.user.findFirst({
          where: {
            email: email.trim().toLowerCase(),
          },
        });
        if (!!_exists_1 && _exists_1.confirmed) {
          return {
            error: "The email address is already in use by another account.",
          };
        }

        if (!!_exists_1) {
          await prisma.user.delete({ where: { id: _exists_1.id } });
        }
        const _exists_2 = await prisma.user.findFirst({
          where: {
            nickname: nickname.trim().toLowerCase(),
          },
        });
        if (!!_exists_2 && _exists_2.confirmed) {
          return {
            error:
              "The nickname that you provide is already taken by another user.",
          };
        }
        if (!!_exists_2) {
          await prisma.user.delete({ where: { id: _exists_2.id } });
        }
        const hashed = await hash(password.trim(), 12);
        try {
          const user = await prisma.user.create({
            data: {
              email: email.trim().toLowerCase(),
              password: hashed,
              nickname: nickname.trim().toLowerCase(),
            },
          });
          const code = await generateVerificationCode(6, false, true);
          const value = JSON.stringify({
            nickname: user.nickname,
            code,
            email: user.email,
            id: user.id,
          });
          await redis.setex(
            __verify__prefix__ + nickname,
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
          console.log(error);
          return {
            error:
              "Something went wrong while creating your account try again.",
          };
        }
      }
    ),
  verify: publicProcedure
    .input(verifySchema)
    .mutation(async ({ ctx: { redis, prisma, req }, input: { code } }) => {
      const _code = decodeFromBase64(code);
      try {
        const jwt = req.headers?.authorization?.split(/\s/)[1];
        const { id } = await verifyJwt(jwt as string);
        const me = await prisma.user.findFirst({ where: { id } });
        if (!!!me) {
          return {
            error: "Verification incomplete. Invalid token.",
          };
        }
        const key = __verify__prefix__ + me.nickname;
        const value = await redis.get(key);
        if (!!!value) {
          await redis.del(key);
          return {
            error: "Invalid verification code, it might have expired.",
          };
        }
        const payload = JSON.parse(value) as {
          code: string;
          email: string;
          nickname: string;
          id: string;
        };
        if (id !== payload.id) {
          return { error: "You can not verify the email that is not yours." };
        }
        if (_code !== payload.code) {
          return { error: "Invalid verification code, try again." };
        }
        await redis.del(key);
        const user = await prisma.user.update({
          where: { id: me.id },
          data: { confirmed: true },
        });
        const _jwt = await signJwt(user);
        return { jwt: _jwt };
      } catch (error) {
        return { error: "Failed to verify your email for whatever reason." };
      }
    }),
  resendVerificationEmail: publicProcedure.mutation(
    async ({ ctx: { redis, prisma, req } }) => {
      try {
        const jwt = req.headers.authorization?.split(/\s/)[1];
        if (!!!jwt) return { error: "Invalid token." };
        const { id } = await verifyJwt(jwt);
        const me = await prisma.user.findFirst({
          where: { id },
        });
        if (!!!me)
          return {
            error: "The email provided does not have a dispatch account.",
          };
        const key = __verify__prefix__ + me.nickname;
        const code = await generateVerificationCode(6, false, true);
        const value = JSON.stringify({
          nickname: me.nickname,
          code,
          email: me.email,
          id: me.id,
        });
        await redis.setex(key, __code__exp__, value);
        await sendVerificationCodeAsEmail(
          me.email,
          verificationEmailTemplate(code.toString(), me),
          "Verify your Email"
        );
        const _jwt = await signJwt(me);
        return {
          jwt: _jwt,
        };
      } catch (err) {
        return {
          error:
            "Failed to send the verification email because of an unknown error.",
        };
      }
    }
  ),
  sendForgotPasswordLink: publicProcedure
    .input(sendForgotPasswordLinkSchema)
    .mutation(async ({ ctx: { prisma, redis }, input: { email } }) => {
      try {
        const me = await prisma.user.findFirst({
          where: { email: email.trim().toLowerCase() },
        });
        if (!!!me)
          return {
            error: "The email provided does not have a dispatch account.",
          };
        const key = __reset__password__prefix__ + me.nickname;
        const token = uuid_v4();
        const value = JSON.stringify({
          nickname: me.nickname,
          token,
          email: me.email,
          id: me.id,
        });
        await redis.setex(key, __token__exp__, value);
        await sendVerificationCodeAsEmail(
          me.email,
          resetPasswordLinkEmailTemplate(token, me),
          "Reset Password"
        );
        const _jwt = await signJwt(me);
        return {
          jwt: _jwt,
        };
      } catch (err) {
        return {
          error:
            "Failed to send the reset password email because of an unknown error.",
        };
      }
    }),
  resendForgotPasswordLink: publicProcedure
    .input(resendForgotPasswordLinkSchema)
    .mutation(async ({ ctx: { prisma, redis }, input: { email } }) => {
      try {
        const me = await prisma.user.findFirst({
          where: { email: email.trim().toLowerCase() },
        });
        if (!!!me)
          return {
            error: "The email provided does not have a dispatch account.",
          };
        const key = __reset__password__prefix__ + me.nickname;
        await redis.del(key);
        const token = uuid_v4();
        const value = JSON.stringify({
          nickname: me.nickname,
          token,
          email: me.email,
          id: me.id,
        });
        await redis.setex(key, __token__exp__, value);
        await sendVerificationCodeAsEmail(
          me.email,
          resetPasswordLinkEmailTemplate(token, me),
          "Reset Password"
        );
        const _jwt = await signJwt(me);
        return {
          jwt: _jwt,
        };
      } catch (err) {
        return {
          error:
            "Failed to send the reset password email because of an unknown error.",
        };
      }
    }),
  login: publicProcedure
    .input(loginSchema)
    .mutation(
      async ({ input: { password, emailOrNickname }, ctx: { prisma } }) => {
        try {
          const me = await prisma.user.findFirst({
            where: {
              email: emailOrNickname.trim().toLowerCase(),
              OR: [{ nickname: emailOrNickname.trim().toLowerCase() }],
            },
          });
          if (!!!me) return { error: "Invalid nickname or email." };
          if (!me.confirmed)
            return { error: "The account email was not confirmed." };
          const correct = await compare(password.trim(), me.password);
          if (!correct) return { error: "Invalid account password." };
          const u = await prisma.user.update({
            where: { id: me.id },
            data: { isAuthenticated: true },
          });
          const jwt = await signJwt(u);
          return { jwt };
        } catch (error) {
          return {
            error:
              "An error occurred while trying to log the user in try again.",
          };
        }
      }
    ),
  logout: publicProcedure.mutation(async ({ ctx: { prisma, req } }) => {
    try {
      const token = req.headers.authorization?.split(/\s/)[1];
      if (!token) return false;
      const { id } = await verifyJwt(token);
      const me = await prisma.user.findFirst({
        where: {
          id,
        },
      });
      if (!!!me) return false;
      const u = await prisma.user.update({
        where: { id: me.id },
        data: { isAuthenticated: false },
      });
      const jwt = await signJwt(u);
      return { jwt };
    } catch (error) {
      return false;
    }
  }),
});
