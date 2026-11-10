"use client";

import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { useMe } from "@/features/account/use-me";

/**
 * Las secciones del admin solo se arman para el admin. Es experiencia, no seguridad: el backend
 * responde 403 a cualquier otro rol en todas las rutas /admin.
 */
export function AdminOnly({ children }: { children: ReactNode }) {
  const me = useMe();
  if (me.role !== "ADMIN") {
    return (
      <EmptyState
        icon={ShieldAlert}
        headingLevel={1}
        title="Esta sección es del equipo de Repara Ya"
        description="Tu cuenta no tiene acceso a la administración."
        action={<ButtonLink href="/panel">Volver al panel</ButtonLink>}
      />
    );
  }
  return children;
}
