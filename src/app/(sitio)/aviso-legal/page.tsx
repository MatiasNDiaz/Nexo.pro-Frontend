import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { legalNotice } from "@/content/legal";

export const metadata: Metadata = {
  title: legalNotice.title,
  description: legalNotice.description,
  // Mientras el texto sea provisorio, no se indexa.
  robots: legalNotice.provisional ? { index: false, follow: true } : undefined,
  alternates: { canonical: "/aviso-legal" },
};

export default function LegalNoticePage() {
  return <LegalPage document={legalNotice} />;
}
