"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Star } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useMemo } from "react";
import { revealDelay } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { Alert, EmptyState, Skeleton } from "@/components/ui/feedback";
import { PanelTitle } from "@/features/account/settings-section";
import { counterpartName } from "@/features/chat/api";
import { CounterpartAvatar } from "@/features/chat/counterpart-avatar";
import { contractKeys, listContracts } from "@/features/requests/api";
import { useCounterparts } from "@/features/requests/use-counterparts";
import { errorMessage } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import { listMyReviews, reviewKeys } from "./api";
import { Stars } from "./star-rating";

/**
 * Mis reseñas: cada una con el profesional (nombre tomado del chat del trabajo, H-05) y un enlace al
 * trabajo, donde se edita o se borra. Arriba, los trabajos terminados que todavía no reseñaste.
 */
export function ReviewsPage() {
  const reviews = useQuery({ queryKey: reviewKeys.mine, queryFn: listMyReviews });
  const contracts = useQuery({ queryKey: contractKeys.all, queryFn: listContracts });
  const { byConversation } = useCounterparts();

  const conversationByContract = useMemo(
    () => new Map((contracts.data ?? []).map((c) => [c.id, byConversation.get(c.conversationId)])),
    [contracts.data, byConversation],
  );
  const pending = useMemo(() => {
    const reviewed = new Set((reviews.data ?? []).map((r) => r.contractId));
    return (contracts.data ?? []).filter((c) => c.status === "COMPLETED" && !reviewed.has(c.id));
  }, [contracts.data, reviews.data]);

  return (
    <div className="flex flex-col gap-8">
      <PanelTitle title="Mis reseñas" description="Lo que contaste de los trabajos terminados. Ayuda a otras personas a elegir." />

      {pending.length > 0 && (
        <section aria-labelledby="sin-resena" className="flex flex-col gap-3 rounded-3xl bg-brand-950 p-5 text-white sm:p-7">
          <h2 id="sin-resena" className="flex items-center gap-2 font-display text-xl font-bold">
            <Star className="size-5 fill-amber-400 text-amber-400" aria-hidden="true" />
            {pending.length === 1 ? "Tenés un trabajo para reseñar" : `Tenés ${pending.length} trabajos para reseñar`}
          </h2>
          <ul className="flex flex-col gap-2">
            {pending.map((contract) => {
              const conversation = byConversation.get(contract.conversationId);
              return (
                <li key={contract.id}>
                  <Link
                    href={`/panel/trabajos/${contract.id}#resena` as Route}
                    className="group flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10 transition-colors hover:bg-white/10"
                  >
                    {conversation && <CounterpartAvatar conversation={conversation} />}
                    <span className="flex-1 font-semibold">
                      {conversation ? counterpartName(conversation) : "Trabajo terminado"}
                      {contract.completedAt && <span className="block text-sm font-normal text-brand-200">Terminó el {formatDate(contract.completedAt)}</span>}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-400">
                      Dejar reseña
                      <ArrowRight className="size-4 transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {reviews.isPending ? (
        <div className="flex flex-col gap-3" aria-busy="true" aria-label="Cargando reseñas">
          <Skeleton className="h-36 w-full rounded-3xl" />
          <Skeleton className="h-36 w-full rounded-3xl" />
        </div>
      ) : reviews.isError ? (
        <Alert tone="danger" title="No pudimos cargar tus reseñas">
          {errorMessage(reviews.error)}
        </Alert>
      ) : reviews.data.length === 0 ? (
        pending.length === 0 && (
          <EmptyState
            icon={Star}
            title="Todavía no dejaste reseñas"
            description="Cuando un profesional termine un trabajo, vas a poder contar cómo te fue."
            action={
              <ButtonLink href="/panel/trabajos" variant="secondary">
                Ver mis trabajos
              </ButtonLink>
            }
          />
        )
      ) : (
        <ul className="flex flex-col gap-3">
          {reviews.data.map((review, index) => {
            const conversation = conversationByContract.get(review.contractId);
            const name = conversation ? counterpartName(conversation) : "Profesional";
            return (
              <li key={review.id} data-reveal style={revealDelay(index % 4, 60)}>
                <article className="flex flex-col gap-3 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    {conversation && <CounterpartAvatar conversation={conversation} />}
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <h2 className="truncate font-semibold text-ink">{name}</h2>
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
                  {review.comment && <p className="line-clamp-3 leading-relaxed text-ink">{review.comment}</p>}
                  {review.reply && (
                    <p className="rounded-xl bg-canvas px-3 py-2 text-sm text-muted-strong">
                      <span className="font-semibold text-ink">Respuesta de {name}:</span> {review.reply.body}
                    </p>
                  )}
                  <Link
                    href={`/panel/trabajos/${review.contractId}#resena` as Route}
                    className="inline-flex items-center gap-1 self-start text-sm font-semibold text-brand-700 hover:underline"
                  >
                    Ver el trabajo y editar
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
