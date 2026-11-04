import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/feedback";
import { AuthShell } from "./auth-shell";

/** Páginas de enlaces de email: personales y de un solo uso, nunca se indexan. */
export const linkPageMetadata = (title: string): Metadata => ({
  title,
  robots: { index: false, follow: false },
});

/**
 * Marco de una página a la que se llega desde un enlace de email. El contenido lee la URL
 * (`?token=`, `?resultado=`): se resuelve en el navegador, con un esqueleto mientras tanto.
 */
export function LinkPage({ title, description, children, wide }: { title: string; description?: string; children: ReactNode; wide?: boolean }) {
  return (
    <AuthShell title={title} description={description} wide={wide}>
      <Suspense
        fallback={
          <div className="flex flex-col items-center gap-4 py-4" aria-busy="true">
            <Skeleton className="size-14 rounded-2xl" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-11 w-full" />
          </div>
        }
      >
        {children}
      </Suspense>
    </AuthShell>
  );
}
