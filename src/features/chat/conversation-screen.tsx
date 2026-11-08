"use client";

import { useParams } from "next/navigation";
import { ConversationView } from "./conversation-view";

/** Conversación de la URL. `key`: al cambiar de conversación empieza de cero (lectura, edición, scroll). */
export function ConversationScreen() {
  const { id } = useParams<{ id: string }>();
  return <ConversationView key={id} id={id} />;
}
