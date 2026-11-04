"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Lee `?token=` de un enlace de email y lo saca de la barra de direcciones (contrato §12): así no
 * queda en el historial ni viaja en el `Referer`. El token se guarda solo en memoria de la página.
 */
export function useUrlToken(): string | null {
  const searchParams = useSearchParams();
  const [token] = useState(() => searchParams.get("token"));

  useEffect(() => {
    if (!token) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("token");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, [token]);

  return token;
}
