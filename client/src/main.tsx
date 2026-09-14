import { trpc } from "@/lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (_error: unknown) => {
  // Authentication is handled explicitly by AccountPortal.
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      headers() {
        try {
          const raw = sessionStorage.getItem("edupulse-session");
          if (raw) {
            const prefix = "edupulse-session=";
            const pair = raw.split(";").find(s => s.trim().startsWith(prefix));
            const token = pair?.trim().slice(prefix.length);
            if (token) {
              return { Authorization: `Bearer ${token}` };
            }
          }
        } catch {
          // sessionStorage unavailable
        }
        return {};
      },
      async fetch(input, init) {
        const res = await globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
        const contentType = res.headers.get("content-type") || "";
        if (!contentType.includes("application/json") && !contentType.includes("application/trpc")) {
          const text = await res.text();
          if (text.trim().startsWith("<")) {
            return new Response(
              JSON.stringify([{
                error: {
                  message: "الخادم قيد الإعداد أو قيد إعادة التشغيل. يرجى الانتظار...",
                  data: { code: "SERVICE_UNAVAILABLE", httpStatus: res.status }
                }
              }]),
              {
                status: res.status === 200 ? 503 : res.status,
                headers: { "content-type": "application/json" },
              }
            );
          }
          return new Response(text, { status: res.status, headers: res.headers });
        }
        return res;
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
