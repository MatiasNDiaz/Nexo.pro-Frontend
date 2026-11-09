"use client";

import { useEffect } from "react";
import { ProfilePhotoTransition } from "./profile-photo-transition";

/*
 * Primer toque en una tarjeta sin el perfil precargado: Next muestra el esqueleto mientras llegan los
 * datos, y sin una foto con el mismo nombre en el esqueleto la foto de la tarjeta no tendría adónde
 * volar. Por eso, al tocar una tarjeta se recuerda un instante qué foto era, y el esqueleto la muestra
 * en el mismo lugar que tendrá la real (que después la reemplaza sin moverse).
 */

interface Pending {
  slug: string;
  src: string;
}

let pending: Pending | null = null;
/** Solo vale para la navegación que sigue al toque (un toque viejo no puede mostrar otra cara). */
const VALID_MS = 5000;

/** En el catálogo: anota la foto de la tarjeta que se toca. */
export function PhotoStash() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href^="/profesionales/"]');
      const img = link?.closest("article")?.querySelector<HTMLImageElement>("img[data-pro-photo]");
      if (!img?.dataset.proPhoto) return;
      const photo = { slug: img.dataset.proPhoto, src: img.currentSrc || img.src };
      pending = photo;
      setTimeout(() => {
        if (pending === photo) pending = null;
      }, VALID_MS);
    };
    // En captura: antes de que el enlace empiece la navegación.
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}

/** En el esqueleto del perfil: la foto recién tocada, lista para recibir el vuelo. */
export function PendingProfilePhoto() {
  // Se lee al renderizar a propósito: el esqueleto se arma en el mismo momento del toque. En el
  // servidor y al hidratar no hay nada anotado, así que coinciden.
  const photo = pending;
  if (!photo) return null;
  return (
    <ProfilePhotoTransition slug={photo.slug}>
      {/* Es la misma imagen ya descargada de la tarjeta (currentSrc): no pasa de nuevo por next/image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.src} alt="" className="absolute inset-0 size-full object-cover" />
    </ProfilePhotoTransition>
  );
}
