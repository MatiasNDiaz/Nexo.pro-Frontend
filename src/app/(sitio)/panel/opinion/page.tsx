import type { Metadata } from "next";
import { OpinionPage } from "@/features/platform-reviews/opinion-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Tu opinión" };

export default function Page() {
  return <OpinionPage />;
}
