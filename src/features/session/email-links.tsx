"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LogOut, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Field } from "@/components/ui/form-controls";
import { PasswordInput } from "@/components/ui/password-input";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { closeSessionByLink, confirmGoogleLink, resendVerificationEmail, resetPassword, verifyEmail } from "./api";
import { LinkResult } from "./link-result";
import { resetPasswordSchema, type ResetPasswordValues } from "./schemas";
import { useSessionActions } from "./session-provider";
import { useUrlToken } from "./use-url-token";
import { useViewer } from "./viewer";

function MissingToken() {
  return (
    <LinkResult
      tone="error"
      title="El enlace está incompleto"
      actions={
        <ButtonLink href="/" variant="secondary" fullWidth>
          Ir al inicio
        </ButtonLink>
      }
    >
      <p>Abrí el enlace directamente desde el email que te enviamos.</p>
    </LinkResult>
  );
}

// ---- /verificar-email ----

type VerifyState = { kind: "verifying" } | { kind: "done" } | { kind: "invalid" } | { kind: "failed"; message: string };

/** Verifica el email apenas se abre el enlace (el token es de un solo uso). */
export function VerifyEmail() {
  const token = useUrlToken();
  const viewer = useViewer();
  const { refreshSession } = useSessionActions();
  const [state, setState] = useState<VerifyState>({ kind: "verifying" });
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true; // Una sola vez, aunque React monte dos veces en desarrollo.
    verifyEmail(token)
      .then(async () => {
        setState({ kind: "done" });
        await refreshSession();
      })
      .catch((error: unknown) =>
        setState(isApiError(error, "INVALID_TOKEN") ? { kind: "invalid" } : { kind: "failed", message: errorMessage(error) }),
      );
  }, [token, refreshSession]);

  if (!token) return <MissingToken />;
  const signedIn = viewer.status === "authenticated";

  switch (state.kind) {
    case "verifying":
      return <LinkResult tone="pending" title="Verificando tu email…" />;
    case "done":
      return (
        <LinkResult
          tone="success"
          title="¡Email verificado!"
          actions={
            <ButtonLink href={signedIn ? "/panel" : "/ingresar"} size="lg" fullWidth>
              {signedIn ? "Ir a mi panel" : "Ingresar"}
            </ButtonLink>
          }
        >
          <p>El siguiente paso es cargar tu foto de perfil y verificar tu identidad desde tu panel.</p>
        </LinkResult>
      );
    case "invalid":
      return (
        <LinkResult
          tone="error"
          title="El enlace venció o ya se usó"
          actions={
            signedIn ? (
              <ResendButton />
            ) : (
              <ButtonLink href="/ingresar" fullWidth>
                Ingresar
              </ButtonLink>
            )
          }
        >
          <p>Los enlaces de verificación duran 24 horas y sirven una sola vez.</p>
          {!signedIn && <p>Si tu email todavía no está verificado, ingresá y pedí un enlace nuevo desde tu panel.</p>}
        </LinkResult>
      );
    case "failed":
      return (
        <LinkResult
          tone="error"
          title="No pudimos verificar tu email"
          actions={
            <ButtonLink href="/" variant="secondary" fullWidth>
              Ir al inicio
            </ButtonLink>
          }
        >
          <p>{state.message}</p>
        </LinkResult>
      );
  }
}

/** Pide un enlace nuevo (requiere sesión; el backend permite 3 por hora). */
export function ResendButton() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  if (status === "sent") return <Alert tone="success">Te enviamos un enlace nuevo. Revisá tu email.</Alert>;
  return (
    <div className="flex flex-col gap-2">
      {error && <Alert tone="danger">{error}</Alert>}
      <Button
        fullWidth
        loading={status === "sending"}
        onClick={async () => {
          setStatus("sending");
          setError(null);
          try {
            await resendVerificationEmail();
            setStatus("sent");
          } catch (e) {
            setError(errorMessage(e));
            setStatus("idle");
          }
        }}
      >
        <Mail className="size-4" aria-hidden="true" />
        Enviarme un enlace nuevo
      </Button>
    </div>
  );
}

// ---- /restablecer-contrasena ----

/** Contraseña nueva desde el enlace que dispara el admin (ADR 0002). Cierra todas las sesiones. */
export function ResetPasswordForm() {
  const token = useUrlToken();
  const [done, setDone] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  if (!token) return <MissingToken />;
  if (done) {
    return (
      <LinkResult
        tone="success"
        title="Listo, cambiaste tu contraseña"
        actions={
          <ButtonLink href="/ingresar" size="lg" fullWidth>
            Ingresar
          </ButtonLink>
        }
      >
        <p>Por seguridad cerramos la sesión en todos tus dispositivos. Ingresá con tu contraseña nueva.</p>
      </LinkResult>
    );
  }

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await resetPassword(token, values.newPassword);
      setDone(true);
    } catch (error) {
      setFormError(errorMessage(error));
    }
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {formError && <Alert tone="danger">{formError}</Alert>}
      <Field id="reset-nueva" label="Contraseña nueva" required hint="Al menos 8 caracteres." error={errors.newPassword?.message}>
        {(a11y) => <PasswordInput {...a11y} {...register("newPassword")} autoComplete="new-password" autoFocus />}
      </Field>
      <Field id="reset-repetir" label="Repetí la contraseña" required error={errors.confirmPassword?.message}>
        {(a11y) => <PasswordInput {...a11y} {...register("confirmPassword")} autoComplete="new-password" />}
      </Field>
      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        <KeyRound className="size-5" aria-hidden="true" />
        Guardar contraseña
      </Button>
    </form>
  );
}

// ---- /cerrar-sesion ----

/**
 * "No fui yo" del email de dispositivo nuevo (ADR 0031). Es un botón, no una acción automática:
 * los servicios de email abren los enlaces para revisarlos y no deben cerrar sesiones solos.
 */
export function CloseSessionByLink() {
  const token = useUrlToken();
  const [state, setState] = useState<"idle" | "sending" | "closed" | "already" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!token) return <MissingToken />;
  if (state === "closed" || state === "already") {
    return (
      <LinkResult
        tone="success"
        title={state === "closed" ? "Cerramos esa sesión" : "Esa sesión ya estaba cerrada"}
        actions={
          <ButtonLink href="/ingresar" fullWidth>
            Ingresar
          </ButtonLink>
        }
      >
        <p>Si no reconocés ese ingreso, te recomendamos cambiar tu contraseña desde tu panel.</p>
      </LinkResult>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-muted">
        Si no reconocés el ingreso que te avisamos por email, cerrá esa sesión. Tus otros dispositivos siguen con la
        sesión abierta.
      </p>
      {state === "error" && <Alert tone="danger">{message}</Alert>}
      <Button
        variant="danger"
        size="lg"
        fullWidth
        loading={state === "sending"}
        onClick={async () => {
          setState("sending");
          try {
            const result = await closeSessionByLink(token);
            setState(result.closed ? "closed" : "already");
          } catch (error) {
            setMessage(errorMessage(error));
            setState("error");
          }
        }}
      >
        <LogOut className="size-5" aria-hidden="true" />
        Cerrar esa sesión
      </Button>
    </div>
  );
}

// ---- /vincular-google ----

/** Confirma desde el email la vinculación con Google; inicia sesión al terminar. */
export function ConfirmGoogleLink() {
  const token = useUrlToken();
  const router = useRouter();
  const { refreshSession } = useSessionActions();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!token) return <MissingToken />;
  return (
    <div className="flex flex-col gap-5">
      <p className="text-muted">
        Confirmá que querés poder ingresar a tu cuenta de Repara Ya también con tu cuenta de Google.
      </p>
      {error && <Alert tone="danger">{error}</Alert>}
      <Button
        size="lg"
        fullWidth
        loading={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          try {
            await confirmGoogleLink(token);
            await refreshSession();
            router.replace("/panel");
          } catch (e) {
            setError(
              isApiError(e, "GOOGLE_PENDING_EXPIRED")
                ? "La vinculación venció. Volvé a ingresar con Google."
                : errorMessage(e),
            );
            setPending(false);
          }
        }}
      >
        Confirmar vinculación
      </Button>
    </div>
  );
}
