import type { Metadata } from "next";
import { ProfileEditor } from "@/features/pro-profile/profile-editor";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Mi perfil profesional" };

export default function Page() {
  return <ProfileEditor />;
}
