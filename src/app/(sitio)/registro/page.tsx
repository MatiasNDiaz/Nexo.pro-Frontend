import { ComingSoon, comingSoonMetadata } from "@/components/layout/coming-soon";

export const metadata = comingSoonMetadata("Crear cuenta");

export default function Page() {
  return (
    <ComingSoon
      title="Crear cuenta"
      description="Registrate como cliente o como profesional."
      stage="etapa 2"
    />
  );
}