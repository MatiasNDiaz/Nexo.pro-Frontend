import { ComingSoon, comingSoonMetadata } from "@/components/layout/coming-soon";

export const metadata = comingSoonMetadata("Panel");

export default function Page() {
  return (
    <ComingSoon
      title="Panel"
      description="Tu espacio para gestionar pedidos, conversaciones y tu cuenta."
      stage="etapa 5"
    />
  );
}