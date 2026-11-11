"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageSquareQuote, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, Skeleton } from "@/components/ui/feedback";
import { Field, Textarea } from "@/components/ui/form-controls";
import { SettingsSection } from "@/features/account/settings-section";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import {
  canStillReview,
  COMMENT_MAX,
  createReview,
  deleteReview,
  listMyReviews,
  reviewKeys,
  updateReview,
  type OwnReview,
} from "./api";
import { StarRatingInput, Stars } from "./star-rating";

/**
 * Reseña de un trabajo terminado, dentro de su detalle: dejarla, verla, editarla (30 días desde que
 * terminó) o borrarla. Se busca en "mis reseñas" por la contratación.
 */
export function ReviewPanel({ contractId, completedAt, name }: { contractId: string; completedAt: string | null; name: string }) {
  const mine = useQuery({ queryKey: reviewKeys.mine, queryFn: listMyReviews });
  const [editing, setEditing] = useState(false);
  const review = mine.data?.find((r) => r.contractId === contractId) ?? null;
  const open = canStillReview(completedAt);

  if (mine.isPending) return <Skeleton className="h-48 w-full rounded-3xl" />;
  if (mine.isError) return <Alert tone="danger" title="No pudimos cargar tu reseña">{errorMessage(mine.error)}</Alert>;

  if (!review && !open) {
    return (
      <SettingsSection title="Reseña" description={`Pasaron más de 30 días desde que terminó: ya no se puede dejar una reseña.`}>
        <p className="text-sm text-muted-strong">Si querés contar algo de este trabajo, escribile a {name} por el chat.</p>
      </SettingsSection>
    );
  }

  if (!review || editing) {
    return (
      <SettingsSection
        id="resena"
        title={review ? "Editá tu reseña" : `¿Cómo te fue con ${name}?`}
        description="Tu reseña es pública y ayuda a otras personas a elegir. Podés editarla durante 30 días desde que terminó el trabajo."
      >
        <ReviewForm contractId={contractId} review={review} onDone={() => setEditing(false)} />
      </SettingsSection>
    );
  }

  return <ReviewSummary review={review} onEdit={open ? () => setEditing(true) : undefined} name={name} />;
}

function ReviewForm({ contractId, review, onDone }: { contractId: string; review: OwnReview | null; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [comment, setComment] = useState(review?.comment ?? "");
  const [missingRating, setMissingRating] = useState(false);

  const save = useMutation({
    mutationFn: () => (review ? updateReview(review.id, rating, comment) : createReview(contractId, rating, comment)),
    meta: {
      success: review
        ? "Guardamos los cambios de tu reseña"
        : { title: "¡Gracias por tu reseña!", description: "Ayuda a otras personas a elegir y al profesional a mejorar." },
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: reviewKeys.mine });
      onDone();
    },
  });

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (rating === 0) {
          setMissingRating(true);
          return;
        }
        save.mutate();
      }}
      noValidate
    >
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-ink">Calificación</span>
        <StarRatingInput
          value={rating}
          onChange={(value) => {
            setRating(value);
            setMissingRating(false);
          }}
          invalid={missingRating}
          describedBy={missingRating ? "resena-falta" : undefined}
        />
        {missingRating && (
          <p id="resena-falta" role="alert" className="text-sm font-medium text-danger-600">
            Elegí de 1 a 5 estrellas.
          </p>
        )}
      </div>
      <Field id="resena-comentario" label="Comentario (opcional)" hint={`Contá cómo fue el trabajo. ${comment.length}/${COMMENT_MAX}`}>
        {(a11y) => <Textarea {...a11y} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={COMMENT_MAX} rows={4} />}
      </Field>
      {save.isError && (
        <Alert tone="danger">
          {isApiError(save.error, "REVIEW_WINDOW_CLOSED")
            ? "Pasaron más de 30 días desde que terminó el trabajo: ya no se puede cambiar."
            : isApiError(save.error, "REVIEW_EXISTS")
              ? "Ya dejaste una reseña de este trabajo. Recargá la página para verla."
              : errorMessage(save.error)}
        </Alert>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="accent" loading={save.isPending}>
          {review ? "Guardar cambios" : "Publicar reseña"}
        </Button>
        {review && (
          <Button variant="ghost" onClick={onDone}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}

/** La reseña ya publicada, con la respuesta del profesional si la hay. */
export function ReviewSummary({ review, name, onEdit }: { review: OwnReview; name: string; onEdit?: () => void }) {
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () => deleteReview(review.id),
    meta: { success: "Borraste tu reseña" },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: reviewKeys.mine }),
  });

  return (
    <section aria-labelledby={`resena-${review.id}`} className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          <h2 id={`resena-${review.id}`} className="text-lg font-semibold text-brand-900">
            Tu reseña
          </h2>
          <Stars value={review.rating} />
        </div>
        <span className="text-sm text-muted">
          {formatDate(review.createdAt)}
          {review.edited && " · editada"}
        </span>
      </div>
      {review.status === "HIDDEN_BY_ADMIN" && (
        <Alert tone="warning" title="Nuestro equipo ocultó esta reseña">
          {review.hiddenReason ?? "No cumple las reglas de la comunidad."}
        </Alert>
      )}
      {review.comment ? <p className="leading-relaxed whitespace-pre-line text-ink">{review.comment}</p> : <p className="text-sm text-muted">Sin comentario.</p>}
      {review.reply && (
        <div className="flex gap-3 rounded-2xl bg-canvas p-4">
          <MessageSquareQuote className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-ink">Respuesta de {name}</p>
            <p className="text-sm leading-relaxed whitespace-pre-line text-muted-strong">{review.reply.body}</p>
          </div>
        </div>
      )}
      {remove.isError && <Alert tone="danger">{errorMessage(remove.error)}</Alert>}
      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
        {onEdit && (
          <Button variant="secondary" size="sm" onClick={onEdit}>
            <Pencil className="size-4" aria-hidden="true" />
            Editar
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => remove.mutate()} loading={remove.isPending} className="text-danger-600 hover:bg-danger-50">
          <Trash2 className="size-4" aria-hidden="true" />
          Borrar
        </Button>
        {!onEdit && <p className="self-center text-xs text-muted">Pasaron más de 30 días: ya no se puede editar, sí borrar.</p>}
      </div>
    </section>
  );
}
