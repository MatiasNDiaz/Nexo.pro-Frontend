"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { RealtimeProvider } from "@/features/chat/realtime";
import { SessionProvider } from "@/features/session/session-provider";
import { ApiError } from "@/lib/api/client";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Los 4xx son respuestas definitivas (permisos, validación, no existe): reintentar no sirve.
        retry: (failureCount, error) =>
          !(error instanceof ApiError && error.status >= 400 && error.status < 500) && failureCount < 2,
      },
      mutations: { retry: false },
    },
  });
}

/**
 * Proveedores del navegador. Un QueryClient por pestaña (creado una sola vez): los datos privados
 * nunca se comparten entre usuarios porque nunca pasan por el servidor de Next.
 */
export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <RealtimeProvider>{children}</RealtimeProvider>
      </SessionProvider>
    </QueryClientProvider>
  );
}
