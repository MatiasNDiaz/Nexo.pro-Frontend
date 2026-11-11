"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareReply, Pencil, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { revealDelay } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Alert, EmptyState, Skeleton } from "@/components/ui/feedback";
import { Textarea } from "@/components/ui/form-controls";
import { PanelTitle } from "@/features/account/settings-section";
import { Stars } from "@/features/reviews/star-rating";
import { errorMessage } from "@/lib/api/errors";
import { formatDate, formatRating } from "@/lib/format";
import { deleteReply, listReceivedReviews, REPLY_MAX, replyReview, workKeys, type OwnReview } from "./api";

/** Reseñas que recibió el profesional: el promedio arriba y cada una con su respuesta pública. */
export function ReceivedReviewsPage() {
  const reviews = useQuery({ queryKey: workKeys.reviewsReceived, queryFn: listReceivedReviews });
  const visible = reviews.data?.filter((r) => r.status === "VISIBLE") ?? [];
  const average = visible.length ? visible.reduce((sum, r) => sum + r.rating, 0) / visible.length : null;

  return (
    <div className="flex flex-col gap-8">
      <PanelTitle title="Reseñas recibidas" description="Lo que cuentan tus clientes. Responder con buena onda suma mucho, incluso en las críticas." />
      {reviews.isPending ? (
        <Skeleton className="h-64 w-full rounded-3xl" />
      ) : reviews.isError ? (
        <Alert tone="danger" title="No pudimos cargar tus reseñas">
          {errorMessage(reviews.error)}
        </Alert>
      ) : reviews.data.length === 0 ? (
        <EmptyState icon={Star} title="Todavía no tenés reseñas" description="Cuando termines un trabajo, le pedimos al cliente que cuente cómo le fue." />
      ) : (
        <>
          {average !== null && (
            <div className="flex flex-wrap items-center gap-5 rounded-3xl bg-brand-950 p-6 text-white animate-fade-up">
              <span className="font-display text-6xl leading-none font-bold">{formatRating(average)}</span>
              <span className="flex flex-col gap-1">
                <Stars value={Math.round(average)} />
                <span className="text-brand-200">
                  {visible.length} {visible.length === 1 ? "reseña publicada" : "reseñas publicadas"}
                </span>
              </span>
            </div>
          )}
          <ul className="flex flex-col gap-3">
            {reviews.data.map((review, index) => (
              <li key={review.id} data-reveal style={revealDelay(index % 4, 60)}>
                <ReceivedReview review={review} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function ReceivedReview({ review }: { review: OwnReview }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(review.reply?.body ?? "");
  const refresh = () => queryClient.invalidateQueries({ queryKey: workKeys.reviewsReceived });
  const reply = useMutation({
    mutationFn: () => replyReview(review.id, body.trim()),
    meta: { success: { title: "Publicamos tu respuesta", description: "Se ve debajo de la reseña en tu página." } },
    onSuccess: () => { setEditing(false); void refresh(); },
  });
  const remove = useMutation({ mutationFn: () => deleteReply(review.id), meta: { success: "Borramos tu respuesta" }, onSuccess: () => { setBody(""); void refresh(); } });

  return (
    <article className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-ink">{review.author.displayName}</span>
          <Stars value={review.rating} />
        </div>
        <span className="text-sm text-muted">
          {formatDate(review.createdAt)}
          {review.edited && " · editada"}
        </span>
      </div>
      {review.status === "HIDDEN_BY_ADMIN" && (
        <p className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">Oculta por nuestro equipo: {review.hiddenReason ?? "no cumple las reglas"}.</p>
      )}
      {review.comment ? <p className="leading-relaxed whitespace-pre-line text-ink">{review.comment}</p> : <p className="text-sm text-muted">Sin comentario.</p>}

      {review.reply && !editing ? (
        <div className="flex gap-3 rounded-2xl bg-canvas p-4">
          <MessageSquareReply className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-sm font-semibold text-ink">Tu respuesta</p>
            <p className="text-sm leading-relaxed whitespace-pre-line text-muted-strong">{review.reply.body}</p>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="size-4" aria-hidden="true" />
                Editar
              </Button>
              <Button variant="ghost" size="sm" onClick={() => remove.mutate()} loading={remove.isPending} className="text-danger-600 hover:bg-danger-50">
                <Trash2 className="size-4" aria-hidden="true" />
                Borrar
              </Button>
            </div>
          </div>
        </div>
      ) : review.status === "VISIBLE" ? (
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            if (body.trim()) reply.mutate();
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">{review.reply ? "Editá tu respuesta" : "Respondé en público"}</span>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} maxLength={REPLY_MAX} rows={3} />
          </label>
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" loading={reply.isPending} disabled={!body.trim()}>
              {review.reply ? "Guardar" : "Responder"}
            </Button>
            {editing && (
              <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            )}
            <span className="ml-auto text-xs text-muted">
              {body.length}/{REPLY_MAX}
            </span>
          </div>
        </form>
      ) : null}
      {(reply.isError || remove.isError) && <Alert tone="danger">{errorMessage(reply.error ?? remove.error)}</Alert>}
    </article>
  );
}
