import type { Metadata } from "next";
import { OwnPageScreen } from "@/features/pro-profile/own-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Mi página" };

export default function Page() {
  return <OwnPageScreen />;
}
