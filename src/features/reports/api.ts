import { api, type Schemas } from "@/lib/api/client";

/*
 * Reportes (ADR 0029; docs E-131 y E-132): clientes y profesionales reportan un perfil, un mensaje,
 * una publicación o respuesta del foro, o una reseña. Con fotos opcionales (privadas: las ven el autor
 * y el admin). Un reporte abierto por objeto (REPORT_ALREADY_OPEN).
 */

export type ReportTarget = Schemas["CreateReportDto"]["targetType"];
export type ReportReason = Schemas["CreateReportDto"]["reason"];
export type MyReport = Schemas["MyReportDto"];

/** Límites de CreateReportDto. */
export const DESCRIPTION_MIN = 10;
export const DESCRIPTION_MAX = 2000;
export const MAX_EVIDENCE = 3;

export const reportKeys = { mine: ["reports", "mine"] as const };

export const createReport = (input: Schemas["CreateReportDto"]) => api<MyReport>("/reports", { method: "POST", body: input });

export const listMyReports = () => api<MyReport[]>("/reports/mine");

export const reasonLabel: Record<ReportReason, string> = {
  DISCRIMINATION: "Discriminación",
  DISRESPECT: "Falta de respeto",
  HARASSMENT: "Acoso",
  NO_SHOW: "No se presentó",
  NOT_AS_AGREED: "No hizo lo acordado",
  FRAUD: "Estafa o fraude",
  THREATS: "Amenazas",
  OFFENSIVE_CONTENT: "Contenido ofensivo",
  SPAM: "Spam o publicidad",
  OTHER: "Otro motivo",
};

export const targetLabel: Record<ReportTarget, string> = {
  PROFILE: "Perfil",
  MESSAGE: "Mensaje del chat",
  FORUM_POST: "Publicación del foro",
  FORUM_REPLY: "Respuesta del foro",
  REVIEW: "Reseña",
};

export const statusLabel: Record<MyReport["status"], { label: string; tone: "neutral" | "electric" | "success" | "amber" }> = {
  SUBMITTED: { label: "Enviado", tone: "neutral" },
  UNDER_REVIEW: { label: "En revisión", tone: "electric" },
  VALID: { label: "Tomamos medidas", tone: "success" },
  REJECTED: { label: "Sin infracción", tone: "amber" },
};
