import { Hammer, HelpCircle, ShieldCheck } from "lucide-react";

/**
 * Cómo funciona el foro (columna de la lista). Los dos tipos de publicación con su ícono, el mismo que
 * llevan las tarjetas, y una nota de convivencia. Todo lo que dice existe en el backend (ADR 0028:
 * responden clientes y profesionales con plan; en "Busco profesional" el profesional puede proponer
 * un precio; las publicaciones se pueden reportar).
 */
export function ForumGuide() {
  return (
    <section aria-labelledby="como-funciona" className="flex flex-col gap-5 rounded-3xl border border-line bg-surface p-5 shadow-card">
      <h2 id="como-funciona" className="font-display text-xl font-bold text-brand-900">
        Cómo funciona
      </h2>
      <ul className="flex flex-col gap-4">
        <li className="flex gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-electric-50 text-electric-700">
            <HelpCircle className="size-5" aria-hidden="true" />
          </span>
          <p className="text-sm leading-relaxed text-muted-strong">
            <span className="block font-semibold text-ink">Preguntas</span>
            Consultá una duda sobre un arreglo y te responden otros clientes y profesionales.
          </p>
        </li>
        <li className="flex gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-800">
            <Hammer className="size-5" aria-hidden="true" />
          </span>
          <p className="text-sm leading-relaxed text-muted-strong">
            <span className="block font-semibold text-ink">Busco profesional</span>
            Contá qué necesitás, dónde y para cuándo: los profesionales te responden y pueden proponerte un precio.
          </p>
        </li>
        <li className="flex gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-success-50 text-success-800">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <p className="text-sm leading-relaxed text-muted-strong">
            <span className="block font-semibold text-ink">Con respeto</span>
            Si algo no corresponde, reportalo: nuestro equipo lo revisa.
          </p>
        </li>
      </ul>
    </section>
  );
}
