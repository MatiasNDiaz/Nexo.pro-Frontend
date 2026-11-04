"use client";

import type { Me } from "@/features/session/api";
import { useViewer } from "@/features/session/viewer";

/**
 * Usuario en sesión dentro del panel. El layout del panel (RequireSession) solo muestra su contenido
 * con sesión, así que acá siempre hay usuario.
 */
export function useMe(): Me {
  const viewer = useViewer();
  if (viewer.status !== "authenticated") throw new Error("useMe fuera del panel con sesión");
  return viewer.user;
}
