import type { Metadata } from "next";
import { PanelShell } from "@/features/account/panel-shell";

/** Todo el panel es privado: nunca se indexa. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

/*
 * El panel se arma en el navegador detrás de la sesión (las cookies son de la API): una navegación
 * hacia acá no puede mostrarse prearmada. Se excluye de la validación de navegación instantánea de
 * Next (docs: route-segment-config/instant), que si no avisa en desarrollo.
 */
export const instant = false;

export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return <PanelShell>{children}</PanelShell>;
}
