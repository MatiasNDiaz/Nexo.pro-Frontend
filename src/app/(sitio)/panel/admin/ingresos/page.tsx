import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOnly } from "@/features/admin/admin-only";
import { RevenuePage } from "@/features/admin/revenue-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Ingresos" };

export default function Page() {
  // Suspense: la vista inicial se lee de la URL (?vista=mercadopago desde el resumen).
  return (
    <AdminOnly>
      <Suspense>
        <RevenuePage />
      </Suspense>
    </AdminOnly>
  );
}
