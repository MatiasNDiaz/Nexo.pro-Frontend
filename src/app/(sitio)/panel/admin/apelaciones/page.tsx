import type { Metadata } from "next";
import { AdminOnly } from "@/features/admin/admin-only";
import { AppealsPage } from "@/features/admin/queue-pages";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Apelaciones" };

export default function Page() {
  return (
    <AdminOnly>
      <AppealsPage />
    </AdminOnly>
  );
}
