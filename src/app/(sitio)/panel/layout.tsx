import type { Metadata } from "next";
import { PanelShell } from "@/features/account/panel-shell";

/** Todo el panel es privado: nunca se indexa. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PanelLayout({ children }: LayoutProps<"/panel">) {
  return <PanelShell>{children}</PanelShell>;
}
