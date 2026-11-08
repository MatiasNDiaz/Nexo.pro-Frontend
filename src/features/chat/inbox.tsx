"use client";

import { useQuery } from "@tanstack/react-query";
import { MessagesSquare } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Alert, EmptyState, Skeleton } from "@/components/ui/feedback";
import { useMe } from "@/features/account/use-me";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatListDate } from "@/lib/format";
import { chatKeys, counterpartName, listConversations, type Conversation, type Message } from "./api";
import { CounterpartAvatar } from "./counterpart-avatar";

export function useConversations() {
  return useQuery({ queryKey: chatKeys.conversations, queryFn: listConversations });
}

/** Lista de chats, la más reciente primero. `activeId` resalta la que está abierta (pantallas anchas). */
export function Inbox({ activeId }: { activeId: string | null }) {
  const me = useMe();
  const conversations = useConversations();

  if (conversations.isPending) {
    return (
      <div className="flex flex-col gap-2" aria-busy="true" aria-label="Cargando conversaciones">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-18 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (conversations.isError) {
    return (
      <Alert tone="danger" title="No pudimos cargar tus conversaciones">
        {isApiError(conversations.error, "SUBSCRIPTION_REQUIRED")
          ? "Para usar el chat necesitás tu prueba o un plan vigente."
          : errorMessage(conversations.error)}
      </Alert>
    );
  }

  if (conversations.data.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="Todavía no tenés conversaciones"
        description={
          me.role === "CUSTOMER"
            ? "Buscá un profesional y escribile desde su perfil. Las conversaciones aparecen acá."
            : "Cuando un cliente te escriba, la conversación aparece acá."
        }
        action={
          me.role === "CUSTOMER" ? (
            <ButtonLink href="/profesionales" variant="secondary">
              Buscar profesionales
            </ButtonLink>
          ) : undefined
        }
      />
    );
  }

  return (
    <ul className="flex flex-col gap-1.5" aria-label="Conversaciones">
      {conversations.data.map((conversation) => (
        <li key={conversation.id}>
          <InboxItem conversation={conversation} myId={me.id} active={conversation.id === activeId} />
        </li>
      ))}
    </ul>
  );
}

function InboxItem({ conversation, myId, active }: { conversation: Conversation; myId: string; active: boolean }) {
  const name = counterpartName(conversation);
  const unread = conversation.unread;
  return (
    <Link
      href={`/panel/mensajes/${conversation.id}` as Route}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3 transition-colors",
        active ? "border-brand-300 bg-brand-50" : "border-transparent hover:border-line hover:bg-surface",
      )}
    >
      <CounterpartAvatar conversation={conversation} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline justify-between gap-2">
          <span className={cn("truncate text-ink", unread > 0 ? "font-bold" : "font-semibold")}>{name}</span>
          {conversation.lastMessageAt && (
            <span className={cn("shrink-0 text-xs", unread > 0 ? "font-semibold text-brand-700" : "text-muted")}>
              {formatListDate(conversation.lastMessageAt)}
            </span>
          )}
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className={cn("truncate text-sm", unread > 0 ? "font-medium text-ink" : "text-muted")}>
            {preview(conversation.lastMessage, myId)}
          </span>
          {unread > 0 && (
            <span className="grid min-w-5 shrink-0 place-items-center rounded-full bg-amber-400 px-1.5 text-xs font-bold text-brand-900">
              {unread > 99 ? "99+" : unread}
              <span className="sr-only"> {unread === 1 ? "mensaje sin leer" : "mensajes sin leer"}</span>
            </span>
          )}
        </span>
      </span>
    </Link>
  );
}

/** Texto corto del último mensaje (siempre como texto: nunca se interpreta HTML). */
export function preview(message: Message | null, myId: string): string {
  if (!message) return "Sin mensajes todavía";
  if (message.deleted) return "Mensaje eliminado";
  const text = message.body.replace(/\s+/g, " ").trim();
  const content = text || (message.attachments.length === 1 ? "Archivo adjunto" : `${message.attachments.length} archivos adjuntos`);
  return message.senderId === myId ? `Vos: ${content}` : content;
}
