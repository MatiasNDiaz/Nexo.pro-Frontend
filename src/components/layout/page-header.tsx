import Image from "next/image";
import type { ReactNode } from "react";
import type { Photo } from "@/content/photos";
import { cn } from "@/lib/cn";

/**
 * Encabezado de página interna: título, bajada y acciones. Con `photo`, una franja de lado a lado
 * con la foto y un degradado azul noche que asegura el contraste del texto (blanco sobre ≥ 85 % de
 * opacidad del lado del texto). Sin antetítulo en mayúsculas (auditoría de diseño).
 */
export function PageHeader({
  title,
  description,
  actions,
  photo,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  photo?: Photo;
  className?: string;
}) {
  if (photo) {
    return (
      <div className={cn("relative isolate overflow-hidden bg-brand-950", className)}>
        <Image src={photo.src} alt="" fill preload sizes="100vw" className="-z-20 object-cover" />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-t from-brand-950/95 via-brand-950/70 to-brand-950/15 sm:bg-linear-to-r sm:from-brand-950/95 sm:via-brand-950/75 sm:to-brand-950/15"
        />
        <div className="container-page flex min-h-80 flex-col justify-end gap-4 py-10 sm:min-h-80 sm:flex-row sm:items-end sm:justify-between sm:py-14">
          <div className="flex max-w-2xl flex-col gap-3 animate-fade-up">
            <h1 className="text-4xl leading-[1.02] font-bold text-white sm:text-5xl">{title}</h1>
            {description && <p className="text-lg leading-relaxed text-brand-100">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
        </div>
      </div>
    );
  }
  return (
    <div className={cn("border-b border-line bg-surface", className)}>
      <div className="container-page flex flex-col gap-4 py-10 sm:flex-row sm:items-end sm:justify-between sm:py-14">
        <div className="flex max-w-2xl flex-col gap-3 animate-fade-up">
          <h1 className="text-4xl leading-[1.02] font-bold text-brand-900 sm:text-5xl">{title}</h1>
          {description && <p className="text-lg leading-relaxed text-muted-strong">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 gap-3">{actions}</div>}
      </div>
    </div>
  );
}
