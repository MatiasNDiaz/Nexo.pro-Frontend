import type { Metadata } from "next";
import { NotificationsPage } from "@/features/notifications/notifications-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Notificaciones" };

export default function Page() {
  return <NotificationsPage />;
}
