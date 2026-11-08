import { api, buildUrl, type Schemas } from "@/lib/api/client";

/*
 * Chat cliente-profesional (ADR 0024; docs E-086 a E-094). Todo se envía por REST; el tiempo real
 * solo avisa (realtime.tsx). Requiere cuenta ACTIVE; el backend valida participación y plan.
 */

export type Conversation = Schemas["ConversationDto"];
export type Message = Schemas["MessageDto"];
export type Attachment = Schemas["AttachmentDto"];

/** Límites de SendMessageDto (chat.dto.ts). */
export const MESSAGE_MAX_LENGTH = 2000;
export const MAX_ATTACHMENTS = 5;
/** Se puede editar un mensaje durante 15 minutos (EDIT_WINDOW_MS del backend). */
export const EDIT_WINDOW_MS = 15 * 60 * 1000;
/** Mensajes por página (MessagesQueryDto: 1 a 50). */
export const MESSAGES_PAGE_SIZE = 30;

export const chatKeys = {
  all: ["chat"] as const,
  conversations: ["chat", "conversations"] as const,
  conversation: (id: string) => ["chat", "conversation", id] as const,
  messages: (id: string) => ["chat", "messages", id] as const,
};

export const listConversations = () => api<Conversation[]>("/chat/conversations");

export const getConversation = (id: string) => api<Conversation>(`/chat/conversations/${id}`);

/** Solo el cliente; devuelve la conversación existente si ya había una con ese profesional. */
export function openConversation(professionalUserId: string) {
  return api<Conversation>("/chat/conversations", { method: "POST", body: { professionalId: professionalUserId } });
}

/** Mensajes más recientes primero; `before` pide los anteriores a esa fecha. */
export function getMessages(id: string, before: string | undefined, signal?: AbortSignal) {
  return api<Message[]>(`/chat/conversations/${id}/messages`, {
    query: { before, limit: MESSAGES_PAGE_SIZE },
    signal,
  });
}

export function sendMessage(id: string, input: Schemas["SendMessageDto"]) {
  return api<Message>(`/chat/conversations/${id}/messages`, { method: "POST", body: input });
}

export function editMessage(messageId: string, body: string) {
  return api<Message>(`/chat/messages/${messageId}`, { method: "PATCH", body: { body } });
}

export function deleteMessage(messageId: string) {
  return api(`/chat/messages/${messageId}`, { method: "DELETE" });
}

export function markConversationRead(id: string) {
  return api(`/chat/conversations/${id}/read`, { method: "POST" });
}

/** Adjunto privado: lo sirve la API solo a los dos participantes (con la cookie de sesión). */
export const attachmentUrl = (fileId: string) => buildUrl(`/chat/attachments/${encodeURIComponent(fileId)}`);

/** ¿Se puede editar todavía? Solo el autor, sin eliminar y dentro de los 15 minutos. */
export function canEdit(message: Message, myId: string, now = Date.now()): boolean {
  return (
    message.senderId === myId &&
    !message.deleted &&
    message.senderType !== "SYSTEM" &&
    now - new Date(message.createdAt).getTime() < EDIT_WINDOW_MS
  );
}

/** Nombre a mostrar de la otra parte: el comercial si es un profesional que lo tiene. */
export function counterpartName(conversation: Conversation): string {
  const { counterpart } = conversation;
  return counterpart.businessName || `${counterpart.firstName} ${counterpart.lastName}`.trim();
}
