"use client";

import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { mediaUrl } from "@/lib/media";
import { RemoteImage } from "./remote-image";

interface GalleryItem {
  url: string;
  kind: "IMAGE" | "VIDEO";
}

/**
 * Trabajos del profesional: grilla con la primera foto más grande y un visor a pantalla completa
 * (<dialog> nativo: foco atrapado y Esc). Flechas del teclado o deslizar para pasar; las fotos
 * entran con un fundido y un leve zoom.
 */
export function WorkGallery({ items, name }: { items: GalleryItem[]; name: string }) {
  const images = items.filter((item) => item.kind === "IMAGE");
  const videos = items.filter((item) => item.kind === "VIDEO");
  const [open, setOpen] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open !== null && !dialog.open) dialog.showModal();
    if (open === null && dialog.open) dialog.close();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, [open]);

  const go = (step: number) => setOpen((index) => (index === null ? null : (index + step + images.length) % images.length));

  return (
    <>
      {images.length > 0 && (
        // Con una o dos fotos, más grandes (dos columnas); con más, la primera ocupa el doble.
        <ul className={cn("grid grid-cols-2 gap-3", images.length > 2 && "sm:grid-cols-3")}>
          {images.map((image, index) => (
            <li key={image.url} className={cn(index === 0 && images.length > 2 && "col-span-2 row-span-2")}>
              <button
                type="button"
                onClick={() => setOpen(index)}
                className="group relative block aspect-square w-full overflow-hidden rounded-2xl bg-brand-50"
              >
                <RemoteImage
                  src={image.url}
                  alt={`Trabajo de ${name} (${index + 1} de ${images.length})`}
                  fill
                  sizes={index === 0 ? "(min-width: 1024px) 480px, 66vw" : "(min-width: 1024px) 240px, 33vw"}
                  className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-[1.06]"
                />
                <span className="absolute inset-0 grid place-items-center bg-brand-950/0 transition-colors duration-300 group-hover:bg-brand-950/35">
                  <Expand className="size-7 text-white opacity-0 transition-[opacity,scale] duration-300 ease-out-soft group-hover:opacity-100" aria-hidden="true" />
                </span>
                <span className="sr-only">Ver en grande</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {videos.map((video) => {
        const url = mediaUrl(video.url);
        return url ? (
          <video key={video.url} src={url} controls preload="none" playsInline className="mt-3 w-full rounded-2xl bg-brand-950">
            Tu navegador no puede reproducir este video.
          </video>
        ) : null;
      })}

      <dialog
        ref={dialogRef}
        aria-label={`Trabajos de ${name}`}
        onClose={() => setOpen(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") go(1);
          if (event.key === "ArrowLeft") go(-1);
        }}
        onTouchStart={(event) => {
          touchX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touchX.current;
          const end = event.changedTouches[0]?.clientX;
          if (start !== null && end !== undefined && Math.abs(end - start) > 50) go(end < start ? 1 : -1);
          touchX.current = null;
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-brand-950/95 p-0 backdrop:bg-brand-950/80 open:animate-[fade-in_200ms_ease-out]"
      >
        {open !== null && images[open] && (
          <div className="relative flex h-full flex-col items-center justify-center gap-4 p-4 sm:p-10">
            <div className="relative h-[78dvh] w-full max-w-5xl">
              <RemoteImage
                key={images[open].url}
                src={images[open].url}
                alt={`Trabajo de ${name} (${open + 1} de ${images.length})`}
                fill
                sizes="100vw"
                className="object-contain motion-safe:animate-[pro-zoom_350ms_var(--ease-out-soft)]"
              />
            </div>
            <p className="text-sm text-brand-200" aria-live="polite">
              {open + 1} de {images.length}
            </p>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="absolute top-4 right-4 grid size-12 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            >
              <X className="size-6" aria-hidden="true" />
              <span className="sr-only">Cerrar</span>
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute top-1/2 left-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
                >
                  <ChevronLeft className="size-7" aria-hidden="true" />
                  <span className="sr-only">Anterior</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute top-1/2 right-3 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
                >
                  <ChevronRight className="size-7" aria-hidden="true" />
                  <span className="sr-only">Siguiente</span>
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
