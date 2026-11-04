import { LinkPage, linkPageMetadata } from "@/components/layout/link-page";
import { ResetPasswordForm } from "@/features/session/email-links";

export const metadata = linkPageMetadata("Nueva contraseña");

export default function ResetPasswordPage() {
  return (
    <LinkPage title="Elegí una contraseña nueva" description="Al guardarla se cierra la sesión en todos tus dispositivos.">
      <ResetPasswordForm />
    </LinkPage>
  );
}
