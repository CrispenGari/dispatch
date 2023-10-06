import { generateVerificationCode } from "@crispengari/random-verification-codes";
import {
  changePasswordSchema,
  mentionsSchema,
  onUpdateSchema,
  onViewProfileSchema,
  tweetsSchema,
  updateBioSchema,
  updateEmailSchema,
  updateGenderSchema,
  updateNicknameSchema,
  userSchema,
  viewProfile,
} from "../../schema/user.schema";
import { publicProcedure, router } from "../../trpc/trpc";
import { signJwt } from "../../utils/jwt";
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
} from "../../utils/regex";
import { __verify__prefix__, __code__exp__, Events } from "../../constants";
import { sendVerificationCodeAsEmail } from "../../utils/mail";
import { verificationEmailTemplate } from "../../utils/templates";
import { compare, hash } from "bcryptjs";
import { User } from "@prisma/client";
import { observable } from "@trpc/server/observable";
import EventEmitter from "events";
import { isAuth } from "../../middleware/isAuth.middleware";
const ee = new EventEmitter();
ee.setMaxListeners(100);
export const userRouter = router({
  onUpdate: publicProcedure
    .input(onUpdateSchema)
    .subscription(async ({ ctx: {}, input: { uid } }) => {
      return observable<User>((emit) => {
        const handler = (user: User) => {
          if (user.id === uid) {
            emit.next(user);
          }
        };
        ee.on(Events.ON_USER_UPDATE, handler);
        return () => {
          ee.off(Events.ON_USER_UPDATE, handler);
        };
      });
    }),
  onViewProfile: publicProcedure
    .input(onViewProfileSchema)
    .subscription(async ({ ctx: {}, input: { uid } }) => {
      return observable<User>((emit) => {
        const handler = (user: User) => {
          if (user.id === uid) {
            emit.next(user);
          }
        };
        ee.on(Events.ON_PROFILE_VIEW, handler);
        return () => {
          ee.off(Events.ON_PROFILE_VIEW, handler);
        };
      });
    }),

  deleteAccount: publicProcedure
    .use(isAuth)
    .mutation(async ({ ctx: { me, prisma } }) => {
      try {
        if (!!!me) {
          return {
            error:
              "Failed to delete account because you are not authenticated.",
          };
        }
        await prisma.user.delete({ where: { id: me.id } });
        return { success: true };
      } catch (error) {
        return {
          error: "Failed to delete the account for whatever reason.",
        };
      }
    }),
  user: publicProcedure
    .input(userSchema)
    .use(isAuth)
    .query(async ({ ctx: { me, prisma }, input: { id } }) => {
      try {
        if (!!!me) return null;
        const user = await prisma.user.findFirst({
          where: { id },
          include: { tweets: { select: { id: true } }, profileViews: true },
        });
        return user;
      } catch (err) {
        return null;
      }
    }),

  users: publicProcedure.use(isAuth).query(async ({ ctx: { me, prisma } }) => {
    try {
      if (!!!me) return null;
      const user = await prisma.user.findMany({});
      return user;
    } catch (err) {
      return null;
    }
  }),
  mentions: publicProcedure
    .input(mentionsSchema)
    .use(isAuth)
    .query(async ({ ctx: { me, prisma }, input: { nickname } }) => {
      try {
        if (!!!me) return [];

        const blocked = await prisma.blocked.findMany({
          where: {
            userId: me.id,
          },
          select: { uid: true },
        });
        const mentions = await prisma.user.findMany({
          where: {
            AND: [
              {
                nickname: {
                  contains: `%${nickname.trim().toLowerCase()}%`,
                  mode: "insensitive",
                },
              },
              { confirmed: true },
              {
                id: {
                  notIn: blocked.map((b) => b.uid),
                },
              },
            ],
          },
        });
        return mentions.filter((mention) => mention.id !== me.id);
      } catch (err) {
        return [];
      }
    }),
  me: publicProcedure.use(isAuth).query(async ({ ctx: { me } }) => me),
  updateNickname: publicProcedure
    .use(isAuth)
    .input(updateNicknameSchema)
    .mutation(async ({ ctx: { me, prisma }, input: { nickname } }) => {
      try {
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
        ee.emit(Events.ON_USER_UPDATE, user);
        return { jwt };
      } catch (error) {
        return { error: "Failed to update the nickname for whatever reason." };
      }
    }),
  updateEmail: publicProcedure
    .input(updateEmailSchema)
    .use(isAuth)
    .mutation(async ({ ctx: { me, prisma, redis }, input: { email } }) => {
      try {
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
          data: {
            confirmed: false,
            email: email.trim().toLocaleLowerCase(),
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
    .use(isAuth)
    .mutation(async ({ ctx: { me, prisma }, input: { gender } }) => {
      try {
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
        ee.emit(Events.ON_USER_UPDATE, user);
        return {
          jwt: _jwt,
        };
      } catch (error) {
        return {
          error: "Unable to update the user gender for whatever reason.",
        };
      }
    }),

  updateBio: publicProcedure
    .input(updateBioSchema)
    .use(isAuth)
    .mutation(async ({ ctx: { me, prisma }, input: { bio } }) => {
      try {
        if (!!!me) {
          return {
            error:
              "Failed to update the profile because you are not authenticated.",
          };
        }
        const user = await prisma.user.update({
          where: { id: me.id },
          data: {
            bio,
          },
        });
        const _jwt = await signJwt(user);
        ee.emit(Events.ON_USER_UPDATE, user);
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
    .use(isAuth)
    .mutation(
      async ({
        ctx: { me, prisma },
        input: { confirmNewPassword, newPassword, currentPassword },
      }) => {
        try {
          if (!!!me) {
            return {
              error:
                "Failed to update the user password because you are not authenticated.",
            };
          }
          const valid = await compare(currentPassword.trim(), me.password);
          if (!valid)
            return {
              error:
                "Failed to update the user password because the current account password is invalid.",
            };

          if (confirmNewPassword.trim() !== newPassword.trim()) {
            return {
              error:
                "Failed to update the user password. The two password must match.",
            };
          }
          if (!isValidPassword(newPassword.trim())) {
            return {
              error:
                "The password is not secure. Password must contain minimum of 8 characters with least 1 digit.",
            };
          }
          const correct = await compare(newPassword.trim(), me.password);
          if (correct) {
            return {
              error:
                "Failed to update the user password. You can not change your password to the current account password. ",
            };
          }

          const hashed = await hash(newPassword.trim(), 12);
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
  tweets: publicProcedure
    .input(tweetsSchema)
    .use(isAuth)
    .query(
      async ({
        ctx: { me, prisma },
        input: { id, cursor, limit, orderBy },
      }) => {
        try {
          if (!!!me) return { tweets: [], nextCursor: undefined };
          const tweets = await prisma.tweet.findMany({
            where: { userId: id },
            take: limit + 1,
            orderBy: { createdAt: orderBy },
            select: {
              id: true,
            },
            cursor: cursor ? { id: cursor } : undefined,
          });
          let nextCursor: typeof cursor | undefined = undefined;
          if (tweets.length > limit) {
            const nextItem = tweets.pop() as (typeof tweets)[number];
            nextCursor = nextItem.id;
          }
          return { tweets, nextCursor };
        } catch (error) {
          console.log(error);
          return { tweets: [], nextCursor: undefined };
        }
      }
    ),
  viewProfile: publicProcedure
    .input(viewProfile)
    .use(isAuth)
    .mutation(async ({ ctx: { me, prisma }, input: { id } }) => {
      try {
        if (!!!me) return false;
        if (me.id === id) return false;
        const viewers = await prisma.user.findFirst({
          where: { id },
          include: {
            profileViews: {
              select: { id: true },
            },
          },
        });
        const viewed = !!viewers?.profileViews.find((u) => u.id === me.id);
        if (viewed) return false;
        const user = await prisma.user.update({
          where: { id },
          data: {
            profileViews: {
              connect: {
                id: me.id,
              },
            },
          },
        });
        ee.emit(Events.ON_PROFILE_VIEW, user);
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    }),
});
