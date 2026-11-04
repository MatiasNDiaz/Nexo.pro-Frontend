import { ComingSoon, comingSoonMetadata } from "@/components/layout/coming-soon";

export const metadata = comingSoonMetadata("Foro");

export default function Page() {
  return (
    <ComingSoon
      title="Foro"
      description="Preguntas de la comunidad y pedidos de clientes que buscan un profesional."
      stage="etapa 3"
    />
  );
}