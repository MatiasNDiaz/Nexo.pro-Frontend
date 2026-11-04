import { ComingSoon, comingSoonMetadata } from "@/components/layout/coming-soon";

export const metadata = comingSoonMetadata("Contacto");

export default function Page() {
  return (
    <ComingSoon
      title="Contacto"
      description="Escribinos tu consulta, sugerencia o problema."
      stage="etapa 3"
    />
  );
}