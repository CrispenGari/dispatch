import React, { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { httpBatchLink, splitLink } from "@trpc/client";
import { trpc } from "../utils/trpc";
import superjson from "superjson";
import { createWSClient, wsLink } from "@trpc/client";
import type { AppRouter } from "@dispatch/api";
import { retrieve } from "../utils";
import { KEYS, clientHttpURL, clientWsURL } from "../constants";

interface Props {
  children: React.ReactNode;
}
const client = createWSClient({
  url: clientWsURL,
});
const TRPCProvider: React.FC<Props> = ({ children }) => {
  const links = [
    splitLink({
      condition: (op) => op.type === "subscription",
      true: wsLink<AppRouter>({ client }),
      false: httpBatchLink({
        url: clientHttpURL,
        headers: async () => {
          const token = (await retrieve(KEYS.TOKEN_KEY)) ?? "";
          return token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {};
        },
      }),
    }),
  ];
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links,
      transformer: superjson,
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
};

export default TRPCProvider;
