import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
export const signJwt = async ({
  id,
  nickname,
  email,
}: User): Promise<string> => {
  return await jwt.sign(
    {
      id,
      nickname,
      email,
    },
    process.env.JWT_SECRETE
  );
};

export const verifyJwt = async (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRETE) as {
    username: string;
    id: string;
    email: string;
  };
};
