import type { Metadata } from "next";
import { RequestsPage } from "@/features/requests/requests-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Pedidos" };

export default function Page() {
  return <RequestsPage />;
}
