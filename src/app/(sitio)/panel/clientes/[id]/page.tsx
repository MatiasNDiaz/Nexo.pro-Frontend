import type { Metadata } from "next";
import { CustomerDetail } from "@/features/customers/customer-detail";
import { ProfessionalOnly } from "@/features/customers/professional-only";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Cliente" };

export default function Page() {
  return (
    <ProfessionalOnly>
      <CustomerDetail />
    </ProfessionalOnly>
  );
}
