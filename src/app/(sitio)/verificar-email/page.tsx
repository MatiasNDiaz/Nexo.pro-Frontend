import { LinkPage, linkPageMetadata } from "@/components/layout/link-page";
import { VerifyEmail } from "@/features/session/email-links";

export const metadata = linkPageMetadata("Verificar email");

export default function VerifyEmailPage() {
  return (
    <LinkPage title="Verificación de email">
      <VerifyEmail />
    </LinkPage>
  );
}
