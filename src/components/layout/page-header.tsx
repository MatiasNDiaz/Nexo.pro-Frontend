import Image from "next/image";
import type { ReactNode } from "react";
import type { Photo } from "@/content/photos";
import { cn } from "@/lib/cn";

/**
 * Encabezado de página interna: título, bajada y acciones. Con `photo`, la foto va en un marco a la
 * derecha (abajo en celular) que se descubre al cargar; el texto queda sobre el fondo claro, sin velos.
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
  return (
    <div className={cn("border-b border-line bg-surface", className)}>
      <div
        className={cn(
          "container-page grid gap-8 py-10 sm:py-14",
          photo && "lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-16 lg:py-16",
        )}
      >
        <div className="flex flex-col gap-4 animate-fade-up">
          <h1 className="max-w-[16ch] text-4xl leading-[1.02] font-bold text-brand-900 sm:text-6xl">{title}</h1>
          {description && <p className="max-w-[52ch] text-lg leading-relaxed text-muted-strong">{description}</p>}
          {actions && <div className="mt-2 flex flex-wrap gap-3">{actions}</div>}
        </div>
        {photo && (
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-brand-100 animate-[clip-up_900ms_var(--ease-out-soft)_both] sm:aspect-[2/1] lg:aspect-[4/3]">
            <Image src={photo.src} alt="" fill preload sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}
