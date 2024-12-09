import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const [endpoint, ...params] = queryKey;
        const url = Array.isArray(endpoint)
          ? endpoint.join('/')
          : String(endpoint);

        const res = await fetch(url, {
          credentials: "include",
        });

        if (!res.ok) {
          if (res.status >= 500) {
            throw new Error(`${res.status}: ${res.statusText}`);
          }

          const errorText = await res.text();
          throw new Error(`${res.status}: ${errorText}`);
        }

        return res.json();
      },
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.startsWith('404')) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: false,
    }
  },
});
