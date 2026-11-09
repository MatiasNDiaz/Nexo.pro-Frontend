import { api, type Schemas } from "@/lib/api/client";

/*
 * Favoritos del cliente (solo CUSTOMER activo; docs E-079 a E-082). Se guardan por el id de usuario
 * del profesional (`professionalUserId`). Los que ya no aparecen en el catálogo vienen con
 * `listed: false` y sin datos públicos.
 */

export type Favorite = Schemas["FavoriteDto"];

export const favoriteKeys = { all: ["favorites"] as const };

export const listFavorites = () => api<Favorite[]>("/favorites");

// Las tres responden 204 sin cuerpo: la lista se vuelve a pedir.
export const saveFavorite = (professionalId: string) => api(`/favorites/${professionalId}`, { method: "PUT", body: {} });

export const removeFavorite = (professionalId: string) => api(`/favorites/${professionalId}`, { method: "DELETE" });

export const setFavoriteAlerts = (professionalId: string, availabilityAlerts: boolean) =>
  api(`/favorites/${professionalId}`, { method: "PATCH", body: { availabilityAlerts } });
