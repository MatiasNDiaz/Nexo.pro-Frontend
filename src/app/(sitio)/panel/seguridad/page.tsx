import type { Metadata } from "next";
import { SecurityPage } from "@/features/account/security-page";

export const metadata: Metadata = { title: "Seguridad" };

export default function Page() {
  return <SecurityPage />;
}
