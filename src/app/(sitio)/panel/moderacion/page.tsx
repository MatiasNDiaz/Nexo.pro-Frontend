import type { Metadata } from "next";
import { ModerationPage } from "@/features/moderation/moderation-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Sanciones y apelaciones" };

export default function Page() {
  return <ModerationPage />;
}
