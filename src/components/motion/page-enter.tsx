"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** ¿Ya se mostró una página en esta visita? La primera (la que llega del servidor) no se anima. */
let shownOnce = false;

/**
 * Entrada de cada página al navegar: aparece y sube un poco (`page-enter` en globals.css), con una
 * animación CSS de opacidad y transform que la placa de video corre sola.
 *
 * Reemplaza a la View Transition de página completa (11/11/2026): el navegador sacaba una "foto" de la
 * página vieja y otra de la nueva en cada navegación, y en un celular con CPU x4 eso costaba ~500 ms
 * del hilo principal. La foto del profesional sigue volando con su propia View Transition
 * (components/catalog/profile-photo-transition.tsx).
 *
 * El template se vuelve a montar en cada navegación, así que cada página nueva arranca su animación.
 */
export function PageEnter({ children }: { children: ReactNode }) {
  // En la hidratación da false (igual que en el servidor): la primera página no se anima.
  const [animate] = useState(() => shownOnce);
  useEffect(() => {
    shownOnce = true;
  }, []);
  return <div className={cn("flex flex-1 flex-col", animate && "page-enter")}>{children}</div>;
}
