import { z } from "zod";
import { publicProcedure, router } from "../../trpc/trpc";
import EventEmitter from "events";
import { Events } from "../../constants";
import { observable } from "@trpc/server/observable";

const ee = new EventEmitter();

export const helloRouter = router({
  greeting: publicProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(3, { message: "minimum of 3 characters" })
          .max(10, { message: "maximum of 10 characters" }),
      })
    )
    .output(z.object({ message: z.string() }))
    .query(({ input: { name } }) => {
      return {
        message: `Hello ${name}`,
      };
    }),
  fromTRPC: publicProcedure.query(({}) => "Hello from TRPC"),
  hi: publicProcedure
    .input(
      z.object({
        message: z.string(),
        name: z.string(),
      })
    )
    .mutation(({ input: { message, name } }) => {
      ee.emit(Events.ON_HI, {
        name,
        message,
      });
      return {
        message,
      };
    }),
  onHi: publicProcedure.subscription(async ({}) => {
    return observable<{ name: string; message: string }>((emit) => {
      const handler = (res: { name: string; message: string }) => {
        emit.next(res);
      };
      ee.on(Events.ON_HI, handler);
      return () => {
        ee.off(Events.ON_HI, handler);
      };
    });
  }),
});
