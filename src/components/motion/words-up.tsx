import { Fragment } from "react";

/**
 * Título que entra palabra por palabra desde abajo de su propia máscara (CSS, visible sin
 * JavaScript; con movimiento reducido aparece directo). `delay` en milisegundos.
 * El espacio va entre las máscaras, no adentro: al final de un inline-block el navegador lo descarta
 * y las palabras quedarían pegadas.
 */
export function WordsUp({ text, delay = 0 }: { text: string; delay?: number }) {
  return text.split(" ").map((word, index) => (
    <Fragment key={`${word}-${index}`}>
      {index > 0 && " "}
      <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
        <span className="inline-block animate-[word-up_700ms_var(--ease-out-soft)_both]" style={{ animationDelay: `${delay + index * 55}ms` }}>
          {word}
        </span>
      </span>
    </Fragment>
  ));
}
