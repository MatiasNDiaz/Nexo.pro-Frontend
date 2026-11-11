"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Crown, ExternalLink, Lock, RotateCcw } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Badge, Skeleton } from "@/components/ui/feedback";
import { PanelTitle } from "@/features/account/settings-section";
import { REVIEWS_PAGE_SIZE } from "@/features/catalog/filters";
import { sectionLabels, themeForLevel, type SectionKey, type SectionStyle, type ThemeLevel, type ThemeSections } from "@/features/catalog/profile-theme";
import { ProfileView } from "@/features/catalog/profile-view";
import { refreshPublicProfile } from "@/features/catalog/refresh-profile";
import type { PublicProfile, ReviewPage } from "@/features/catalog/types";
import { api } from "@/lib/api/client";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { getMyProfile, getSubscription, proKeys, setTheme, type ProfessionalMe } from "./api";
import { SectionStyleMenu } from "./section-style-menu";

const levelOf = (sub: Awaited<ReturnType<typeof getSubscription>> | undefined): ThemeLevel =>
  sub?.live && sub.plan ? (sub.plan.themeLevel as ThemeLevel) : "NONE";

/**
 * Editor de diseño de la página del profesional (ADR 0034 del backend): la página tal cual la ven los
 * clientes, con un menú ⋮ en cada contenedor. Los cambios se ven al instante y recién se guardan con
 * "Aplicar estilos"; después la página pública se actualiza enseguida (refreshPublicProfile).
 */
export function DesignEditor() {
  const me = useQuery({ queryKey: proKeys.me, queryFn: getMyProfile });
  const subscription = useQuery({ queryKey: proKeys.subscription, queryFn: getSubscription });
  const slug = me.data?.slug;
  // La página pública (sin caché: la pide el navegador). Las visitas propias no cuentan en las métricas.
  const profile = useQuery({
    queryKey: ["design", "public", slug],
    queryFn: () => api<PublicProfile>(`/catalog/professionals/${slug}`),
    enabled: !!slug,
    retry: (count, error) => !isApiError(error) && count < 2,
  });
  const reviews = useQuery({
    queryKey: ["design", "reviews", slug],
    queryFn: () => api<ReviewPage>(`/catalog/professionals/${slug}/reviews`, { query: { page: 1, limit: REVIEWS_PAGE_SIZE } }),
    enabled: !!slug,
  });

  const header = <PanelTitle title="Diseño de tu página" description="Tocá ⋮ en cada parte para cambiar sus colores, su tamaño o cómo aparece. Después, Aplicar estilos." />;

  if (me.isPending || subscription.isPending || (slug && profile.isPending)) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando tu página">
        {header}
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-[36rem] w-full rounded-3xl" />
      </div>
    );
  }
  if (me.isError) return <Alert tone="danger" title="No pudimos cargar tu perfil">{errorMessage(me.error)}</Alert>;

  const level = levelOf(subscription.data);
  if (level === "NONE") {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <section className="relative isolate flex flex-col items-start gap-4 overflow-hidden rounded-3xl bg-brand-950 p-6 text-white sm:p-10">
          <span aria-hidden="true" className="absolute -top-24 -right-16 -z-1 size-80 rounded-full bg-[radial-gradient(closest-side,rgb(244_163_64/0.35),transparent)]" />
          <Lock className="size-8 text-amber-400" aria-hidden="true" />
          <h2 className="font-display text-3xl font-bold">Diseñá tu página con Medium o Premium</h2>
          <p className="max-w-[52ch] text-brand-100">
            Con Medium elegís el color de fondo y de letra de cada parte. Con Premium, además, degradés, el tamaño y cómo aparece cada una.
          </p>
          <ButtonLink href="/panel/plan" variant="accent">
            Ver planes
          </ButtonLink>
        </section>
      </div>
    );
  }
  if (profile.isError || !profile.data) {
    return (
      <div className="flex flex-col gap-6">
        {header}
        <Alert tone="warning" title="Tu página todavía no está publicada">
          {isApiError(profile.error) && profile.error.status === 404
            ? "La vas a poder diseñar cuando aparezca en el catálogo (con tu cuenta activa y tu plan vigente)."
            : errorMessage(profile.error)}
        </Alert>
      </div>
    );
  }

  return <Editor key={me.data.slug} me={me.data} profile={profile.data} reviews={reviews.data ?? null} level={level} header={header} />;
}

function Editor({ me, profile, reviews, level, header }: { me: ProfessionalMe; profile: PublicProfile; reviews: ReviewPage | null; level: ThemeLevel; header: ReactNode }) {
  const queryClient = useQueryClient();
  // Base: el tema guardado sin lo que el plan actual no incluye (es lo que se va a poder guardar).
  const saved = themeForLevel(me.theme, level);
  const [draft, setDraft] = useState<ThemeSections>(saved.sections ?? {});
  const [appliedAt, setAppliedAt] = useState<number | null>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved.sections ?? {});

  const apply = useMutation({
    mutationFn: () => setTheme(themeForLevel({ ...saved, sections: draft }, level)),
    onSuccess: async (updated) => {
      queryClient.setQueryData(proKeys.me, updated);
      setDraft(themeForLevel(updated.theme, level).sections ?? {});
      setAppliedAt(Date.now());
      await refreshPublicProfile(me.slug).catch(() => false);
    },
  });

  const change = (key: SectionKey, style: SectionStyle) => {
    setAppliedAt(null);
    setDraft((current) => {
      const next = { ...current };
      if (Object.keys(style).length) next[key] = style;
      else delete next[key];
      return next;
    });
    // Al elegir una animación, se repite en la sección para verla.
    if (style.animation) requestAnimationFrame(() => replay(canvas.current, key));
  };

  return (
    <div className="flex flex-col gap-6">
      {header}

      {/* Barra del editor: queda a la vista al bajar por la página. */}
      <div className="sticky top-16 z-30 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-white/95 p-3 shadow-raised backdrop-blur sm:top-20">
        <Badge tone={level === "EXTENDED" ? "amber" : "electric"}>
          {level === "EXTENDED" && <Crown className="size-3" aria-hidden="true" />}
          {level === "EXTENDED" ? "Premium" : "Medium"}
        </Badge>
        <span className="flex items-center gap-2 text-sm font-medium text-ink">
          <SectionStyleMenu section="pagina" level={level} value={draft.pagina} onChange={(style) => change("pagina", style)} />
          {sectionLabels.pagina}
        </span>
        <span className="ml-auto flex flex-wrap items-center gap-2">
          {dirty && (
            <Button variant="ghost" size="sm" onClick={() => setDraft(saved.sections ?? {})} disabled={apply.isPending}>
              <RotateCcw className="size-4" aria-hidden="true" />
              Descartar
            </Button>
          )}
          <Button onClick={() => apply.mutate()} loading={apply.isPending} disabled={!dirty}>
            Aplicar estilos
          </Button>
        </span>
        {(apply.isError || appliedAt) && (
          <div className="basis-full" aria-live="polite">
            {apply.isError ? (
              <Alert tone="danger">{isApiError(apply.error, "THEME_NOT_IN_PLAN") ? "Tu plan no incluye alguna de esas opciones." : errorMessage(apply.error)}</Alert>
            ) : (
              <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-success-800">
                <CheckCircle2 className="size-4 text-success-600" aria-hidden="true" />
                Listo: tu página ya se ve así.
                <Link href={`/profesionales/${me.slug}` as Route} target="_blank" className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
                  Ver mi página
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">(se abre en otra pestaña)</span>
                </Link>
              </p>
            )}
          </div>
        )}
      </div>

      {/* La página real en vista previa. `inert` no: los menús ⋮ tienen que poder usarse. */}
      <div ref={canvas} className="overflow-x-clip rounded-3xl border border-line bg-canvas shadow-card">
        <ProfileView
          profile={profile}
          reviews={reviews}
          preview
          theme={{ ...saved, sections: draft }}
          frame={(key, node) => (
            <div className="group/sec relative rounded-3xl outline-2 outline-offset-4 outline-transparent transition-[outline-color] hover:outline-electric-500/40 has-[[aria-expanded=true]]:outline-electric-500">
              {node}
              <SectionStyleMenu
                section={key}
                level={level}
                value={draft[key]}
                pageBackground={draft.pagina?.background}
                onChange={(style) => change(key, style)}
                className="absolute top-2 right-2"
              />
            </div>
          )}
        />
      </div>
    </div>
  );
}

/** Vuelve a correr la animación de entrada de una sección (sacando y poniendo data-revealed). */
function replay(root: HTMLElement | null, key: SectionKey) {
  const section = root?.querySelector<HTMLElement>(`[data-section="${key}"]`);
  if (!section) return;
  const targets = [section, ...section.querySelectorAll<HTMLElement>('[data-reveal^="anim-"]')].filter((el) => el.matches('[data-reveal^="anim-"]'));
  for (const el of targets) el.removeAttribute("data-revealed");
  void section.offsetWidth; // fuerza el recálculo para que la animación arranque de nuevo
  for (const el of targets) el.setAttribute("data-revealed", "");
}
