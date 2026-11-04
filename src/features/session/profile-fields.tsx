"use client";

import { MapPin, Plus, Trash2 } from "lucide-react";
import { useEffect, useId, useRef, useState, type ComponentProps } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/form-controls";
import { useLocalities, useNeighborhoodSuggestions, useProfessions, useProvinces } from "@/features/catalogs/queries";
import { cn } from "@/lib/cn";
import { MAX_SERVICE_AREAS, type ProfileValues } from "./schemas";

/**
 * Datos personales y de ubicación del registro (con contraseña o con Google). Al cliente se le pide
 * dónde vive; al profesional, su oficio principal y las zonas donde trabaja.
 */
export function ProfileFields() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProfileValues>();
  const role = useWatch<ProfileValues, "role">({ name: "role" });

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="reg-nombre" label="Nombre" required error={errors.firstName?.message}>
          {(a11y) => <Input {...a11y} {...register("firstName")} autoComplete="given-name" />}
        </Field>
        <Field id="reg-apellido" label="Apellido" required error={errors.lastName?.message}>
          {(a11y) => <Input {...a11y} {...register("lastName")} autoComplete="family-name" />}
        </Field>
      </div>
      <Field
        id="reg-telefono"
        label="Teléfono"
        required
        hint="Con código de área, sin 0 ni 15. Ej.: 351 506 7276."
        error={errors.phone?.message}
      >
        {(a11y) => <Input {...a11y} {...register("phone")} type="tel" inputMode="tel" autoComplete="tel" />}
      </Field>

      <fieldset className="flex flex-col gap-5 rounded-2xl border border-line p-4 sm:p-5">
        <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-brand-900">
          <MapPin className="size-4 text-brand-600" aria-hidden="true" />
          {role === "PROFESSIONAL" ? "Oficio y zonas de trabajo" : "Dónde vivís"}
        </legend>
        {role === "PROFESSIONAL" ? <ProfessionalLocation /> : <CustomerLocation />}
      </fieldset>
    </div>
  );
}

/** Provincia elegida. Hoy hay una sola activa (Córdoba): se elige sola. */
function useProvinceChoice() {
  const provinces = useProvinces();
  const [provinceId, setProvinceId] = useState<string | null>(null);
  const only = provinces.data?.length === 1 ? provinces.data[0]!.id : null;
  return { provinces, provinceId: provinceId ?? only, setProvinceId };
}

function ProvinceSelect({ id, value, onChange }: { id: string; value: string | null; onChange: (id: string) => void }) {
  const provinces = useProvinces();
  if (provinces.data && provinces.data.length <= 1) return null;
  return (
    <Field id={id} label="Provincia" required>
      {(a11y) => (
        <Select {...a11y} value={value ?? ""} onChange={(event) => onChange(event.target.value)} disabled={provinces.isPending}>
          <option value="" disabled>
            {provinces.isPending ? "Cargando…" : "Elegí la provincia"}
          </option>
          {provinces.data?.map((province) => (
            <option key={province.id} value={province.id}>
              {province.name}
            </option>
          ))}
        </Select>
      )}
    </Field>
  );
}

function LocalityOptions({ provinceId }: { provinceId: string | null }) {
  const localities = useLocalities(provinceId);
  return (
    <>
      <option value="" disabled>
        {!provinceId ? "Elegí primero la provincia" : localities.isPending ? "Cargando…" : "Elegí la localidad"}
      </option>
      {localities.data?.map((locality) => (
        <option key={locality.id} value={locality.id}>
          {locality.name}
        </option>
      ))}
    </>
  );
}

/** Campo de barrio con sugerencias de los barrios aprobados; se puede escribir uno nuevo. */
function NeighborhoodInput({
  localityId,
  inputProps,
  value,
}: {
  localityId: string | null;
  inputProps: ComponentProps<"input">;
  value: string;
}) {
  const listId = useId();
  const suggestions = useNeighborhoodSuggestions(localityId, value);
  return (
    <>
      <Input {...inputProps} list={listId} autoComplete="off" disabled={!localityId} />
      <datalist id={listId}>
        {suggestions.data?.map((neighborhood) => (
          <option key={neighborhood.id} value={neighborhood.name} />
        ))}
      </datalist>
    </>
  );
}

function CustomerLocation() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProfileValues>();
  const { provinceId, setProvinceId } = useProvinceChoice();
  const localityId = useWatch<ProfileValues, "customerLocalityId">({ name: "customerLocalityId" });
  const neighborhood = useWatch<ProfileValues, "customerNeighborhood">({ name: "customerNeighborhood" });

  return (
    <>
      <ProvinceSelect id="reg-provincia" value={provinceId} onChange={setProvinceId} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="reg-localidad" label="Localidad" required error={errors.customerLocalityId?.message}>
          {(a11y) => (
            <Select {...a11y} {...register("customerLocalityId")} defaultValue="">
              <LocalityOptions provinceId={provinceId} />
            </Select>
          )}
        </Field>
        <Field
          id="reg-barrio"
          label="Barrio"
          required
          hint="Si no aparece en la lista, escribilo: lo revisa nuestro equipo."
          error={errors.customerNeighborhood?.message}
        >
          {(a11y) => (
            <NeighborhoodInput
              localityId={localityId || null}
              value={neighborhood ?? ""}
              inputProps={{ ...a11y, ...register("customerNeighborhood") }}
            />
          )}
        </Field>
      </div>
    </>
  );
}

function ProfessionalLocation() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ProfileValues>();
  const professions = useProfessions();
  const { provinceId, setProvinceId } = useProvinceChoice();
  const { fields, append, remove } = useFieldArray({ control, name: "serviceAreas" });
  const areas = useWatch<ProfileValues, "serviceAreas">({ name: "serviceAreas" });

  // Una primera zona lista para completar. El ref evita agregarla dos veces cuando React ejecuta el
  // efecto de nuevo antes de que se actualice la lista (modo estricto en desarrollo).
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current || fields.length > 0) return;
    seeded.current = true;
    append({ localityId: "", neighborhoodName: "" }, { shouldFocus: false });
  }, [fields.length, append]);

  const areasError = errors.serviceAreas?.message ?? errors.serviceAreas?.root?.message;

  return (
    <>
      <Field
        id="reg-oficio"
        label="Oficio principal"
        required
        hint="Después vas a poder sumar más oficios según tu plan."
        error={errors.professionId?.message}
      >
        {(a11y) => (
          <Select {...a11y} {...register("professionId")} defaultValue="" disabled={professions.isPending}>
            <option value="" disabled>
              {professions.isPending ? "Cargando…" : "Elegí tu oficio"}
            </option>
            {professions.data?.map((profession) => (
              <option key={profession.id} value={profession.id}>
                {profession.name}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <ProvinceSelect id="reg-provincia-pro" value={provinceId} onChange={setProvinceId} />

      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-medium text-ink">Zonas donde trabajás</p>
          <p className="text-sm text-muted">Dejá el barrio vacío para cubrir toda la localidad.</p>
        </div>
        <ul className="flex flex-col gap-3">
          {fields.map((field, index) => {
            const areaErrors = errors.serviceAreas?.[index];
            return (
              <li key={field.id} className="grid gap-3 rounded-xl bg-canvas p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <Field id={`zona-${field.id}-localidad`} label={`Zona ${index + 1}: localidad`} error={areaErrors?.localityId?.message}>
                  {(a11y) => (
                    <Select {...a11y} {...register(`serviceAreas.${index}.localityId`)} defaultValue="">
                      <LocalityOptions provinceId={provinceId} />
                    </Select>
                  )}
                </Field>
                <Field id={`zona-${field.id}-barrio`} label="Barrio (opcional)" error={areaErrors?.neighborhoodName?.message}>
                  {(a11y) => (
                    <NeighborhoodInput
                      localityId={areas?.[index]?.localityId || null}
                      value={areas?.[index]?.neighborhoodName ?? ""}
                      inputProps={{ ...a11y, ...register(`serviceAreas.${index}.neighborhoodName`), placeholder: "Toda la localidad" }}
                    />
                  )}
                </Field>
                <Button
                  variant="ghost"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className={cn("justify-self-start sm:justify-self-auto")}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  <span className="sm:sr-only">Quitar zona {index + 1}</span>
                </Button>
              </li>
            );
          })}
        </ul>
        {areasError && (
          <p role="alert" className="text-sm font-medium text-danger-600">
            {areasError}
          </p>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="self-start"
          disabled={fields.length >= MAX_SERVICE_AREAS}
          onClick={() => append({ localityId: "", neighborhoodName: "" })}
        >
          <Plus className="size-4" aria-hidden="true" />
          Agregar otra zona
        </Button>
      </div>
    </>
  );
}
