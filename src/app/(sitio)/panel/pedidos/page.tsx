import type { Metadata } from "next";
import { RequestsPage } from "@/features/requests/requests-page";

export const metadata: Metadata = { title: "Pedidos" };

export default function Page() {
  return <RequestsPage />;
}
