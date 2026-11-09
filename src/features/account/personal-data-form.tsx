"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Alert, Skeleton } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/form-controls";
import { FormListbox } from "@/components/ui/form-listbox";
import { useLocalities, useNeighborhoodSuggestions, useProvinces } from "@/features/catalogs/queries";
import { neighborhoodName, personName, phoneSchema } from "@/features/session/schemas";
import { useSessionActions } from "@/features/session/session-provider";
import { errorMessage, fieldErrors, isApiError } from "@/lib/api/errors";
import { accountKeys, getPersonalData, updatePersonalData, type PersonalData } from "./api";
import { SettingsSection } from "./settings-section";
import { useMe } from "./use-me";

const schema = z
  .object({
    firstName: personName("nombre"),
    lastName: personName("apellido"),
    phone: phoneSchema,
    changeNeighborhood: z.boolean(),
    localityId: z.string(),
    neighborhood: z.string(),
  })
  .superRefine((values, ctx) => {
    if (!values.changeNeighborhood) return;
    if (!z.uuid().safeParse(values.localityId).success) {
      ctx.addIssue({ code: "custom", path: ["localityId"], message: "Elegí la localidad." });
    }
    const name = neighborhoodName.safeParse(values.neighborhood);
    if (!name.success) ctx.addIssue({ code: "custom", path: ["neighborhood"], message: name.error.issues[0]!.message });
  });
type Values = z.input<typeof schema>;

/** Datos personales (ADR 0021): teléfono y barrio cambian al instante; el nombre, con la identidad aprobada, queda en revisión. */
export function PersonalDataSection() {
  const personal = useQuery({ queryKey: accountKeys.personal, queryFn: getPersonalData });
  return (
    <SettingsSection id="datos" title="Datos personales" description="Tu nombre se ve en tu perfil y en tus conversaciones.">
      {personal.isPending ? (
        <div className="flex flex-col gap-4" aria-busy="true">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      ) : personal.isError ? (
        <Alert tone="danger">{errorMessage(personal.error)}</Alert>
      ) : (
        // Una vez por cuenta: si se re-montara con cada cambio de datos, se perdería el aviso de "guardado".
        <PersonalDataForm key={personal.data.id} data={personal.data} />
      )}
    </SettingsSection>
  );
}

function PersonalDataForm({ data }: { data: PersonalData }) {
  const me = useMe();
  const queryClient = useQueryClient();
  const { refreshSession } = useSessionActions();
  const [saved, setSaved] = useState<string | null>(null);
  const isCustomer = me.role === "CUSTOMER";
  const identityApproved = me.verificationStatus === "APPROVED";

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: data.pendingFirstName ?? data.firstName,
      lastName: data.pendingLastName ?? data.lastName,
      phone: data.phone,
      changeNeighborhood: false,
      localityId: "",
      neighborhood: "",
    },
  });
  const {
    register,
    handleSubmit,
    setError,
    control,
    setValue,
    formState: { errors, isDirty },
  } = form;
  const changeNeighborhood = useWatch({ control, name: "changeNeighborhood" });

  const mutation = useMutation({
    mutationFn: updatePersonalData,
    onSuccess: async (updated) => {
      queryClient.setQueryData(accountKeys.personal, updated);
      // Lo guardado pasa a ser el estado "sin cambios" del formulario.
      form.reset({
        firstName: updated.pendingFirstName ?? updated.firstName,
        lastName: updated.pendingLastName ?? updated.lastName,
        phone: updated.phone,
        changeNeighborhood: false,
        localityId: "",
        neighborhood: "",
      });
      await refreshSession();
      setSaved(
        updated.pendingFirstName || updated.pendingLastName
          ? "Guardamos tus datos. El nombre nuevo queda en revisión y mientras tanto se ve el anterior."
          : "Guardamos tus datos.",
      );
    },
  });

  const submit = handleSubmit((values) => {
    setSaved(null);
    const parsed = schema.parse(values);
    // Solo lo que cambió: un nombre sin cambios no vuelve a revisión.
    const body: Parameters<typeof updatePersonalData>[0] = {};
    if (parsed.firstName !== (data.pendingFirstName ?? data.firstName)) body.firstName = parsed.firstName;
    if (parsed.lastName !== (data.pendingLastName ?? data.lastName)) body.lastName = parsed.lastName;
    if (parsed.phone !== data.phone) body.phone = parsed.phone;
    if (isCustomer && parsed.changeNeighborhood) {
      body.neighborhood = { localityId: parsed.localityId, name: parsed.neighborhood.trim() };
    }
    if (Object.keys(body).length === 0) {
      setSaved("No había cambios para guardar.");
      return;
    }
    mutation.mutate(body, {
      onError: (error) => {
        // Nombres de campos de ESTE formulario (el mapeo del registro usa otros).
        if (isApiError(error, "INVALID_NEIGHBORHOOD")) {
          setError("neighborhood", { message: "Revisá la localidad y el barrio." });
          return;
        }
        const aliases: Record<string, keyof Values> = {
          "neighborhood.name": "neighborhood",
          "neighborhood.localityId": "localityId",
          firstName: "firstName",
          lastName: "lastName",
          phone: "phone",
        };
        const fields = Object.entries(fieldErrors(error)).filter(([field]) => aliases[field]);
        fields.forEach(([field, message]) => setError(aliases[field]!, { message }));
        if (fields.length === 0) setError("root", { message: errorMessage(error) });
      },
    });
  });

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {errors.root && <Alert tone="danger">{errors.root.message}</Alert>}
      {saved && <Alert tone="success">{saved}</Alert>}
      {(data.pendingFirstName || data.pendingLastName) && (
        <p className="flex items-center gap-1.5 text-sm text-amber-800">
          <Clock className="size-4" aria-hidden="true" />
          Nombre en revisión. Hoy se ve como {data.firstName} {data.lastName}.
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="datos-nombre"
          label="Nombre"
          hint={identityApproved ? "Si lo cambiás, lo revisa nuestro equipo." : undefined}
          error={errors.firstName?.message}
        >
          {(a11y) => <Input {...a11y} {...register("firstName")} autoComplete="given-name" />}
        </Field>
        <Field id="datos-apellido" label="Apellido" error={errors.lastName?.message}>
          {(a11y) => <Input {...a11y} {...register("lastName")} autoComplete="family-name" />}
        </Field>
      </div>
      <Field id="datos-telefono" label="Teléfono" hint="Con código de área, sin 0 ni 15." error={errors.phone?.message}>
        {(a11y) => <Input {...a11y} {...register("phone")} type="tel" inputMode="tel" autoComplete="tel" />}
      </Field>

      {isCustomer && (
        <div className="flex flex-col gap-3 rounded-2xl border border-line p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium text-ink">Barrio donde vivís</p>
              <p className="text-sm text-muted">{data.neighborhoodName ?? "Sin barrio cargado"}</p>
            </div>
            {!changeNeighborhood && (
              <Button variant="secondary" size="sm" onClick={() => setValue("changeNeighborhood", true, { shouldDirty: true })}>
                Cambiar barrio
              </Button>
            )}
          </div>
          {changeNeighborhood && <NeighborhoodChange form={form} />}
        </div>
      )}

      <Button type="submit" loading={mutation.isPending} disabled={!isDirty} className="self-start">
        Guardar cambios
      </Button>
    </form>
  );
}

function NeighborhoodChange({ form }: { form: ReturnType<typeof useForm<Values>> }) {
  const provinces = useProvinces();
  const provinceId = provinces.data?.length === 1 ? provinces.data[0]!.id : null;
  const localities = useLocalities(provinceId);
  const localityId = useWatch({ control: form.control, name: "localityId" });
  const neighborhood = useWatch({ control: form.control, name: "neighborhood" });
  const suggestions = useNeighborhoodSuggestions(localityId || null, neighborhood);
  const errors = form.formState.errors;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field id="datos-localidad" label="Localidad" error={errors.localityId?.message}>
        {(a11y) => (
          <FormListbox
            {...a11y}
            control={form.control}
            name="localityId"
            placeholder={localities.isPending ? "Cargando…" : "Elegí la localidad"}
            options={localities.data?.map((locality) => ({ value: locality.id, label: locality.name })) ?? []}
          />
        )}
      </Field>
      <Field
        id="datos-barrio"
        label="Barrio"
        hint="Si no aparece, escribilo: lo revisa nuestro equipo."
        error={errors.neighborhood?.message}
      >
        {(a11y) => (
          <>
            <Input {...a11y} {...form.register("neighborhood")} list="datos-barrios" autoComplete="off" disabled={!localityId} />
            <datalist id="datos-barrios">
              {suggestions.data?.map((n) => (
                <option key={n.id} value={n.name} />
              ))}
            </datalist>
          </>
        )}
      </Field>
    </div>
  );
}
