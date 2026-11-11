"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Circle, Copy, ExternalLink, EyeOff, Palette, Pencil } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Alert, Skeleton } from "@/components/ui/feedback";
import { toast } from "@/components/ui/toast";
import { PanelTitle } from "@/features/account/settings-section";
import { REVIEWS_PAGE_SIZE } from "@/features/catalog/filters";
import { ProfileView } from "@/features/catalog/profile-view";
import type { ReviewPage } from "@/features/catalog/types";
import { api } from "@/lib/api/client";
import { errorMessage } from "@/lib/api/errors";
import { getOwnPublicPage, proKeys, type OwnPublicPage, type PublicationRequirement } from "./api";

/** Qué le falta, dicho para el profesional, y dónde se resuelve. Mismo orden que el backend. */
export const requirementSteps: Record<PublicationRequirement, { label: string; action: string; href: Route }> = {
  ACCOUNT_NOT_ACTIVE: { label: "Activá tu cuenta: confirmá tu email y completá los pasos del inicio", action: "Ver los pasos", href: "/panel" },
  ACCOUNT_RESTRICTED: { label: "Tu cuenta está suspendida o bloqueada", action: "Ver la sanción", href: "/panel/moderacion" },
  IDENTITY_NOT_VERIFIED: { label: "Verificá tu identidad", action: "Verificar", href: "/panel/verificacion" },
  NO_AVATAR: { label: "Subí una foto de perfil donde se vea tu cara", action: "Subir foto", href: "/panel/cuenta" },
  NO_BIO: { label: "Escribí una descripción de lo que hacés", action: "Escribirla", href: "/panel/perfil" },
  NO_PROFESSION: { label: "Elegí al menos un oficio", action: "Elegir", href: "/panel/perfil" },
  NO_SERVICE_AREA: { label: "Elegí al menos una zona donde trabajás", action: "Elegir", href: "/panel/perfil" },
  NO_LIVE_PLAN: { label: "Tu prueba gratis o tu plan vencieron", action: "Ver planes", href: "/panel/plan" },
  PROFILE_DEACTIVATED: { label: "Tu perfil está pausado", action: "Escribirnos", href: "/panel/soporte" },
  PROFILE_HIDDEN: { label: "Tenés la sanción “perfil oculto” vigente", action: "Ver la sanción", href: "/panel/moderacion" },
};

/**
 * Mi página (pedido del fundador del 11/11/2026): cómo la ven los clientes aunque todavía no esté
 * publicada, y qué le falta para publicarla, cada cosa con un enlace a donde se resuelve. Publicada,
 * ofrece copiar el enlace para compartirlo. No cuenta como visita en las métricas.
 */
export function OwnPageScreen() {
  const page = useQuery({ queryKey: proKeys.publicPage, queryFn: getOwnPublicPage });
  const slug = page.data?.profile.slug;
  // Las reseñas son públicas: solo existen (y se pueden pedir) con la página publicada.
  const reviews = useQuery({
    queryKey: ["catalog", "reviews", slug],
    queryFn: () => api<ReviewPage>(`/catalog/professionals/${slug}/reviews`, { query: { page: 1, limit: REVIEWS_PAGE_SIZE } }),
    enabled: !!page.data?.published,
  });

  const header = <PanelTitle title="Mi página" description="Así te ven los clientes cuando te encuentran en el catálogo." />;
  if (page.isPending) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando tu página">
        {header}
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-[36rem] w-full rounded-3xl" />
      </div>
    );
  }
  if (page.isError) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <Alert tone="danger" title="No pudimos cargar tu página">
          {errorMessage(page.error)}
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {header}
      {page.data.published ? <Published slug={page.data.profile.slug} /> : <Missing missing={page.data.missing} />}
      <Preview page={page.data} reviews={reviews.data ?? null} />
    </div>
  );
}

function Published({ slug }: { slug: string }) {
  const path = `/profesionales/${slug}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${path}`);
      toast({ title: "Enlace copiado", description: "Pegalo donde quieras: WhatsApp, redes, tu tarjeta.", tone: "success" });
    } catch {
      toast({ title: "No pudimos copiar el enlace", description: `Copialo a mano: ${window.location.origin}${path}`, tone: "error" });
    }
  };
  return (
    <section aria-labelledby="pagina-estado" className="flex flex-col gap-4 rounded-2xl border border-success-600/25 bg-success-50/70 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 size-6 shrink-0 text-success-600" aria-hidden="true" />
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id="pagina-estado" className="text-lg font-semibold text-ink">
            Tu página está publicada
          </h2>
          <p className="text-sm text-muted-strong">Cualquiera la encuentra en el catálogo y la puede abrir con este enlace:</p>
          <p className="text-sm font-semibold text-ink [overflow-wrap:anywhere]">{path}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copy}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-semibold text-brand-800 shadow-xs transition-colors hover:border-brand-200 hover:bg-brand-50"
        >
          <Copy className="size-4" aria-hidden="true" />
          Copiar enlace
        </button>
        <Link
          href={path as Route}
          target="_blank"
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-800 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-900"
        >
          Abrir
          <ExternalLink className="size-4" aria-hidden="true" />
          <span className="sr-only">(se abre en otra pestaña)</span>
        </Link>
      </div>
    </section>
  );
}

function Missing({ missing }: { missing: PublicationRequirement[] }) {
  return (
    <section aria-labelledby="pagina-estado" className="flex flex-col gap-4 rounded-2xl border border-amber-400/60 bg-amber-50 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <EyeOff className="mt-0.5 size-6 shrink-0 text-amber-800" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <h2 id="pagina-estado" className="text-lg font-semibold text-ink">
            Tu página todavía no se ve en el catálogo
          </h2>
          <p className="text-sm text-muted-strong">
            {missing.length === 1 ? "Te falta una cosa" : `Te faltan ${missing.length} cosas`} para publicarla. Abajo la ves como la van a ver los clientes.
          </p>
        </div>
      </div>
      <ol className="flex flex-col gap-2">
        {missing.map((requirement) => {
          const step = requirementSteps[requirement];
          return (
            <li key={requirement} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl bg-surface px-4 py-3 ring-1 ring-line">
              <span className="flex items-center gap-2.5 text-sm font-medium text-ink">
                <Circle className="size-4 shrink-0 text-amber-700" aria-hidden="true" />
                {step.label}
              </span>
              <Link href={step.href} className="text-sm font-semibold text-brand-700 hover:underline">
                {step.action}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Preview({ page, reviews }: { page: OwnPublicPage; reviews: ReviewPage | null }) {
  return (
    <section aria-labelledby="vista-previa" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="vista-previa" className="text-xl font-semibold text-brand-900">
          Vista previa
        </h2>
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/panel/perfil" variant="secondary" size="sm">
            <Pencil className="size-4" aria-hidden="true" />
            Editar mi perfil
          </ButtonLink>
          <ButtonLink href="/panel/perfil/diseno" variant="secondary" size="sm">
            <Palette className="size-4" aria-hidden="true" />
            Cambiar el diseño
          </ButtonLink>
        </div>
      </div>
      {/* Solo para mirar: `inert` evita tocar botones que en la vista previa no hacen nada. */}
      <div inert className="overflow-x-clip rounded-3xl border border-line bg-canvas shadow-card">
        <ProfileView profile={page.profile} reviews={reviews} preview />
      </div>
    </section>
  );
}
