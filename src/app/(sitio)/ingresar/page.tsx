import { ComingSoon, comingSoonMetadata } from "@/components/layout/coming-soon";

export const metadata = comingSoonMetadata("Ingresar");

export default function Page() {
  return (
    <ComingSoon
      title="Ingresar"
      description="Entrá a tu cuenta de Repara Ya."
      stage="etapa 2"
    />
  );
}