import { Compass } from "lucide-react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

/**
 * 404 del sitio, dentro de su layout (header y footer los pone el layout: no se duplican). Las URLs
 * que no existen llegan acá por la ruta comodín `[...resto]`.
 */
export default function NotFound() {
  return (
    <div className="container-page flex flex-1 flex-col items-center justify-center gap-5 py-20 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-700">
        <Compass className="size-7" aria-hidden="true" />
      </span>
      <p className="font-display text-sm font-bold tracking-wide text-brand-600">ERROR 404</p>
      <h1 className="text-3xl font-bold text-brand-900 sm:text-4xl">No encontramos esta página</h1>
      <p className="max-w-md text-lg text-muted-strong">Puede que el enlace esté mal escrito o que la página ya no exista.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <ButtonLink href="/">Ir al inicio</ButtonLink>
        <ButtonLink href="/profesionales" variant="secondary">
          Buscar profesionales
        </ButtonLink>
      </div>
    </div>
  );
}
