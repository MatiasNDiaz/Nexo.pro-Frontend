import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutResult } from "@/features/pro-work/checkout-result";

export const metadata: Metadata = { title: "Resultado del pago", robots: { index: false, follow: false } };

/** Vuelta desde Mercado Pago (la URL la arma el backend: config/payments.config.ts). */
export default function Page() {
  return (
    <Suspense>
      <CheckoutResult />
    </Suspense>
  );
}
