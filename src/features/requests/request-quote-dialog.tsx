"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Alert } from "@/components/ui/feedback";
import { Field, Textarea } from "@/components/ui/form-controls";
import { FormListbox } from "@/components/ui/form-listbox";
import { chatKeys } from "@/features/chat/api";
import { errorMessage, isApiError } from "@/lib/api/errors";
import { cn } from "@/lib/cn";
import { createRequest, DESCRIPTION_MAX, DESCRIPTION_MIN, requestKeys, type Urgency } from "./api";
import { urgencyHint, urgencyLabel } from "./labels";

const URGENCIES: Urgency[] = ["CAN_WAIT", "IMPATIENT", "URGENT"];

const schema = z.object({
  professionId: z.uuid("Elegí el oficio."),
  description: z
    .string()
    .trim()
    .min(DESCRIPTION_MIN, `Contá un poco más (al menos ${DESCRIPTION_MIN} caracteres).`)
    .max(DESCRIPTION_MAX, `Puede tener hasta ${DESCRIPTION_MAX} caracteres.`),
  urgency: z.enum(URGENCIES),
});
type Values = z.input<typeof schema>;

interface RequestQuoteDialogProps {
  open: boolean;
  onClose: () => void;
  professional: {
    userId: string;
    firstName: string;
    professions: { id: string; name: string; isPrimary: boolean }[];
  };
}

/**
 * Pedir presupuesto a un profesional (POST /requests). El pedido va a su chat con un mensaje
 * automático; después se sigue la negociación desde "Pedidos" o desde el chat.
 */
export function RequestQuoteDialog({ open, onClose, professional }: RequestQuoteDialogProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const primary = professional.professions.find((p) => p.isPrimary) ?? professional.professions[0];

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { professionId: primary?.id ?? "", description: "", urgency: "CAN_WAIT" },
  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;
  const description = useWatch({ control, name: "description" }) ?? "";
  const urgency = useWatch({ control, name: "urgency" });

  const create = useMutation({
    mutationFn: (values: z.output<typeof schema>) =>
      createRequest({ professionalIds: [professional.userId], ...values }),
    onSuccess: async (request) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: requestKeys.all }),
        // El pedido abre (o usa) el chat con un mensaje automático.
        queryClient.invalidateQueries({ queryKey: chatKeys.conversations }),
      ]);
      router.push(`/panel/pedidos/${request.id}` as Route);
    },
  });

  const submit = handleSubmit((values) => create.mutate(schema.parse(values)));

  const failure = create.error
    ? isApiError(create.error, "PROFESSIONAL_NOT_AVAILABLE")
      ? `${professional.firstName} no está disponible para pedidos en este momento.`
      : isApiError(create.error, "PROFESSION_NOT_OFFERED", "INVALID_PROFESSION")
        ? `${professional.firstName} ya no ofrece ese oficio. Recargá la página y elegí otro.`
        : errorMessage(create.error)
    : null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Pedir presupuesto a ${professional.firstName}`}
      description="Le llega por el chat. Te avisamos cuando responda o te mande un presupuesto."
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-5">
        {failure && <Alert tone="danger">{failure}</Alert>}
        {professional.professions.length > 1 && (
          <Field id="pedido-oficio" label="Oficio" error={errors.professionId?.message}>
            {(a11y) => (
              <FormListbox
                {...a11y}
                control={control}
                name="professionId"
                options={professional.professions.map((profession) => ({ value: profession.id, label: profession.name }))}
              />
            )}
          </Field>
        )}
        <Field
          id="pedido-descripcion"
          label="¿Qué necesitás?"
          hint={`Contá qué pasa, dónde y desde cuándo. ${description.length}/${DESCRIPTION_MAX}`}
          error={errors.description?.message}
          required
        >
          {(a11y) => (
            <Textarea
              {...a11y}
              {...register("description")}
              rows={4}
              maxLength={DESCRIPTION_MAX}
              placeholder="Ej.: Se corta la luz cuando prendo el horno. Es en un departamento."
            />
          )}
        </Field>
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-sm font-medium text-ink">¿Qué tan urgente es?</legend>
          {URGENCIES.map((value) => (
            <label
              key={value}
              className={cn(
                "flex cursor-pointer flex-col rounded-2xl border px-4 py-3 transition-colors",
                "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-electric-500",
                urgency === value ? "border-brand-600 bg-brand-50" : "border-line hover:border-brand-200",
              )}
            >
              <input type="radio" value={value} {...register("urgency")} className="sr-only" />
              <span className="font-semibold text-ink">{urgencyLabel[value]}</span>
              <span className="text-sm text-muted">{urgencyHint[value]}</span>
            </label>
          ))}
        </fieldset>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="accent" loading={create.isPending}>
            Enviar pedido
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
