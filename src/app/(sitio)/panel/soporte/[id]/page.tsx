import type { Metadata } from "next";
import { Suspense } from "react";
import { TicketScreen } from "@/features/support/support-pages";

export const metadata: Metadata = { title: "Consulta de soporte" };

export default function Page() {
  return (
    <Suspense>
      <TicketScreen />
    </Suspense>
  );
}
