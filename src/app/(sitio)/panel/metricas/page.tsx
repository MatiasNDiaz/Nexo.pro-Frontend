import type { Metadata } from "next";
import { MetricsPage } from "@/features/pro-work/metrics-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Métricas" };

export default function Page() {
  return <MetricsPage />;
}
