import type { Metadata } from "next";
import { VerificationPage } from "@/features/account/verification-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Verificación de identidad" };

export default function Page() {
  return <VerificationPage />;
}
