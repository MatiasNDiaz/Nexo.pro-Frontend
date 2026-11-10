import type { Metadata } from "next";
import { Suspense } from "react";
import { AnnouncementPage } from "@/features/notifications/announcement-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Novedad" };

export default function Page() {
  return (
    <Suspense>
      <AnnouncementPage />
    </Suspense>
  );
}
