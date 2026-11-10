import { Suspense } from "react";
import { ConversationScreen } from "@/features/chat/conversation-screen";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export default function Page() {
  return (
    <Suspense>
      <ConversationScreen />
    </Suspense>
  );
}
