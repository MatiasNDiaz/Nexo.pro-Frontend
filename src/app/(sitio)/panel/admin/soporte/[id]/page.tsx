import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOnly } from "@/features/admin/admin-only";
import { TicketScreen } from "@/features/admin/support-admin";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Consulta" };

export default function Page() {
  return (
    <AdminOnly>
      <Suspense>
        <TicketScreen />
      </Suspense>
    </AdminOnly>
  );
}
