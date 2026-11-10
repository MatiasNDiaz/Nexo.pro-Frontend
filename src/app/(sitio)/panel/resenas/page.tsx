import type { Metadata } from "next";
import { ReviewsPage } from "@/features/reviews/reviews-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Mis reseñas" };

export default function Page() {
  return <ReviewsPage />;
}
