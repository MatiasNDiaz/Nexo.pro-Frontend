import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomersPage } from "@/features/customers/customers-page";
import { ProfessionalOnly } from "@/features/customers/professional-only";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Clientes" };

export default function Page() {
  // Suspense: los filtros se leen de la URL (useSearchParams).
  return (
    <ProfessionalOnly>
      <Suspense>
        <CustomersPage />
      </Suspense>
    </ProfessionalOnly>
  );
}
