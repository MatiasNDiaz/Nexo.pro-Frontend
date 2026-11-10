"use client";

import { useMutation } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/form-controls";
import { Listbox } from "@/components/ui/listbox";
import { plans } from "@/content/home";
import { LocationFields } from "@/features/session/profile-fields";
import { locationSchema, personName, phoneSchema, toLocationBody, type LocationValues } from "@/features/session/schemas";
import { isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { ActionDialog, adminErrorMessage } from "./action-dialog";
import {
  accountActions,
  addStrike,
  applySanction,
  changePlan,
  changeRole,
  deleteUser,
  fullName,
  LIFT_REASON_MIN,
  liftSanction,
  MESSAGE_BODY_MAX,
  MESSAGE_MIN,
  MESSAGE_TITLE_MAX,
  messageUser,
  REASON_MAX,
  REASON_MIN,
  restoreUser,
  revokeSessions,
  roleLabel,
  sanctionLabel,
  sendPasswordReset,
  updateUserData,
  voidStrike,
  type AdminUserDetail,
  type Sanction,
  type SanctionType,
  type Strike,
} from "./api";

export type UserDialog =
  | { kind: "edit" | "role" | "sanction" | "strike" | "restore" | "delete" | "sessions" | "password" | "message" | "plan" }
  | { kind: "lift"; sanction: Sanction }
  | { kind: "void"; strike: Strike };

interface Props {
  user: AdminUserDetail;
  /** Reporte que originó el strike o la sanción (llegando desde un reporte). */
  reportId?: string;
  onClose: () => void;
  onDone: (message: string) => void;
}

/** El diálogo que corresponde a la acción elegida en la ficha. */
export function UserActionDialog({ dialog, ...props }: Props & { dialog: UserDialog }) {
  const { user } = props;
  const name = fullName(user);
  switch (dialog.kind) {
    case "edit":
      return <EditDataDialog {...props} />;
    case "role":
      return <ChangeRoleDialog {...props} />;
    case "sanction":
      return <SanctionDialog {...props} />;
    case "strike":
      return <StrikeDialog {...props} />;
    case "message":
      return <MessageDialog {...props} />;
    case "plan":
      return <ChangePlanDialog {...props} />;
    case "restore":
      return (
        <ActionDialog
          {...props}
          title={`Restaurar la cuenta de ${name}`}
          description={
            accountActions(user).pendingDeletion
              ? "Se cancela la baja: la cuenta vuelve con sus datos."
              : "Se levantan la suspensión y el bloqueo vigentes. La cuenta vuelve a estar activa, o por verificar si su identidad no está aprobada."
          }
          confirmLabel="Restaurar la cuenta"
          run={(reason) => restoreUser(user.id, reason)}
          done="Restauraste la cuenta."
        />
      );
    case "delete":
      return (
        <ActionDialog
          {...props}
          tone="danger"
          title={`Dar de baja la cuenta de ${name}`}
          description="Se cierran sus sesiones, se oculta su perfil y la cuenta queda dada de baja. Durante el período de gracia la podés restaurar; después se anonimiza y no hay vuelta atrás."
          confirmLabel="Dar de baja"
          run={(reason) => deleteUser(user.id, reason)}
          done="La cuenta quedó dada de baja. Podés restaurarla durante el período de gracia."
        />
      );
    case "sessions":
      return (
        <ActionDialog
          {...props}
          tone="danger"
          title="Cerrar todas sus sesiones"
          description="Para una cuenta comprometida: se cierra la sesión en todos sus dispositivos. El estado de la cuenta no cambia."
          confirmLabel="Cerrar sesiones"
          run={(reason) => revokeSessions(user.id, reason)}
          done="Cerraste todas sus sesiones."
        />
      );
    case "password":
      return (
        <ActionDialog
          {...props}
          title="Mandar un enlace para cambiar la contraseña"
          description={`Le llega a ${user.email} un enlace de un solo uso, válido por 30 minutos. Vos nunca ves ni elegís la contraseña.`}
          confirmLabel="Mandar el enlace"
          run={(reason) => sendPasswordReset(user.id, reason)}
          done="Le mandamos el enlace por email."
        />
      );
    case "lift":
      return (
        <ActionDialog
          {...props}
          title={`Levantar: ${sanctionLabel[dialog.sanction.type].label.toLowerCase()}`}
          description={
            dialog.sanction.type === "SUSPENSION" || dialog.sanction.type === "BAN"
              ? "La cuenta vuelve a su estado: activa, o por verificar si su identidad no está aprobada."
              : "Deja de regir desde ahora."
          }
          minReason={LIFT_REASON_MIN}
          confirmLabel="Levantar la sanción"
          run={(reason) => liftSanction(dialog.sanction.id, reason)}
          done="Levantaste la sanción."
        />
      );
    case "void":
      return (
        <ActionDialog
          {...props}
          title="Anular el strike"
          description={`Strike de peso ${dialog.strike.weight} del ${formatDate(dialog.strike.createdAt)}: deja de sumar.`}
          minReason={LIFT_REASON_MIN}
          confirmLabel="Anular el strike"
          run={(reason) => voidStrike(dialog.strike.id, reason)}
          done="Anulaste el strike."
        />
      );
  }
}

// ---- Editar datos (ADR 0021: el admin los aplica directo, con motivo) ----

function EditDataDialog({ user, onClose, onDone }: Props) {
  const id = useId();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone);
  const [errors, setErrors] = useState<Record<string, string>>({});
  // Lo que se manda: lo calcula la validación y lo usa el envío (una sola vez).
  const pending = useRef<Record<string, string>>({});

  /** Solo lo que cambió; null si hay errores. */
  const changes = () => {
    const next: Record<string, string> = {};
    const found: Record<string, string> = {};
    const first = personName("nombre").safeParse(firstName);
    const last = personName("apellido").safeParse(lastName);
    const tel = phoneSchema.safeParse(phone);
    if (!first.success) found.firstName = first.error.issues[0]!.message;
    else if (first.data !== user.firstName) next.firstName = first.data;
    if (!last.success) found.lastName = last.error.issues[0]!.message;
    else if (last.data !== user.lastName) next.lastName = last.data;
    if (!tel.success) found.phone = tel.error.issues[0]!.message;
    else if (tel.data !== user.phone) next.phone = tel.data;
    setErrors(found);
    return Object.keys(found).length ? null : next;
  };

  return (
    <ActionDialog
      title="Editar datos"
      description="Se aplican directo, sin revisión. Si cambiás el nombre de alguien con la identidad aprobada, queda registrado en la auditoría."
      confirmLabel="Guardar cambios"
      onClose={onClose}
      onDone={onDone}
      validate={() => {
        const next = changes();
        if (!next) return "Revisá los datos marcados.";
        pending.current = next;
        return Object.keys(next).length ? null : "No cambiaste ningún dato.";
      }}
      run={(reason) => updateUserData(user.id, { ...pending.current, reason })}
      done="Guardaste los datos."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={`${id}-nombre`} label="Nombre" required error={errors.firstName}>
          {(a11y) => <Input {...a11y} value={firstName} onChange={(e) => setFirstName(e.target.value)} maxLength={60} />}
        </Field>
        <Field id={`${id}-apellido`} label="Apellido" required error={errors.lastName}>
          {(a11y) => <Input {...a11y} value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={60} />}
        </Field>
      </div>
      <Field id={`${id}-telefono`} label="Teléfono" required error={errors.phone} hint="Con código de área, sin 0 ni 15.">
        {(a11y) => <Input {...a11y} type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />}
      </Field>
    </ActionDialog>
  );
}

// ---- Sanción (ADR 0029: solo manuales; el usuario ve el motivo) ----

function SanctionDialog({ user, reportId, onClose, onDone }: Props) {
  const id = useId();
  const allowed = accountActions(user);
  const types = (Object.keys(sanctionLabel) as SanctionType[]).filter((type) =>
    type === "SUSPENSION" ? allowed.suspend : type === "BAN" ? allowed.ban : type === "PROFILE_HIDDEN" ? allowed.hideProfile : allowed.sanction,
  );
  const [type, setType] = useState<SanctionType>(types[0] ?? "WARNING");
  const [endsAt, setEndsAt] = useState("");
  const withEnd = type === "SUSPENSION" || type === "PROFILE_HIDDEN";

  return (
    <ActionDialog
      tone={type === "WARNING" ? "primary" : "danger"}
      title={`Sancionar a ${fullName(user)}`}
      confirmLabel={`Aplicar ${sanctionLabel[type].label.toLowerCase()}`}
      reasonLabel="Motivo (lo ve la persona)"
      reasonHint="Le llega en la notificación y queda en la auditoría."
      onClose={onClose}
      onDone={onDone}
      validate={() => (withEnd && endsAt && new Date(endsAt) <= new Date() ? "La fecha de fin tiene que ser en el futuro." : null)}
      run={(reason) => applySanction(user.id, { type, reason, ...(withEnd && endsAt ? { endsAt: new Date(endsAt).toISOString() } : {}), ...(reportId ? { reportId } : {}) })}
      done={`Aplicaste: ${sanctionLabel[type].label.toLowerCase()}.`}
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-ink">Tipo de sanción</legend>
        {types.map((option) => (
          <label
            key={option}
            className={cn(
              "flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors",
              type === option ? "border-brand-700 bg-brand-50" : "border-line hover:border-brand-200",
            )}
          >
            <input type="radio" name={`${id}-tipo`} value={option} checked={type === option} onChange={() => setType(option)} className="mt-1 size-4 accent-brand-700" />
            <span className="flex flex-col">
              <span className="font-semibold text-ink">{sanctionLabel[option].label}</span>
              <span className="text-sm text-muted-strong">{sanctionLabel[option].detail}</span>
            </span>
          </label>
        ))}
      </fieldset>
      {withEnd && (
        <Field id={`${id}-fin`} label="Termina (opcional)" hint="Sin fecha, sigue hasta que la levantes.">
          {(a11y) => <Input {...a11y} type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />}
        </Field>
      )}
    </ActionDialog>
  );
}

// ---- Strike (peso 1 a 3 según la gravedad) ----

function StrikeDialog({ user, reportId, onClose, onDone }: Props) {
  const id = useId();
  const [weight, setWeight] = useState(1);
  return (
    <ActionDialog
      title={`Strike a ${fullName(user)}`}
      description={`Hoy suma ${user.activeStrikeWeight}. Los strikes no aplican sanciones solos: las decidís vos.`}
      confirmLabel="Agregar el strike"
      reasonLabel="Motivo (lo ve la persona)"
      reasonHint="Le llega en la notificación y queda en la auditoría."
      onClose={onClose}
      onDone={onDone}
      run={(reason) => addStrike(user.id, { weight, reason, ...(reportId ? { reportId } : {}) })}
      done={`Agregaste un strike de peso ${weight}.`}
    >
      <div className="flex flex-col gap-1.5">
        <span id={`${id}-peso`} className="text-sm font-medium text-ink">
          Peso según la gravedad
        </span>
        <div role="group" aria-labelledby={`${id}-peso`} className="flex gap-2">
          {[1, 2, 3].map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={weight === value}
              onClick={() => setWeight(value)}
              className={cn("h-11 min-w-14 rounded-xl px-4 font-semibold transition-colors", weight === value ? "bg-brand-700 text-white" : "border border-line text-brand-800 hover:bg-brand-50")}
            >
              {value}
            </button>
          ))}
        </div>
      </div>
    </ActionDialog>
  );
}

// ---- Mensaje (llega como notificación) ----

function MessageDialog({ user, onClose, onDone }: Props) {
  const id = useId();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [touched, setTouched] = useState(false);
  const message = useMutation({
    mutationFn: () => messageUser(user.id, { title: title.trim(), body: body.trim() }),
    onSuccess: () => onDone("Le mandaste el mensaje."),
  });
  const titleError = touched && title.trim().length < MESSAGE_MIN ? "Escribí un título." : undefined;
  const bodyError = touched && body.trim().length < MESSAGE_MIN ? "Escribí el mensaje." : undefined;

  return (
    <Dialog open onClose={onClose} title={`Mensaje a ${fullName(user)}`} description="Le llega como notificación en su panel (y al celular, si activó los avisos).">
      <form
        noValidate
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          setTouched(true);
          if (title.trim().length < MESSAGE_MIN || body.trim().length < MESSAGE_MIN) return;
          message.mutate();
        }}
      >
        <Field id={`${id}-titulo`} label="Título" required error={titleError} hint={`${title.length}/${MESSAGE_TITLE_MAX}`}>
          {(a11y) => <Input {...a11y} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={MESSAGE_TITLE_MAX} />}
        </Field>
        <Field id={`${id}-cuerpo`} label="Mensaje" required error={bodyError} hint={`${body.length}/${MESSAGE_BODY_MAX}`}>
          {(a11y) => <Textarea {...a11y} value={body} onChange={(e) => setBody(e.target.value)} maxLength={MESSAGE_BODY_MAX} rows={4} />}
        </Field>
        {message.isError && <Alert tone="danger">{adminErrorMessage(message.error)}</Alert>}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={message.isPending}>
            Mandar el mensaje
          </Button>
        </div>
      </form>
    </Dialog>
  );
}

// ---- Plan (cambio de común acuerdo, FI §6.4) ----

function ChangePlanDialog({ user, onClose, onDone }: Props) {
  const id = useId();
  const current = user.subscription?.planCode ?? null;
  const options = plans.filter((plan) => plan.code !== current);
  const [planCode, setPlanCode] = useState<string>(options[0]?.code ?? "");
  const chosen = plans.find((plan) => plan.code === planCode);
  return (
    <ActionDialog
      title="Cambiar el plan"
      description="De común acuerdo con el profesional. No cobra ni devuelve nada: cambia el plan del período en curso y le avisamos."
      confirmLabel={chosen ? `Pasar a ${chosen.name}` : "Cambiar el plan"}
      onClose={onClose}
      onDone={onDone}
      run={(reason) => changePlan(user.id, planCode, reason)}
      errorFor={(error) =>
        isApiError(error, "SUBSCRIPTION_NOT_LIVE") ? "No tiene una prueba ni un período vigente: el plan se puede cambiar solo mientras rige." : isApiError(error, "SAME_PLAN") ? "Ya tiene ese plan." : null
      }
      done={`Cambiaste el plan a ${chosen?.name ?? planCode}.`}
    >
      <Field id={`${id}-plan`} label="Plan nuevo" required>
        {(a11y) => <Listbox {...a11y} value={planCode} onChange={setPlanCode} options={options.map((plan) => ({ value: plan.code, label: plan.name }))} />}
      </Field>
    </ActionDialog>
  );
}

// ---- Cambio de rol (ADR 0012) ----

type RoleFormValues = LocationValues & { reason: string };

/**
 * Cliente ⇄ profesional. Si la cuenta ya tuvo el rol nuevo, el backend reutiliza sus datos: el primer
 * intento va sin datos y, si el backend los pide (NEIGHBORHOOD_REQUIRED / PROFESSIONAL_DATA_REQUIRED),
 * aparecen los campos. El cambio corre en una transacción: el intento fallido no deja nada a medias.
 * Cierra las sesiones de la persona para que el rol nuevo rija desde su próximo ingreso.
 */
function ChangeRoleDialog({ user, onClose, onDone }: Props) {
  const id = useId();
  const target = user.role === "PROFESSIONAL" ? "CUSTOMER" : "PROFESSIONAL";
  const [needsData, setNeedsData] = useState(false);
  const form = useForm<RoleFormValues>({
    defaultValues: { role: target, customerLocalityId: "", customerNeighborhood: "", professionId: "", serviceAreas: [], reason: "" },
  });
  const change = useMutation({
    mutationFn: (values: RoleFormValues) =>
      changeRole(user.id, {
        role: target,
        reason: values.reason.trim(),
        ...(needsData ? toLocationBody(locationSchema.parse(values)) : {}),
      }),
    onSuccess: () => onDone(`La cuenta ahora es de ${roleLabel[target].toLowerCase()}. Sus sesiones se cerraron.`),
    onError: (error) => {
      if (isApiError(error, "NEIGHBORHOOD_REQUIRED", "PROFESSIONAL_DATA_REQUIRED")) setNeedsData(true);
    },
  });
  const reason = useWatch({ control: form.control, name: "reason" });
  const [touched, setTouched] = useState(false);
  const reasonError = touched && reason.trim().length < REASON_MIN ? `Escribí el motivo (al menos ${REASON_MIN} caracteres).` : undefined;

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Pasar a ${roleLabel[target].toLowerCase()}`}
      description={`${fullName(user)} deja de ser ${roleLabel[user.role].toLowerCase()}. Su perfil anterior queda guardado (no se borra) y se cierran sus sesiones.`}
    >
      <FormProvider {...form}>
        <form
          noValidate
          className="flex flex-col gap-5"
          onSubmit={form.handleSubmit((values) => {
            setTouched(true);
            // La ubicación se valida solo cuando el backend la pidió (mismas reglas que el registro).
            if (needsData) {
              form.clearErrors();
              const parsed = locationSchema.safeParse(values);
              if (!parsed.success) {
                for (const issue of parsed.error.issues) form.setError(issue.path.join(".") as never, { message: issue.message });
                return;
              }
            }
            if (values.reason.trim().length < REASON_MIN) return;
            change.mutate(values);
          })}
        >
          {needsData && (
            <>
              <Alert tone="info">
                {target === "PROFESSIONAL"
                  ? "Esta cuenta nunca fue profesional: cargá su oficio y sus zonas de trabajo."
                  : "Esta cuenta no tiene barrio cargado: cargá dónde vive."}
              </Alert>
              <LocationFields role={target} />
            </>
          )}
          <Field id={`${id}-motivo`} label="Motivo" required error={reasonError} hint={`Queda en el registro de auditoría. ${reason.length}/${REASON_MAX}`}>
            {(a11y) => <Textarea {...a11y} {...form.register("reason")} maxLength={REASON_MAX} rows={3} />}
          </Field>
          {change.isError && !isApiError(change.error, "NEIGHBORHOOD_REQUIRED", "PROFESSIONAL_DATA_REQUIRED") && (
            <Alert tone="danger">{isApiError(change.error, "SAME_ROLE") ? "La cuenta ya tiene ese rol." : adminErrorMessage(change.error)}</Alert>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" loading={change.isPending}>
              Cambiar el rol
            </Button>
          </div>
        </form>
      </FormProvider>
    </Dialog>
  );
}
