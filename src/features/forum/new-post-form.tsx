"use client";

import { useMutation } from "@tanstack/react-query";
import { Check, HelpCircle, Search, X } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/form-controls";
import { Listbox } from "@/components/ui/listbox";
import { MediaPicker } from "@/components/ui/media-picker";
import { useLocalities, useNeighborhoodSuggestions, useProfessions, useProvinces } from "@/features/catalogs/queries";
import { useViewer } from "@/features/session/viewer";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { createPost, MAX_POST_IMAGES, MAX_POST_PROFESSIONS, MAX_POST_VIDEOS, POST_MAX, POST_MIN, type ForumType } from "./api";

const types: { value: ForumType; title: string; detail: string; icon: typeof HelpCircle }[] = [
  { value: "QUESTION", title: "Tengo una pregunta", detail: "Consultá a la comunidad sobre un arreglo", icon: HelpCircle },
  { value: "PROFESSIONAL_WANTED", title: "Busco un profesional", detail: "Contá qué necesitás y recibí propuestas", icon: Search },
];

/**
 * Nueva publicación del foro (E-110). Oficios hasta 4, zona opcional (barrio aprobado), presupuesto y
 * fecha límite opcionales, y hasta 2 fotos y 1 video que se suben al elegirlos.
 */
export function NewPostForm() {
  const viewer = useViewer();
  const router = useRouter();
  const id = useId();
  const professions = useProfessions();
  const provinces = useProvinces();
  const provinceId = provinces.data?.length === 1 ? provinces.data[0]!.id : null;
  const localities = useLocalities(provinceId);

  const [type, setType] = useState<ForumType>("QUESTION");
  const [body, setBody] = useState("");
  const [professionIds, setProfessionIds] = useState<string[]>([]);
  const [localityId, setLocalityId] = useState("");
  const [neighborhood, setNeighborhood] = useState<{ id: string; name: string } | null>(null);
  const [neighborhoodText, setNeighborhoodText] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [media, setMedia] = useState<{ fileIds: string[]; busy: boolean }>({ fileIds: [], busy: false });
  const [touched, setTouched] = useState(false);
  const suggestions = useNeighborhoodSuggestions(localityId || null, neighborhoodText);

  const create = useMutation({
    mutationFn: () =>
      createPost({
        type,
        body: body.trim(),
        ...(professionIds.length ? { professionIds } : {}),
        ...(localityId ? { localityId } : {}),
        ...(neighborhood ? { neighborhoodId: neighborhood.id } : {}),
        ...(Number(budget) > 0 ? { budgetEstimate: Math.round(Number(budget)) } : {}),
        ...(deadline ? { deadline } : {}),
        ...(media.fileIds.length ? { mediaFileIds: media.fileIds } : {}),
      }),
    onSuccess: (post) => router.push(`/foro/${post.id}` as Route),
  });

  if (viewer.status === "loading") return <Skeleton className="h-[32rem] w-full rounded-3xl" />;
  if (viewer.status === "anonymous" || viewer.user.status !== "ACTIVE" || viewer.user.role === "ADMIN") {
    return (
      <Alert tone="info" title="Para publicar necesitás una cuenta activa">
        {viewer.status === "anonymous" ? (
          <Link href={`/ingresar?siguiente=${encodeURIComponent("/foro/nueva")}` as Route} className="font-semibold underline underline-offset-4">
            Ingresá a tu cuenta
          </Link>
        ) : (
          "Activá tu cuenta desde el panel para participar."
        )}
      </Alert>
    );
  }

  const bodyError = touched && body.trim().length < POST_MIN ? `Contá un poco más (al menos ${POST_MIN} caracteres).` : undefined;
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form
      noValidate
      className="flex flex-col gap-6 rounded-3xl border border-line bg-surface p-5 shadow-raised sm:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        setTouched(true);
        if (body.trim().length < POST_MIN || media.busy) return;
        create.mutate();
      }}
    >
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-3 text-sm font-medium text-ink">¿Qué querés publicar?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {types.map((option) => {
            const selected = type === option.value;
            return (
              <label
                key={option.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-[border-color,background-color,box-shadow] duration-200 has-focus-visible:outline-2 has-focus-visible:outline-electric-500",
                  selected ? "border-brand-700 bg-brand-50 shadow-xs" : "border-line hover:border-brand-200",
                )}
              >
                <input type="radio" name={`${id}-tipo`} value={option.value} checked={selected} onChange={() => setType(option.value)} className="sr-only" />
                <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl transition-colors", selected ? "bg-brand-700 text-white" : "bg-brand-50 text-brand-700")}>
                  <option.icon className="size-5" aria-hidden="true" />
                </span>
                <span className="flex flex-col">
                  <span className="font-semibold text-ink">{option.title}</span>
                  <span className="text-sm text-muted">{option.detail}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <Field
        id={`${id}-texto`}
        label={type === "QUESTION" ? "Tu pregunta" : "¿Qué necesitás?"}
        required
        error={bodyError}
        hint={`Contá qué pasa, dónde y desde cuándo. ${body.length}/${POST_MAX}`}
      >
        {(a11y) => <Textarea {...a11y} value={body} onChange={(e) => setBody(e.target.value)} maxLength={POST_MAX} rows={6} />}
      </Field>

      <div role="group" aria-labelledby={`${id}-oficios`} className="flex flex-col gap-3">
        <p id={`${id}-oficios`} className="text-sm font-medium text-ink">
          Oficios relacionados <span className="font-normal text-muted">(hasta {MAX_POST_PROFESSIONS}, opcional)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {professions.data?.map((profession) => {
            const selected = professionIds.includes(profession.id);
            const disabled = !selected && professionIds.length >= MAX_POST_PROFESSIONS;
            return (
              <button
                key={profession.id}
                type="button"
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => setProfessionIds((list) => (selected ? list.filter((x) => x !== profession.id) : [...list, profession.id]))}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-[background-color,border-color,color] duration-150 disabled:opacity-45",
                  selected ? "border-brand-700 bg-brand-700 text-white" : "border-line bg-surface text-ink hover:border-brand-300 hover:bg-brand-50",
                )}
              >
                {selected && <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />}
                {profession.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${id}-localidad`} label="Localidad (opcional)">
          {(a11y) => (
            <Listbox
              {...a11y}
              value={localityId}
              onChange={(value) => {
                setLocalityId(value);
                setNeighborhood(null);
                setNeighborhoodText("");
              }}
              options={[{ value: "", label: "Sin especificar" }, ...(localities.data ?? []).map((l) => ({ value: l.id, label: l.name }))]}
            />
          )}
        </Field>
        {neighborhood ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">Barrio</span>
            <span className="flex h-11 items-center justify-between gap-2 rounded-xl border border-brand-200 bg-brand-50 pr-1 pl-3.5 text-brand-900">
              <span className="truncate">{neighborhood.name}</span>
              <button type="button" onClick={() => setNeighborhood(null)} className="grid size-9 place-items-center rounded-lg text-brand-700 hover:bg-brand-100">
                <X className="size-4" aria-hidden="true" />
                <span className="sr-only">Quitar el barrio</span>
              </button>
            </span>
          </div>
        ) : (
          <Field id={`${id}-barrio`} label="Barrio (opcional)" hint={localityId ? "Elegilo de la lista." : "Elegí primero la localidad."}>
            {(a11y) => (
              <>
                <Input
                  {...a11y}
                  list={`${id}-barrios`}
                  value={neighborhoodText}
                  disabled={!localityId}
                  autoComplete="off"
                  onChange={(event) => {
                    const typed = event.target.value;
                    setNeighborhoodText(typed);
                    const match = suggestions.data?.find((n) => n.name.toLowerCase() === typed.trim().toLowerCase());
                    if (match) setNeighborhood(match);
                  }}
                />
                <datalist id={`${id}-barrios`}>
                  {suggestions.data?.map((n) => (
                    <option key={n.id} value={n.name} />
                  ))}
                </datalist>
              </>
            )}
          </Field>
        )}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id={`${id}-presupuesto`} label="Ofrezco a partir de (opcional)" hint="En pesos, sin puntos.">
          {(a11y) => <Input {...a11y} type="number" inputMode="numeric" min={1} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="$" />}
        </Field>
        <Field id={`${id}-fecha`} label="Para cuándo (opcional)">
          {(a11y) => <Input {...a11y} type="date" min={today} value={deadline} onChange={(e) => setDeadline(e.target.value)} />}
        </Field>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-ink">
          Fotos o video <span className="font-normal text-muted">(hasta {MAX_POST_IMAGES} fotos y {MAX_POST_VIDEOS} video, opcional)</span>
        </span>
        <MediaPicker purpose="FORUM_MEDIA" maxImages={MAX_POST_IMAGES} maxVideos={MAX_POST_VIDEOS} onChange={setMedia} />
      </div>

      {create.isError && (
        <Alert tone="danger">
          {isApiError(create.error, "SUBSCRIPTION_REQUIRED")
            ? "Para publicar en el foro necesitás un plan vigente."
            : isApiError(create.error, "INVALID_PLACE")
              ? "El barrio no corresponde a la localidad elegida."
              : errorMessage(create.error)}
        </Alert>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-line pt-5 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" variant="accent" size="lg" loading={create.isPending} disabled={media.busy}>
          {media.busy ? "Subiendo archivos…" : "Publicar"}
        </Button>
      </div>
    </form>
  );
}
