import type { Metadata } from "next";
import { DesignEditor } from "@/features/pro-profile/design-editor";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Diseño de tu página" };

export default function Page() {
  return <DesignEditor />;
}
