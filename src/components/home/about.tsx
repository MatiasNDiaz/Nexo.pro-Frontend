import { HeartHandshake, MapPin, ShieldCheck } from "lucide-react";
import Image from "next/image";
import type { CSSProperties } from "react";
import { about } from "@/content/home";
import { scenes } from "@/content/photos";

const delay = (ms: number) => ({ "--stage-delay": `${ms}ms` }) as CSSProperties;

/** Un ícono por valor, en el orden de `about.values` (Confianza, Transparencia, Cercanía). */
const valueIcons = [ShieldCheck, HeartHandshake, MapPin] as const;

/**
 * "Quiénes somos" (pedido del fundador: más vida y otra estructura). Arriba, el título y quiénes somos
 * en dos columnas; en el medio, la foto ancha que se abre desde el centro con el objetivo encima, en la
 * serif de exhibición; abajo, los tres valores, que entran uno detrás de otro.
 */
export function About() {
  return (
    <section aria-labelledby="quienes-somos" className="overflow-hidden bg-surface">
      <div data-reveal="stage" className="container-page flex flex-col gap-12 py-20 sm:gap-16 sm:py-28">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
          <h2 id="quienes-somos" className="stage-in text-4xl leading-[1.02] font-bold text-brand-900 sm:text-6xl" style={delay(0)}>
            Quiénes somos
          </h2>
          <p className="stage-in max-w-[56ch] text-lg leading-relaxed text-muted-strong sm:text-xl" style={delay(120)}>
            {about.who}
          </p>
        </div>

        <figure className="stage-open relative isolate min-h-[34rem] overflow-hidden rounded-3xl bg-brand-900 sm:min-h-[30rem]" style={delay(200)}>
          <Image src={scenes.familiaReforma.src} alt={scenes.familiaReforma.alt} fill sizes="(min-width: 1280px) 1200px, 100vw" quality={75} className="-z-10 object-cover" style={{ objectPosition: "62% 20%" }} />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(7_21_42/0.92)_0%,rgb(7_21_42/0.55)_45%,rgb(7_21_42/0.05)_100%)] lg:bg-[linear-gradient(to_right,rgb(7_21_42/0.9)_0%,rgb(7_21_42/0.6)_40%,rgb(7_21_42/0)_75%)]" />
          <figcaption className="flex h-full min-h-[34rem] flex-col justify-end gap-4 p-6 sm:min-h-[30rem] sm:p-10 lg:max-w-[38rem] lg:justify-center lg:p-14">
            <h3 className="stage-in font-display text-xl font-bold text-amber-400" style={delay(700)}>
              Nuestro objetivo
            </h3>
            <p className="stage-in font-serif text-3xl leading-[1.15] text-white italic sm:text-[2.6rem]" style={delay(820)}>
              “{about.goal}”
            </p>
          </figcaption>
        </figure>

        <ul className="grid gap-8 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-line">
          {about.values.map((value, index) => {
            const Icon = valueIcons[index] ?? ShieldCheck;
            return (
              <li key={value.title} className="stage-in group flex flex-col gap-3 sm:px-8 sm:first:pl-0 sm:last:pr-0" style={delay(500 + index * 140)}>
                <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700 transition-[background-color,color,rotate] duration-300 ease-out-soft group-hover:-rotate-6 group-hover:bg-amber-400 group-hover:text-brand-900">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="font-display text-2xl font-bold text-ink">{value.title}</h3>
                <p className="max-w-[34ch] leading-relaxed text-muted-strong">{value.text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
