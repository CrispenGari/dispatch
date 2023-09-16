import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "@dispatch/api";

export const trpc = createTRPCReact<AppRouter>();
