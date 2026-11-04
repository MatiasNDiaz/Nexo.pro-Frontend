import { ViewTransition, type ReactNode } from "react";

/**
 * A diferencia del layout, el template se vuelve a montar en cada navegación: así cada cambio de
 * página tiene su salida y su entrada (fundido corto con un leve desplazamiento; ver globals.css).
 * `default="none"` evita animar en transiciones que no son de navegación.
 */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <div className="flex flex-1 flex-col">{children}</div>
    </ViewTransition>
  );
}
