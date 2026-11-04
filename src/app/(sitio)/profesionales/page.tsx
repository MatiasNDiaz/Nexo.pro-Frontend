import { ComingSoon, comingSoonMetadata } from "@/components/layout/coming-soon";

export const metadata = comingSoonMetadata("Profesionales");

export default function Page() {
  return (
    <ComingSoon
      title="Profesionales"
      description="Buscá profesionales por oficio y zona, y mirá quién está disponible ahora."
      stage="etapa 3"
    />
  );
}