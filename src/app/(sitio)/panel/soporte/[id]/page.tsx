import type { Metadata } from "next";
import { Suspense } from "react";
import { TicketScreen } from "@/features/support/support-pages";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Consulta de soporte" };

export default function Page() {
  return (
    <Suspense>
      <TicketScreen />
    </Suspense>
  );
}
