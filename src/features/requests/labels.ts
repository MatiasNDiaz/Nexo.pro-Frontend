import type { Contract, RequestTarget, ServiceRequest, Urgency } from "./api";

type Tone = "neutral" | "brand" | "electric" | "amber" | "success" | "danger";

export const urgencyLabel: Record<Urgency, string> = {
  CAN_WAIT: "Puede esperar",
  IMPATIENT: "Lo antes posible",
  URGENT: "Urgente",
};

export const urgencyHint: Record<Urgency, string> = {
  CAN_WAIT: "No es urgente: se puede coordinar con tiempo.",
  IMPATIENT: "Me gustaría resolverlo en los próximos días.",
  URGENT: "Necesito que lo vean cuanto antes.",
};

export const requestStatus: Record<ServiceRequest["status"], { label: string; tone: Tone }> = {
  OPEN: { label: "Esperando respuestas", tone: "amber" },
  SELECTED: { label: "Profesional elegido", tone: "success" },
  CANCELLED: { label: "Cancelado", tone: "neutral" },
};

/** Estado de cada profesional dentro del pedido (visto por el cliente). */
export const targetStatus: Record<RequestTarget["status"], { label: string; tone: Tone }> = {
  PENDING: { label: "Sin respuesta todavía", tone: "neutral" },
  IN_DISCUSSION: { label: "Te respondió", tone: "electric" },
  QUOTED: { label: "Mandó presupuesto", tone: "amber" },
  SELECTED: { label: "Elegido", tone: "success" },
  NOT_SELECTED: { label: "No elegido", tone: "neutral" },
  DECLINED: { label: "No puede tomarlo", tone: "neutral" },
  CANCELLED: { label: "Pedido cancelado", tone: "neutral" },
};

export const contractStatus: Record<Contract["status"], { label: string; tone: Tone }> = {
  ACCEPTED: { label: "Acordado", tone: "electric" },
  SCHEDULED: { label: "Con fecha", tone: "amber" },
  IN_PROGRESS: { label: "En curso", tone: "amber" },
  COMPLETED: { label: "Terminado", tone: "success" },
  CANCELLED_BY_CLIENT: { label: "Lo cancelaste", tone: "neutral" },
  CANCELLED_BY_PRO: { label: "Lo canceló el profesional", tone: "danger" },
};
