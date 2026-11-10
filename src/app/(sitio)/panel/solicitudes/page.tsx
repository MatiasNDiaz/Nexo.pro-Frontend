import type { Metadata } from "next";
import { ReceivedRequestsPage } from "@/features/pro-work/received-requests";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Pedidos recibidos" };

export default function Page() {
  return <ReceivedRequestsPage />;
}
