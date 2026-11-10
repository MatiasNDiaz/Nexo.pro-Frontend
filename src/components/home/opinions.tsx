import { Quote, Star } from "lucide-react";
import { getPublishedOpinions, type PlatformReview } from "@/features/platform-reviews/data";
import { cn } from "@/lib/cn";

/**
 * "Lo que dicen de Repara Ya": opiniones reales publicadas por el equipo (nunca inventadas). Si no hay
 * ninguna, la sección no aparece. Con 4 o más corren en una cinta que se frena al pasar el mouse; con
 * movimiento reducido o pocas, quedan quietas en grilla.
 */
export async function Opinions() {
  const opinions = await getPublishedOpinions();
  if (opinions.length === 0) return null;
  const marquee = opinions.length >= 4;

  return (
    <section aria-labelledby="opiniones" className="overflow-hidden bg-surface">
      <div className="container-page flex flex-col gap-3 pt-20 sm:pt-28">
        <h2 id="opiniones" className="max-w-[18ch] text-4xl leading-[1.02] font-bold text-brand-900 sm:text-6xl">
          Lo que dicen de Repara Ya.
        </h2>
      </div>
      {marquee ? (
        <div className="group relative mt-10 pb-20 sm:pb-28 [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          {/* La lista va dos veces para que la cinta no tenga corte; la copia no se lee en voz alta. */}
          <div className="flex w-max gap-4 motion-safe:animate-[opinions-marquee_60s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:flex-wrap">
            {[opinions, opinions].map((list, copy) => (
              <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex gap-4">
                {list.map((opinion) => (
                  <li key={`${copy}-${opinion.id}`} className="w-[20rem] shrink-0 sm:w-[24rem]">
                    <OpinionCard opinion={opinion} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      ) : (
        <ul className="container-page mt-10 grid gap-4 pb-20 sm:grid-cols-2 sm:pb-28 lg:grid-cols-3">
          {opinions.map((opinion) => (
            <li key={opinion.id} data-reveal>
              <OpinionCard opinion={opinion} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function OpinionCard({ opinion }: { opinion: PlatformReview }) {
  return (
    <figure className="flex h-full flex-col gap-4 rounded-3xl border border-line bg-canvas p-6 transition-[border-color,translate] duration-300 ease-out-soft hover:-translate-y-1 hover:border-brand-200">
      <div className="flex items-center justify-between">
        <span role="img" aria-label={`${opinion.rating} de 5`} className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star key={n} className={cn("size-4", n <= opinion.rating ? "fill-amber-400 text-amber-500" : "text-line-strong")} aria-hidden="true" />
          ))}
        </span>
        <Quote className="size-6 text-brand-200" aria-hidden="true" />
      </div>
      {opinion.comment && <blockquote className="flex-1 leading-relaxed text-ink">{opinion.comment}</blockquote>}
      <figcaption className="font-semibold text-brand-800">{opinion.author.displayName}</figcaption>
    </figure>
  );
}
