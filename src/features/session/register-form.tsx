"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Briefcase, Home, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { AuthDivider, GoogleButton } from "@/components/forms/google-button";
import { Turnstile } from "@/components/forms/turnstile";
import { Button, ButtonLink } from "@/components/ui/button";
import { FeedbackIcon } from "@/components/ui/feedback-icon";
import { Alert } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form-controls";
import { PasswordInput } from "@/components/ui/password-input";
import { env } from "@/config/env";
import { errorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { register as registerAccount } from "./api";
import { ProfileFields } from "./profile-fields";
import { registerSchema, toRegistrationBody, type RegisterValues } from "./schemas";
import { applyServerErrors } from "./server-errors";
import { useViewer } from "./viewer";

type Role = RegisterValues["role"];

const roles: { value: Role; title: string; text: string; icon: typeof Home }[] = [
  { value: "CUSTOMER", title: "Busco profesionales", text: "Para arreglos y trabajos en tu casa.", icon: Home },
  { value: "PROFESSIONAL", title: "Soy profesional", text: "Para ofrecer tus servicios. 30 días de prueba.", icon: Briefcase },
];

/** Elección de rol: dos tarjetas que funcionan como radio buttons (teclado incluido). */
export function RoleChooser({ value, onChange }: { value: Role; onChange: (role: Role) => void }) {
  return (
    <fieldset>
      <legend className="mb-3 text-sm font-medium text-ink">¿Cómo vas a usar Repara Ya?</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {roles.map((role) => {
          const checked = value === role.value;
          return (
            <label
              key={role.value}
              className={cn(
                "relative flex cursor-pointer gap-3 rounded-2xl border p-4 transition-[border-color,background-color,box-shadow] duration-200",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-electric-500",
                checked ? "border-brand-600 bg-brand-50 shadow-card" : "border-line hover:border-brand-200",
              )}
            >
              <input
                type="radio"
                name="rol"
                value={role.value}
                checked={checked}
                onChange={() => onChange(role.value)}
                className="sr-only"
              />
              <span
                className={cn(
                  "grid size-10 shrink-0 place-items-center rounded-xl transition-colors",
                  checked ? "bg-brand-700 text-white" : "bg-brand-50 text-brand-700",
                )}
              >
                <role.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="flex flex-col">
                <span className="font-semibold text-ink">{role.title}</span>
                <span className="text-sm text-muted">{role.text}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function RegisterForm() {
  const viewer = useViewer();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole: Role = searchParams.get("rol") === "profesional" ? "PROFESSIONAL" : "CUSTOMER";
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  useEffect(() => {
    if (viewer.status === "authenticated") router.replace("/panel");
  }, [viewer.status, router]);

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: initialRole,
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      password: "",
      customerLocalityId: "",
      customerNeighborhood: "",
      professionId: "",
      serviceAreas: [],
    },
  });
  const role = useWatch({ control: form.control, name: "role" });
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = form;

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    if (env.turnstileSiteKey && !captchaToken) {
      setFormError("Completá la verificación para seguir.");
      return;
    }
    try {
      const parsed = registerSchema.parse(values);
      await registerAccount({
        ...toRegistrationBody(parsed),
        email: parsed.email,
        password: parsed.password,
        ...(captchaToken ? { captchaToken } : {}),
      });
      setSentTo(parsed.email);
    } catch (error) {
      setCaptchaToken(null);
      const placed = applyServerErrors(error, setError);
      setFormError(placed ? "Revisá los datos marcados." : errorMessage(error));
    }
  });

  if (sentTo) return <RegistrationSent email={sentTo} />;

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-6">
        <RoleChooser value={role} onChange={(value) => form.setValue("role", value, { shouldValidate: form.formState.isSubmitted })} />
        <GoogleButton label="Registrarme con Google" />
        <AuthDivider />
        <form onSubmit={submit} noValidate className="flex flex-col gap-5">
          {formError && <Alert tone="danger">{formError}</Alert>}
          <ProfileFields />
          <div className="grid gap-5 sm:grid-cols-2">
            <Field id="reg-email" label="Email" required error={errors.email?.message}>
              {(a11y) => <Input {...a11y} {...register("email")} type="email" inputMode="email" autoComplete="email" />}
            </Field>
            <Field
              id="reg-password"
              label="Contraseña"
              required
              hint="Al menos 8 caracteres. Mejor si es una frase que no uses en otro sitio."
              error={errors.password?.message}
            >
              {(a11y) => <PasswordInput {...a11y} {...register("password")} autoComplete="new-password" />}
            </Field>
          </div>
          {env.turnstileSiteKey && <Turnstile onToken={setCaptchaToken} />}
          <Button type="submit" variant="accent" size="lg" fullWidth loading={isSubmitting}>
            <UserPlus className="size-5" aria-hidden="true" />
            Crear mi cuenta
          </Button>
          <p className="text-center text-sm text-muted">
            ¿Ya tenés cuenta?{" "}
            <Link href="/ingresar" className="font-semibold text-brand-700 underline-offset-4 hover:underline">
              Ingresá
            </Link>
          </p>
        </form>
      </div>
    </FormProvider>
  );
}

/**
 * El backend responde lo mismo exista o no el email (no revela cuentas): el mensaje lo refleja.
 * El siguiente paso real es verificar el email desde el enlace y después ingresar.
 */
function RegistrationSent({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center" role="status">
      <FeedbackIcon tone="success" size="lg" />
      <h2 className="text-2xl font-bold text-brand-900">Revisá tu email</h2>
      <p className="text-muted">
        Si <span className="font-semibold break-all text-ink">{email}</span> no estaba registrado, te enviamos un enlace
        para verificarlo. Abrilo desde ese mismo email y después ingresá a tu cuenta.
      </p>
      <p className="text-sm text-muted">Si no lo ves en unos minutos, revisá la carpeta de spam.</p>
      <ButtonLink href="/ingresar" size="lg" fullWidth>
        Ir a ingresar
      </ButtonLink>
    </div>
  );
}
