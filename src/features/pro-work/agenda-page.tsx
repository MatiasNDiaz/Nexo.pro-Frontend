"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarOff, CircleCheck, Coffee, Hammer, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, Skeleton } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form-controls";
import { Listbox } from "@/components/ui/listbox";
import { PanelTitle, SettingsSection } from "@/features/account/settings-section";
import { weekdayLabel } from "@/features/catalog/labels";
import { getMyProfile, proKeys, updateProfile, type ProfessionalMe } from "@/features/pro-profile/api";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatDateTime, formatDay } from "@/lib/format";
import {
  addException,
  attentionOptions,
  EXCEPTION_NOTE_MAX,
  exceptionTypes,
  MAX_SLOTS,
  removeException,
  replaceAvailability,
  setAttention,
  type AttentionStatus,
  type ExceptionType,
} from "./api";

const icons = { AVAILABLE: Sparkles, WORKING: Hammer, RESTING: Coffee } as const;
const tones = {
  AVAILABLE: "border-success-600 bg-success-50 text-success-800",
  WORKING: "border-amber-500 bg-amber-50 text-amber-800",
  RESTING: "border-brand-700 bg-brand-950 text-white",
} as const;

/** Agenda del profesional: si atiende ahora, su horario semanal y los días sin atención. */
export function AgendaPage() {
  const profile = useQuery({ queryKey: proKeys.me, queryFn: getMyProfile });
  if (profile.isPending) return <Skeleton className="h-[40rem] w-full rounded-3xl" />;
  if (profile.isError) return <Alert tone="danger" title="No pudimos cargar tu agenda">{errorMessage(profile.error)}</Alert>;
  return (
    <div className="flex flex-col gap-8">
      <PanelTitle title="Agenda" description="Contale a los clientes cuándo atendés. Tu estado se ve en tu tarjeta y en tu página." />
      <AttentionCard me={profile.data} />
      <WeeklySchedule me={profile.data} />
      <Exceptions me={profile.data} />
    </div>
  );
}

function AttentionCard({ me }: { me: ProfessionalMe }) {
  const queryClient = useQueryClient();
  const [until, setUntil] = useState("");
  const change = useMutation({
    mutationFn: (status: AttentionStatus) => setAttention(status, until ? new Date(until).toISOString() : null),
    meta: {
      success: (_updated, status) =>
        status === "AVAILABLE"
          ? { title: "Estás disponible", description: "Los clientes te ven como “Disponible ya” en el catálogo." }
          : status === "WORKING"
            ? "Te pusiste en “Trabajando”"
            : "Te pusiste en “Descansando”",
    },
    onSuccess: (updated) => queryClient.setQueryData(proKeys.me, updated),
  });
  const auto = useMutation({
    mutationFn: (on: boolean) => updateProfile({ autoStatusFromSchedule: on }),
    meta: { success: (_updated, on) => (on ? "Tu estado va a seguir tus horarios" : "Tu estado ya no sigue tus horarios") },
    onSuccess: (updated) => queryClient.setQueryData(proKeys.me, updated),
  });
  const { attention } = me;

  return (
    <SettingsSection title="¿Atendés ahora?" description="Elegí tu estado. Si ponés un “hasta”, vuelve solo a como estaba.">
      <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Estado de atención">
        {attentionOptions.map((option) => {
          const Icon = icons[option.value];
          const selected = attention.manual === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={change.isPending}
              onClick={() => change.mutate(option.value)}
              className={cn(
                "group flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-[border-color,background-color,translate] duration-200 ease-out-soft hover:-translate-y-0.5",
                selected ? tones[option.value] : "border-line bg-surface text-ink hover:border-brand-200",
              )}
            >
              <span className="flex w-full items-center justify-between">
                <Icon className="size-6 transition-transform duration-300 ease-out-soft group-hover:scale-110" aria-hidden="true" />
                {selected &&
                  (option.value === "AVAILABLE" ? (
                    <span className="size-2.5 animate-pulse rounded-full bg-success-600" aria-hidden="true" />
                  ) : (
                    <CircleCheck className="size-5 animate-[pop-in_220ms_var(--ease-out-soft)]" aria-hidden="true" />
                  ))}
              </span>
              <span className="font-display text-xl font-bold">{option.label}</span>
              <span className="text-sm opacity-80">{option.detail}</span>
            </button>
          );
        })}
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">Hasta (opcional, para el próximo cambio)</span>
          <Input type="datetime-local" value={until} onChange={(e) => setUntil(e.target.value)} />
        </label>
        {attention.until && <p className="text-sm text-muted-strong sm:pb-3">Vuelve solo el {formatDateTime(attention.until)}</p>}
      </div>
      {attention.effective !== attention.manual && (
        <p className="rounded-xl bg-canvas px-3 py-2 text-sm text-muted-strong">
          Ahora los clientes te ven como <strong>{attentionOptions.find((o) => o.value === attention.effective)?.label}</strong> por tu horario.
        </p>
      )}
      <label className="flex min-h-12 cursor-pointer items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-2 text-sm font-medium text-ink has-checked:border-success-600/40 has-checked:bg-success-50 has-focus-visible:outline-2 has-focus-visible:outline-electric-500">
        <span className="flex flex-col">
          Usar mi horario para el estado
          <span className="text-xs font-normal text-muted-strong">Fuera de tu horario te mostramos como “Descansando”</span>
        </span>
        <input type="checkbox" role="switch" className="peer sr-only" checked={attention.autoFromSchedule} onChange={(e) => auto.mutate(e.target.checked)} />
        <span aria-hidden="true" className="relative h-5 w-9 shrink-0 rounded-full bg-line-strong transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-success-600 peer-checked:after:translate-x-4" />
      </label>
      {(change.isError || auto.isError) && (
        <Alert tone="danger">{isApiError(change.error, "INVALID_UNTIL") ? "El “hasta” tiene que ser una fecha futura (como mucho, unos días)." : errorMessage(change.error ?? auto.error)}</Alert>
      )}
    </SettingsSection>
  );
}

type Slot = { start: string; end: string };

function WeeklySchedule({ me }: { me: ProfessionalMe }) {
  const queryClient = useQueryClient();
  const [days, setDays] = useState<Record<number, Slot[]>>(() => {
    const map: Record<number, Slot[]> = {};
    for (const slot of me.availability.slots) (map[slot.weekday] ??= []).push({ start: slot.start, end: slot.end });
    return map;
  });
  const total = Object.values(days).reduce((sum, list) => sum + list.length, 0);
  const save = useMutation({
    mutationFn: () => replaceAvailability(Object.entries(days).flatMap(([weekday, list]) => list.map((slot) => ({ weekday: Number(weekday), ...slot })))),
    meta: { success: { title: "Guardamos tus horarios", description: "Se ven en tu página pública." } },
    onSuccess: (updated) => queryClient.setQueryData(proKeys.me, updated),
  });
  const setDay = (weekday: number, list: Slot[]) => setDays({ ...days, [weekday]: list });

  return (
    <SettingsSection title="Horario semanal" description="Hora de Córdoba. Podés cargar más de un tramo por día (por ejemplo, mañana y tarde).">
      <ul className="flex flex-col divide-y divide-line">
        {[1, 2, 3, 4, 5, 6, 7].map((weekday) => {
          const list = days[weekday] ?? [];
          const on = list.length > 0;
          return (
            <li key={weekday} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
              <label className="flex w-40 shrink-0 cursor-pointer items-center gap-3 font-medium text-ink has-focus-visible:outline-2 has-focus-visible:outline-electric-500">
                <input
                  type="checkbox"
                  role="switch"
                  className="peer sr-only"
                  checked={on}
                  onChange={(e) => setDay(weekday, e.target.checked ? [{ start: "08:00", end: "18:00" }] : [])}
                />
                <span aria-hidden="true" className="relative h-5 w-9 shrink-0 rounded-full bg-line-strong transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-success-600 peer-checked:after:translate-x-4" />
                {weekdayLabel[weekday]}
              </label>
              {on ? (
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  {list.map((slot, index) => (
                    <span key={index} className="inline-flex items-center gap-1.5 rounded-xl bg-canvas p-1.5 animate-[pop-in_200ms_var(--ease-out-soft)]">
                      <input
                        type="time"
                        aria-label={`${weekdayLabel[weekday]}, tramo ${index + 1}: desde`}
                        value={slot.start}
                        onChange={(e) => setDay(weekday, list.map((s, i) => (i === index ? { ...s, start: e.target.value } : s)))}
                        className="h-9 rounded-lg border border-line-strong bg-surface px-2 text-sm"
                      />
                      <span className="text-sm text-muted">a</span>
                      <input
                        type="time"
                        aria-label={`${weekdayLabel[weekday]}, tramo ${index + 1}: hasta`}
                        value={slot.end}
                        onChange={(e) => setDay(weekday, list.map((s, i) => (i === index ? { ...s, end: e.target.value } : s)))}
                        className="h-9 rounded-lg border border-line-strong bg-surface px-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setDay(weekday, list.filter((_, i) => i !== index))}
                        className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger-50 hover:text-danger-600"
                      >
                        <X className="size-4" aria-hidden="true" />
                        <span className="sr-only">Quitar el tramo {index + 1} del {weekdayLabel[weekday]}</span>
                      </button>
                    </span>
                  ))}
                  {list.length < 4 && total < MAX_SLOTS && (
                    <button
                      type="button"
                      onClick={() => setDay(weekday, [...list, { start: "14:00", end: "18:00" }])}
                      className="inline-flex h-9 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                    >
                      <Plus className="size-4" aria-hidden="true" />
                      Tramo
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-sm text-muted">No atendés</span>
              )}
            </li>
          );
        })}
      </ul>
      {save.isError && (
        <Alert tone="danger">{isApiError(save.error, "INVALID_AVAILABILITY") ? "Revisá los tramos: cada uno tiene que terminar después de empezar y no pueden superponerse." : errorMessage(save.error)}</Alert>
      )}
      <div className="flex items-center gap-3">
        <Button onClick={() => save.mutate()} loading={save.isPending}>
          Guardar horario
        </Button>
        {save.isSuccess && <span role="status" className="text-sm font-semibold text-success-800 animate-[pop-in_220ms_var(--ease-out-soft)]">Guardado</span>}
      </div>
    </SettingsSection>
  );
}

function Exceptions({ me }: { me: ProfessionalMe }) {
  const id = useId();
  const queryClient = useQueryClient();
  const [type, setType] = useState<ExceptionType>("DAY_OFF");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [note, setNote] = useState("");
  const add = useMutation({
    mutationFn: () => addException({ type, startDate: from, endDate: to || from, ...(note.trim() ? { note: note.trim() } : {}) }),
    meta: { success: { title: "Agregamos los días sin atención", description: "Se muestran en tu página para que nadie te espere." } },
    onSuccess: (updated) => {
      queryClient.setQueryData(proKeys.me, updated);
      setFrom("");
      setTo("");
      setNote("");
    },
  });
  const remove = useMutation({ mutationFn: (exceptionId: string) => removeException(exceptionId), meta: { success: "Quitamos esos días sin atención" }, onSettled: () => queryClient.invalidateQueries({ queryKey: proKeys.me }) });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <SettingsSection title="Días sin atención" description="Feriados, vacaciones o días libres. Se muestran en tu página para que nadie te espere.">
      {me.availability.exceptions.length > 0 && (
        <ul className="flex flex-col gap-2">
          {me.availability.exceptions.map((exception) => (
            <li key={exception.id} className="flex items-center gap-3 rounded-2xl bg-canvas px-4 py-3 animate-[pop-in_200ms_var(--ease-out-soft)]">
              <CalendarOff className="size-5 shrink-0 text-amber-600" aria-hidden="true" />
              <span className="flex flex-1 flex-col">
                <span className="font-medium text-ink">
                  {exceptionTypes.find((t) => t.value === exception.type)?.label}: {formatDay(exception.startDate)}
                  {exception.endDate !== exception.startDate && ` al ${formatDay(exception.endDate)}`}
                </span>
                {exception.note && <span className="text-sm text-muted">{exception.note}</span>}
              </span>
              <Button variant="ghost" size="sm" onClick={() => remove.mutate(exception.id)} className="text-danger-600 hover:bg-danger-50">
                <Trash2 className="size-4" aria-hidden="true" />
                <span className="sr-only">Quitar</span>
              </Button>
            </li>
          ))}
        </ul>
      )}
      <form
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:items-end"
        onSubmit={(event) => {
          event.preventDefault();
          if (from) add.mutate();
        }}
      >
        <Field id={`${id}-tipo`} label="Motivo">
          {(a11y) => <Listbox {...a11y} value={type} onChange={(v) => setType(v as ExceptionType)} options={exceptionTypes} />}
        </Field>
        <Field id={`${id}-desde`} label="Desde">
          {(a11y) => <Input {...a11y} type="date" min={today} value={from} onChange={(e) => setFrom(e.target.value)} />}
        </Field>
        <Field id={`${id}-hasta`} label="Hasta (opcional)">
          {(a11y) => <Input {...a11y} type="date" min={from || today} value={to} onChange={(e) => setTo(e.target.value)} />}
        </Field>
        <Field id={`${id}-nota`} label="Nota (opcional)">
          {(a11y) => <Input {...a11y} value={note} maxLength={EXCEPTION_NOTE_MAX} onChange={(e) => setNote(e.target.value)} />}
        </Field>
        <Button type="submit" variant="secondary" loading={add.isPending} disabled={!from} className="sm:col-span-2 lg:col-span-4 lg:justify-self-start">
          <Plus className="size-4" aria-hidden="true" />
          Agregar
        </Button>
      </form>
      {(add.isError || remove.isError) && (
        <Alert tone="danger">
          {isApiError(add.error, "INVALID_EXCEPTION_DATES")
            ? "Revisá las fechas: la de fin no puede ser anterior a la de inicio."
            : isApiError(add.error, "TOO_MANY_EXCEPTIONS")
              ? "Ya cargaste el máximo de días sin atención a futuro."
              : errorMessage(add.error ?? remove.error)}
        </Alert>
      )}
    </SettingsSection>
  );
}
