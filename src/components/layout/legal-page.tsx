import { Mail } from "lucide-react";
import { Alert } from "@/components/ui/feedback";
import { site } from "@/config/site";
import type { LegalDocument } from "@/content/legal";
import { PageHeader } from "./page-header";

const dateFormat = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** Página legal: índice lateral en escritorio, lectura cómoda (≈ 70 caracteres por línea). */
export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <>
      <PageHeader title={document.title} description={document.description} />
      <div className="container-page grid gap-10 py-10 lg:grid-cols-[14rem_1fr] lg:py-14">
        <nav aria-label="Secciones" className="hidden lg:block">
          <ul className="sticky top-24 flex flex-col gap-1 border-l border-line">
            {document.sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="-ml-px block border-l-2 border-transparent py-1.5 pl-4 text-sm text-muted-strong transition-colors hover:border-brand-300 hover:text-brand-800"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <article className="flex max-w-[70ch] flex-col gap-8">
          {document.provisional && (
            <Alert tone="warning" title="Texto provisorio">
              Esta página todavía no tiene su texto definitivo. Lo que se ve es la estructura que va a tener; no
              constituye asesoramiento legal ni reemplaza el documento final.
            </Alert>
          )}
          {document.updatedAt && (
            <p className="text-sm text-muted-strong">
              Última actualización: {dateFormat.format(new Date(`${document.updatedAt}T00:00:00Z`))}
            </p>
          )}

          {document.sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-titulo`}
              data-reveal
              className="flex flex-col gap-3"
            >
              <h2 id={`${section.id}-titulo`} className="text-xl font-semibold text-brand-900">
                {index + 1}. {section.title}
              </h2>
              {section.body.length > 0 ? (
                section.body.map((paragraph, i) => (
                  <p key={i} className="leading-relaxed text-ink">
                    {paragraph}
                  </p>
                ))
              ) : (
                <p className="text-muted-strong italic">Pendiente de redacción.</p>
              )}
            </section>
          ))}

          <section
            aria-labelledby="consultas"
            data-reveal
            className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-6"
          >
            <h2 id="consultas" className="text-lg font-semibold text-brand-900">
              Consultas
            </h2>
            <p className="text-muted">Si tenés dudas sobre este documento, escribinos.</p>
            <a
              href={`mailto:${site.contact.email}`}
              className="inline-flex items-center gap-2 font-medium break-all text-brand-700 underline-offset-4 hover:underline"
            >
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              {site.contact.email}
            </a>
          </section>
        </article>
      </div>
    </>
  );
}
