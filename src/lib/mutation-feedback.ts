import { MutationCache } from "@tanstack/react-query";
import { toast, type ToastInput } from "@/components/ui/toast";
import { errorMessage } from "@/lib/api/errors";

/** Un aviso fijo, o uno armado con lo que respondió la API y lo que se mandó. */
type SuccessFeedback =
  | string
  | ToastInput
  | ((data: unknown, variables: unknown) => string | ToastInput | null);

/**
 * Avisos de cada acción, declarados donde se define la mutación:
 *
 *   useMutation({ mutationFn, meta: { success: "Guardamos tus datos" } })
 *
 * - `success`: aviso al salir bien. Sin él no se muestra nada (p. ej. cuando la pantalla ya cambia
 *   de forma evidente o se va a otra página).
 * - `error`: `true` muestra el error de la API traducido; un texto, ese texto. Por defecto los
 *   errores NO van en aviso flotante: los formularios y diálogos los muestran al lado del campo o
 *   del botón (más claro y accesible). Se usa para acciones sueltas sin lugar para el error (un
 *   botón de una lista, un corazón de favoritos).
 */
export interface FeedbackMeta extends Record<string, unknown> {
  success?: SuccessFeedback;
  error?: boolean | string;
}

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: FeedbackMeta;
  }
}

function asToast(
  value: string | ToastInput,
  tone: "success" | "error",
): ToastInput {
  return typeof value === "string"
    ? { title: value, tone }
    : { tone, ...value };
}

/** Caché de mutaciones que muestra los avisos declarados en `meta` (app/providers.tsx). */
export function createFeedbackMutationCache(): MutationCache {
  return new MutationCache({
    onSuccess: (data, variables, _result, mutation) => {
      const success = mutation.meta?.success;
      if (!success) return;
      const value =
        typeof success === "function" ? success(data, variables) : success;
      if (value) toast(asToast(value, "success"));
    },
    onError: (error, _variables, _result, mutation) => {
      const setting = mutation.meta?.error;
      if (!setting) return;
      toast(
        asToast(
          typeof setting === "string"
            ? setting
            : {
                title: "No se pudo completar",
                description: errorMessage(error),
              },
          "error",
        ),
      );
    },
  });
}
