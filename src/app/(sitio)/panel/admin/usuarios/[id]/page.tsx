import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminOnly } from "@/features/admin/admin-only";
import { UserDetailScreen } from "@/features/admin/user-detail";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Ficha del usuario" };

export default function Page() {
  return (
    <AdminOnly>
      <Suspense>
        <UserDetailScreen />
      </Suspense>
    </AdminOnly>
  );
}
