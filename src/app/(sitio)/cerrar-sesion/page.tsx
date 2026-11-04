import { LinkPage, linkPageMetadata } from "@/components/layout/link-page";
import { CloseSessionByLink } from "@/features/session/email-links";

export const metadata = linkPageMetadata("Cerrar sesión desconocida");

export default function CloseSessionPage() {
  return (
    <LinkPage title="¿No reconocés este ingreso?">
      <CloseSessionByLink />
    </LinkPage>
  );
}
