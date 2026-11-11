"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { FeedbackIcon } from "@/components/ui/feedback-icon";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Turnstile } from "@/components/forms/turnstile";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/form-controls";
import { FormListbox } from "@/components/ui/form-listbox";
import { env } from "@/config/env";
import { api } from "@/lib/api/client";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { applyServerErrors } from "@/features/session/server-errors";

/** Categorías del backend (SupportCategory) con los nombres de ADR 0029. */
const contactCategories = [
  { value: "SUGGESTION", label: "Sugerencia" },
  { value: "BUG", label: "Falla de la página" },
  { value: "INCIDENT", label: "Incidencia" },
  { value: "COMPLAINT", label: "Reclamo" },
  { value: "OTHER", label: "Otro" },
] as const;

/** Mismas reglas que ContactDto del backend. */
const contactSchema = z.object({
  name: z.string().trim().min(2, "Ingresá tu nombre.").max(80, "El nombre puede tener hasta 80 caracteres."),
  email: z.email("Ingresá un email válido.").max(254, "El email es demasiado largo."),
  category: z.enum(["SUGGESTION", "BUG", "INCIDENT", "COMPLAINT", "OTHER"], "Elegí el motivo."),
  body: z
    .string()
    .trim()
    .min(10, "Contanos un poco más (al menos 10 caracteres).")
    .max(2000, "El mensaje puede tener hasta 2000 caracteres."),
});
type ContactValues = z.input<typeof contactSchema>;

const MAX_BODY = 2000;

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", category: "" as ContactValues["category"], body: "" },
  });
  const body = useWatch({ control, name: "body" }) ?? "";

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    if (env.turnstileSiteKey && !captchaToken) {
      setFormError("Completá la verificación para seguir.");
      return;
    }
    try {
      await api("/support/contact", {
        method: "POST",
        body: { ...contactSchema.parse(values), ...(captchaToken ? { captchaToken } : {}) },
      });
      setSent(true);
    } catch (error) {
      setCaptchaToken(null);
      if (isApiError(error, "TOO_MANY_REQUESTS")) {
        setFormError("Ya recibimos varios mensajes desde tu conexión en la última hora. Probá más tarde o escribinos por email.");
        return;
      }
      setFormError(applyServerErrors(error, setError) ? "Revisá los datos marcados." : errorMessage(error));
    }
  });

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-6 text-center">
        <FeedbackIcon tone="success" size="lg" />
        <h2 className="text-2xl font-bold text-brand-900">¡Recibimos tu mensaje!</h2>
        <p className="max-w-md text-muted">Te respondemos al email que nos dejaste, dentro de las 48 a 72 horas hábiles.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {formError && <Alert tone="danger">{formError}</Alert>}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contacto-nombre" label="Nombre" required error={errors.name?.message}>
          {(a11y) => <Input {...a11y} {...register("name")} autoComplete="name" />}
        </Field>
        <Field id="contacto-email" label="Email" required hint="Te respondemos a este email." error={errors.email?.message}>
          {(a11y) => <Input {...a11y} {...register("email")} type="email" inputMode="email" autoComplete="email" />}
        </Field>
      </div>
      <Field id="contacto-motivo" label="Motivo" required error={errors.category?.message}>
        {(a11y) => (
          <FormListbox {...a11y} control={control} name="category" placeholder="Elegí el motivo" options={contactCategories} />
        )}
      </Field>
      <Field
        id="contacto-mensaje"
        label="Mensaje"
        required
        hint={`${body.length}/${MAX_BODY} caracteres`}
        error={errors.body?.message}
      >
        {(a11y) => <Textarea {...a11y} {...register("body")} rows={6} maxLength={MAX_BODY} />}
      </Field>
      {env.turnstileSiteKey && <Turnstile onToken={setCaptchaToken} />}
      <Button type="submit" size="lg" loading={isSubmitting} className="self-start">
        <Send className="size-4" aria-hidden="true" />
        Enviar mensaje
      </Button>
    </form>
  );
}
