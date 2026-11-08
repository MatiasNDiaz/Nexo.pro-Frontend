import { Suspense } from "react";
import { ConversationScreen } from "@/features/chat/conversation-screen";

export default function Page() {
  return (
    <Suspense>
      <ConversationScreen />
    </Suspense>
  );
}
