import type { Metadata } from "next";
import { Suspense } from "react";
import { ContractDetailScreen } from "@/features/requests/contracts-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Trabajo" };

export default function Page() {
  return (
    <Suspense>
      <ContractDetailScreen />
    </Suspense>
  );
}
