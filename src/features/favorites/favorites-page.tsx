"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, BellRing, EyeOff, Heart, Trash2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { RemoteImage } from "@/components/catalog/remote-image";
import { revealDelay } from "@/components/motion/reveal";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, EmptyState, Skeleton } from "@/components/ui/feedback";
import { PanelTitle } from "@/features/account/settings-section";
import { errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { favoriteKeys, removeFavorite, setFavoriteAlerts, type Favorite } from "./api";
import { useFavorites } from "./favorite-button";

/** Favoritos del cliente: los profesionales que guardó, con el aviso de "disponible" y quitar. */
export function FavoritesPage() {
  const { query } = useFavorites();

  return (
    <div className="flex flex-col gap-8">
      <PanelTitle title="Favoritos" description="Los profesionales que guardaste para tenerlos a mano." />
      {query.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Cargando favoritos">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-2xl" />
          ))}
        </div>
      ) : query.isError ? (
        <Alert tone="danger" title="No pudimos cargar tus favoritos">
          {errorMessage(query.error)}
        </Alert>
      ) : query.data.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Todavía no guardaste a nadie"
          description="Tocá el corazón en un profesional del catálogo para tenerlo acá."
          action={
            <ButtonLink href="/profesionales" variant="accent">
              Ver profesionales
            </ButtonLink>
          }
        />
      ) : (
        <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-[repeat(2,minmax(0,1fr))] xl:grid-cols-[repeat(3,minmax(0,1fr))]">
          {query.data.map((favorite, index) => (
            <li key={favorite.professionalId} data-reveal style={revealDelay(index % 3, 70)}>
              <FavoriteCard favorite={favorite} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FavoriteCard({ favorite }: { favorite: Favorite }) {
  const queryClient = useQueryClient();
  const name = favorite.listed ? [favorite.firstName, favorite.lastName].filter(Boolean).join(" ") : "Profesional no disponible";
  const refresh = () => queryClient.invalidateQueries({ queryKey: favoriteKeys.all });

  const remove = useMutation({ mutationFn: () => removeFavorite(favorite.professionalId), meta: { success: "Lo quitaste de tus favoritos" }, onSettled: refresh });
  const alerts = useMutation({
    mutationFn: (on: boolean) => setFavoriteAlerts(favorite.professionalId, on),
    meta: {
      success: (_data, on) =>
        on ? { title: "Te vamos a avisar", description: "Te llega una notificación cuando se ponga “Disponible ya”." } : "Ya no te avisamos cuando esté disponible",
    },
    onMutate: (on) =>
      queryClient.setQueryData<Favorite[]>(favoriteKeys.all, (list) =>
        list?.map((f) => (f.professionalId === favorite.professionalId ? { ...f, availabilityAlerts: on } : f)),
      ),
    onSettled: refresh,
  });

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-[border-color,box-shadow,translate] duration-300 ease-out-soft hover:-translate-y-1 hover:border-brand-200 hover:shadow-raised">
      <div className="relative aspect-[16/10] overflow-hidden bg-brand-100">
        {favorite.listed && favorite.avatarUrl ? (
          <RemoteImage src={favorite.avatarUrl} alt="" fill sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 92vw" className="object-cover object-[center_30%] transition-transform duration-700 ease-out-soft group-hover:scale-[1.05]" />
        ) : (
          <span className="grid size-full place-items-center text-brand-400">
            {favorite.listed ? <Heart className="size-10" aria-hidden="true" /> : <EyeOff className="size-10" aria-hidden="true" />}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex flex-col gap-0.5">
          <h2 className="truncate text-lg font-bold text-ink">{name}</h2>
          {favorite.listed ? (
            favorite.businessName && <p className="truncate text-sm text-muted">{favorite.businessName}</p>
          ) : (
            <p className="text-sm text-muted-strong">Ya no aparece en el catálogo. Si vuelve, lo vas a ver acá.</p>
          )}
        </div>

        {favorite.listed && (
          <div
            className={cn(
              "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5",
              favorite.alertsAvailable ? "bg-canvas" : "bg-canvas/60",
            )}
          >
            <span className="flex items-center gap-2 text-sm">
              <BellRing className="size-4 shrink-0 text-brand-600" aria-hidden="true" />
              {favorite.alertsAvailable ? "Avisarme cuando esté disponible" : "Su plan no incluye avisos de disponibilidad"}
            </span>
            {favorite.alertsAvailable && (
              <label className="relative flex shrink-0 cursor-pointer items-center has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-electric-500">
                <input
                  type="checkbox"
                  role="switch"
                  aria-label={`Avisarme cuando ${name} esté disponible`}
                  className="peer sr-only"
                  checked={favorite.availabilityAlerts}
                  onChange={(event) => alerts.mutate(event.target.checked)}
                />
                <span
                  aria-hidden="true"
                  className="relative h-6 w-11 rounded-full bg-line-strong transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-white after:shadow-xs after:transition-transform peer-checked:bg-success-600 peer-checked:after:translate-x-5"
                />
              </label>
            )}
          </div>
        )}

        {(remove.isError || alerts.isError) && <Alert tone="danger">{errorMessage(remove.error ?? alerts.error)}</Alert>}

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-4">
          <Button variant="ghost" size="sm" onClick={() => remove.mutate()} loading={remove.isPending} className="text-danger-600 hover:bg-danger-50">
            <Trash2 className="size-4" aria-hidden="true" />
            Quitar
          </Button>
          {favorite.listed && favorite.slug && (
            <Link
              href={`/profesionales/${favorite.slug}` as Route}
              className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
            >
              Ver perfil
              <ArrowRight className="size-4 transition-transform duration-200 ease-out-soft group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
