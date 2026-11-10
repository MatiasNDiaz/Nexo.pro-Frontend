import type { Metadata } from "next";
import { FavoritesPage } from "@/features/favorites/favorites-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Favoritos" };

export default function Page() {
  return <FavoritesPage />;
}
