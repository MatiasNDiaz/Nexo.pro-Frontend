import { LinkPage, linkPageMetadata } from "@/components/layout/link-page";
import { ConfirmGoogleLink } from "@/features/session/email-links";

export const metadata = linkPageMetadata("Vincular Google");

export default function LinkGooglePage() {
  return (
    <LinkPage title="Vincular tu cuenta de Google">
      <ConfirmGoogleLink />
    </LinkPage>
  );
}
