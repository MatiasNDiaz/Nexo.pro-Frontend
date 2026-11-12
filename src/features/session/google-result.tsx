"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, Mail, UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { z } from "@/lib/zod";
import { Turnstile } from "@/components/forms/turnstile";
import { Button, ButtonLink } from "@/components/ui/button";
import { Alert, Skeleton } from "@/components/ui/feedback";
import { Field } from "@/components/ui/form-controls";
import { PasswordInput } from "@/components/ui/password-input";
import { env } from "@/config/env";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { fetchGooglePending, linkGoogleWithPassword, registerWithGoogle, requestGoogleLinkEmail, type GooglePending, type Me } from "./api";
import { LinkResult } from "./link-result";
import { ProfileFields } from "./profile-fields";
import { RoleChooser } from "./register-form";
import { profileSchema, toRegistrationBody, type ProfileValues } from "./schemas";
import { applyServerErrors } from "./server-errors";
import { sessionQueryKey, useSessionActions, welcome } from "./session-provider";

/** Motivos de error que manda el backend en `?codigo=` (google-auth.service.ts). */
const errorReasons: Record<string, string> = {
  CANCELLED: "Cancelaste el ingreso con Google.",
  INVALID_STATE: "El ingreso tardó demasiado o se abrió en otra pestaña. Volvé a intentarlo.",
  GOOGLE_FAILED: "Google no respondió como esperábamos. Volvé a intentarlo en unos minutos.",
  EMAIL_NOT_VERIFIED: "Tu cuenta de Google no tiene el email verificado.",
  ACCOUNT_UNAVAILABLE: "Esta cuenta no está disponible para ingresar.",
  GOOGLE_NOT_ALLOWED: "Esta cuenta no puede ingresar con Google. Usá tu email y contraseña.",
  OTHER_GOOGLE_ACCOUNT: "Tu cuenta de Repara Ya ya está vinculada a otra cuenta de Google.",
};

export function GoogleResult() {
  const searchParams = useSearchParams();
  const result = searchParams.get("resultado");
  const code = searchParams.get("codigo");

  switch (result) {
    case "session":
      return <GoogleSession />;
    case "link":
      return <PendingLoader>{(pending) => <GoogleLink pending={pending} />}</PendingLoader>;
    case "signup":
      return <PendingLoader>{(pending) => <GoogleSignup pending={pending} />}</PendingLoader>;
    default:
      return (
        <LinkResult
          tone="error"
          title="No pudimos ingresar con Google"
          actions={
            <ButtonLink href="/ingresar" fullWidth>
              Volver a ingresar
            </ButtonLink>
          }
        >
          <p>{(code && errorReasons[code]) ?? "Volvé a intentarlo o ingresá con tu email y contraseña."}</p>
        </LinkResult>
      );
  }
}

/** La cuenta de Google ya estaba vinculada: las cookies de sesión ya quedaron puestas. */
function GoogleSession() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { refreshSession } = useSessionActions();
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    // La página se abre con la sesión ya puesta por Google: se saluda acá (el proveedor de sesión solo
    // saluda cuando la sesión empieza durante la visita).
    void refreshSession().then(() => {
      const me = queryClient.getQueryData<Me | null>(sessionQueryKey);
      if (me) welcome(me);
      router.replace("/panel");
    });
  }, [queryClient, refreshSession, router]);
  return <LinkResult tone="pending" title="Ingresando…" />;
}

/** Datos del ingreso con Google a medio terminar (30 minutos). */
function PendingLoader({ children }: { children: (pending: GooglePending) => ReactNode }) {
  const pending = useQuery({ queryKey: ["google-pending"], queryFn: fetchGooglePending, retry: false, staleTime: Infinity });
  if (pending.isPending) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }
  if (pending.isError) {
    return (
      <LinkResult
        tone="error"
        title={isApiError(pending.error, "GOOGLE_PENDING_EXPIRED") ? "El ingreso con Google venció" : "No pudimos seguir"}
        actions={
          <ButtonLink href="/ingresar" fullWidth>
            Volver a empezar
          </ButtonLink>
        }
      >
        <p>{isApiError(pending.error, "GOOGLE_PENDING_EXPIRED") ? "Tenés 30 minutos para completarlo." : errorMessage(pending.error)}</p>
      </LinkResult>
    );
  }
  return <>{children(pending.data)}</>;
}

/**
 * El email de Google ya tiene cuenta con contraseña. No se vincula solo (ADR 0015): hay que probar
 * que es tuya con la contraseña o con un enlace al email de la cuenta.
 */
function GoogleLink({ pending }: { pending: GooglePending }) {
  const router = useRouter();
  const { refreshSession } = useSessionActions();
  const [formError, setFormError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [sending, setSending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<{ password: string }>({
    resolver: zodResolver(z.object({ password: z.string().min(1, "Ingresá tu contraseña.") })),
    defaultValues: { password: "" },
  });

  const submit = handleSubmit(async ({ password }) => {
    setFormError(null);
    try {
      await linkGoogleWithPassword(password);
      await refreshSession();
      router.replace("/panel");
    } catch (error) {
      setFormError(errorMessage(error));
    }
  });

  return (
    <div className="flex flex-col gap-5">
      <Alert tone="info" title="Ya tenés una cuenta con este email">
        <span className="break-all">{pending.email}</span> ya está registrado. Confirmá que es tuyo para poder ingresar
        también con Google.
      </Alert>
      {formError && <Alert tone="danger">{formError}</Alert>}
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Field id="google-link-password" label="Tu contraseña de Repara Ya" error={errors.password?.message}>
          {(a11y) => <PasswordInput {...a11y} {...register("password")} autoComplete="current-password" autoFocus />}
        </Field>
        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          <Link2 className="size-5" aria-hidden="true" />
          Vincular e ingresar
        </Button>
      </form>
      <div className="border-t border-line pt-5">
        {emailSent ? (
          <Alert tone="success">Te enviamos un enlace a tu email para confirmar la vinculación.</Alert>
        ) : (
          <Button
            variant="secondary"
            fullWidth
            loading={sending}
            onClick={async () => {
              setSending(true);
              setFormError(null);
              try {
                await requestGoogleLinkEmail();
                setEmailSent(true);
              } catch (error) {
                setFormError(errorMessage(error));
              } finally {
                setSending(false);
              }
            }}
          >
            <Mail className="size-4" aria-hidden="true" />
            No recuerdo mi contraseña: enviarme un enlace
          </Button>
        )}
      </div>
    </div>
  );
}

/** Email nuevo: se completan los mismos datos que en el registro (sin email ni contraseña). */
function GoogleSignup({ pending }: { pending: GooglePending }) {
  const router = useRouter();
  const { refreshSession } = useSessionActions();
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      role: "CUSTOMER",
      firstName: pending.firstName ?? "",
      lastName: pending.lastName ?? "",
      phone: "",
      customerLocalityId: "",
      customerNeighborhood: "",
      professionId: "",
      serviceAreas: [],
    },
  });
  const role = useWatch({ control: form.control, name: "role" });

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    if (env.turnstileSiteKey && !captchaToken) {
      setFormError("Completá la verificación para seguir.");
      return;
    }
    try {
      await registerWithGoogle({
        ...toRegistrationBody(profileSchema.parse(values)),
        ...(captchaToken ? { captchaToken } : {}),
      });
      await refreshSession();
      router.replace("/panel");
    } catch (error) {
      setCaptchaToken(null);
      const placed = applyServerErrors(error, form.setError);
      setFormError(placed ? "Revisá los datos marcados." : errorMessage(error));
    }
  });

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-6">
        <Alert tone="info" title="Completá tu registro">
          Vas a ingresar con <span className="break-all">{pending.email}</span>. Faltan algunos datos para crear tu
          cuenta.
        </Alert>
        <RoleChooser value={role} onChange={(value) => form.setValue("role", value)} />
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          {formError && <Alert tone="danger">{formError}</Alert>}
          <ProfileFields />
          {env.turnstileSiteKey && <Turnstile onToken={setCaptchaToken} />}
          <Button type="submit" variant="accent" size="lg" fullWidth loading={form.formState.isSubmitting}>
            <UserPlus className="size-5" aria-hidden="true" />
            Crear mi cuenta
          </Button>
        </form>
      </div>
    </FormProvider>
  );
}
