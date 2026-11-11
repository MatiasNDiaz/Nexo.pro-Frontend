"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, Badge, Skeleton } from "@/components/ui/feedback";
import { Field, Textarea } from "@/components/ui/form-controls";
import { PanelTitle, SettingsSection } from "@/features/account/settings-section";
import { StarRatingInput, Stars } from "@/features/reviews/star-rating";
import { api, type Schemas } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";

/*
 * Mi opinión sobre Repara Ya (docs E-143 a E-145). Al guardarla queda sin publicar hasta que el equipo
 * la revisa; las publicadas se muestran en el inicio. Una por persona: guardar de nuevo la reemplaza.
 */

type PlatformReview = Schemas["PlatformReviewDto"];
const COMMENT_MAX = 1000;
const opinionKey = ["platform-reviews", "me"] as const;

export function OpinionPage() {
  const queryClient = useQueryClient();
  const mine = useQuery({ queryKey: opinionKey, queryFn: async () => (await api<PlatformReview | null>("/platform-reviews/me")) ?? null });
  const [editing, setEditing] = useState(false);

  const remove = useMutation({
    mutationFn: () => api("/platform-reviews/me", { method: "DELETE" }),
    meta: { success: "Borraste tu opinión" },
    onSuccess: () => queryClient.setQueryData(opinionKey, null),
  });

  return (
    <div className="flex flex-col gap-8">
      <PanelTitle title="Tu opinión sobre Repara Ya" description="Contanos cómo te resulta la plataforma. Nos ayuda a mejorarla y a que más gente se anime." />
      {mine.isPending ? (
        <Skeleton className="h-64 w-full rounded-3xl" />
      ) : mine.isError ? (
        <Alert tone="danger" title="No pudimos cargar tu opinión">
          {errorMessage(mine.error)}
        </Alert>
      ) : !mine.data || editing ? (
        <OpinionForm current={mine.data} onDone={() => setEditing(false)} />
      ) : (
        <section aria-labelledby="mi-opinion" className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="mi-opinion" className="text-lg font-semibold text-brand-900">
              Tu opinión
            </h2>
            <Badge tone={mine.data.published ? "success" : "electric"}>{mine.data.published ? "Publicada en el inicio" : "En revisión"}</Badge>
          </div>
          <Stars value={mine.data.rating} />
          {mine.data.comment && <p className="leading-relaxed whitespace-pre-line text-ink">{mine.data.comment}</p>}
          <p className="text-xs text-muted">{formatDate(mine.data.createdAt)}</p>
          {remove.isError && <Alert tone="danger">{errorMessage(remove.error)}</Alert>}
          <div className="flex flex-wrap gap-2 border-t border-line pt-4">
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
              Cambiarla
            </Button>
            <Button size="sm" variant="ghost" className="text-danger-600 hover:bg-danger-50" onClick={() => remove.mutate()} loading={remove.isPending}>
              <Trash2 className="size-4" aria-hidden="true" />
              Borrar
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}

function OpinionForm({ current, onDone }: { current: PlatformReview | null; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(current?.rating ?? 0);
  const [comment, setComment] = useState(current?.comment ?? "");
  const [missing, setMissing] = useState(false);
  const save = useMutation({
    mutationFn: () => api<PlatformReview>("/platform-reviews/me", { method: "PUT", body: { rating, comment: comment.trim() || null } }),
    meta: { success: { title: "¡Gracias por tu opinión!", description: "La revisamos antes de publicarla." } },
    onSuccess: (saved) => {
      queryClient.setQueryData(opinionKey, saved);
      onDone();
    },
  });
  return (
    <SettingsSection title={current ? "Cambiá tu opinión" : "¿Qué te parece Repara Ya?"} description="Si la cambiás, vuelve a revisión antes de publicarse.">
      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (rating === 0) {
            setMissing(true);
            return;
          }
          save.mutate();
        }}
      >
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Calificación</span>
          <StarRatingInput
            value={rating}
            onChange={(value) => {
              setRating(value);
              setMissing(false);
            }}
            invalid={missing}
            describedBy={missing ? "opinion-falta" : undefined}
          />
          {missing && (
            <p id="opinion-falta" role="alert" className="text-sm font-medium text-danger-600">
              Elegí de 1 a 5 estrellas.
            </p>
          )}
        </div>
        <Field id="opinion-comentario" label="Comentario (opcional)" hint={`${comment.length}/${COMMENT_MAX}`}>
          {(a11y) => <Textarea {...a11y} value={comment} onChange={(e) => setComment(e.target.value)} maxLength={COMMENT_MAX} rows={4} />}
        </Field>
        {save.isError && <Alert tone="danger">{errorMessage(save.error)}</Alert>}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="accent" loading={save.isPending}>
            <Sparkles className="size-4" aria-hidden="true" />
            {current ? "Guardar cambios" : "Enviar opinión"}
          </Button>
          {current && (
            <Button variant="ghost" onClick={onDone}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </SettingsSection>
  );
}
