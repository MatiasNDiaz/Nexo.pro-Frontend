import type { Metadata } from "next";
import { AdminOnly } from "@/features/admin/admin-only";
import { PlatformReviewsPage } from "@/features/admin/support-admin";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Opiniones" };

export default function Page() {
  return (
    <AdminOnly>
      <PlatformReviewsPage />
    </AdminOnly>
  );
}
