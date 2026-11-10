import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOnly } from "@/features/admin/admin-only";
import { AdminUsersPage } from "@/features/admin/users-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Usuarios" };

export default function Page() {
  // Suspense: los filtros se leen de la URL (useSearchParams).
  return (
    <AdminOnly>
      <Suspense>
        <AdminUsersPage />
      </Suspense>
    </AdminOnly>
  );
}
