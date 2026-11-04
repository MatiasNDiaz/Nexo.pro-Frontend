"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, ShieldCheck } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { AuthDivider, GoogleButton } from "@/components/forms/google-button";
import { Turnstile } from "@/components/forms/turnstile";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form-controls";
import { PasswordInput } from "@/components/ui/password-input";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { login, verifyMfa } from "./api";
import { loginSchema, mfaSchema, safeNextPath, type LoginValues, type MfaValues } from "./schemas";
import { useSessionActions } from "./session-provider";
import { useViewer } from "./viewer";

/** Ingreso con email y contraseña; si la cuenta es de admin, sigue el segundo factor (TOTP). */
export function LoginForm() {
  const viewer = useViewer();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("siguiente")) as Route;
  const { refreshSession } = useSessionActions();
  const [step, setStep] = useState<"credentials" | "mfa">("credentials");

  // Con sesión abierta no tiene sentido ingresar de nuevo.
  useEffect(() => {
    if (viewer.status === "authenticated") router.replace(next);
  }, [viewer.status, router, next]);

  const done = async () => {
    await refreshSession();
    router.replace(next);
  };

  return step === "credentials" ? (
    <CredentialsStep onMfaRequired={() => setStep("mfa")} onSuccess={done} />
  ) : (
    <MfaStep onSuccess={done} onBack={() => setStep("credentials")} />
  );
}

function CredentialsStep({ onMfaRequired, onSuccess }: { onMfaRequired: () => void; onSuccess: () => Promise<void> }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaNeeded, setCaptchaNeeded] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    if (captchaNeeded && !captchaToken) {
      setFormError("Completá la verificación para seguir.");
      return;
    }
    try {
      const result = await login({ ...values, ...(captchaToken ? { captchaToken } : {}) });
      if ("mfaRequired" in result) onMfaRequired();
      else await onSuccess();
    } catch (error) {
      if (isApiError(error, "CAPTCHA_REQUIRED")) setCaptchaNeeded(true);
      // El token de Turnstile es de un solo uso: después de un intento hay que pedir otro.
      setCaptchaToken(null);
      setFormError(errorMessage(error));
    }
  });

  return (
    <div className="flex flex-col gap-5">
      <GoogleButton />
      <AuthDivider />
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {formError && <Alert tone="danger">{formError}</Alert>}
        <Field id="login-email" label="Email" error={errors.email?.message}>
          {(a11y) => (
            <Input {...a11y} {...register("email")} type="email" autoComplete="email" inputMode="email" autoFocus />
          )}
        </Field>
        <Field id="login-password" label="Contraseña" error={errors.password?.message}>
          {(a11y) => <PasswordInput {...a11y} {...register("password")} autoComplete="current-password" />}
        </Field>
        {captchaNeeded && <Turnstile onToken={setCaptchaToken} />}
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          <LogIn className="size-5" aria-hidden="true" />
          Ingresar
        </Button>
      </form>
      <div className="flex flex-col gap-2 border-t border-line pt-5 text-sm text-muted">
        <p>
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
            Creá una gratis
          </Link>
        </p>
        <p>
          ¿Olvidaste tu contraseña?{" "}
          <Link href="/contacto" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
            Escribinos
          </Link>{" "}
          y te ayudamos a recuperarla.
        </p>
      </div>
    </div>
  );
}

function MfaStep({ onSuccess, onBack }: { onSuccess: () => Promise<void>; onBack: () => void }) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MfaValues>({ resolver: zodResolver(mfaSchema), defaultValues: { method: "code", code: "" } });
  const method = useWatch({ control, name: "method" });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await verifyMfa(values.method === "code" ? { code: values.code } : { recoveryCode: values.recoveryCode });
      await onSuccess();
    } catch (error) {
      setFormError(
        isApiError(error, "UNAUTHORIZED") ? "El tiempo para ingresar el código venció. Volvé a empezar." : errorMessage(error),
      );
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      <Alert tone="info" title="Verificación en dos pasos">
        {method === "code"
          ? "Ingresá el código de 6 números de tu aplicación de autenticación."
          : "Ingresá uno de tus códigos de recuperación. Cada código sirve una sola vez."}
      </Alert>
      {formError && <Alert tone="danger">{formError}</Alert>}
      {method === "code" ? (
        <Field id="mfa-code" label="Código" error={"code" in errors ? errors.code?.message : undefined}>
          {(a11y) => (
            <Input
              {...a11y}
              {...register("code")}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              autoFocus
              className="text-center text-xl tracking-[0.5em]"
            />
          )}
        </Field>
      ) : (
        <Field
          id="mfa-recovery"
          label="Código de recuperación"
          error={"recoveryCode" in errors ? errors.recoveryCode?.message : undefined}
        >
          {(a11y) => <Input {...a11y} {...register("recoveryCode")} autoComplete="off" autoFocus />}
        </Field>
      )}
      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        <ShieldCheck className="size-5" aria-hidden="true" />
        Verificar
      </Button>
      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            method === "code"
              ? setValue("method", "recovery", { shouldValidate: false })
              : setValue("method", "code", { shouldValidate: false })
          }
        >
          {method === "code" ? "Usar un código de recuperación" : "Usar el código de la aplicación"}
        </Button>
        <Button variant="ghost" size="sm" onClick={onBack}>
          Volver
        </Button>
      </div>
    </form>
  );
}
