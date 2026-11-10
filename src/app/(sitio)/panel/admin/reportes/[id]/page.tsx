import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOnly } from "@/features/admin/admin-only";
import { ReportDetailScreen } from "@/features/admin/reports-pages";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Reporte" };

export default function Page() {
  return (
    <AdminOnly>
      <Suspense>
        <ReportDetailScreen />
      </Suspense>
    </AdminOnly>
  );
}
