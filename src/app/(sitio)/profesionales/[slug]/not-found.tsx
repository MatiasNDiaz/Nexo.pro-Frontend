import { UserX } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";

/**
 * El perfil no existe o hoy no está en el catálogo (sin plan vigente, suspendido, perfil oculto).
 * El backend no distingue el motivo (404 PROFILE_NOT_FOUND) y acá tampoco se adivina.
 */
export default function ProfileNotFound() {
  return (
    <div className="container-page flex flex-1 items-center py-16">
      <EmptyState
        className="w-full"
        headingLevel={1}
        icon={UserX}
        title="Este perfil no está disponible"
        description="Puede que el enlace esté mal escrito o que el profesional hoy no esté publicado en el catálogo."
        action={
          <ButtonLink href="/profesionales" variant="primary">
            Ver otros profesionales
          </ButtonLink>
        }
      />
    </div>
  );
}
