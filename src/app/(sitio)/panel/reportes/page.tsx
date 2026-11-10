import type { Metadata } from "next";
import { ReportsPage } from "@/features/reports/reports-page";

export const metadata: Metadata = { title: "Mis reportes" };

export default function Page() {
  return <ReportsPage />;
}
