"use client";

import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { useMe } from "@/features/account/use-me";

/**
 * "Clientes" solo se arma para profesionales. Es experiencia, no seguridad: el backend responde 403 a
 * cualquier otro rol en /customers (ADR 0037).
 */
export function ProfessionalOnly({ children }: { children: ReactNode }) {
  const me = useMe();
  if (me.role !== "PROFESSIONAL") {
    return (
      <EmptyState
        icon={ShieldAlert}
        headingLevel={1}
        title="Esta sección es para profesionales"
        description="Acá los profesionales encuentran clientes y lo que piden en el foro."
        action={<ButtonLink href="/panel">Volver al panel</ButtonLink>}
      />
    );
  }
  return children;
}
