import { Hammer } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "./page-header";

/** Las secciones todavía en construcción no se indexan. */
export const comingSoonMetadata = (title: string): Metadata => ({
  title,
  robots: { index: false, follow: true },
});

/**
 * Sección que existe en la navegación pero se construye en una etapa posterior. Lo dice
 * explícitamente en vez de simular contenido.
 */
export function ComingSoon({ title, description, stage }: { title: string; description: string; stage: string }) {
  return (
    <>
      <PageHeader title={title} description={description} />
      <div className="container-page py-12">
        <EmptyState
          icon={Hammer}
          title="Estamos construyendo esta sección"
          description={`Llega en la ${stage} del desarrollo del sitio.`}
          action={
            <ButtonLink href="/" variant="secondary">
              Volver al inicio
            </ButtonLink>
          }
        />
      </div>
    </>
  );
}
