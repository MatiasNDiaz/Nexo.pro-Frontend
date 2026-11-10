import { api, buildUrl, type Schemas } from "@/lib/api/client";

/*
 * Soporte con sesión (ADR 0029; docs E-148 a E-151): consultas con categoría, texto y una foto
 * opcional, y la conversación con el equipo. Si la consulta estaba cerrada, escribir la reabre.
 */

export type Ticket = Schemas["TicketDto"];
export type TicketCategory = Schemas["CreateTicketDto"]["category"];

/** Límites de support.dto.ts. */
export const TICKET_MIN = 10;
export const TICKET_MAX = 2000;
export const MESSAGE_MAX = 2000;

export const supportKeys = {
  all: ["support"] as const,
  detail: (id: string) => ["support", id] as const,
};

export const listTickets = () => api<Ticket[]>("/support/tickets");
export const getTicket = (id: string) => api<Ticket>(`/support/tickets/${id}`);

export const createTicket = (category: TicketCategory, body: string, fileId?: string) =>
  api<Ticket>("/support/tickets", { method: "POST", body: { category, body, ...(fileId ? { fileId } : {}) } });

export const addTicketMessage = (id: string, body: string, fileId?: string) =>
  api<Ticket>(`/support/tickets/${id}/messages`, { method: "POST", body: { body, ...(fileId ? { fileId } : {}) } });

/** Foto propia adjunta (privada: la sirve la API con la sesión). */
export const evidenceUrl = (fileId: string) => buildUrl(`/evidence/${encodeURIComponent(fileId)}`);

/** Categorías del backend (SupportCategory) con los nombres de ADR 0029. */
export const ticketCategories: { value: TicketCategory; label: string }[] = [
  { value: "SUGGESTION", label: "Sugerencia" },
  { value: "BUG", label: "Falla de la página" },
  { value: "INCIDENT", label: "Incidencia" },
  { value: "COMPLAINT", label: "Reclamo" },
  { value: "OTHER", label: "Otro" },
];

export const categoryName = (value: TicketCategory) => ticketCategories.find((c) => c.value === value)?.label ?? value;

export const ticketStatus: Record<Ticket["status"], { label: string; tone: "electric" | "success" | "neutral" }> = {
  OPEN: { label: "Esperando respuesta", tone: "electric" },
  ANSWERED: { label: "Respondida", tone: "success" },
  CLOSED: { label: "Cerrada", tone: "neutral" },
};
