import type { Metadata } from "next";
import { AgendaPage } from "@/features/pro-work/agenda-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Agenda" };

export default function Page() {
  return <AgendaPage />;
}
