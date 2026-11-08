import type { Metadata } from "next";
import { Suspense } from "react";
import { ContractDetailScreen } from "@/features/requests/contracts-page";

export const metadata: Metadata = { title: "Trabajo" };

export default function Page() {
  return (
    <Suspense>
      <ContractDetailScreen />
    </Suspense>
  );
}
