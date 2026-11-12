import type { ReactNode } from "react";
import { PageEnter } from "@/components/motion/page-enter";

/**
 * A diferencia del layout, el template se vuelve a montar en cada navegación: así cada página nueva
 * tiene su entrada (fundido corto con un leve desplazamiento; ver PageEnter y globals.css).
 */
export default function SiteTemplate({ children }: { children: ReactNode }) {
  return <PageEnter>{children}</PageEnter>;
}
