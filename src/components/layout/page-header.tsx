import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";
import { WordsUp } from "@/components/motion/words-up";
import type { Photo } from "@/content/photos";
import { cn } from "@/lib/cn";

/**
 * Encabezado de página interna: título, bajada y acciones.
 *
 * Con `photo`, un banner de lado a lado (pedido del fundador: fotos anchas que representen cada
 * sección). La foto se asienta al cargar (de 1,06 a 1, sin pasar por transparente), el título sube
 * palabra por palabra y la bajada entra después: es el único momento animado del encabezado. El texto
 * va sobre un degradé del azul noche del sitio, más denso abajo a la izquierda, donde está el texto:
 * el blanco y el brand-100 superan 4,5:1 sobre cualquier parte de la foto.
 *
 * Sin `photo`, la versión clara de siempre (páginas internas y de sistema).
 */
export function PageHeader({
  title,
  description,
  actions,
  photo,
  focus = "50% 50%",
  highlights,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  photo?: Photo;
  /** Punto de la foto que tiene que quedar a la vista al recortarla (object-position). */
  focus?: string;
  /** Datos clave de la sección, debajo de la bajada (solo con `photo`). */
  highlights?: { icon: LucideIcon; label: string }[];
  className?: string;
}) {
  if (!photo) {
    return (
      <div className={cn("border-b border-line bg-surface", className)}>
        <div className="container-page flex flex-col gap-4 py-10 animate-fade-up sm:py-14">
          <h1 className="max-w-[16ch] text-4xl leading-[1.02] font-bold text-brand-900 sm:text-6xl">{title}</h1>
          {description && <p className="max-w-[52ch] text-lg leading-relaxed text-muted-strong">{description}</p>}
          {actions && <div className="mt-2 flex flex-wrap gap-3">{actions}</div>}
        </div>
      </div>
    );
  }

  return (
    <header className={cn("relative isolate overflow-hidden bg-brand-950 text-white", className)}>
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src={photo.src}
          alt=""
          fill
          preload
          quality={75}
          sizes="100vw"
          className="object-cover motion-safe:animate-[banner-settle_1600ms_var(--ease-out-soft)_both]"
          style={{ objectPosition: focus }}
        />
        {/*
          Velo suave (pedido del fundador: menos azul). Con el texto centrado abajo, se oscurece la franja
          inferior de borde a borde y la parte de arriba (las caras) queda casi limpia.
        */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(7_21_42/0.9)_0%,rgb(7_21_42/0.62)_38%,rgb(7_21_42/0.12)_72%,rgb(7_21_42/0.05)_100%)]" />
      </div>
      {/* Alto: las fotos entran casi enteras. Contenido centrado (pedido del fundador). */}
      <div className="container-page flex min-h-[28rem] flex-col items-center justify-end gap-4 pt-24 pb-10 text-center sm:min-h-[32rem] sm:pb-12 lg:min-h-[38rem] lg:pb-14">
        <h1 className="max-w-[20ch] text-4xl leading-[1.02] font-bold tracking-[-0.02em] text-balance [text-shadow:0_2px_18px_rgb(7_21_42/0.5)] sm:text-6xl">
          {typeof title === "string" ? <WordsUp text={title} /> : title}
        </h1>
        {description && (
          <p className="max-w-[58ch] text-lg leading-relaxed text-pretty text-brand-100 [text-shadow:0_1px_10px_rgb(7_21_42/0.55)] animate-fade-up [animation-delay:350ms]">
            {description}
          </p>
        )}
        {highlights && highlights.length > 0 && (
          <ul className="mt-2 flex flex-wrap justify-center gap-2 animate-fade-up [animation-delay:450ms]">
            {highlights.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 rounded-full bg-brand-950/55 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm"
              >
                <item.icon className="size-4 text-amber-400" aria-hidden="true" />
                {item.label}
              </li>
            ))}
          </ul>
        )}
        {actions && <div className="mt-2 flex flex-wrap justify-center gap-3 animate-fade-up [animation-delay:500ms]">{actions}</div>}
        {/* Línea de acento que se dibuja desde el centro al final de la entrada. */}
        <span aria-hidden="true" className="mt-3 block h-1 w-16 rounded-full bg-amber-400 motion-safe:animate-[banner-line_700ms_var(--ease-out-soft)_600ms_both]" />
      </div>
    </header>
  );
}
