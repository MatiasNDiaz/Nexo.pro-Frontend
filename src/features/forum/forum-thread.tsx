"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, CheckCircle2, Heart, MapPin, MessageSquare, MessageSquareReply, Pencil, Trash2, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { RemoteImage } from "@/components/catalog/remote-image";
import { ForumAuthor, ForumAvatar, ForumRole } from "@/components/forum/forum-author";
import { excerpt, formatDeadline, forumTypeLabel } from "@/components/forum/forum-labels";
import { forumTypeStyle } from "@/components/forum/forum-post-card";
import { ParticipateCta } from "@/components/forum/participate-cta";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Alert, Badge } from "@/components/ui/feedback";
import { Input, Textarea } from "@/components/ui/form-controls";
import { ReportButton } from "@/features/reports/report-dialog";
import { useViewer } from "@/features/session/viewer";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatDate, formatMoney, plural } from "@/lib/format";
import { mediaUrl } from "@/lib/media";
import {
  createReply,
  deletePost,
  deleteReply,
  forumKeys,
  getMyLikes,
  getPost,
  POST_MAX,
  POST_MIN,
  REPLY_MAX,
  resolvePost,
  setPostLike,
  setReplyLike,
  updatePost,
  updateReply,
  type ForumLikes,
  type ForumPostDetail,
  type ForumReply,
} from "./api";

/** Mensaje claro para los errores de participar (el resto, el del backend). */
function participationError(error: unknown): string {
  if (isApiError(error, "SUBSCRIPTION_REQUIRED")) return "Para participar en el foro necesitás un plan vigente. Mientras tanto, podés leer todo.";
  if (isApiError(error, "FORUM_POST_RESOLVED")) return "La publicación ya está resuelta y no admite respuestas nuevas.";
  if (isApiError(error, "PRICE_NOT_ALLOWED")) return "Solo los profesionales pueden proponer un precio, y solo en \"Busco profesional\".";
  return errorMessage(error);
}

/**
 * Publicación del foro con sus respuestas, interactiva. Llega armada del servidor (`initial`, en
 * caché para buscadores) y después de cada cambio se vuelve a pedir desde el navegador, fresca.
 * Participan clientes activos y profesionales (estos con plan: lo controla el backend).
 */
export function ForumThread({ initial }: { initial: ForumPostDetail }) {
  const viewer = useViewer();
  const queryClient = useQueryClient();
  const post = useQuery({ queryKey: forumKeys.post(initial.id), queryFn: () => getPost(initial.id), initialData: initial, staleTime: 30_000 }).data;
  const user = viewer.status === "authenticated" ? viewer.user : null;
  const canParticipate = !!user && user.status === "ACTIVE" && user.role !== "ADMIN";
  const likes = useQuery({ queryKey: forumKeys.likes(post.id), queryFn: () => getMyLikes(post.id), enabled: canParticipate });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["forum"] });

  return (
    <>
      <PostCard post={post} mine={user?.id === post.author.userId} canParticipate={canParticipate} liked={likes.data?.post ?? false} onChanged={refresh} />

      <section aria-labelledby="respuestas" className="flex flex-col gap-6">
        <h2 id="respuestas" className="flex items-center gap-3 font-display text-2xl font-bold text-brand-900">
          Respuestas
          <span className="grid h-8 min-w-8 place-items-center rounded-full bg-brand-50 px-2.5 text-base text-brand-800 tabular-nums">{post.replyCount}</span>
        </h2>
        {post.replies.length > 0 ? (
          <ReplyTree
            post={post}
            myId={user?.id ?? null}
            canParticipate={canParticipate}
            likes={likes.data}
            isProfessional={user?.role === "PROFESSIONAL"}
            onChanged={refresh}
          />
        ) : (
          <p className="flex items-center gap-3 rounded-2xl border border-dashed border-line px-5 py-4 text-muted-strong">
            <MessageSquare className="size-5 shrink-0 text-brand-600" aria-hidden="true" />
            <span>Todavía no tiene respuestas. {canParticipate && !post.resolved && "¡Sé la primera persona en responder!"}</span>
          </p>
        )}
        {post.resolved ? (
          <p className="flex items-center gap-2 rounded-2xl bg-success-50 px-4 py-3 text-sm font-medium text-success-800">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            Esta publicación está resuelta y ya no admite respuestas.
          </p>
        ) : canParticipate ? (
          <ReplyComposer post={post} isProfessional={user?.role === "PROFESSIONAL"} onSent={refresh} me={user} />
        ) : (
          <ParticipateCta returnTo={`/foro/${post.id}`} text="Ingresá para responder o contarle tu propuesta." />
        )}
      </section>
    </>
  );
}

function PostCard({
  post,
  mine,
  canParticipate,
  liked,
  onChanged,
}: {
  post: ForumPostDetail;
  mine: boolean;
  canParticipate: boolean;
  liked: boolean;
  onChanged: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState<"delete" | "resolve" | null>(null);
  const budget = formatMoney(post.budgetEstimate);
  const place = [post.neighborhood?.name, post.locality?.name].filter(Boolean).join(", ");
  const images = post.media.filter((m) => m.kind === "IMAGE");
  const videos = post.media.filter((m) => m.kind === "VIDEO");

  const remove = useMutation({
    mutationFn: () => deletePost(post.id),
    meta: { success: "Borraste la publicación" },
    onSuccess: () => router.push("/foro"),
  });
  const resolve = useMutation({
    mutationFn: () => resolvePost(post.id),
    meta: { success: { title: "¡Qué bueno que lo resolviste!", description: "Marcamos la publicación como resuelta." } },
    onSuccess: (updated) => {
      queryClient.setQueryData(forumKeys.post(post.id), updated);
      setConfirm(null);
    },
  });

  const style = forumTypeStyle[post.type];
  const TypeIcon = style.icon;
  const facts = [
    place && { icon: MapPin, label: "Zona", value: place },
    budget && { icon: Wallet, label: "Ofrece desde", value: budget },
    post.deadline && { icon: CalendarClock, label: "Para cuándo", value: formatDeadline(post.deadline) },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string }[];

  return (
    <article className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card animate-fade-up">
      {/* Cabecera del tipo: el mismo ícono y color que en la lista. */}
      <header className={cn("flex flex-wrap items-center gap-3 px-5 py-4 sm:px-7", post.type === "PROFESSIONAL_WANTED" ? "bg-amber-50" : "bg-electric-50")}>
        <span className={cn("grid size-10 place-items-center rounded-xl bg-surface shadow-xs", style.text)}>
          <TypeIcon className="size-5" aria-hidden="true" />
        </span>
        <span className={cn("font-display text-lg font-bold", style.text)}>{forumTypeLabel[post.type]}</span>
        {post.resolved && (
          <Badge tone="success">
            <CheckCircle2 className="size-3.5" aria-hidden="true" />
            Resuelta
          </Badge>
        )}
        {post.professions.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 sm:ml-auto">
            {post.professions.map((profession) => (
              <li key={profession.id} className="rounded-full bg-surface px-3 py-1 text-sm font-medium text-brand-800 shadow-xs">
                {profession.name}
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="flex flex-col gap-6 p-5 sm:p-7">
      <ForumAuthor author={post.author} date={post.createdAt} size="lg" />

      {/* El texto es del usuario: se muestra como texto. El h1 resume la publicación para lectores de pantalla. */}
      <h1 className="sr-only">
        {forumTypeLabel[post.type]}: {excerpt(post.body, 80)}
      </h1>
      {editing ? (
        <TextEditor
          initial={post.body}
          min={POST_MIN}
          max={POST_MAX}
          label="Tu publicación"
          onCancel={() => setEditing(false)}
          save={(body) => updatePost(post.id, body)}
          onSaved={(updated) => {
            queryClient.setQueryData(forumKeys.post(post.id), updated);
            setEditing(false);
          }}
        />
      ) : (
        <p className="text-lg leading-relaxed whitespace-pre-line text-ink sm:text-xl">{post.body}</p>
      )}
      {post.edited && !editing && <p className="text-xs text-muted">Editada</p>}

      {/* Ficha: zona, presupuesto y fecha, cada dato con su ícono. */}
      {facts.length > 0 && (
        <dl className={cn("grid gap-3", facts.length > 1 && "sm:grid-cols-2", facts.length > 2 && "lg:grid-cols-3")}>
          {facts.map((fact) => (
            <div key={fact.label} className={cn("flex items-center gap-3 rounded-2xl p-4", fact.label === "Ofrece desde" ? "bg-amber-50" : "bg-canvas")}>
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl bg-surface shadow-xs", fact.label === "Ofrece desde" ? "text-amber-800" : "text-brand-700")}>
                <fact.icon className="size-5" aria-hidden="true" />
              </span>
              <div className="flex min-w-0 flex-col">
                <dt className="text-xs font-medium text-muted-strong">{fact.label}</dt>
                <dd className="font-semibold text-ink">{fact.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}

      {/* Fotos en mosaico: la primera más grande. */}
      {images.length > 0 && (
        <ul className={cn("grid gap-3", images.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3")}>
          {images.map((media, index) => (
            <li
              key={media.url}
              className={cn(
                "relative overflow-hidden rounded-2xl bg-brand-50",
                images.length === 1 ? "aspect-[16/10]" : "aspect-square",
                images.length > 2 && index === 0 && "col-span-2 row-span-2 sm:col-span-2",
              )}
            >
              <RemoteImage
                src={media.url}
                alt={`Foto ${index + 1} de la publicación`}
                fill
                sizes={images.length === 1 || index === 0 ? "(min-width: 768px) 640px, 100vw" : "(min-width: 640px) 240px, 50vw"}
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      )}
      {videos.map((media) => {
        const url = mediaUrl(media.url);
        return url ? (
          <video key={media.url} src={url} controls preload="none" playsInline className="w-full rounded-2xl bg-brand-950">
            Tu navegador no puede reproducir este video.
          </video>
        ) : null;
      })}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-sm text-muted">
        <LikeButton
          count={post.likeCount}
          liked={liked}
          enabled={canParticipate}
          label="la publicación"
          toggle={(next) => setPostLike(post.id, next)}
          onToggled={(next) => {
            queryClient.setQueryData<ForumLikes>(forumKeys.likes(post.id), (likes) => (likes ? { ...likes, post: next } : likes));
            onChanged();
          }}
        />
        <span className="flex items-center gap-1.5">
          <MessageSquare className="size-4" aria-hidden="true" />
          {plural(post.replyCount, "respuesta")}
        </span>
        <span className="ml-auto flex flex-wrap items-center gap-1">
          {mine && !editing && (
            <>
              <IconAction icon={<Pencil className="size-4" />} label="Editar" onClick={() => setEditing(true)} />
              {!post.resolved && <IconAction icon={<CheckCircle2 className="size-4" />} label="Marcar resuelta" onClick={() => setConfirm("resolve")} />}
              <IconAction icon={<Trash2 className="size-4" />} label="Borrar" danger onClick={() => setConfirm("delete")} />
            </>
          )}
          {!mine && <ReportButton targetType="FORUM_POST" targetId={post.id} subject="esta publicación" />}
        </span>
      </div>

      <ConfirmDialog
        open={confirm === "resolve"}
        onClose={() => setConfirm(null)}
        title="¿Marcar como resuelta?"
        description="Sigue visible, pero ya no admite respuestas nuevas."
        confirmLabel="Marcar resuelta"
        tone="primary"
        pending={resolve.isPending}
        error={resolve.isError ? errorMessage(resolve.error) : null}
        onConfirm={() => resolve.mutate()}
      />
      <ConfirmDialog
        open={confirm === "delete"}
        onClose={() => setConfirm(null)}
        title="¿Borrar la publicación?"
        description="También se ocultan sus respuestas. No se puede deshacer."
        confirmLabel="Borrar"
        pending={remove.isPending}
        error={remove.isError ? errorMessage(remove.error) : null}
        onConfirm={() => remove.mutate()}
      />
      </div>
    </article>
  );
}

/** Respuestas anidadas por `parentReplyId`, en el orden en que llegan del backend. */
function ReplyTree({
  post,
  myId,
  canParticipate,
  likes,
  isProfessional,
  onChanged,
}: {
  post: ForumPostDetail;
  myId: string | null;
  canParticipate: boolean;
  likes: ForumLikes | undefined;
  isProfessional: boolean;
  onChanged: () => void;
}) {
  const { replies } = post;
  const children = new Map<string | null, ForumReply[]>();
  for (const reply of replies) {
    const key = reply.parentReplyId && replies.some((r) => r.id === reply.parentReplyId) ? reply.parentReplyId : null;
    children.set(key, [...(children.get(key) ?? []), reply]);
  }
  /*
   * Como conversación: el avatar a la izquierda y el globo a la derecha; una línea une las respuestas
   * del mismo nivel y las respuestas a una respuesta quedan debajo de su globo (la sangría la da el
   * avatar). Desde el tercer nivel no se sangra más, para que se lea en el celular.
   */
  const render = (parent: string | null, depth: number): ReactNode => {
    const items = children.get(parent) ?? [];
    return (
      <ul className={cn("flex flex-col gap-5", depth > 0 && "mt-5", depth >= 3 && "-ml-12 sm:-ml-14")}>
        {items.map((reply, index) => (
          <li key={reply.id} className="relative flex gap-3 animate-fade-up sm:gap-4">
            {index < items.length - 1 && <span aria-hidden="true" className="absolute top-12 -bottom-5 left-5 w-px -translate-x-1/2 bg-line" />}
            <div className="relative z-1 shrink-0">
              {reply.author && !reply.removed ? (
                <ForumAvatar name={`${reply.author.firstName} ${reply.author.lastName}`} avatarUrl={reply.author.avatarUrl} />
              ) : (
                <span aria-hidden="true" className="block size-10 rounded-full border-2 border-dashed border-line bg-canvas" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <ReplyItem
                reply={reply}
                post={post}
                mine={!!myId && reply.author?.userId === myId}
                canParticipate={canParticipate && !post.resolved}
                canLike={canParticipate}
                liked={likes?.replyIds.includes(reply.id) ?? false}
                isProfessional={isProfessional}
                onChanged={onChanged}
              />
              {children.has(reply.id) && render(reply.id, depth + 1)}
            </div>
          </li>
        ))}
      </ul>
    );
  };
  return render(null, 0);
}

function ReplyItem({
  reply,
  post,
  mine,
  canParticipate,
  canLike,
  liked,
  isProfessional,
  onChanged,
}: {
  reply: ForumReply;
  post: ForumPostDetail;
  mine: boolean;
  canParticipate: boolean;
  canLike: boolean;
  liked: boolean;
  isProfessional: boolean;
  onChanged: () => void;
}) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<"view" | "edit" | "reply">("view");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const remove = useMutation({ mutationFn: () => deleteReply(reply.id), meta: { success: "Borraste tu respuesta" }, onSuccess: () => { setConfirmDelete(false); onChanged(); } });

  if (reply.removed || !reply.author) {
    return <p className="rounded-2xl rounded-tl-md border border-dashed border-line px-4 py-3 text-sm text-muted italic">Respuesta eliminada</p>;
  }
  const price = formatMoney(reply.proposedPrice);
  const name = reply.author.firstName;
  const isPro = reply.author.role === "PROFESSIONAL";
  const isOriginalPoster = reply.author.userId === post.author.userId;

  return (
    <article
      className={cn(
        "flex flex-col gap-3 rounded-2xl rounded-tl-md border p-4 transition-colors sm:p-5",
        isPro ? "border-electric-100 bg-electric-50/50 hover:border-electric-400/50" : "border-line bg-surface hover:border-brand-200",
      )}
    >
      <header className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-sm font-semibold text-ink">
          {reply.author.firstName} {reply.author.lastName}
        </span>
        <ForumRole role={reply.author.role} />
        {isOriginalPoster && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">Quien publicó</span>}
        <time dateTime={reply.createdAt} className="text-xs text-muted">
          · {formatDate(reply.createdAt)}
        </time>
      </header>
      {mode === "edit" ? (
        <TextEditor
          initial={reply.body}
          min={1}
          max={REPLY_MAX}
          label="Tu respuesta"
          onCancel={() => setMode("view")}
          save={(body) => updateReply(reply.id, body)}
          onSaved={() => {
            setMode("view");
            onChanged();
          }}
        />
      ) : (
        <p className="leading-relaxed whitespace-pre-line text-ink">{reply.body}</p>
      )}
      {/* El precio que propone un profesional, bien a la vista. */}
      {price && (
        <p className="flex items-center gap-2 self-start rounded-xl bg-amber-400 px-3 py-1.5 text-sm font-bold text-brand-900">
          <Wallet className="size-4" aria-hidden="true" />
          Propone {price}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
        {reply.edited && <span>Editada</span>}
        <LikeButton
          count={reply.likeCount}
          liked={liked}
          enabled={canLike}
          label={`la respuesta de ${name}`}
          small
          toggle={(next) => setReplyLike(reply.id, next)}
          onToggled={(next) => {
            queryClient.setQueryData<ForumLikes>(forumKeys.likes(post.id), (likes) =>
              likes ? { ...likes, replyIds: next ? [...likes.replyIds, reply.id] : likes.replyIds.filter((id) => id !== reply.id) } : likes,
            );
            onChanged();
          }}
        />
        <span className="ml-auto flex items-center gap-1">
          {canParticipate && mode === "view" && (
            <IconAction icon={<MessageSquareReply className="size-4" />} label="Responder" onClick={() => setMode("reply")} />
          )}
          {mine && mode === "view" && (
            <>
              <IconAction icon={<Pencil className="size-4" />} label="Editar" onClick={() => setMode("edit")} />
              <IconAction icon={<Trash2 className="size-4" />} label="Borrar" danger onClick={() => setConfirmDelete(true)} />
            </>
          )}
          {!mine && <ReportButton targetType="FORUM_REPLY" targetId={reply.id} subject={`la respuesta de ${name}`} compact />}
        </span>
      </div>
      {mode === "reply" && (
        <ReplyComposer post={post} parent={reply} isProfessional={isProfessional} onCancel={() => setMode("view")} onSent={() => { setMode("view"); onChanged(); }} />
      )}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="¿Borrar tu respuesta?"
        description="Se muestra como “Respuesta eliminada” si tiene respuestas debajo."
        confirmLabel="Borrar"
        pending={remove.isPending}
        error={remove.isError ? errorMessage(remove.error) : null}
        onConfirm={() => remove.mutate()}
      />
    </article>
  );
}

/** Responder a la publicación o a una respuesta. Los profesionales pueden proponer un precio en "Busco profesional". */
function ReplyComposer({
  post,
  parent,
  isProfessional,
  onSent,
  onCancel,
  me,
}: {
  post: ForumPostDetail;
  parent?: ForumReply;
  isProfessional: boolean;
  onSent: () => void;
  onCancel?: () => void;
  /** Quien responde (solo en el cuadro principal: muestra su foto al lado). */
  me?: { firstName: string; lastName: string; avatarUrl: string | null } | null;
}) {
  const [body, setBody] = useState("");
  const [price, setPrice] = useState("");
  const allowPrice = isProfessional && post.type === "PROFESSIONAL_WANTED";
  const send = useMutation({
    mutationFn: () => createReply(post.id, body.trim(), parent?.id, allowPrice && Number(price) > 0 ? Math.round(Number(price)) : undefined),
    meta: { success: "Publicamos tu respuesta" },
    onSuccess: () => {
      setBody("");
      setPrice("");
      onSent();
    },
  });
  const label = parent ? `Respuesta a ${parent.author?.firstName ?? "la respuesta"}` : "Tu respuesta";

  return (
    <form
      className={cn(
        "flex flex-col gap-3",
        parent ? "mt-1 rounded-2xl bg-canvas p-3" : "rounded-3xl border border-line bg-surface p-4 shadow-card transition-shadow focus-within:shadow-raised sm:p-5",
      )}
      onSubmit={(event) => {
        event.preventDefault();
        if (body.trim()) send.mutate();
      }}
    >
      {!parent && me && (
        <div className="flex items-center gap-3">
          <ForumAvatar name={`${me.firstName} ${me.lastName}`} avatarUrl={me.avatarUrl} size="sm" />
          <span className="font-display text-lg font-bold text-brand-900">Sumá tu respuesta</span>
        </div>
      )}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">{label}</span>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={REPLY_MAX} rows={parent ? 2 : 3} autoFocus={!!parent} placeholder={parent ? undefined : "Contá lo que sabés o tu propuesta…"} />
      </label>
      {allowPrice && (
        <label className="flex max-w-60 flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Precio que proponés (opcional)</span>
          <Input type="number" inputMode="numeric" min={1} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="$" />
        </label>
      )}
      {send.isError && <Alert tone="danger">{participationError(send.error)}</Alert>}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <span className="mr-auto text-xs text-muted">
          {body.length}/{REPLY_MAX}
        </span>
        {onCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" size="sm" variant={parent ? "secondary" : "primary"} loading={send.isPending} disabled={!body.trim()}>
          Responder
        </Button>
      </div>
    </form>
  );
}

/** Editar el texto de una publicación o respuesta propia. */
function TextEditor<T>({
  initial,
  min,
  max,
  label,
  save,
  onSaved,
  onCancel,
}: {
  initial: string;
  min: number;
  max: number;
  label: string;
  save: (body: string) => Promise<T>;
  onSaved: (result: T) => void;
  onCancel: () => void;
}) {
  const [body, setBody] = useState(initial);
  const mutation = useMutation({ mutationFn: () => save(body.trim()), meta: { success: "Guardamos los cambios" }, onSuccess: onSaved });
  const valid = body.trim().length >= min;
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (valid) mutation.mutate();
      }}
    >
      <label className="flex flex-col gap-1.5">
        <span className="sr-only">{label}</span>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={max} rows={4} autoFocus />
      </label>
      {mutation.isError && <Alert tone="danger">{participationError(mutation.error)}</Alert>}
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={mutation.isPending} disabled={!valid}>
          Guardar
        </Button>
      </div>
    </form>
  );
}

/** "Me gusta" con el corazón que late; se ve el total aunque no se pueda marcar. */
function LikeButton({
  count,
  liked,
  enabled,
  label,
  small = false,
  toggle,
  onToggled,
}: {
  count: number;
  liked: boolean;
  enabled: boolean;
  label: string;
  small?: boolean;
  toggle: (next: boolean) => Promise<unknown>;
  onToggled: (next: boolean) => void;
}) {
  const [optimistic, setOptimistic] = useState<{ liked: boolean; count: number } | null>(null);
  const mutation = useMutation({
    mutationFn: (next: boolean) => toggle(next),
    // El corazón cambia al instante (sin aviso); si falla vuelve atrás y se explica.
    meta: { error: "No pudimos registrar tu “me gusta”. Probá de nuevo." },
    onMutate: (next) => setOptimistic({ liked: next, count: count + (next ? 1 : -1) }),
    onSuccess: (_data, next) => onToggled(next),
    onSettled: () => setOptimistic(null),
  });
  const shown = optimistic ?? { liked, count };

  const content = (
    <>
      <Heart
        key={shown.liked ? "si" : "no"}
        className={cn(
          small ? "size-4" : "size-[1.1rem]",
          shown.liked ? "fill-danger-600 text-danger-600 motion-safe:animate-[heart-pop_420ms_var(--ease-out-soft)]" : "",
        )}
        aria-hidden="true"
      />
      <span className="tabular-nums">{shown.count}</span>
      <span className="sr-only"> me gusta</span>
    </>
  );
  if (!enabled) return <span className="flex items-center gap-1.5">{content}</span>;
  return (
    <button
      type="button"
      aria-pressed={shown.liked}
      aria-label={`${shown.liked ? "Quitar me gusta de" : "Me gusta"} ${label} (${shown.count})`}
      onClick={() => mutation.mutate(!shown.liked)}
      disabled={mutation.isPending}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 font-medium transition-colors",
        shown.liked ? "bg-danger-50 text-danger-600" : "hover:bg-canvas hover:text-ink",
      )}
    >
      {content}
    </button>
  );
}

function IconAction({ icon, label, onClick, danger = false }: { icon: ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-sm font-medium transition-colors",
        danger ? "text-muted hover:bg-danger-50 hover:text-danger-600" : "text-muted hover:bg-brand-50 hover:text-brand-800",
      )}
    >
      <span aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}
