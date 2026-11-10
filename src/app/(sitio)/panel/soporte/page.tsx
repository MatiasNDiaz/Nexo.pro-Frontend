import type { Metadata } from "next";
import { SupportPage } from "@/features/support/support-pages";

export const metadata: Metadata = { title: "Soporte" };

export default function Page() {
  return <SupportPage />;
}
