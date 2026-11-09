import { ViewTransition, type ReactNode } from "react";

/**
 * La foto de un profesional como "elemento compartido" entre su tarjeta del catálogo y su perfil:
 * las dos llevan el mismo nombre, y al navegar (ida o vuelta) el navegador lleva la foto de un lugar
 * al otro mientras cambia la página. El vuelo (se agranda en el medio y se acomoda al llegar) está en
 * globals.css, clase `pro-photo`. `default="none"`: no anima en transiciones que no la involucran.
 * Sin soporte de View Transitions, o con movimiento reducido, la página cambia directo.
 */
export function ProfilePhotoTransition({ slug, children }: { slug: string; children: ReactNode }) {
  return (
    <ViewTransition name={`pro-photo-${slug}`} share="pro-photo" default="none">
      {children}
    </ViewTransition>
  );
}
