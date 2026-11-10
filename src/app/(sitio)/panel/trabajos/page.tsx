import type { Metadata } from "next";
import { ContractsPage } from "@/features/requests/contracts-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Trabajos" };

export default function Page() {
  return <ContractsPage />;
}
