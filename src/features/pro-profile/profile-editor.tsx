"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Check, FileBadge, ImagePlus, Loader2, Lock, MapPin, Plus, Star, Trash2, Video } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { RemoteImage } from "@/components/catalog/remote-image";
import { ShineLink } from "@/components/home/shine-link";
import { Button } from "@/components/ui/button";
import { Alert, Badge, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/form-controls";
import { Listbox } from "@/components/ui/listbox";
import { AvatarCard } from "@/features/account/avatar-card";
import { PanelTitle, SettingsSection } from "@/features/account/settings-section";
import { useMe } from "@/features/account/use-me";
import { themeAnimations, themeColors, themeFonts, themeStyle, type ThemeColor } from "@/features/catalog/profile-theme";
import { useLocalities, useProfessions, useProvinces } from "@/features/catalogs/queries";
import { addCertification, removeCertification } from "@/features/pro-work/api";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { ACCEPTED_TYPES, kindOf, uploadFile } from "@/lib/uploads";
import {
  addMedia,
  BIO_MAX,
  BUSINESS_NAME_MAX,
  getMyProfile,
  getSubscription,
  HEADLINE_MAX,
  proKeys,
  rateModes,
  removeMedia,
  reorderMedia,
  replaceProfessions,
  replaceServiceAreas,
  replaceSocialLinks,
  setTheme,
  SOCIAL_URL_MAX,
  socialNetworks,
  themeAllows,
  updateProfile,
  YEARS_MAX,
  type MediaItem,
  type ProfessionalMe,
  type RateMode,
  type Theme,
} from "./api";

/** Errores del plan con un texto claro (el backend ya trae uno, en castellano). */
function planError(error: unknown): string {
  if (isApiError(error, "SUBSCRIPTION_REQUIRED")) return "Necesitás un plan vigente para cambiar esto.";
  return errorMessage(error);
}

/**
 * Mi perfil profesional: lo que ven los clientes en la página pública, sección por sección. Cada
 * sección se guarda por separado y la caché queda con el perfil que devuelve el backend.
 */
export function ProfileEditor() {
  const profile = useQuery({ queryKey: proKeys.me, queryFn: getMyProfile });
  const subscription = useQuery({ queryKey: proKeys.subscription, queryFn: getSubscription });

  if (profile.isPending) {
    return (
      <div className="flex flex-col gap-6" aria-busy="true" aria-label="Cargando tu perfil">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-72 w-full rounded-3xl" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }
  if (profile.isError) return <Alert tone="danger" title="No pudimos cargar tu perfil">{errorMessage(profile.error)}</Alert>;

  const me = profile.data;
  const sub = subscription.data;
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PanelTitle title="Mi perfil profesional" description="Lo que ven los clientes cuando te encuentran en el catálogo." />
        <ShineLink href={`/profesionales/${me.slug}` as Route} target="_blank" className="h-11 px-5 text-sm">
          Ver mi página
        </ShineLink>
      </div>
      <Completeness me={me} />
      {sub && !sub.live && (
        <Alert tone="warning" title="Tu perfil no aparece en el catálogo">
          Tu plan no está vigente. Podés editar tus datos, pero para aparecer y sumar fotos necesitás un plan.
        </Alert>
      )}
      <CoverSection me={me} allowed={themeAllows(sub, "STANDARD")} allowsVideo={themeAllows(sub, "EXTENDED")} />
      <AvatarCard />
      <DetailsSection me={me} />
      <MediaSection me={me} maxImages={sub?.plan?.maxImages ?? 0} maxVideos={sub?.plan?.maxVideos ?? 0} />
      <ProfessionsSection me={me} max={sub?.plan?.maxProfessions ?? 1} />
      <AreasSection me={me} />
      <CertificatesSection me={me} />
      <SocialsSection me={me} />
      <ThemeSection me={me} level={themeAllows(sub, "EXTENDED") ? "EXTENDED" : themeAllows(sub, "STANDARD") ? "STANDARD" : "NONE"} />
    </div>
  );
}

/** Cuánto del perfil está completo: una barra que se llena y lo que falta, con enlace a cada parte. */
function Completeness({ me }: { me: ProfessionalMe }) {
  const user = useMe();
  const work = me.media.filter((m) => m.purpose !== "BANNER");
  const steps = [
    { done: !!user.avatarUrl, label: "Foto de perfil", href: "#foto" },
    { done: !!me.bio, label: "Descripción", href: "#datos" },
    { done: work.length > 0, label: "Fotos de tus trabajos", href: "#trabajos" },
    { done: me.referenceRate !== null || me.freeQuote, label: "Tarifa o presupuesto sin cargo", href: "#datos" },
    { done: me.yearsExperience !== null, label: "Años de experiencia", href: "#datos" },
    { done: me.serviceAreas.length > 0, label: "Zonas de trabajo", href: "#zonas" },
  ];
  const done = steps.filter((s) => s.done).length;
  const percent = Math.round((done / steps.length) * 100);
  return (
    <section aria-label="Perfil completo" className="flex flex-col gap-4 rounded-3xl bg-brand-950 p-5 text-white sm:p-6">
      <div className="flex items-end justify-between gap-4">
        <p className="font-display text-xl font-bold">{percent === 100 ? "¡Tu perfil está completo!" : "Completá tu perfil para generar más confianza"}</p>
        <span className="font-display text-3xl font-bold text-amber-400 tabular-nums">{percent}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Perfil completo">
        <div className="h-full origin-left rounded-full bg-linear-to-r from-amber-400 to-amber-100 transition-[width] duration-700 ease-out-soft" style={{ width: `${percent}%` }} />
      </div>
      {percent < 100 && (
        <ul className="flex flex-wrap gap-2">
          {steps
            .filter((s) => !s.done)
            .map((s) => (
              <li key={s.label}>
                <a href={s.href} className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/10 px-3 text-sm font-medium text-white transition-colors hover:bg-white/20">
                  <Plus className="size-3.5" aria-hidden="true" />
                  {s.label}
                </a>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}

/** Sube un archivo y lo suma al perfil con el uso indicado. Devuelve el perfil actualizado. */
function useAddMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, purpose }: { file: File; purpose: MediaItem["purpose"] }) => {
      const uploaded = await uploadFile(file, "PROFILE_MEDIA");
      return addMedia(uploaded.id, purpose);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: proKeys.me }),
  });
}

function CoverSection({ me, allowed, allowsVideo }: { me: ProfessionalMe; allowed: boolean; allowsVideo: boolean }) {
  const user = useMe();
  const inputId = useId();
  const queryClient = useQueryClient();
  const banner = me.media.find((m) => m.purpose === "BANNER") ?? null;
  const add = useAddMedia();
  const remove = useMutation({
    mutationFn: (id: string) => removeMedia(id),
    onSettled: () => queryClient.invalidateQueries({ queryKey: proKeys.me }),
  });
  const accept = [...ACCEPTED_TYPES.IMAGE, ...(allowsVideo ? ACCEPTED_TYPES.VIDEO : [])].join(",");

  return (
    <section id="portada" aria-labelledby="portada-titulo" className="flex scroll-mt-24 flex-col gap-4">
      <h2 id="portada-titulo" className="text-lg font-semibold text-brand-900">
        Portada
      </h2>
      {/* Vista previa de la cabecera pública, con la portada y la foto encima. */}
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-card" style={themeStyle(me.theme)}>
        <div className="relative h-40 bg-[linear-gradient(135deg,var(--pro-from),var(--pro-to))] sm:h-56">
          {banner?.url &&
            (banner.kind === "IMAGE" ? (
              <RemoteImage src={banner.url} alt="Tu portada" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
            ) : (
              <video src={banner.url} autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" aria-label="Tu portada en video" />
            ))}
          {(add.isPending || remove.isPending) && (
            <span className="absolute inset-0 grid place-items-center bg-brand-950/50 text-white">
              <Loader2 className="size-8 animate-spin" aria-label="Guardando" />
            </span>
          )}
          {!allowed && (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-brand-950/60 p-4 text-center text-white backdrop-blur-[2px]">
              <Lock className="size-6 text-amber-400" aria-hidden="true" />
              <span className="font-semibold">La portada personalizada está en los planes Medium y Premium</span>
            </span>
          )}
        </div>
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between sm:p-5">
          <div className="flex items-end gap-4">
            <span className="relative -mt-14 size-20 shrink-0 overflow-hidden rounded-2xl bg-brand-800 ring-4 ring-surface sm:-mt-16 sm:size-24">
              {user.avatarUrl ? (
                <RemoteImage src={user.avatarUrl} alt="" fill sizes="96px" className="object-cover" />
              ) : (
                <span className="grid size-full place-items-center font-display text-2xl font-bold text-brand-200">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </span>
              )}
            </span>
            <p className="pb-1 text-sm text-muted-strong">{allowsVideo ? "Foto o video corto, horizontal." : "Una foto horizontal de tu trabajo o tu taller."}</p>
          </div>
          {allowed && (
            <div className="flex flex-wrap gap-2">
              <label
                htmlFor={inputId}
                className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-brand-700 px-5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-brand-800 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-electric-500"
              >
                <ImagePlus className="size-4" aria-hidden="true" />
                {banner ? "Cambiar portada" : "Subir portada"}
                <input
                  id={inputId}
                  type="file"
                  accept={accept}
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    if (file) add.mutate({ file, purpose: "BANNER" });
                  }}
                />
              </label>
              {banner && (
                <Button variant="ghost" onClick={() => remove.mutate(banner.id)} className="text-danger-600 hover:bg-danger-50">
                  <Trash2 className="size-4" aria-hidden="true" />
                  Quitar
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
      {(add.isError || remove.isError) && <Alert tone="danger">{planError(add.error ?? remove.error)}</Alert>}
    </section>
  );
}

function DetailsSection({ me }: { me: ProfessionalMe }) {
  const id = useId();
  const queryClient = useQueryClient();
  const [businessName, setBusinessName] = useState(me.businessName ?? "");
  const [bio, setBio] = useState(me.bio ?? "");
  const [years, setYears] = useState(me.yearsExperience?.toString() ?? "");
  const [rate, setRate] = useState(me.referenceRate ? String(Math.round(Number(me.referenceRate))) : "");
  const [rateMode, setRateMode] = useState<RateMode | "">(me.rateMode ?? "");
  const [flags, setFlags] = useState({ freeQuote: me.freeQuote, hasMobility: me.hasMobility, worksWithTeam: me.worksWithTeam });
  const save = useMutation({
    mutationFn: () =>
      updateProfile({
        businessName: (businessName.trim() || null) as never,
        bio: (bio.trim() || null) as never,
        yearsExperience: (years === "" ? null : Number(years)) as never,
        referenceRate: (rate === "" ? null : Number(rate)) as never,
        rateMode: rate === "" ? null : rateMode || null,
        ...flags,
      }),
    onSuccess: (updated) => queryClient.setQueryData(proKeys.me, updated),
  });
  const rateIncomplete = rate !== "" && !rateMode;

  return (
    <SettingsSection id="datos" title="Datos del perfil" description="Contá quién sos y cómo trabajás. Es lo primero que leen.">
      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (!rateIncomplete) save.mutate();
        }}
      >
        <Field id={`${id}-negocio`} label="Nombre comercial (opcional)" hint={`Si trabajás con una marca. ${businessName.length}/${BUSINESS_NAME_MAX}`}>
          {(a11y) => <Input {...a11y} value={businessName} onChange={(e) => setBusinessName(e.target.value)} maxLength={BUSINESS_NAME_MAX} />}
        </Field>
        <Field id={`${id}-bio`} label="Descripción" hint={`Qué hacés, tu experiencia y por qué elegirte. ${bio.length}/${BIO_MAX}`}>
          {(a11y) => <Textarea {...a11y} value={bio} onChange={(e) => setBio(e.target.value)} maxLength={BIO_MAX} rows={4} />}
        </Field>
        <div className="grid gap-5 sm:grid-cols-3">
          <Field id={`${id}-anios`} label="Años de experiencia">
            {(a11y) => <Input {...a11y} type="number" inputMode="numeric" min={0} max={YEARS_MAX} value={years} onChange={(e) => setYears(e.target.value)} />}
          </Field>
          <Field id={`${id}-tarifa`} label="Tarifa de referencia" hint="En pesos, sin puntos.">
            {(a11y) => <Input {...a11y} type="number" inputMode="numeric" min={0} value={rate} onChange={(e) => setRate(e.target.value)} placeholder="$" />}
          </Field>
          <Field id={`${id}-modo`} label="Cómo cobrás" error={rateIncomplete ? "Elegí cómo cobrás esa tarifa." : undefined}>
            {(a11y) => (
              <Listbox {...a11y} value={rateMode} onChange={(value) => setRateMode(value as RateMode)} placeholder="Elegí" options={rateModes} />
            )}
          </Field>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Toggle label="Presupuesto sin cargo" checked={flags.freeQuote} onChange={(v) => setFlags({ ...flags, freeQuote: v })} />
          <Toggle label="Tengo movilidad propia" checked={flags.hasMobility} onChange={(v) => setFlags({ ...flags, hasMobility: v })} />
          <Toggle label="Trabajo con equipo" checked={flags.worksWithTeam} onChange={(v) => setFlags({ ...flags, worksWithTeam: v })} />
        </div>
        <SaveRow pending={save.isPending} saved={save.isSuccess} error={save.isError ? planError(save.error) : null} />
      </form>
    </SettingsSection>
  );
}

function MediaSection({ me, maxImages, maxVideos }: { me: ProfessionalMe; maxImages: number; maxVideos: number }) {
  const inputId = useId();
  const queryClient = useQueryClient();
  const add = useAddMedia();
  const media = [...me.media].sort((a, b) => a.position - b.position);
  const work = media.filter((m) => m.purpose !== "BANNER");
  const images = work.filter((m) => m.kind === "IMAGE").length;
  const videos = work.filter((m) => m.kind === "VIDEO").length;
  const canAddImage = images < maxImages;
  const canAddVideo = videos < maxVideos;
  const remove = useMutation({ mutationFn: (id: string) => removeMedia(id), onSettled: () => queryClient.invalidateQueries({ queryKey: proKeys.me }) });
  const reorder = useMutation({
    mutationFn: (ids: string[]) => reorderMedia(ids),
    onMutate: (ids) =>
      queryClient.setQueryData<ProfessionalMe>(proKeys.me, (current) =>
        current ? { ...current, media: current.media.map((m) => ({ ...m, position: ids.indexOf(m.id) })) } : current,
      ),
    onSuccess: (updated) => queryClient.setQueryData(proKeys.me, updated),
  });
  // El backend pide el orden de TODOS los medios (portada incluida): la portada va primero.
  const move = (index: number, step: number) => {
    const ids = work.map((m) => m.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(index + step, 0, moved!);
    reorder.mutate([...media.filter((m) => m.purpose === "BANNER").map((m) => m.id), ...ids]);
  };
  const accept = [...(canAddImage ? ACCEPTED_TYPES.IMAGE : []), ...(canAddVideo ? ACCEPTED_TYPES.VIDEO : [])].join(",");

  return (
    <SettingsSection
      id="trabajos"
      title="Fotos y videos de tus trabajos"
      description={`Tu plan permite ${maxImages} fotos y ${maxVideos} ${maxVideos === 1 ? "video" : "videos"}. La primera es la que más se ve.`}
    >
      <div className="flex flex-wrap gap-3 text-sm text-muted-strong">
        <Badge tone={canAddImage ? "neutral" : "amber"}>
          Fotos {images} de {maxImages}
        </Badge>
        <Badge tone={canAddVideo || maxVideos === 0 ? "neutral" : "amber"}>
          Videos {videos} de {maxVideos}
        </Badge>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {work.map((item, index) => (
          <li key={item.id} className="group relative aspect-square overflow-hidden rounded-2xl bg-brand-50 ring-1 ring-line animate-[pop-in_220ms_var(--ease-out-soft)]">
            {item.url && item.kind === "IMAGE" ? (
              <RemoteImage src={item.url} alt={`Trabajo ${index + 1}`} fill sizes="240px" className="object-cover" />
            ) : (
              <span className="grid size-full place-items-center text-brand-700">
                <Video className="size-8" aria-hidden="true" />
                <span className="sr-only">Video {index + 1}</span>
              </span>
            )}
            {index === 0 && <span className="absolute top-2 left-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-brand-900">Principal</span>}
            {item.status !== "ACTIVE" && (
              <span className="absolute inset-x-2 bottom-12 rounded-lg bg-brand-950/80 px-2 py-1 text-center text-xs font-semibold text-white">
                {item.status === "HIDDEN_BY_PLAN" ? "Oculta: supera tu plan" : "Oculta por el equipo"}
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-linear-to-t from-brand-950/80 to-transparent p-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
              <span className="flex gap-1">
                <IconButton label="Mover antes" disabled={index === 0 || reorder.isPending} onClick={() => move(index, -1)}>
                  <ArrowLeft className="size-4" />
                </IconButton>
                <IconButton label="Mover después" disabled={index === work.length - 1 || reorder.isPending} onClick={() => move(index, 1)}>
                  <ArrowRight className="size-4" />
                </IconButton>
              </span>
              <IconButton label="Borrar" danger disabled={remove.isPending} onClick={() => remove.mutate(item.id)}>
                <Trash2 className="size-4" />
              </IconButton>
            </div>
          </li>
        ))}
        {(canAddImage || canAddVideo) && (
          <li>
            <label
              htmlFor={inputId}
              className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line-strong text-center text-sm font-semibold text-brand-700 transition-colors hover:border-brand-400 hover:bg-brand-50 has-focus-visible:outline-2 has-focus-visible:outline-electric-500"
            >
              {add.isPending ? <Loader2 className="size-7 animate-spin" aria-label="Subiendo" /> : <ImagePlus className="size-7" aria-hidden="true" />}
              {add.isPending ? "Subiendo…" : "Agregar"}
              <input
                id={inputId}
                type="file"
                accept={accept}
                className="sr-only"
                disabled={add.isPending}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  event.target.value = "";
                  if (!file) return;
                  add.mutate({ file, purpose: kindOf(file) === "VIDEO" ? "PROFILE_VIDEO" : "WORK" });
                }}
              />
            </label>
          </li>
        )}
      </ul>
      {(add.isError || remove.isError || reorder.isError) && <Alert tone="danger">{planError(add.error ?? remove.error ?? reorder.error)}</Alert>}
    </SettingsSection>
  );
}

function ProfessionsSection({ me, max }: { me: ProfessionalMe; max: number }) {
  const queryClient = useQueryClient();
  const professions = useProfessions();
  const [selected, setSelected] = useState(me.professions.map((p) => p.id));
  const [primary, setPrimary] = useState(me.professions.find((p) => p.isPrimary)?.id ?? me.professions[0]?.id ?? "");
  const save = useMutation({
    mutationFn: () => replaceProfessions(selected, primary),
    onSuccess: (updated) => queryClient.setQueryData(proKeys.me, updated),
  });
  const toggle = (id: string) => {
    if (selected.includes(id)) {
      if (selected.length === 1) return;
      const next = selected.filter((x) => x !== id);
      setSelected(next);
      if (primary === id) setPrimary(next[0]!);
    } else if (selected.length < max) {
      setSelected([...selected, id]);
    }
  };

  return (
    <SettingsSection id="oficios" title="Tus oficios" description={`Elegí hasta ${max} según tu plan. La estrella marca el principal: es el que se ve en tu tarjeta.`}>
      <ul className="flex flex-wrap gap-2">
        {professions.data?.map((profession) => {
          const on = selected.includes(profession.id);
          const isPrimary = primary === profession.id;
          return (
            <li key={profession.id} className="flex">
              <button
                type="button"
                aria-pressed={on}
                disabled={!on && selected.length >= max}
                onClick={() => toggle(profession.id)}
                className={cn(
                  "inline-flex h-10 items-center gap-1.5 rounded-l-full border pr-3 pl-4 text-sm font-medium transition-colors disabled:opacity-45",
                  on ? "border-brand-700 bg-brand-700 text-white" : "rounded-r-full border-line bg-surface text-ink hover:border-brand-300 hover:bg-brand-50",
                )}
              >
                {on && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
                {profession.name}
              </button>
              {on && (
                <button
                  type="button"
                  aria-pressed={isPrimary}
                  onClick={() => setPrimary(profession.id)}
                  className={cn(
                    "grid h-10 w-10 place-items-center rounded-r-full border border-l-0 transition-colors",
                    isPrimary ? "border-brand-700 bg-amber-400 text-brand-900" : "border-brand-700 bg-brand-700 text-brand-200 hover:text-amber-400",
                  )}
                >
                  <Star className={cn("size-4", isPrimary && "fill-current")} aria-hidden="true" />
                  <span className="sr-only">{isPrimary ? `${profession.name} es tu oficio principal` : `Hacer ${profession.name} tu oficio principal`}</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <SaveRow pending={save.isPending} saved={save.isSuccess} error={save.isError ? planError(save.error) : null} />
      </form>
    </SettingsSection>
  );
}

function AreasSection({ me }: { me: ProfessionalMe }) {
  const id = useId();
  const queryClient = useQueryClient();
  const provinces = useProvinces();
  const localities = useLocalities(provinces.data?.length === 1 ? provinces.data[0]!.id : null);
  const [areas, setAreas] = useState(me.serviceAreas.map((a) => ({ localityId: a.localityId, neighborhoodName: a.neighborhoodName ?? "" })));
  const save = useMutation({
    mutationFn: () =>
      replaceServiceAreas(
        areas.filter((a) => a.localityId).map((a) => ({ localityId: a.localityId, ...(a.neighborhoodName.trim() ? { neighborhoodName: a.neighborhoodName.trim() } : {}) })),
      ),
    onSuccess: (updated) => queryClient.setQueryData(proKeys.me, updated),
  });
  const options = (localities.data ?? []).map((l) => ({ value: l.id, label: l.name }));

  return (
    <SettingsSection id="zonas" title="Zonas de trabajo" description="Dejá el barrio vacío para cubrir toda la localidad. Los barrios nuevos los revisa nuestro equipo.">
      <ul className="flex flex-col gap-3">
        {areas.map((area, index) => (
          <li key={index} className="grid gap-3 rounded-2xl bg-canvas p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end animate-[pop-in_200ms_var(--ease-out-soft)]">
            <Field id={`${id}-loc-${index}`} label={`Zona ${index + 1}: localidad`}>
              {(a11y) => (
                <Listbox {...a11y} value={area.localityId} placeholder="Elegí la localidad" options={options} onChange={(value) => setAreas(areas.map((a, i) => (i === index ? { ...a, localityId: value } : a)))} />
              )}
            </Field>
            <Field id={`${id}-barrio-${index}`} label="Barrio (opcional)">
              {(a11y) => (
                <Input
                  {...a11y}
                  value={area.neighborhoodName}
                  placeholder="Toda la localidad"
                  onChange={(e) => setAreas(areas.map((a, i) => (i === index ? { ...a, neighborhoodName: e.target.value } : a)))}
                />
              )}
            </Field>
            <Button variant="ghost" disabled={areas.length === 1} onClick={() => setAreas(areas.filter((_, i) => i !== index))}>
              <Trash2 className="size-4" aria-hidden="true" />
              <span className="sm:sr-only">Quitar zona {index + 1}</span>
            </Button>
          </li>
        ))}
      </ul>
      <Button variant="secondary" size="sm" className="self-start" onClick={() => setAreas([...areas, { localityId: "", neighborhoodName: "" }])}>
        <MapPin className="size-4" aria-hidden="true" />
        Agregar otra zona
      </Button>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <SaveRow pending={save.isPending} saved={save.isSuccess} error={save.isError ? planError(save.error) : null} />
      </form>
    </SettingsSection>
  );
}

function SocialsSection({ me }: { me: ProfessionalMe }) {
  const id = useId();
  const queryClient = useQueryClient();
  const [links, setLinks] = useState<Record<string, string>>(Object.fromEntries(me.socialLinks.map((l) => [l.network, l.url])));
  const save = useMutation({
    mutationFn: () =>
      replaceSocialLinks(
        socialNetworks.flatMap((n) => (links[n.value]?.trim() ? [{ network: n.value, url: links[n.value]!.trim() }] : [])),
      ),
    onSuccess: (updated) => queryClient.setQueryData(proKeys.me, updated),
  });
  return (
    <SettingsSection id="redes" title="Redes y sitio web" description="Solo enlaces https de cada red. Se muestran en tu página.">
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          save.mutate();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {socialNetworks.map((network) => (
            <Field key={network.value} id={`${id}-${network.value}`} label={network.label}>
              {(a11y) => (
                <Input
                  {...a11y}
                  type="url"
                  inputMode="url"
                  value={links[network.value] ?? ""}
                  placeholder={network.placeholder}
                  maxLength={SOCIAL_URL_MAX}
                  onChange={(e) => setLinks({ ...links, [network.value]: e.target.value })}
                />
              )}
            </Field>
          ))}
        </div>
        <SaveRow
          pending={save.isPending}
          saved={save.isSuccess}
          error={save.isError ? (isApiError(save.error, "INVALID_SOCIAL_LINKS") ? "Revisá los enlaces: cada uno tiene que ser de su red y empezar con https://." : errorMessage(save.error)) : null}
        />
      </form>
    </SettingsSection>
  );
}

function ThemeSection({ me, level }: { me: ProfessionalMe; level: "NONE" | "STANDARD" | "EXTENDED" }) {
  const id = useId();
  const queryClient = useQueryClient();
  const [theme, setThemeState] = useState<Theme>(me.theme);
  const [useGradient, setUseGradient] = useState(!!me.theme.gradient);
  const save = useMutation({
    mutationFn: () => {
      const { gradient, headline, animation, ...rest } = theme;
      return setTheme({
        ...rest,
        ...(useGradient && gradient ? { gradient } : {}),
        ...(headline?.trim() ? { headline: headline.trim() } : {}),
        ...(level === "EXTENDED" && animation ? { animation } : {}),
      });
    },
    onSuccess: (updated) => queryClient.setQueryData(proKeys.me, updated),
  });
  const locked = level === "NONE";
  const colors = Object.entries(themeColors) as [ThemeColor, { hex: string; label: string }][];
  const font = theme.font ? themeFonts[theme.font].className : "font-display";

  return (
    <SettingsSection id="estilo" title="Estilo de tu página" description="Color, tipografía y una frase destacada. Medium y Premium; la animación de entrada, solo Premium.">
      {locked ? (
        <div className="flex flex-col items-start gap-3 rounded-2xl bg-canvas p-5">
          <Lock className="size-6 text-amber-500" aria-hidden="true" />
          <p className="text-muted-strong">Con Medium o Premium elegís el color, la tipografía y una frase para tu página.</p>
          <Link href="/#planes" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
            Ver planes
          </Link>
        </div>
      ) : (
        <form
          noValidate
          className="flex flex-col gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            save.mutate();
          }}
        >
          {/* Vista previa en vivo del encabezado. */}
          <div className="overflow-hidden rounded-2xl border border-line" style={themeStyle({ ...theme, gradient: useGradient ? theme.gradient : undefined })} aria-hidden="true">
            <div className="h-20 bg-[linear-gradient(135deg,var(--pro-from),var(--pro-to))]" />
            <div key={`${theme.animation}-${theme.font}`} className={cn("flex flex-col gap-1 p-4", theme.animation && themeAnimations[theme.animation].className)}>
              <span className="self-start rounded-full bg-[var(--pro-accent)] px-3 py-1 text-xs font-semibold text-white">Tu oficio</span>
              <span className={cn("text-3xl font-bold text-brand-950", font)}>Tu nombre</span>
              {theme.headline && <span className={cn("text-lg text-[var(--pro-accent)]", theme.font ? font : "font-serif italic")}>{theme.headline}</span>}
            </div>
          </div>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-2 text-sm font-medium text-ink">Color principal</legend>
            <Swatches name={`${id}-color`} value={theme.color} colors={colors} onChange={(color) => setThemeState({ ...theme, color })} />
          </fieldset>

          <div className="flex flex-col gap-3">
            <Toggle label="Usar un degradé en la portada" checked={useGradient} onChange={(v) => {
              setUseGradient(v);
              if (v && !theme.gradient) setThemeState({ ...theme, gradient: { from: theme.color ?? "azul", to: "grafito" } });
            }} />
            {useGradient && theme.gradient && (
              <div className="grid gap-4 sm:grid-cols-2">
                <fieldset>
                  <legend className="mb-2 text-sm text-muted-strong">Desde</legend>
                  <Swatches name={`${id}-desde`} value={theme.gradient.from} colors={colors} onChange={(from) => setThemeState({ ...theme, gradient: { ...theme.gradient!, from } })} />
                </fieldset>
                <fieldset>
                  <legend className="mb-2 text-sm text-muted-strong">Hasta</legend>
                  <Swatches name={`${id}-hasta`} value={theme.gradient.to} colors={colors} onChange={(to) => setThemeState({ ...theme, gradient: { ...theme.gradient!, to } })} />
                </fieldset>
              </div>
            )}
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-ink">Tipografía del nombre</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.entries(themeFonts) as [NonNullable<Theme["font"]>, { label: string; className: string }][]).map(([value, option]) => (
                <Choice key={value} name={`${id}-fuente`} checked={theme.font === value} onChange={() => setThemeState({ ...theme, font: value })}>
                  <span className={cn("text-2xl text-ink", option.className)}>Aa</span>
                  <span className="text-xs text-muted-strong">{option.label}</span>
                </Choice>
              ))}
            </div>
          </fieldset>

          <Field id={`${id}-frase`} label="Frase destacada (opcional)" hint={`${theme.headline?.length ?? 0}/${HEADLINE_MAX}`}>
            {(a11y) => (
              <Input {...a11y} value={theme.headline ?? ""} maxLength={HEADLINE_MAX} placeholder="Ej.: Trabajos prolijos, con garantía" onChange={(e) => setThemeState({ ...theme, headline: e.target.value })} />
            )}
          </Field>

          <fieldset disabled={level !== "EXTENDED"} className="disabled:opacity-60">
            <legend className="mb-2 flex items-center gap-2 text-sm font-medium text-ink">
              Animación de entrada {level !== "EXTENDED" && <Badge tone="amber">Premium</Badge>}
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(Object.entries(themeAnimations) as [NonNullable<Theme["animation"]>, { label: string; className: string }][]).map(([value, option]) => (
                <Choice key={value} name={`${id}-animacion`} checked={theme.animation === value} onChange={() => setThemeState({ ...theme, animation: value })}>
                  <span className="text-sm font-semibold text-ink">{option.label}</span>
                </Choice>
              ))}
            </div>
          </fieldset>

          <SaveRow
            pending={save.isPending}
            saved={save.isSuccess}
            error={save.isError ? (isApiError(save.error, "THEME_NOT_IN_PLAN") ? "Tu plan no incluye alguna de esas opciones." : planError(save.error)) : null}
          />
        </form>
      )}
    </SettingsSection>
  );
}

function Swatches({
  name,
  value,
  colors,
  onChange,
}: {
  name: string;
  value: ThemeColor | undefined;
  colors: [ThemeColor, { hex: string; label: string }][];
  onChange: (color: ThemeColor) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map(([color, { hex, label }]) => (
        <label key={color} className="cursor-pointer rounded-full has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-electric-500">
          <input type="radio" name={name} value={color} checked={value === color} onChange={() => onChange(color)} className="peer sr-only" />
          <span
            className="grid size-10 place-items-center rounded-full ring-2 ring-transparent ring-offset-2 transition-transform duration-150 hover:scale-110 peer-checked:ring-brand-900"
            style={{ backgroundColor: hex }}
          >
            {value === color && <Check className="size-4 text-white" strokeWidth={3} aria-hidden="true" />}
          </span>
          <span className="sr-only">{label}</span>
        </label>
      ))}
    </div>
  );
}

function Choice({ name, checked, onChange, children }: { name: string; checked: boolean; onChange: () => void; children: ReactNode }) {
  return (
    <label
      className={cn(
        "flex cursor-pointer flex-col items-center gap-1 rounded-2xl border p-3 transition-[border-color,background-color] duration-150 has-focus-visible:outline-2 has-focus-visible:outline-electric-500",
        checked ? "border-brand-700 bg-brand-50" : "border-line hover:border-brand-200",
      )}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:border-brand-200 has-checked:border-success-600/40 has-checked:bg-success-50 has-focus-visible:outline-2 has-focus-visible:outline-electric-500">
      {label}
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative h-5 w-9 shrink-0 rounded-full bg-line-strong transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-xs after:transition-transform peer-checked:bg-success-600 peer-checked:after:translate-x-4"
      />
    </label>
  );
}

function IconButton({ label, onClick, disabled, danger = false, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid size-8 place-items-center rounded-lg bg-white/95 text-ink shadow-xs transition-[transform,color] hover:scale-105 disabled:opacity-40",
        danger && "text-danger-600",
      )}
    >
      <span aria-hidden="true">{children}</span>
      <span className="sr-only">{label}</span>
    </button>
  );
}

/** Botón de guardar con confirmación que aparece y se va sola. */
function SaveRow({ pending, saved, error }: { pending: boolean; saved: boolean; error: string | null }) {
  return (
    <div className="flex flex-col gap-3">
      {error && <Alert tone="danger">{error}</Alert>}
      <div className="flex items-center gap-3">
        <Button type="submit" loading={pending}>
          Guardar
        </Button>
        {saved && !pending && !error && (
          <span role="status" className="inline-flex items-center gap-1.5 text-sm font-semibold text-success-800 animate-[pop-in_220ms_var(--ease-out-soft)]">
            <Check className="size-4" aria-hidden="true" />
            Guardado
          </span>
        )}
      </div>
    </div>
  );
}

const MAX_CERTIFICATIONS = 10;

/**
 * Certificados (ADR 0020): foto o PDF, se publican al momento como "cargado por el profesional" (el
 * equipo no los verifica). Hay que confirmar que no muestran DNI, dirección ni fecha de nacimiento.
 */
function CertificatesSection({ me }: { me: ProfessionalMe }) {
  const id = useId();
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [institution, setInstitution] = useState("");
  const [year, setYear] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [touched, setTouched] = useState(false);
  const refresh = () => queryClient.invalidateQueries({ queryKey: proKeys.me });
  const add = useMutation({
    mutationFn: async () => {
      const uploaded = await uploadFile(file!, "CERTIFICATE");
      return addCertification({
        fileId: uploaded.id,
        title: title.trim(),
        ...(institution.trim() ? { institution: institution.trim() } : {}),
        ...(year ? { issuedYear: Number(year) } : {}),
        sensitiveDataConfirmed: true,
      });
    },
    onSuccess: () => {
      setFile(null);
      setTitle("");
      setInstitution("");
      setYear("");
      setConfirmed(false);
      setTouched(false);
      void refresh();
    },
  });
  const remove = useMutation({ mutationFn: (certId: string) => removeCertification(certId), onSettled: refresh });
  const full = me.certifications.length >= MAX_CERTIFICATIONS;
  const titleError = touched && title.trim().length < 2 ? "Escribí el nombre del certificado." : undefined;
  const fileError = touched && !file ? "Elegí la foto o el PDF." : undefined;
  const confirmError = touched && !confirmed ? "Confirmá que no muestra datos sensibles." : undefined;

  return (
    <SettingsSection id="certificados" title="Certificados" description={`Matrículas, cursos o habilitaciones (hasta ${MAX_CERTIFICATIONS}). Se muestran como “cargados por el profesional”.`}>
      {me.certifications.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {me.certifications.map((cert) => (
            <li key={cert.id} className="flex items-start gap-3 rounded-2xl bg-canvas p-4 animate-[pop-in_200ms_var(--ease-out-soft)]">
              <FileBadge className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-semibold text-ink">{cert.title}</span>
                <span className="text-sm text-muted">{[cert.institution, cert.issuedYear].filter(Boolean).join(" · ") || "Sin datos de emisión"}</span>
                {cert.status === "HIDDEN_BY_ADMIN" && <span className="text-xs font-semibold text-danger-600">Oculto por el equipo: {cert.hiddenReason ?? "revisalo"}</span>}
                {cert.url && (
                  <a href={cert.url} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline">
                    Ver<span className="sr-only"> {cert.title} (se abre en otra pestaña)</span>
                  </a>
                )}
              </span>
              <IconButton label={`Borrar ${cert.title}`} danger disabled={remove.isPending} onClick={() => remove.mutate(cert.id)}>
                <Trash2 className="size-4" />
              </IconButton>
            </li>
          ))}
        </ul>
      )}
      {full ? (
        <p className="text-sm text-muted">Llegaste al máximo de certificados. Borrá uno para sumar otro.</p>
      ) : (
        <form
          noValidate
          className="flex flex-col gap-4 rounded-2xl border border-dashed border-line-strong p-4"
          onSubmit={(event) => {
            event.preventDefault();
            setTouched(true);
            if (!file || title.trim().length < 2 || !confirmed) return;
            add.mutate();
          }}
        >
          <Field id={`${id}-archivo`} label="Foto o PDF" required error={fileError} hint={file ? file.name : "JPG, PNG, WEBP o PDF."}>
            {(a11y) => (
              <Input
                {...a11y}
                type="file"
                accept={[...ACCEPTED_TYPES.IMAGE, ...ACCEPTED_TYPES.DOCUMENT].join(",")}
                className="h-auto py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:font-semibold file:text-brand-800"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            )}
          </Field>
          <div className="grid gap-4 sm:grid-cols-[2fr_2fr_1fr]">
            <Field id={`${id}-titulo`} label="Nombre" required error={titleError}>
              {(a11y) => <Input {...a11y} value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="Ej.: Matrícula de electricista" />}
            </Field>
            <Field id={`${id}-institucion`} label="Institución (opcional)">
              {(a11y) => <Input {...a11y} value={institution} maxLength={120} onChange={(e) => setInstitution(e.target.value)} />}
            </Field>
            <Field id={`${id}-anio`} label="Año (opcional)">
              {(a11y) => <Input {...a11y} type="number" inputMode="numeric" min={1950} max={new Date().getFullYear() + 1} value={year} onChange={(e) => setYear(e.target.value)} />}
            </Field>
          </div>
          <label className="flex cursor-pointer items-start gap-3 text-sm text-ink">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-brand-700" aria-invalid={confirmError ? true : undefined} />
            <span>
              Confirmo que el documento <strong>no muestra mi DNI, mi dirección ni mi fecha de nacimiento</strong> (o están tapados).
              {confirmError && <span role="alert" className="mt-1 block font-medium text-danger-600">{confirmError}</span>}
            </span>
          </label>
          {(add.isError || remove.isError) && (
            <Alert tone="danger">{isApiError(add.error, "CERTIFICATION_LIMIT_REACHED") ? "Llegaste al máximo de certificados." : planError(add.error ?? remove.error)}</Alert>
          )}
          <Button type="submit" variant="secondary" loading={add.isPending} className="self-start">
            <Plus className="size-4" aria-hidden="true" />
            Sumar certificado
          </Button>
        </form>
      )}
    </SettingsSection>
  );
}
