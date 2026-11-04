import { notFound } from "next/navigation";

/**
 * Cualquier URL que no coincide con una página del sitio cae acá y muestra el 404 del sitio
 * (`(sitio)/not-found.tsx`), con su header y footer. Las rutas concretas siempre tienen prioridad
 * sobre esta ruta comodín.
 */
export default function UnknownRoute() {
  notFound();
}
