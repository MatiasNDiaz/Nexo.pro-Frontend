import type { Metadata } from "next";
import { ContractsPage } from "@/features/requests/contracts-page";

export const metadata: Metadata = { title: "Trabajos" };

export default function Page() {
  return <ContractsPage />;
}
