import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

/**
 * Último recurso, fuera del layout del sitio. Next incluye este componente en lo que manda a cada
 * página por si hace falta mostrarlo: por eso es mínimo (sin header ni footer). El 404 completo es
 * `(sitio)/not-found.tsx`.
 */
export default function RootNotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold text-brand-900">No encontramos esta página</h1>
      <Link href="/" className="font-semibold text-brand-700 underline underline-offset-4">
        Ir al inicio
      </Link>
    </main>
  );
}
