"use client";

import { useEffect } from "react";
import { api, type Query } from "@/lib/api/client";

/**
 * Registra la visita real para las métricas Premium (ADR 0033). La página llega armada desde el
 * servidor de Next, que se identifica como robot y no cuenta; este pedido sale del navegador de la
 * persona (con su sesión si la tiene), que es lo que el backend necesita para contar personas
 * distintas por día. El resultado no se usa y un error no afecta a la página.
 */
export function ViewBeacon({ path, query }: { path: string; query?: Query }) {
  const key = JSON.stringify([path, query ?? null]);

  useEffect(() => {
    const controller = new AbortController();
    const [beaconPath, beaconQuery] = JSON.parse(key) as [string, Query | null];
    api(beaconPath, { query: beaconQuery ?? undefined, signal: controller.signal }).catch(() => {
      // Sin efecto visible: la métrica es secundaria a la página.
    });
    return () => controller.abort();
  }, [key]);

  return null;
}
