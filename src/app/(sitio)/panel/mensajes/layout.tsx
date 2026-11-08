import type { Metadata } from "next";
import { MessagesLayout } from "@/features/chat/messages-layout";

export const metadata: Metadata = { title: "Mensajes" };

export default function Layout({ children }: LayoutProps<"/panel/mensajes">) {
  return <MessagesLayout>{children}</MessagesLayout>;
}
