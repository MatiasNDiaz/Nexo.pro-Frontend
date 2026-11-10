import type { Metadata } from "next";
import { AccountPage } from "@/features/account/account-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Mi cuenta" };

export default function Page() {
  return <AccountPage />;
}
