"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MessageSquareOff } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Alert, Badge, EmptyState, Skeleton } from "@/components/ui/feedback";
import { useMe } from "@/features/account/use-me";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { uploadFile } from "@/lib/uploads";
import {
  chatKeys,
  counterpartName,
  deleteMessage,
  editMessage,
  getConversation,
  getMessages,
  markConversationRead,
  MESSAGES_PAGE_SIZE,
  sendMessage,
  type Conversation,
  type Message,
} from "./api";
import { applyMessageToList, chronological, upsertMessage, type MessagePages } from "./cache";
import { Composer, type ComposerSubmit } from "./composer";
import { CounterpartAvatar } from "./counterpart-avatar";
import { MessageList } from "./message-list";
import { useOpenConversation } from "./realtime";

/** Una conversación: encabezado, mensajes y el campo para escribir. */
export function ConversationView({ id }: { id: string }) {
  const conversation = useQuery({ queryKey: chatKeys.conversation(id), queryFn: () => getConversation(id) });

  if (conversation.isPending) {
    return (
      <div className="flex h-full flex-col gap-3 p-5" aria-busy="true" aria-label="Cargando conversación">
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-16 w-2/3" />
        <Skeleton className="ml-auto h-16 w-1/2" />
      </div>
    );
  }
  if (conversation.isError) {
    const missing = isApiError(conversation.error, "CONVERSATION_NOT_FOUND") || isApiError(conversation.error, "VALIDATION_FAILED");
    return (
      <div className="p-5">
        <EmptyState
          icon={MessageSquareOff}
          title={missing ? "No encontramos esa conversación" : "No pudimos abrir la conversación"}
          description={missing ? "Puede que el enlace esté mal o que no sea tuya." : errorMessage(conversation.error)}
          action={
            <ButtonLink href="/panel/mensajes" variant="secondary">
              Volver a mensajes
            </ButtonLink>
          }
        />
      </div>
    );
  }
  return <OpenConversation conversation={conversation.data} />;
}

function OpenConversation({ conversation }: { conversation: Conversation }) {
  const me = useMe();
  const queryClient = useQueryClient();
  const id = conversation.id;
  const name = counterpartName(conversation);
  useOpenConversation(id);

  const messages = useInfiniteQuery({
    queryKey: chatKeys.messages(id),
    queryFn: ({ pageParam, signal }) => getMessages(id, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    // Página incompleta = no hay más viejos. Si no, se piden los anteriores al más viejo de la página.
    getNextPageParam: (page) => (page.length < MESSAGES_PAGE_SIZE ? undefined : page.at(-1)?.createdAt),
  });
  const list = useMemo(() => chronological(messages.data), [messages.data]);

  /** Refleja un mensaje propio en la caché (la API también lo avisa por tiempo real: no se duplica). */
  const applyLocal = useCallback(
    (message: Message) => {
      queryClient.setQueryData<MessagePages>(chatKeys.messages(id), (data) => upsertMessage(data, message));
      const updated = applyMessageToList(queryClient.getQueryData<Conversation[]>(chatKeys.conversations), message, {
        myId: me.id,
        openId: id,
      });
      if (updated === null) void queryClient.invalidateQueries({ queryKey: chatKeys.conversations });
      else if (updated) queryClient.setQueryData(chatKeys.conversations, updated);
    },
    [queryClient, id, me.id],
  );

  const [editing, setEditing] = useState<Message | null>(null);
  const [toDelete, setToDelete] = useState<Message | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const send = useMutation({
    mutationFn: async ({ body, files, editingId }: ComposerSubmit & { editingId: string | null }) => {
      if (editingId) return editMessage(editingId, body);
      // Primero se suben los adjuntos (tres pasos cada uno); después va el mensaje con sus ids.
      const attachmentIds: string[] = [];
      for (const file of files) attachmentIds.push((await uploadFile(file, "CHAT_ATTACHMENT")).id);
      return sendMessage(id, { ...(body ? { body } : {}), ...(attachmentIds.length ? { attachmentIds } : {}) });
    },
    onSuccess: (message) => {
      applyLocal(message);
      setEditing(null);
      setSendError(null);
    },
    onError: (error) => {
      if (isApiError(error, "EDIT_WINDOW_EXPIRED")) {
        setEditing(null);
        setSendError("Pasaron los 15 minutos: ese mensaje ya no se puede editar.");
        return;
      }
      setSendError(errorMessage(error));
      // La otra parte dejó de estar disponible: se actualiza el estado del chat.
      if (isApiError(error, "PROFESSIONAL_UNAVAILABLE") || isApiError(error, "CUSTOMER_UNAVAILABLE")) {
        void queryClient.invalidateQueries({ queryKey: chatKeys.conversation(id) });
      }
    },
  });

  const remove = useMutation({
    mutationFn: (message: Message) => deleteMessage(message.id),
    onSuccess: (_, message) => {
      applyLocal({ ...message, body: "", deleted: true, attachments: [] });
      setToDelete(null);
    },
  });

  useMarkRead(conversation, list, me.id);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center gap-3 border-b border-line bg-surface px-3 py-3 sm:px-5">
        <Link
          href="/panel/mensajes"
          className="grid size-10 shrink-0 place-items-center rounded-xl text-brand-700 hover:bg-brand-50 lg:hidden"
        >
          <ArrowLeft className="size-5" aria-hidden="true" />
          <span className="sr-only">Volver a mensajes</span>
        </Link>
        <CounterpartAvatar conversation={conversation} />
        <div className="flex min-w-0 flex-col">
          <h2 className="truncate font-semibold text-ink">{name}</h2>
          <p className="truncate text-sm text-muted">
            {conversation.counterpart.deactivated ? (
              <Badge>Cuenta dada de baja</Badge>
            ) : conversation.myRole === "CUSTOMER" && conversation.counterpart.slug ? (
              <Link
                href={`/profesionales/${conversation.counterpart.slug}` as Route}
                className="font-medium text-brand-700 underline-offset-4 hover:underline"
              >
                Ver perfil
              </Link>
            ) : (
              conversation.counterpart.neighborhoodName && `Barrio ${conversation.counterpart.neighborhoodName}`
            )}
          </p>
        </div>
      </header>

      {messages.isPending ? (
        <div className="flex flex-1 flex-col gap-3 p-5" aria-busy="true">
          <Skeleton className="h-14 w-2/3" />
          <Skeleton className="ml-auto h-14 w-1/2" />
        </div>
      ) : messages.isError ? (
        <div className="flex-1 p-5">
          <Alert tone="danger" title="No pudimos cargar los mensajes">
            {errorMessage(messages.error)}
          </Alert>
        </div>
      ) : list.length === 0 ? (
        <div className="grid flex-1 place-items-center p-6 text-center text-sm text-muted">
          Todavía no hay mensajes. Contale qué necesitás.
        </div>
      ) : (
        <MessageList
          messages={list}
          conversation={conversation}
          myId={me.id}
          counterpartLabel={name}
          hasOlder={messages.hasNextPage}
          loadingOlder={messages.isFetchingNextPage}
          onLoadOlder={() => void messages.fetchNextPage()}
          onEdit={(message) => {
            setSendError(null);
            setEditing(message);
          }}
          onDelete={setToDelete}
        />
      )}

      {conversation.canWrite ? (
        <Composer
          key={editing?.id ?? "nuevo"}
          editing={editing}
          onCancelEdit={() => setEditing(null)}
          sending={send.isPending}
          error={sendError}
          onSubmit={async (input) => {
            setSendError(null);
            await send.mutateAsync({ ...input, editingId: editing?.id ?? null });
          }}
        />
      ) : (
        <div className="border-t border-line bg-surface p-4">
          <Alert tone="warning">
            {conversation.counterpart.deactivated
              ? `${name} dio de baja su cuenta. Podés leer la conversación, pero ya no se le pueden mandar mensajes.`
              : "El profesional no está disponible por ahora. Podés leer la conversación."}
          </Alert>
        </div>
      )}

      <Dialog
        open={toDelete !== null}
        onClose={() => setToDelete(null)}
        title="¿Eliminar el mensaje?"
        description="Se elimina para los dos. No se puede deshacer."
      >
        {remove.isError && <Alert tone="danger">{errorMessage(remove.error)}</Alert>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setToDelete(null)}>
            Cancelar
          </Button>
          <Button variant="danger" loading={remove.isPending} onClick={() => toDelete && remove.mutate(toDelete)}>
            Eliminar
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

/**
 * Confirmación de lectura: cuando llega algo de la otra parte y la pestaña está a la vista. Al abrir
 * una conversación sin nada nuevo no se manda (no hace falta avisar de nuevo).
 */
function useMarkRead(conversation: Conversation, list: Message[], myId: string) {
  const queryClient = useQueryClient();
  const [visible, setVisible] = useState(() => document.visibilityState === "visible");
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  const id = conversation.id;
  const lastFromOther = useMemo(() => [...list].reverse().find((m) => m.senderId !== myId)?.id ?? null, [list, myId]);
  // La lista es la que mantiene al día el tiempo real; el detalle puede estar cacheado de antes.
  const initialUnread = useRef(
    queryClient.getQueryData<Conversation[]>(chatKeys.conversations)?.find((c) => c.id === id)?.unread ?? conversation.unread,
  );
  const marked = useRef<string | null>(null);

  useEffect(() => {
    if (!visible || !lastFromOther || marked.current === lastFromOther) return;
    const first = marked.current === null;
    marked.current = lastFromOther;
    if (first && initialUnread.current === 0) return;
    markConversationRead(id).then(
      () => {
        const clear = (c: Conversation) => (c.id === id ? { ...c, unread: 0 } : c);
        queryClient.setQueryData<Conversation>(chatKeys.conversation(id), (c) => (c ? clear(c) : c));
        queryClient.setQueryData<Conversation[]>(chatKeys.conversations, (all) => all?.map(clear));
      },
      () => {
        // Se reintenta con el próximo mensaje o al volver a la pestaña.
        marked.current = null;
      },
    );
  }, [visible, lastFromOther, id, queryClient]);
}
