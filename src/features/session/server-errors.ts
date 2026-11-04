import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import { fieldErrors, isApiError } from "@/lib/api/errors";

/** Campos del backend que en el formulario se llaman distinto. */
const FIELD_ALIASES: Record<string, string> = {
  "neighborhood.name": "customerNeighborhood",
  "neighborhood.localityId": "customerLocalityId",
  neighborhood: "customerNeighborhood",
};

/** Códigos del registro que apuntan a un campo puntual. */
const CODE_FIELDS: Record<string, { field: string; message: string }> = {
  INVALID_NEIGHBORHOOD: { field: "customerNeighborhood", message: "Revisá la localidad y el barrio." },
  INVALID_PROFESSION: { field: "professionId", message: "Elegí un oficio de la lista." },
};

/**
 * Marca en el formulario los errores que devolvió el backend. Devuelve true si pudo ubicar alguno
 * en un campo (si no, conviene mostrar el mensaje general).
 */
export function applyServerErrors<T extends FieldValues>(error: unknown, setError: UseFormSetError<T>): boolean {
  if (isApiError(error, ...Object.keys(CODE_FIELDS))) {
    const target = CODE_FIELDS[error.code]!;
    setError(target.field as Path<T>, { type: "server", message: target.message });
    return true;
  }
  const errors = Object.entries(fieldErrors(error));
  for (const [field, message] of errors) {
    setError((FIELD_ALIASES[field] ?? field) as Path<T>, { type: "server", message });
  }
  return errors.length > 0;
}
