"use client";

import { Check, CheckCheck, FileImage, FileVideo, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { Fragment, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { dayKey, formatDayHeading, formatTime } from "@/lib/format";
import { attachmentUrl, canEdit, type Conversation, type Message } from "./api";

/** A cuántos píxeles del final se considera que la persona está leyendo lo último. */
const NEAR_BOTTOM_PX = 120;

interface MessageListProps {
  messages: Message[];
  conversation: Conversation;
  myId: string;
  counterpartLabel: string;
  hasOlder: boolean;
  loadingOlder: boolean;
  onLoadOlder: () => void;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
}

/**
 * Mensajes de una conversación, de lo más viejo a lo más nuevo. Mantiene el lugar de lectura: baja al
 * final al abrir, al mandar y cuando llega algo mientras se lee lo último; no se mueve al cargar
 * mensajes anteriores.
 */
export function MessageList({
  messages,
  conversation,
  myId,
  counterpartLabel,
  hasOlder,
  loadingOlder,
  onLoadOlder,
  onEdit,
  onDelete,
}: MessageListProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const previous = useRef<{ first?: string; last?: string; height: number; nearBottom: boolean }>({ height: 0, nearBottom: true });

  const first = messages[0]?.id;
  const lastMessage = messages.at(-1);
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const prev = previous.current;
    const last = lastMessage?.id;
    if (prev.first === undefined && prev.last === undefined) {
      el.scrollTop = el.scrollHeight;
    } else if (first !== prev.first && last === prev.last) {
      // Se cargaron mensajes anteriores arriba: se compensa para que no salte.
      el.scrollTop += el.scrollHeight - prev.height;
    } else if (last !== prev.last && (prev.nearBottom || lastMessage?.senderId === myId)) {
      el.scrollTop = el.scrollHeight;
    }
    previous.current = { first, last, height: el.scrollHeight, nearBottom: isNearBottom(el) };
  }, [first, lastMessage, myId]);

  // El último mensaje propio muestra si la otra parte ya lo leyó.
  const lastMine = [...messages].reverse().find((m) => m.senderId === myId && !m.deleted);
  const seen =
    lastMine && conversation.counterpartReadAt !== null && conversation.counterpartReadAt >= lastMine.createdAt;

  return (
    <div
      ref={scroller}
      onScroll={(event) => {
        previous.current.nearBottom = isNearBottom(event.currentTarget);
      }}
      className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5"
    >
      {hasOlder && (
        <div className="mb-4 flex justify-center">
          <Button variant="secondary" size="sm" onClick={onLoadOlder} loading={loadingOlder}>
            Ver mensajes anteriores
          </Button>
        </div>
      )}
      <ol role="log" aria-label={`Mensajes con ${counterpartLabel}`} className="flex flex-col gap-2">
        {messages.map((message, index) => {
          const previousMessage = messages[index - 1];
          const newDay = !previousMessage || dayKey(previousMessage.createdAt) !== dayKey(message.createdAt);
          return (
            <Fragment key={message.id}>
              {newDay && (
                <li aria-hidden="true" className="my-2 flex justify-center">
                  <span className="rounded-full bg-canvas px-3 py-1 text-xs font-medium text-muted first-letter:uppercase">
                    {formatDayHeading(message.createdAt)}
                  </span>
                </li>
              )}
              <li>
                {message.senderType === "SYSTEM" ? (
                  <SystemMessage message={message} myRole={conversation.myRole} />
                ) : (
                  <Bubble
                    message={message}
                    mine={message.senderId === myId}
                    author={message.senderId === myId ? "Vos" : counterpartLabel}
                    editable={canEdit(message, myId)}
                    seen={message.id === lastMine?.id ? seen : undefined}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
}

function isNearBottom(el: HTMLElement) {
  return el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
}

function SystemMessage({ message, myRole }: { message: Message; myRole: Conversation["myRole"] }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-1 rounded-2xl border border-line bg-surface px-4 py-2.5 text-center text-sm text-muted-strong">
      <span className="whitespace-pre-line [overflow-wrap:anywhere]">{message.body}</span>
      <span className="flex items-center gap-2 text-xs text-muted">
        {formatTime(message.createdAt)}
        {message.serviceRequestId && myRole === "CUSTOMER" && (
          <Link href={`/panel/pedidos/${message.serviceRequestId}` as Route} className="font-semibold text-brand-700 underline-offset-4 hover:underline">
            Ver pedido
          </Link>
        )}
      </span>
    </div>
  );
}

interface BubbleProps {
  message: Message;
  mine: boolean;
  author: string;
  editable: boolean;
  /** Solo en el último mensaje propio: si la otra parte ya lo leyó. */
  seen: boolean | undefined;
  onEdit: (message: Message) => void;
  onDelete: (message: Message) => void;
}

function Bubble({ message, mine, author, editable, seen, onEdit, onDelete }: BubbleProps) {
  const [actions, setActions] = useState(false);
  const canAct = mine && !message.deleted;

  return (
    <div className={cn("flex flex-col gap-1", mine ? "items-end" : "items-start")}>
      <div className={cn("flex max-w-[85%] items-end gap-1.5 sm:max-w-[75%]", mine && "flex-row-reverse")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2 text-[0.9375rem] leading-relaxed",
            message.deleted
              ? "border border-dashed border-line bg-transparent text-muted italic"
              : mine
                ? "rounded-br-md bg-brand-700 text-white"
                : "rounded-bl-md border border-line bg-surface text-ink",
          )}
        >
          <span className="sr-only">{author}: </span>
          {message.deleted ? (
            "Mensaje eliminado"
          ) : (
            <>
              {message.body && <p className="whitespace-pre-line [overflow-wrap:anywhere]">{message.body}</p>}
              {message.attachments.length > 0 && (
                <ul className={cn("flex flex-col gap-1", message.body && "mt-2")}>
                  {message.attachments.map((attachment, index) => {
                    const Icon = attachment.kind === "VIDEO" ? FileVideo : FileImage;
                    return (
                      <li key={attachment.fileId}>
                        {/* Se abre en otra pestaña: el archivo es privado y lo sirve la API con la sesión. */}
                        <a
                          href={attachmentUrl(attachment.fileId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold underline-offset-4 hover:underline",
                            mine ? "bg-white/15 text-white" : "bg-brand-50 text-brand-800",
                          )}
                        >
                          <Icon className="size-4" aria-hidden="true" />
                          {attachment.kind === "VIDEO" ? "Video" : "Foto"} {message.attachments.length > 1 ? index + 1 : ""}
                          <span className="sr-only"> (se abre en otra pestaña)</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
          <span className={cn("mt-0.5 flex items-center justify-end gap-1 text-[0.6875rem]", mine && !message.deleted ? "text-white/75" : "text-muted")}>
            {message.edited && !message.deleted && <span>editado ·</span>}
            <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
            {seen !== undefined &&
              (seen ? (
                <span className="inline-flex items-center gap-0.5" title="Visto">
                  <CheckCheck className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">Visto</span>
                </span>
              ) : (
                <span className="inline-flex items-center" title="Enviado">
                  <Check className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">Enviado</span>
                </span>
              ))}
          </span>
        </div>
        {canAct && (
          <button
            type="button"
            onClick={() => setActions((open) => !open)}
            aria-expanded={actions}
            className="grid size-8 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-brand-50 hover:text-brand-800"
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
            <span className="sr-only">Opciones del mensaje</span>
          </button>
        )}
      </div>
      {canAct && actions && (
        <div className="flex gap-1">
          {editable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setActions(false);
                onEdit(message);
              }}
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              Editar
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-danger-600 hover:bg-danger-50"
            onClick={() => {
              setActions(false);
              onDelete(message);
            }}
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Eliminar
          </Button>
        </div>
      )}
    </div>
  );
}
