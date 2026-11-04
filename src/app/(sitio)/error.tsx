"use client";

import { RotateCw, TriangleAlert } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";

/**
 * Error inesperado al renderizar una página. Nunca muestra el mensaje técnico: los errores del
 * servidor llegan con un mensaje genérico y un `digest` que sirve para buscarlo en los logs.
 */
export default function SiteError({ error, retry }: { error: unknown; retry: () => void }) {
  const digest = error instanceof Error && "digest" in error && typeof error.digest === "string" ? error.digest : null;

  return (
    <div className="container-page flex flex-1 flex-col items-center justify-center gap-5 py-20 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-danger-50 text-danger-600">
        <TriangleAlert className="size-7" aria-hidden="true" />
      </span>
      <h1 className="text-3xl font-bold text-brand-900">Algo salió mal</h1>
      <p className="max-w-md text-lg text-muted-strong">
        No pudimos mostrar esta página. Probá de nuevo en unos segundos; si sigue pasando, escribinos.
      </p>
      {digest && <p className="text-sm text-muted-strong">Código de referencia: {digest}</p>}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button onClick={() => retry()}>
          <RotateCw className="size-4" aria-hidden="true" />
          Reintentar
        </Button>
        <ButtonLink href="/" variant="secondary">
          Ir al inicio
        </ButtonLink>
      </div>
    </div>
  );
}
