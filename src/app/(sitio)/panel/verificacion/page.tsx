import type { Metadata } from "next";
import { VerificationPage } from "@/features/account/verification-page";

export const metadata: Metadata = { title: "Verificación de identidad" };

export default function Page() {
  return <VerificationPage />;
}
