"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { onSessionLost } from "@/lib/api/client";
import { fetchSession, logout as logoutRequest, type Me } from "./api";
import { ViewerContext, type Viewer } from "./viewer";

export const sessionQueryKey = ["session"] as const;

interface SessionActions {
  /** Después de un login, registro con Google o vínculo: vuelve a leer `/auth/me`. */
  refreshSession: () => Promise<void>;
  /** Cierra la sesión de este dispositivo y descarta todos los datos privados en memoria. */
  signOut: () => Promise<void>;
}

const SessionActionsContext = createContext<SessionActions | null>(null);

export function useSessionActions(): SessionActions {
  const actions = useContext(SessionActionsContext);
  if (!actions) throw new Error("useSessionActions fuera de SessionProvider");
  return actions;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const session = useQuery({
    queryKey: sessionQueryKey,
    queryFn: fetchSession,
    // El estado de la cuenta puede cambiar en el backend (el admin aprueba la identidad, suspende):
    // se vuelve a consultar al volver a la pestaña, como mucho una vez por minuto.
    staleTime: 60_000,
    retry: false,
  });

  /**
   * Pasa a "sin sesión" y descarta todos los datos privados en memoria (otra persona puede usar este
   * navegador). La consulta de sesión NO se borra: se pone en null. Si se borrara (`clear()`), los
   * componentes que la observan quedarían mostrando el usuario anterior.
   */
  const becomeAnonymous = useCallback(() => {
    queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== sessionQueryKey[0] });
    queryClient.setQueryData<Me | null>(sessionQueryKey, null);
  }, [queryClient]);

  // Si una renovación de sesión falla en cualquier pedido, la app pasa a "sin sesión".
  useEffect(() => onSessionLost(becomeAnonymous), [becomeAnonymous]);

  /** true justo después de un cierre de sesión voluntario (ver Viewer). */
  const [signedOut, setSignedOut] = useState(false);

  const refreshSession = useCallback(async () => {
    setSignedOut(false);
    await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
  }, [queryClient]);

  const signOut = useCallback(async () => {
    try {
      await logoutRequest();
    } finally {
      setSignedOut(true);
      becomeAnonymous();
    }
  }, [becomeAnonymous]);

  const viewer: Viewer = useMemo(() => {
    if (session.data) return { status: "authenticated", user: session.data };
    // Un error de red al arrancar no es "sin sesión", pero tampoco hay usuario para mostrar.
    if (session.data === null || session.isError) return { status: "anonymous", signedOut };
    return { status: "loading" };
  }, [session.data, session.isError, signedOut]);

  const actions = useMemo(() => ({ refreshSession, signOut }), [refreshSession, signOut]);

  return (
    <SessionActionsContext.Provider value={actions}>
      <ViewerContext.Provider value={viewer}>{children}</ViewerContext.Provider>
    </SessionActionsContext.Provider>
  );
}
