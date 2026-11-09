"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { env } from "@/config/env";
import { useViewer } from "@/features/session/viewer";
import { refreshSession } from "@/lib/api/client";
import { chatKeys, type Conversation, type Message } from "./api";
import { applyMessageToList, upsertMessage, type MessagePages } from "./cache";

/** Pedidos y contrataciones: los mensajes de sistema avisan que cambiaron (ver features/requests). */
const REQUESTS_KEY = ["requests"] as const;
const CONTRACTS_KEY = ["contracts"] as const;
/** Notificaciones (features/notifications). */
const NOTIFICATIONS_KEY = ["notifications"] as const;

/** Reintentos seguidos ante un rechazo por sesión: evita un bucle si la sesión ya no sirve. */
const MAX_AUTH_RETRIES = 2;

interface RealtimeContextValue {
  /** Marca la conversación que la persona tiene abierta (sus mensajes no suman no leídos). */
  setOpenConversation: (id: string | null) => void;
}

const RealtimeContext = createContext<RealtimeContextValue>({ setOpenConversation: () => {} });

/** La pantalla de una conversación avisa que está abierta mientras se muestra. */
export function useOpenConversation(id: string) {
  const { setOpenConversation } = useContext(RealtimeContext);
  useEffect(() => {
    setOpenConversation(id);
    return () => setOpenConversation(null);
  }, [id, setOpenConversation]);
}

const isMessage = (value: unknown): value is Message =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as Message).id === "string" &&
  typeof (value as Message).conversationId === "string" &&
  typeof (value as Message).createdAt === "string";

const isReadEvent = (value: unknown): value is { conversationId: string; readAt: string } =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as { conversationId: unknown }).conversationId === "string" &&
  typeof (value as { readAt: unknown }).readAt === "string";

/**
 * Tiempo real (contrato §10): Socket.IO en `/realtime` con la cookie de sesión. Solo avisa; los
 * mensajes se mandan por REST. Se conecta con una cuenta activa de cliente o profesional (los únicos
 * que usan el chat) y aplica los avisos a la caché.
 */
export function RealtimeProvider({ children }: { children: ReactNode }) {
  const viewer = useViewer();
  const queryClient = useQueryClient();
  const openId = useRef<string | null>(null);

  const user = viewer.status === "authenticated" ? viewer.user : null;
  const userId = user && user.status === "ACTIVE" && user.role !== "ADMIN" ? user.id : null;

  useEffect(() => {
    if (!userId) return;
    let socket: Socket | null = null;
    let cancelled = false;
    let connectedBefore = false;
    let authRetries = 0;

    const onMessage = (payload: unknown) => {
      if (!isMessage(payload)) return;
      queryClient.setQueryData<MessagePages>(chatKeys.messages(payload.conversationId), (data) => upsertMessage(data, payload));
      const visibleOpenId = document.visibilityState === "visible" ? openId.current : null;
      const list = queryClient.getQueryData<Conversation[]>(chatKeys.conversations);
      const updated = applyMessageToList(list, payload, { myId: userId, openId: visibleOpenId });
      if (updated === null) void queryClient.invalidateQueries({ queryKey: chatKeys.conversations });
      else if (updated) queryClient.setQueryData(chatKeys.conversations, updated);
      // Los mensajes de sistema acompañan cada cambio de un pedido o una contratación.
      if (payload.senderType === "SYSTEM") {
        void queryClient.invalidateQueries({ queryKey: REQUESTS_KEY });
        void queryClient.invalidateQueries({ queryKey: CONTRACTS_KEY });
        void queryClient.invalidateQueries({ queryKey: chatKeys.conversation(payload.conversationId) });
      }
    };

    const onRead = (payload: unknown) => {
      if (!isReadEvent(payload)) return;
      const markRead = (c: Conversation): Conversation =>
        c.id === payload.conversationId ? { ...c, counterpartReadAt: payload.readAt } : c;
      queryClient.setQueryData<Conversation>(chatKeys.conversation(payload.conversationId), (c) => (c ? markRead(c) : c));
      queryClient.setQueryData<Conversation[]>(chatKeys.conversations, (list) => list?.map(markRead));
    };

    // La librería se descarga solo con una cuenta que la usa (no pesa en las páginas públicas).
    void import("socket.io-client").then(({ io }) => {
      if (cancelled) return;
      const connection = io(`${env.apiUrl}/realtime`, { withCredentials: true });
      socket = connection;
      connection.on("connect", () => {
        authRetries = 0;
        // Al reconectar se pudieron perder avisos: se vuelve a pedir lo que esté a la vista.
        if (connectedBefore) {
          void queryClient.invalidateQueries({ queryKey: chatKeys.all });
          void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
        }
        connectedBefore = true;
      });
      connection.on("message:new", onMessage);
      connection.on("message:updated", onMessage);
      connection.on("conversation:read", onRead);
      // Notificación nueva: la campana y la lista se vuelven a pedir (son livianas).
      connection.on("notification:new", () => void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY }));
      // Rechazo por sesión (acceso vencido): se renueva una vez y se reconecta.
      connection.on("error", (payload: unknown) => {
        if ((payload as { code?: unknown } | null)?.code !== "UNAUTHORIZED" || authRetries >= MAX_AUTH_RETRIES) return;
        authRetries += 1;
        void refreshSession().then((ok) => {
          if (ok && !cancelled && !connection.connected) connection.connect();
        });
      });
    });

    return () => {
      cancelled = true;
      socket?.removeAllListeners();
      socket?.disconnect();
    };
  }, [userId, queryClient]);

  const value = useMemo<RealtimeContextValue>(
    () => ({
      setOpenConversation: (id) => {
        openId.current = id;
      },
    }),
    [],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
