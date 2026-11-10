import type { Metadata } from "next";
import { ModerationPage } from "@/features/moderation/moderation-page";

export const metadata: Metadata = { title: "Sanciones y apelaciones" };

export default function Page() {
  return <ModerationPage />;
}
