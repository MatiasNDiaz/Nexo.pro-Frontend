import type { Metadata } from "next";
import { Suspense } from "react";
import { RequestDetailScreen } from "@/features/requests/request-detail";

export const metadata: Metadata = { title: "Pedido" };

export default function Page() {
  return (
    <Suspense>
      <RequestDetailScreen />
    </Suspense>
  );
}
