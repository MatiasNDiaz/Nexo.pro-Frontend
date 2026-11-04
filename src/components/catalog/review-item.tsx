import { MessageSquareReply } from "lucide-react";
import type { PublicReview } from "@/features/catalog/types";
import { formatDate, formatRating } from "@/lib/format";
import { Stars } from "./rating";

/** Una reseña pública. El texto es del usuario: se muestra como texto, nunca como HTML. */
export function ReviewItem({ review, professionalName }: { review: PublicReview; professionalName: string }) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="font-semibold text-ink">{review.author.displayName}</span>
          <time dateTime={review.createdAt} className="text-sm text-muted">
            {formatDate(review.createdAt)}
            {review.edited && " · editada"}
          </time>
        </div>
        <span role="img" aria-label={`${formatRating(review.rating)} de 5`}>
          <Stars value={review.rating} />
        </span>
      </header>
      {review.comment && <p className="leading-relaxed whitespace-pre-line text-ink">{review.comment}</p>}
      {review.reply && (
        <div className="flex gap-3 rounded-xl bg-canvas p-4">
          <MessageSquareReply className="mt-0.5 size-4 shrink-0 text-brand-600" aria-hidden="true" />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-brand-900">Respuesta de {professionalName}</p>
            <p className="text-sm leading-relaxed whitespace-pre-line text-ink">{review.reply.body}</p>
          </div>
        </div>
      )}
    </article>
  );
}
