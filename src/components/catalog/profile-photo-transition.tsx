import { ViewTransition, type ReactNode } from "react";

/** Tipo de transición de las navegaciones que hacen volar la foto (tarjetas, menú y el "atrás"). */
export const PHOTO_NAV = "navegacion";

/**
 * La foto de un profesional como "elemento compartido" entre su tarjeta del catálogo y su perfil:
 * las dos llevan el mismo nombre, y al navegar (ida o vuelta) el navegador lleva la foto de un lugar
 * al otro mientras cambia la página. El vuelo (se agranda en el medio y se acomoda al llegar) está en
 * globals.css, clase `pro-photo`.
 *
 * Solo vuela en navegaciones marcadas con PHOTO_NAV: cuando el perfil termina de cargar, la foto del
 * esqueleto (PendingProfilePhoto) le pasa el lugar a la real sin un segundo vuelo.
 * Sin soporte de View Transitions, o con movimiento reducido, la página cambia directo.
 */
export function ProfilePhotoTransition({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <ViewTransition name={`pro-photo-${slug}`} share={{ [PHOTO_NAV]: "pro-photo", default: "none" }} default="none">
      {children}
    </ViewTransition>
  );
}
