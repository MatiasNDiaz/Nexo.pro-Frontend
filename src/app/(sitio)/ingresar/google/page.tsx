import { LinkPage, linkPageMetadata } from "@/components/layout/link-page";
import { GoogleResult } from "@/features/session/google-result";

export const metadata = linkPageMetadata("Ingresar con Google");

/** Vuelta del ingreso con Google: la API redirige acá con `?resultado=` (y `?codigo=` si falló). */
export default function GoogleResultPage() {
  return (
    <LinkPage title="Ingresar con Google" wide>
      <GoogleResult />
    </LinkPage>
  );
}
