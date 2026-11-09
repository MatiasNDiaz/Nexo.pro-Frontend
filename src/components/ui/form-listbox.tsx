"use client";

import { useController, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { Listbox, type ListboxOption } from "./listbox";

/**
 * Desplegable propio conectado a react-hook-form (reemplaza a `<Select {...register(name)}>`): toma
 * el valor, avisa los cambios, marca el campo como tocado al salir y recibe el foco ante un error.
 * Va dentro de un FormProvider o con `control`.
 */
export function FormListbox<T extends FieldValues>({
  name,
  control,
  options,
  placeholder,
  disabled,
  ...a11y
}: {
  name: FieldPath<T>;
  control?: Control<T>;
  options: readonly ListboxOption[];
  placeholder?: string;
  disabled?: boolean;
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
}) {
  const {
    field: { value, onChange, onBlur, ref: focusTarget },
  } = useController<T>({ name, control });
  return (
    <Listbox
      {...a11y}
      value={(value as string | undefined) ?? ""}
      onChange={onChange}
      onBlur={onBlur}
      ref={focusTarget}
      disabled={disabled}
      placeholder={placeholder}
      options={options}
    />
  );
}
