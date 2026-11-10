import type { Metadata } from "next";
import { ReportsPage } from "@/features/reports/reports-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Mis reportes" };

export default function Page() {
  return <ReportsPage />;
}
