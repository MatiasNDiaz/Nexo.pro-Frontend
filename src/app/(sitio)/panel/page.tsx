import type { Metadata } from "next";
import { PanelHome } from "@/features/account/panel-home";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Mi panel", robots: { index: false, follow: false } };

export default function PanelPage() {
  return <PanelHome />;
}
