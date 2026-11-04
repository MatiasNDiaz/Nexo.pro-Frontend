"use client";

import { createContext, useContext } from "react";

/** Roles reales del backend (`UserRole`). */
export type Role = "CUSTOMER" | "PROFESSIONAL" | "ADMIN";

/**
 * Quién está mirando la app, desde el punto de vista del navegador. La sesión vive en cookies
 * HttpOnly del dominio de la API: el frontend solo la conoce después de preguntar (`GET /auth/me`).
 * - `loading`: todavía no se sabe (evita mostrar "Ingresar" a alguien que ya tiene sesión).
 * - `anonymous`: sin sesión.
 * - `authenticated`: con sesión y su rol.
 *
 * El rol sirve SOLO para decidir qué se muestra. Quien autoriza es siempre el backend.
 */
export type Viewer =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; role: Role; firstName: string };

/**
 * Hasta la etapa 2 (sesión) no hay proveedor: todos son anónimos. La etapa 2 envuelve la app con el
 * proveedor que consulta `/auth/csrf` y `/auth/me`.
 */
export const ViewerContext = createContext<Viewer>({ status: "anonymous" });

export function useViewer(): Viewer {
  return useContext(ViewerContext);
}
