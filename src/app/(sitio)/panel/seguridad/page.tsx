import type { Metadata } from "next";
import { SecurityPage } from "@/features/account/security-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Seguridad" };

export default function Page() {
  return <SecurityPage />;
}
