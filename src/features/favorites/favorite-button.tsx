"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useViewer } from "@/features/session/viewer";
import { cn } from "@/lib/cn";
import { favoriteKeys, listFavorites, removeFavorite, saveFavorite, type Favorite } from "./api";

/** La lista de favoritos, solo para el cliente con la cuenta activa (el único que puede tenerlos). */
export function useFavorites() {
  const viewer = useViewer();
  const enabled = viewer.status === "authenticated" && viewer.user.role === "CUSTOMER" && viewer.user.status === "ACTIVE";
  return { enabled, query: useQuery({ queryKey: favoriteKeys.all, queryFn: listFavorites, enabled }) };
}

/**
 * Guardar o quitar un profesional de favoritos. Cambia al instante (con un latido del corazón) y se
 * deshace si el backend no lo acepta. Sin sesión lleva a ingresar; a profesionales y admin no se les
 * muestra (no pueden tener favoritos).
 * - `card`: botón redondo sobre la foto de la tarjeta del catálogo (por encima de su enlace).
 * - `profile`: botón con texto en el perfil.
 */
export function FavoriteButton({
  professionalUserId,
  name,
  variant = "profile",
}: {
  professionalUserId: string;
  name: string;
  variant?: "card" | "profile";
}) {
  const viewer = useViewer();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { enabled, query } = useFavorites();
  const saved = query.data?.some((f) => f.professionalId === professionalUserId) ?? false;

  const toggle = useMutation({
    mutationFn: () => (saved ? removeFavorite(professionalUserId) : saveFavorite(professionalUserId)),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: favoriteKeys.all });
      const previous = queryClient.getQueryData<Favorite[]>(favoriteKeys.all);
      queryClient.setQueryData<Favorite[]>(favoriteKeys.all, (list = []) =>
        saved
          ? list.filter((f) => f.professionalId !== professionalUserId)
          : [...list, { professionalId: professionalUserId } as Favorite],
      );
      return { previous };
    },
    onError: (_error, _vars, context) => queryClient.setQueryData(favoriteKeys.all, context?.previous),
    onSettled: () => queryClient.invalidateQueries({ queryKey: favoriteKeys.all }),
  });

  const label = saved ? `Quitar a ${name} de favoritos` : `Guardar a ${name} en favoritos`;
  const heart = (
    <Heart
      key={saved ? "on" : "off"}
      className={cn(
        "size-5 transition-colors duration-200",
        saved ? "fill-danger-600 text-danger-600 motion-safe:animate-[heart-pop_420ms_var(--ease-out-soft)]" : "text-current",
      )}
      aria-hidden="true"
    />
  );
  const cardClass =
    "relative z-10 grid size-10 place-items-center rounded-full bg-white/95 text-brand-800 shadow-raised transition-[transform,background-color] duration-200 ease-out-soft hover:scale-110 hover:bg-white active:scale-95";
  const profileClass =
    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-4 text-[0.9375rem] font-semibold text-brand-800 transition-colors hover:border-brand-200 hover:bg-brand-50";

  if (viewer.status === "loading") return null;
  if (viewer.status === "anonymous") {
    return (
      <Link
        href={`/ingresar?siguiente=${encodeURIComponent(pathname)}` as Route}
        aria-label={`Ingresá para guardar a ${name} en favoritos`}
        className={variant === "card" ? cardClass : profileClass}
      >
        <Heart className="size-5" aria-hidden="true" />
        {variant === "profile" && "Guardar en favoritos"}
      </Link>
    );
  }
  if (!enabled) return null;

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={variant === "card" ? label : undefined}
      onClick={(event) => {
        event.preventDefault();
        toggle.mutate();
      }}
      disabled={toggle.isPending}
      className={variant === "card" ? cardClass : profileClass}
    >
      {heart}
      {variant === "profile" && (saved ? "Guardado en favoritos" : "Guardar en favoritos")}
    </button>
  );
}
