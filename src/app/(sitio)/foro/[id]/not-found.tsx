import { MessageSquareOff } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";

/** La publicación no existe, se borró o la ocultó la moderación (el backend responde lo mismo). */
export default function ForumPostNotFound() {
  return (
    <div className="container-page flex flex-1 items-center py-16">
      <EmptyState
        className="w-full"
        headingLevel={1}
        icon={MessageSquareOff}
        title="Esta publicación no está disponible"
        description="Puede que se haya borrado o que el enlace esté mal escrito."
        action={
          <ButtonLink href="/foro" variant="primary">
            Ver el foro
          </ButtonLink>
        }
      />
    </div>
  );
}
