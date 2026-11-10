import type { Metadata } from "next";
import { PlanPage } from "@/features/pro-work/plan-page";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Tu plan" };

export default function Page() {
  return <PlanPage />;
}
