import { NoConversationSelected } from "@/features/chat/messages-layout";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export default function Page() {
  return <NoConversationSelected />;
}
