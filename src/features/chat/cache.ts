import type { InfiniteData } from "@tanstack/react-query";
import type { Conversation, Message } from "./api";

/*
 * Actualizaciones locales de la caché del chat (mensajes propios y avisos en tiempo real). Funciones
 * puras: no piden nada a la API. La lista de chats se actualiza acá en vez de volver a pedirla, porque
 * armarla es caro en el backend (varias consultas por conversación).
 */

export type MessagePages = InfiniteData<Message[], string | undefined>;

/** Agrega un mensaje nuevo (o reemplaza el que tenga el mismo id). Las páginas van de lo más nuevo a lo más viejo. */
export function upsertMessage(data: MessagePages | undefined, message: Message): MessagePages | undefined {
  if (!data) return data;
  let replaced = false;
  const pages = data.pages.map((page) =>
    page.map((current) => {
      if (current.id !== message.id) return current;
      replaced = true;
      return message;
    }),
  );
  if (replaced) return { ...data, pages };
  const [first = [], ...rest] = pages;
  return { ...data, pages: [[message, ...first], ...rest] };
}

/** Mensajes en orden de lectura (lo más viejo arriba), sin repetidos entre páginas. */
export function chronological(data: { pages: Message[][] } | undefined): Message[] {
  if (!data) return [];
  const seen = new Set<string>();
  const all: Message[] = [];
  for (const page of data.pages) {
    for (const message of page) {
      if (seen.has(message.id)) continue;
      seen.add(message.id);
      all.push(message);
    }
  }
  return all.reverse();
}

interface ConversationContext {
  myId: string;
  /** Conversación que la persona tiene abierta y a la vista: sus mensajes no cuentan como no leídos. */
  openId: string | null;
}

/**
 * Refleja un mensaje en la lista de chats: último mensaje, no leídos y orden. Devuelve `null` si la
 * conversación no está en la lista (hay que volver a pedirla).
 */
export function applyMessageToList(
  list: Conversation[] | undefined,
  message: Message,
  { myId, openId }: ConversationContext,
): Conversation[] | null | undefined {
  if (!list) return list;
  const index = list.findIndex((c) => c.id === message.conversationId);
  if (index === -1) return null;
  const current = list[index]!;
  const isNewer = !current.lastMessage || current.lastMessage.id === message.id || message.createdAt >= current.lastMessage.createdAt;
  const fromOther = message.senderId !== myId;
  const isUpdate = current.lastMessage?.id === message.id;
  const updated: Conversation = {
    ...current,
    lastMessage: isNewer ? message : current.lastMessage,
    lastMessageAt: isNewer && !isUpdate ? message.createdAt : current.lastMessageAt,
    unread: fromOther && !isUpdate && !message.deleted && openId !== message.conversationId ? current.unread + 1 : current.unread,
  };
  const rest = list.filter((_, i) => i !== index);
  // Un mensaje nuevo sube la conversación arriba de todo; una edición no la mueve.
  return isNewer && !isUpdate ? [updated, ...rest] : list.map((c, i) => (i === index ? updated : c));
}

/** Suma de no leídos (para el menú del panel). */
export function totalUnread(list: Conversation[] | undefined): number {
  return list?.reduce((sum, c) => sum + c.unread, 0) ?? 0;
}
