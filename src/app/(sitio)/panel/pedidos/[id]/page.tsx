import type { Metadata } from "next";
import { Suspense } from "react";
import { RequestDetailScreen } from "@/features/requests/request-detail";

/** Privada, detrás de la sesión: no se valida como navegación instantánea (ver panel/layout.tsx). */
export const instant = false;

export const metadata: Metadata = { title: "Pedido" };

export default function Page() {
  return (
    <Suspense>
      <RequestDetailScreen />
    </Suspense>
  );
}
