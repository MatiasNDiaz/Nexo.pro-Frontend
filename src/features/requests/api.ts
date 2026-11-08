import { api, type Schemas } from "@/lib/api/client";

/*
 * Pedidos de presupuesto y contrataciones del cliente (ADR 0025; docs E-095 a E-097, E-165 a E-168 y
 * E-173). Cada pedido va al chat de cada profesional; los cambios llegan como mensajes de sistema.
 */

export type ServiceRequest = Schemas["RequestDto"];
export type RequestTarget = Schemas["TargetDto"];
export type Quote = Schemas["QuoteDto"];
export type Contract = Schemas["ContractDto"];
export type Urgency = Schemas["CreateRequestDto"]["urgency"];

/** Límites de CreateRequestDto y ReasonDto (requests.dto.ts). */
export const DESCRIPTION_MIN = 5;
export const DESCRIPTION_MAX = 1000;
export const REASON_MAX = 300;

export const requestKeys = {
  all: ["requests"] as const,
  detail: (id: string) => ["requests", id] as const,
};

export const contractKeys = {
  all: ["contracts"] as const,
  detail: (id: string) => ["contracts", id] as const,
};

export const listRequests = () => api<ServiceRequest[]>("/requests");

export const getRequest = (id: string) => api<ServiceRequest>(`/requests/${id}`);

export function createRequest(input: Schemas["CreateRequestDto"]) {
  return api<ServiceRequest>("/requests", { method: "POST", body: input });
}

/** El motivo es opcional: sin texto no se manda el campo (el backend pide 1 a 300 caracteres). */
const reasonBody = (reason: string) => (reason.trim() ? { reason: reason.trim() } : {});

export function cancelRequest(id: string, reason: string) {
  return api<ServiceRequest>(`/requests/${id}/cancel`, { method: "POST", body: reasonBody(reason) });
}

/** Elige al profesional; con `quoteId` acepta su presupuesto vigente. Devuelve la contratación que nace. */
export function selectTarget(targetId: string, quoteId: string | undefined) {
  return api<Contract>(`/requests/targets/${targetId}/select`, {
    method: "POST",
    body: quoteId ? { quoteId } : {},
  });
}

export const listContracts = () => api<Contract[]>("/contracts");

export const getContract = (id: string) => api<Contract>(`/contracts/${id}`);

export function cancelContract(id: string, reason: string) {
  return api<Contract>(`/contracts/${id}/cancel`, { method: "POST", body: reasonBody(reason) });
}

/** Un profesional respondió (puede ser elegido): escribió en el chat o mandó presupuesto. */
export const canSelect = (target: RequestTarget) => target.status === "IN_DISCUSSION" || target.status === "QUOTED";

/** Contrataciones que todavía se pueden cancelar (contract-state-machine.ts). */
export const OPEN_CONTRACT_STATUSES: readonly Contract["status"][] = ["ACCEPTED", "SCHEDULED", "IN_PROGRESS"];
