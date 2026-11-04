import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";
import { terms } from "@/content/legal";

export const metadata: Metadata = {
  title: terms.title,
  description: terms.description,
  // Mientras el texto sea provisorio, no se indexa.
  robots: terms.provisional ? { index: false, follow: true } : undefined,
  alternates: { canonical: "/terminos" },
};

export default function TermsPage() {
  return <LegalPage document={terms} />;
}
