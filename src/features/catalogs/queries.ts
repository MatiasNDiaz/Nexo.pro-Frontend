"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";

/** Formas documentadas en docs/BACKEND_ENDPOINTS.md (E-126 a E-128 y E-162). */
export interface Place {
  id: string;
  name: string;
}
export interface Profession extends Place {
  slug: string;
}

// Catálogos públicos que cambian muy poco: se piden una vez por visita.
const LONG = 30 * 60_000;

export function useProvinces() {
  return useQuery({ queryKey: ["provinces"], queryFn: () => api<Place[]>("/locations/provinces"), staleTime: LONG });
}

export function useLocalities(provinceId: string | null) {
  return useQuery({
    queryKey: ["localities", provinceId],
    queryFn: () => api<Place[]>("/locations/localities", { query: { provinceId } }),
    enabled: !!provinceId,
    staleTime: LONG,
  });
}

export function useProfessions() {
  return useQuery({ queryKey: ["professions"], queryFn: () => api<Profession[]>("/professions"), staleTime: LONG });
}

/** Valor que se actualiza recién cuando dejás de escribir (evita un pedido por tecla). */
function useDebounced<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

/** Sugerencias de barrios APROBADOS mientras se escribe (desde 2 letras). */
export function useNeighborhoodSuggestions(localityId: string | null, search: string) {
  const term = useDebounced(search.trim());
  return useQuery({
    queryKey: ["neighborhoods", localityId, term.toLowerCase()],
    queryFn: () => api<Place[]>("/locations/neighborhoods", { query: { localityId, search: term } }),
    enabled: !!localityId && term.length >= 2 && term.length <= 60,
    staleTime: LONG,
    placeholderData: (previous) => previous,
  });
}
