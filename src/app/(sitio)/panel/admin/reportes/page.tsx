import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOnly } from "@/features/admin/admin-only";
import { ReportsPage } from "@/features/admin/reports-pages";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Reportes" };

export default function Page() {
  return (
    <AdminOnly>
      <Suspense>
        <ReportsPage />
      </Suspense>
    </AdminOnly>
  );
}
