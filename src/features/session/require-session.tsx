"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/feedback";
import type { Me } from "./api";
import { useViewer } from "./viewer";

/**
 * Pantallas que necesitan sesión. Sin sesión, manda a ingresar y vuelve acá después. Es solo
 * experiencia de usuario: cada pedido igual lo autoriza el backend.
 */
export function RequireSession({ children }: { children: (user: Me) => ReactNode }) {
  const viewer = useViewer();
  const router = useRouter();
  const pathname = usePathname();

  const signedOut = viewer.status === "anonymous" && viewer.signedOut === true;
  useEffect(() => {
    if (viewer.status !== "anonymous") return;
    // Quien acaba de cerrar sesión va al inicio; quien llegó sin sesión, a ingresar (y vuelve acá).
    router.replace(signedOut ? "/" : (`/ingresar?siguiente=${encodeURIComponent(pathname)}` as Route));
  }, [viewer.status, signedOut, router, pathname]);

  if (viewer.status !== "authenticated") {
    return (
      <div className="container-page flex flex-col gap-4 py-12" aria-busy="true">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  return <>{children(viewer.user)}</>;
}
