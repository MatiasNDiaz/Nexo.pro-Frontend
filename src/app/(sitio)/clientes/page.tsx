import { redirect } from "next/navigation";

/**
 * "Clientes" vive en el panel (ADR 0037 del backend): es solo para profesionales con sesión. Esta
 * dirección queda por los enlaces viejos; el panel pide ingresar si hace falta.
 */
export default function Page() {
  redirect("/panel/clientes");
}
