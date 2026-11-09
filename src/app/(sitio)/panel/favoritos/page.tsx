import type { Metadata } from "next";
import { FavoritesPage } from "@/features/favorites/favorites-page";

export const metadata: Metadata = { title: "Favoritos" };

export default function Page() {
  return <FavoritesPage />;
}
