import jwt from "jsonwebtoken";
import { User } from "@prisma/client";
export const signJwt = async ({ id }: User): Promise<string> => {
  return await jwt.sign(
    {
      id,
    },
    process.env.JWT_SECRETE
  );
};
export const verifyJwt = async (token: string) => {
  return jwt.verify(token, process.env.JWT_SECRETE) as {
    id: string;
  };
};
