import type { Metadata } from "next";
import { PanelHome } from "@/features/account/panel-home";

export const metadata: Metadata = { title: "Mi panel", robots: { index: false, follow: false } };

export default function PanelPage() {
  return <PanelHome />;
}
