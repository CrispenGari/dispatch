import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import { createContext } from "./context/context";
export { type AppRouter } from "./routes/app.routes";
import { appRouter } from "./routes/app.routes";
import Fastify from "fastify";
import cors from "@fastify/cors";
import ws from "@fastify/websocket";
import { getFastifyPlugin } from "trpc-playground/handlers/fastify";

const PORT: any = process.env.PORT || 3001;
const HOST =
  process.env.NODE_ENV === "production"
    ? "0.0.0.0"
    : "localhost" || "127.0.0.1";
const TPRC_API_ENDPOINT = "/api/trpc";
const TRPC_PLAYGROUND_ENDPOINT = "/api/trpc-playground";

(async () => {
  const fastify = Fastify({
    logger: true,
    ignoreTrailingSlash: true,
    maxParamLength: 5000,
  });

  fastify.register(ws);
  fastify.register(cors, {
    credentials: true,
    origin: ["http://localhost:3000"],
  });

  fastify.register(fastifyTRPCPlugin, {
    prefix: TPRC_API_ENDPOINT,
    trpcOptions: { router: appRouter, createContext },
    useWSS: true,
  });
  fastify.register(
    await getFastifyPlugin({
      router: appRouter,
      trpcApiEndpoint: TPRC_API_ENDPOINT,
      playgroundEndpoint: TRPC_PLAYGROUND_ENDPOINT,
      request: {
        superjson: true,
      },
    })
  );
  fastify.listen({ port: PORT, host: HOST }, (error, address) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.info(` Server is now listening on ${address}`);
  });
})();
