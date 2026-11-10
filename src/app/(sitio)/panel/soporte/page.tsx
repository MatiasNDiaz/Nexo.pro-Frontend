import type { Metadata } from "next";
import { SupportPage } from "@/features/support/support-pages";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Soporte" };

export default function Page() {
  return <SupportPage />;
}
