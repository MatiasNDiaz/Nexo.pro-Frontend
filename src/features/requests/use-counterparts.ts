"use client";

import { useMemo } from "react";
import type { Conversation } from "@/features/chat/api";
import { useConversations } from "@/features/chat/inbox";
import { useProfessions } from "@/features/catalogs/queries";

/**
 * Pedidos y contrataciones traen ids, no nombres (H-05). Cada uno tiene su conversación, y la lista
 * de chats sí trae nombre y foto de la otra parte: se cruzan por `conversationId`.
 */
export function useCounterparts() {
  const conversations = useConversations();
  const byConversation = useMemo(
    () => new Map<string, Conversation>((conversations.data ?? []).map((c) => [c.id, c])),
    [conversations.data],
  );
  return { byConversation, isPending: conversations.isPending };
}

/** Nombre del oficio por id (el catálogo de oficios es público y se pide una vez). */
export function useProfessionNames() {
  const professions = useProfessions();
  return useMemo(() => new Map((professions.data ?? []).map((p) => [p.id, p.name])), [professions.data]);
}
