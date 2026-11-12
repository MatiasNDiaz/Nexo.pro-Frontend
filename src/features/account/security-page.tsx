"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, LogOut, MonitorSmartphone, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "@/lib/zod";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Alert, Badge, Skeleton } from "@/components/ui/feedback";
import { FeedbackIcon } from "@/components/ui/feedback-icon";
import { Field } from "@/components/ui/form-controls";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "@/components/ui/toast";
import { newPasswordSchema } from "@/features/session/schemas";
import { useSessionActions } from "@/features/session/session-provider";
import { useSignOut } from "@/features/session/sign-out";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { formatDate } from "@/lib/format";
import {
  accountKeys,
  changePassword,
  closeAllDevices,
  closeDevice,
  deleteOwnAccount,
  getDevices,
  setPassword,
  unlinkGoogle,
  type Device,
} from "./api";
import { deviceLabel } from "./device-label";
import { PanelTitle, SettingsSection } from "./settings-section";
import { useMe } from "./use-me";

const REAUTH_MESSAGE = "Por seguridad, cerrá sesión, volvé a ingresar con Google y repetí esta acción en los próximos 10 minutos.";

export function SecurityPage() {
  const me = useMe();
  const restricted = me.status === "SUSPENDED" || me.status === "BANNED";
  const canEditAccount = !restricted && me.role !== "ADMIN";
  return (
    <div className="flex flex-col gap-6">
      <PanelTitle title="Seguridad" description="Contraseña, formas de ingresar y dispositivos con tu sesión abierta." />
      {!restricted && <PasswordSection />}
      {canEditAccount && me.googleLinked && <GoogleSection />}
      <DevicesSection />
      {canEditAccount && <DeleteAccountSection />}
    </div>
  );
}

// ---- Contraseña ----

const changeSchema = z
  .object({ currentPassword: z.string().min(1, "Ingresá tu contraseña actual."), newPassword: newPasswordSchema, confirm: z.string() })
  .refine((v) => v.newPassword === v.confirm, { path: ["confirm"], message: "Las contraseñas no coinciden." })
  .refine((v) => v.newPassword !== v.currentPassword, { path: ["newPassword"], message: "Elegí una contraseña distinta de la actual." });

const setSchema = z
  .object({ newPassword: newPasswordSchema, confirm: z.string() })
  .refine((v) => v.newPassword === v.confirm, { path: ["confirm"], message: "Las contraseñas no coinciden." });

function PasswordSection() {
  const me = useMe();
  return (
    <SettingsSection
      id="contrasena"
      title={me.hasPassword ? "Cambiar contraseña" : "Crear una contraseña"}
      description={
        me.hasPassword
          ? "Al cambiarla se cierra la sesión en tus otros dispositivos."
          : "Tu cuenta usa Google para ingresar. Con una contraseña vas a poder ingresar también con tu email."
      }
    >
      {me.hasPassword ? <ChangePasswordForm /> : <SetPasswordForm />}
    </SettingsSection>
  );
}

function ChangePasswordForm() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof changeSchema>>({
    resolver: zodResolver(changeSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirm: "" },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await changePassword(values.currentPassword, values.newPassword);
      reset();
      toast.success("Cambiaste tu contraseña", "Cerramos la sesión en tus otros dispositivos.");
      await queryClient.invalidateQueries({ queryKey: accountKeys.devices });
    } catch (error) {
      if (isApiError(error, "INVALID_CURRENT_PASSWORD")) setError("currentPassword", { message: "La contraseña actual no es correcta." });
      else setError("root", { message: errorMessage(error) });
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {errors.root && <Alert tone="danger">{errors.root.message}</Alert>}
      <Field id="pw-actual" label="Contraseña actual" error={errors.currentPassword?.message}>
        {(a11y) => <PasswordInput {...a11y} {...register("currentPassword")} autoComplete="current-password" />}
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="pw-nueva" label="Contraseña nueva" hint="Al menos 8 caracteres." error={errors.newPassword?.message}>
          {(a11y) => <PasswordInput {...a11y} {...register("newPassword")} autoComplete="new-password" />}
        </Field>
        <Field id="pw-repetir" label="Repetí la contraseña nueva" error={errors.confirm?.message}>
          {(a11y) => <PasswordInput {...a11y} {...register("confirm")} autoComplete="new-password" />}
        </Field>
      </div>
      <Button type="submit" loading={isSubmitting} className="self-start">
        <KeyRound className="size-4" aria-hidden="true" />
        Cambiar contraseña
      </Button>
    </form>
  );
}

function SetPasswordForm() {
  const { refreshSession } = useSessionActions();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof setSchema>>({ resolver: zodResolver(setSchema), defaultValues: { newPassword: "", confirm: "" } });

  const submit = handleSubmit(async (values) => {
    try {
      await setPassword(values.newPassword);
      await refreshSession(); // hasPassword pasa a true: se muestra "Cambiar contraseña".
      toast.success("Creaste tu contraseña", "Ya podés ingresar también con tu email y esta contraseña.");
    } catch (error) {
      setError("root", { message: isApiError(error, "REAUTH_REQUIRED") ? REAUTH_MESSAGE : errorMessage(error) });
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {errors.root && <Alert tone="danger">{errors.root.message}</Alert>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="pw-crear" label="Contraseña" hint="Al menos 8 caracteres." error={errors.newPassword?.message}>
          {(a11y) => <PasswordInput {...a11y} {...register("newPassword")} autoComplete="new-password" />}
        </Field>
        <Field id="pw-crear-repetir" label="Repetí la contraseña" error={errors.confirm?.message}>
          {(a11y) => <PasswordInput {...a11y} {...register("confirm")} autoComplete="new-password" />}
        </Field>
      </div>
      <Button type="submit" loading={isSubmitting} className="self-start">
        <KeyRound className="size-4" aria-hidden="true" />
        Crear contraseña
      </Button>
    </form>
  );
}

// ---- Google ----

/**
 * Solo desvincular. No se ofrece "vincular" desde acá: el ingreso con Google decide por el email de
 * Google, y con un email distinto el backend crearía otra cuenta (ADR 0015/0023).
 */
function GoogleSection() {
  const me = useMe();
  const { refreshSession } = useSessionActions();
  const unlink = useMutation({
    mutationFn: unlinkGoogle,
    meta: { success: { title: "Desvinculaste Google", description: "Desde ahora ingresás con tu email y tu contraseña." } },
    onSuccess: () => refreshSession(),
  });
  return (
    <SettingsSection id="google" title="Ingreso con Google" description="Tu cuenta está vinculada con Google.">
      {unlink.isError && <Alert tone="danger">{errorMessage(unlink.error)}</Alert>}
      {me.hasPassword ? (
        <Button variant="secondary" onClick={() => unlink.mutate()} loading={unlink.isPending} className="self-start">
          Desvincular Google
        </Button>
      ) : (
        <p className="text-sm text-muted">Para desvincular Google, primero creá una contraseña: si no, no podrías volver a ingresar.</p>
      )}
    </SettingsSection>
  );
}

// ---- Dispositivos ----

function DevicesSection() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { sessionEnded } = useSessionActions();
  const signOut = useSignOut();
  const devices = useQuery({ queryKey: accountKeys.devices, queryFn: getDevices });
  const [confirmAll, setConfirmAll] = useState(false);
  const close = useMutation({
    mutationFn: closeDevice,
    meta: { success: "Cerramos la sesión en ese dispositivo" },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: accountKeys.devices }),
  });
  const closeAll = useMutation({
    mutationFn: closeAllDevices,
    meta: { success: { title: "Cerramos tu sesión en todos los dispositivos", description: "Para seguir, volvé a ingresar." } },
    onSuccess: () => {
      setConfirmAll(false);
      sessionEnded();
      router.push("/");
    },
  });

  return (
    <SettingsSection
      id="dispositivos"
      title="Dispositivos con tu sesión abierta"
      description="Si no reconocés alguno, cerralo y cambiá tu contraseña."
    >
      {devices.isPending ? (
        <Skeleton className="h-32 w-full" />
      ) : devices.isError ? (
        <Alert tone="danger">{errorMessage(devices.error)}</Alert>
      ) : (
        <ul className="flex flex-col divide-y divide-line rounded-2xl border border-line">
          {sortDevices(devices.data).map((device) => (
            <li key={device.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <MonitorSmartphone className="mt-0.5 size-5 shrink-0 text-brand-600" aria-hidden="true" />
                <div className="flex flex-col">
                  <span className="flex flex-wrap items-center gap-2 font-medium text-ink">
                    {deviceLabel(device.userAgent)}
                    {device.current && <Badge tone="success">Este dispositivo</Badge>}
                  </span>
                  <span className="text-sm text-muted">
                    {device.lastUsedAt ? `Último uso: ${formatDate(device.lastUsedAt)}` : `Desde el ${formatDate(device.createdAt)}`}
                  </span>
                </div>
              </div>
              {device.current ? (
                <Button variant="secondary" size="sm" onClick={signOut.ask}>
                  <LogOut className="size-4" aria-hidden="true" />
                  Cerrar sesión
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  loading={close.isPending && close.variables === device.id}
                  onClick={() => close.mutate(device.id)}
                >
                  Cerrar
                  <span className="sr-only"> la sesión en {deviceLabel(device.userAgent)}</span>
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      {close.isError && <Alert tone="danger">{errorMessage(close.error)}</Alert>}
      {signOut.dialog}
      <Button variant="ghost" onClick={() => setConfirmAll(true)} className="self-start">
        Cerrar sesión en todos los dispositivos
      </Button>
      <ConfirmDialog
        open={confirmAll}
        onClose={() => setConfirmAll(false)}
        title="¿Cerrar la sesión en todos los dispositivos?"
        description="También en este. Vas a tener que volver a ingresar en cada uno."
        confirmLabel="Cerrar en todos"
        onConfirm={() => closeAll.mutate()}
        pending={closeAll.isPending}
        error={closeAll.isError ? errorMessage(closeAll.error) : null}
      />
    </SettingsSection>
  );
}

/** El dispositivo actual primero; después, el usado más recientemente. */
function sortDevices(devices: Device[]): Device[] {
  return [...devices].sort((a, b) => {
    if (a.current !== b.current) return a.current ? -1 : 1;
    return (b.lastUsedAt ?? b.createdAt).localeCompare(a.lastUsedAt ?? a.createdAt);
  });
}

// ---- Baja ----

function DeleteAccountSection() {
  const me = useMe();
  const router = useRouter();
  const { sessionEnded } = useSessionActions();
  const [open, setOpen] = useState(false);
  const [password, setPasswordValue] = useState("");
  const remove = useMutation({
    mutationFn: () => deleteOwnAccount(me.hasPassword ? password : undefined),
    meta: {
      success: {
        title: "Diste de baja tu cuenta",
        description: "Si te arrepentís, escribinos dentro de los próximos 30 días y la restauramos.",
        tone: "info",
      },
    },
    onSuccess: () => {
      setOpen(false);
      sessionEnded();
      router.push("/");
    },
  });
  const error = remove.error
    ? isApiError(remove.error, "INVALID_CURRENT_PASSWORD")
      ? "La contraseña no es correcta."
      : isApiError(remove.error, "REAUTH_REQUIRED")
        ? REAUTH_MESSAGE
        : errorMessage(remove.error)
    : null;

  return (
    <SettingsSection
      id="baja"
      tone="danger"
      title="Dar de baja la cuenta"
      description="Se cierra la sesión en todos tus dispositivos. Tenés 30 días para arrepentirte escribiéndonos; después tus datos se anonimizan y la baja es definitiva."
    >
      <Button variant="danger" onClick={() => setOpen(true)} className="self-start">
        <Trash2 className="size-4" aria-hidden="true" />
        Dar de baja mi cuenta
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="¿Dar de baja tu cuenta?"
        description="Tus reseñas quedan publicadas como de un usuario eliminado. Tenés 30 días para pedir que la restauremos."
        role="alertdialog"
        icon={<FeedbackIcon tone="warning" size="lg" />}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            remove.mutate();
          }}
          className="flex flex-col gap-4"
        >
          {error && <Alert tone="danger">{error}</Alert>}
          {me.hasPassword && (
            <Field id="baja-password" label="Tu contraseña">
              {(a11y) => (
                <PasswordInput {...a11y} value={password} onChange={(e) => setPasswordValue(e.target.value)} autoComplete="current-password" required />
              )}
            </Field>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" loading={remove.isPending} disabled={me.hasPassword && !password}>
              Dar de baja
            </Button>
          </div>
        </form>
      </Dialog>
    </SettingsSection>
  );
}
