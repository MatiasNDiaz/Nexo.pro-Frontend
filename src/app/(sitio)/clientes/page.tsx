import { ComingSoon, comingSoonMetadata } from "@/components/layout/coming-soon";
import { banners } from "@/content/photos";

export const metadata = comingSoonMetadata("Clientes");

export default function Page() {
  return (
    <ComingSoon
      title="Clientes"
      description="Pedidos de clientes que buscan un profesional de tu oficio y zona."
      stage="etapa 6"
      photo={banners.clientes}
    />
  );
}
