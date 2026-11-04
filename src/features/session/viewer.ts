"use client";

import { createContext, useContext } from "react";
import type { Me } from "./api";

/** Roles reales del backend (`UserRole`). */
export type Role = Me["role"];

/**
 * Quién está mirando la app, desde el punto de vista del navegador. La sesión vive en cookies
 * HttpOnly del dominio de la API: el frontend solo la conoce después de preguntar (`GET /auth/me`).
 * - `loading`: todavía no se sabe (evita mostrar "Ingresar" a alguien que ya tiene sesión).
 * - `anonymous`: sin sesión. `signedOut` = la persona acaba de cerrarla a propósito (las pantallas
 *   privadas mandan al inicio en vez de a "Ingresar").
 * - `authenticated`: con sesión; `user` es la respuesta de `/auth/me`.
 *
 * El rol y el estado sirven SOLO para decidir qué se muestra. Quien autoriza es siempre el backend.
 */
export type Viewer =
  | { status: "loading" }
  | { status: "anonymous"; signedOut?: boolean }
  | { status: "authenticated"; user: Me };

export const ViewerContext = createContext<Viewer>({ status: "loading" });

export function useViewer(): Viewer {
  return useContext(ViewerContext);
}
