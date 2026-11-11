import { api, type Schemas } from "@/lib/api/client";
import type { operations } from "@/lib/api/schema";
import type { Metrics } from "@/features/pro-work/api";

/*
 * Panel del admin, parte 7.1: cifras, búsqueda de usuarios, ficha y acciones sobre la cuenta.
 * Docs E-005, E-036 a E-038, E-043 a E-056. Toda acción lleva motivo y queda auditada en el backend;
 * el backend también rechaza cualquier acción sobre una cuenta ADMIN (409 CANNOT_MODIFY_ADMIN).
 */

export type Dashboard = Schemas["DashboardDto"];
export type AdminUserItem = Schemas["AdminUserItemDto"];
export type AdminUserList = Schemas["AdminUserListDto"];
export type AdminUserDetail = Schemas["AdminUserDetailDto"];
export type Sanction = Schemas["SanctionDto"];
export type Strike = Schemas["StrikeDto"];
export type AccountStatus = AdminUserItem["status"];
export type SanctionType = Sanction["type"];
export type AdminRole = "CUSTOMER" | "PROFESSIONAL";
export type VerificationStatus = "NOT_STARTED" | "PENDING" | "REQUIRES_REVIEW" | "APPROVED" | "REJECTED" | "REVOKED";

/** Límites de los DTO del backend. */
export const REASON_MIN = 10; // AccountActionDto, ApplySanctionDto, AddStrikeDto, AdminChangePlanDto, AdminReasonDto
export const LIFT_REASON_MIN = 5; // ModerationReasonDto (levantar sanción, anular strike)
export const REASON_MAX = 500;
export const MESSAGE_TITLE_MAX = 120;
export const MESSAGE_BODY_MAX = 300;
export const MESSAGE_MIN = 3;
export const SEARCH_MIN = 2;
export const USERS_PAGE_SIZE = 20;

/**
 * El Record<string, never> del OpenAPI en DashboardDto es un mapa de conteos: el backend arma
 * `{ CUSTOMER: 12, PROFESSIONAL: 8 }` (admin-panel.service.ts).
 */
export type Counts = Record<string, number | undefined>;
export const counts = (value: Record<string, never>) => value as unknown as Counts;

/** Los filtros van en la URL: el OpenAPI los tipa como parámetros de la operación, no como DTO. */
type Query = NonNullable<operations["AdminPanelController_search_v1"]["parameters"]["query"]>;
export type Joined = NonNullable<Query["joined"]>;
export type ModerationFlag = NonNullable<Query["flags"]>[number];
export type PlanFilter = NonNullable<Query["plan"]>;
export type PageState = NonNullable<Query["pageState"]>;
export type LoginFilter = NonNullable<Query["login"]>;
export type UsersSort = NonNullable<Query["sort"]>;

/** Filtros del listado (todos combinables; ver AdminUsersQueryDto en el backend). */
export interface UsersQuery {
  q?: string;
  role?: AdminRole;
  status?: AccountStatus;
  verification?: VerificationStatus;
  joined?: Joined;
  flags?: ModerationFlag[];
  plan?: PlanFilter;
  pageState?: PageState;
  login?: LoginFilter;
  sort?: UsersSort;
  page?: number;
}

export const joinedLabel: Record<Joined, string> = { today: "Hoy", "7d": "Últimos 7 días", "30d": "Últimos 30 días" };

export const flagLabel: Record<ModerationFlag, string> = {
  sanctioned: "Con sanción vigente",
  strikes: "Con strikes",
  reported: "Con reportes",
  open_reports: "Reportes sin resolver",
};

export const planFilterLabel: Record<PlanFilter, string> = {
  TRIAL: "En prueba gratis",
  BASIC: "Basic pago",
  MEDIUM: "Medium pago",
  PREMIUM: "Premium pago",
  NONE: "Sin plan vigente",
};

export const pageStateLabel: Record<PageState, string> = { published: "Página publicada", unpublished: "Página sin publicar" };

export const loginLabel: Record<LoginFilter, string> = { google: "Con Google", password: "Solo email y contraseña" };

export const sortLabel: Record<UsersSort, string> = {
  recent: "Más nuevos primero",
  oldest: "Más antiguos primero",
  name: "Por nombre",
  last_login: "Último ingreso",
};

/** Lo que le falta a la página de un profesional para publicarse (PublicationRequirement del backend). */
export const requirementLabel: Record<string, string> = {
  ACCOUNT_NOT_ACTIVE: "Confirmar el email (la cuenta está por activar)",
  ACCOUNT_RESTRICTED: "La cuenta está suspendida, bloqueada o dada de baja",
  IDENTITY_NOT_VERIFIED: "Verificar la identidad",
  NO_AVATAR: "Subir una foto de perfil",
  NO_BIO: "Escribir la descripción",
  NO_PROFESSION: "Elegir al menos un oficio",
  NO_SERVICE_AREA: "Elegir al menos una zona de trabajo",
  NO_LIVE_PLAN: "Tener la prueba o un plan vigente",
  PROFILE_DEACTIVATED: "Reactivar el perfil (está pausado)",
  PROFILE_HIDDEN: "Tiene la sanción “perfil oculto” vigente",
};

export const adminKeys = {
  dashboard: ["admin", "dashboard"] as const,
  users: (query: UsersQuery) => ["admin", "users", query] as const,
  usersAll: ["admin", "users"] as const,
  user: (id: string) => ["admin", "user", id] as const,
  metrics: (id: string) => (from: string, to: string, groupBy: string) => ["admin", "user", id, "metrics", from, to, groupBy] as const,
};

export const getDashboard = () => api<Dashboard>("/admin/dashboard");

export const searchUsers = ({ flags, ...query }: UsersQuery) =>
  api<AdminUserList>("/admin/users", {
    query: { ...query, ...(flags?.length ? { flags: flags.join(",") } : {}), limit: USERS_PAGE_SIZE },
  });

export const getUser = (id: string) => api<AdminUserDetail>(`/admin/users/${id}`);

export const getUserMetrics = (id: string) => (from: string, to: string, groupBy: "day" | "week" | "month") =>
  api<Metrics>(`/admin/users/${id}/metrics`, { query: { from, to, groupBy } });

// ---- Datos y cuenta ----
export const updateUserData = (id: string, input: { firstName?: string; lastName?: string; phone?: string; reason: string }) =>
  api<Schemas["PersonalDataDto"]>(`/admin/users/${id}`, { method: "PATCH", body: input });

export const restoreUser = (id: string, reason: string) => api(`/admin/users/${id}/restore`, { method: "POST", body: { reason } });

export const deleteUser = (id: string, reason: string) => api(`/admin/users/${id}`, { method: "DELETE", body: { reason } });

export const revokeSessions = (id: string, reason: string) => api(`/admin/users/${id}/revoke-sessions`, { method: "POST", body: { reason } });

export const sendPasswordReset = (id: string, reason: string) => api(`/admin/users/${id}/password-reset`, { method: "POST", body: { reason } });

export const changeRole = (id: string, input: Schemas["ChangeRoleDto"]) => api(`/admin/users/${id}/change-role`, { method: "POST", body: input });

export const messageUser = (id: string, input: Schemas["AdminMessageDto"]) => api(`/admin/users/${id}/message`, { method: "POST", body: input });

export const changePlan = (id: string, planCode: string, reason: string) =>
  api(`/admin/subscriptions/${id}/plan`, { method: "POST", body: { planCode, reason } });

// ---- Sanciones y strikes ----
export const applySanction = (id: string, input: Schemas["ApplySanctionDto"]) =>
  api<Sanction>(`/admin/users/${id}/sanctions`, { method: "POST", body: input });

export const liftSanction = (sanctionId: string, reason: string) => api<Sanction>(`/admin/sanctions/${sanctionId}/lift`, { method: "POST", body: { reason } });

export const addStrike = (id: string, input: Schemas["AddStrikeDto"]) => api<Strike>(`/admin/users/${id}/strikes`, { method: "POST", body: input });

export const voidStrike = (strikeId: string, reason: string) => api<Strike>(`/admin/strikes/${strikeId}/void`, { method: "POST", body: { reason } });

// ---- Textos ----
export const roleLabel: Record<AdminUserItem["role"], string> = { CUSTOMER: "Cliente", PROFESSIONAL: "Profesional", ADMIN: "Administración" };

type Tone = "success" | "electric" | "danger" | "neutral" | "amber";

export const statusLabel: Record<AccountStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: "Activa", tone: "success" },
  PENDING_VERIFICATION: { label: "Por verificar", tone: "amber" },
  SUSPENDED: { label: "Suspendida", tone: "danger" },
  BANNED: { label: "Bloqueada", tone: "danger" },
  DEACTIVATED: { label: "Dada de baja", tone: "neutral" },
};

export const verificationLabel: Record<VerificationStatus, string> = {
  NOT_STARTED: "Sin iniciar",
  PENDING: "En revisión",
  REQUIRES_REVIEW: "En revisión",
  APPROVED: "Aprobada",
  REJECTED: "Rechazada",
  REVOKED: "Revocada",
};

export const sanctionLabel: Record<SanctionType, { label: string; detail: string }> = {
  WARNING: { label: "Advertencia", detail: "Le llega un aviso con el motivo. La cuenta sigue igual." },
  SUSPENSION: { label: "Suspensión", detail: "No puede usar la plataforma. Con fecha de fin se levanta sola; sin fecha, hasta que la levantes." },
  BAN: { label: "Bloqueo", detail: "No puede usar la plataforma hasta que lo levantes. Reemplaza a una suspensión en curso." },
  PROFILE_HIDDEN: { label: "Perfil oculto", detail: "La cuenta sigue, pero su perfil no aparece en el catálogo. Puede tener fecha de fin." },
};

/** SubscriptionStatus del backend (subscription.entity.ts). */
export const subscriptionLabel: Record<string, string> = {
  TRIAL: "Prueba gratis",
  ACTIVE: "Plan pago",
  EXPIRED: "Vencida",
};

export const paymentLabel: Record<string, { label: string; tone: Tone }> = {
  CREATED: { label: "Sin pagar", tone: "neutral" },
  PENDING: { label: "Pendiente", tone: "amber" },
  APPROVED: { label: "Aprobado", tone: "success" },
  REJECTED: { label: "Rechazado", tone: "danger" },
  CANCELLED: { label: "Cancelado", tone: "neutral" },
  REFUNDED: { label: "Devuelto", tone: "electric" },
  CHARGED_BACK: { label: "Contracargo", tone: "danger" },
};

/** Lo que el admin puede hacer con la cuenta según su estado (mismas reglas que accounts.service.ts). */
export function accountActions(user: Pick<AdminUserDetail, "role" | "status" | "deletionScheduledFor" | "deletedAt">) {
  const anonymized = user.deletedAt !== null;
  const usable = user.status === "ACTIVE" || user.status === "PENDING_VERIFICATION";
  const sanctioned = user.status === "SUSPENDED" || user.status === "BANNED";
  const pendingDeletion = user.status === "DEACTIVATED" && user.deletionScheduledFor !== null;
  return {
    /** Advertencia y perfil oculto se pueden aplicar a cualquier cuenta no anonimizada. */
    sanction: !anonymized && user.status !== "DEACTIVATED",
    /** Suspender: desde activa o por verificar. Bloquear: también desde suspendida. */
    suspend: !anonymized && usable,
    ban: !anonymized && (usable || user.status === "SUSPENDED"),
    hideProfile: !anonymized && user.status !== "DEACTIVATED" && user.role === "PROFESSIONAL",
    restore: !anonymized && (sanctioned || pendingDeletion),
    pendingDeletion,
    delete: !anonymized && user.deletionScheduledFor === null,
    changeRole: !anonymized && user.status !== "DEACTIVATED",
    edit: !anonymized && user.status !== "DEACTIVATED",
    message: !anonymized,
    sessions: !anonymized,
    passwordReset: !anonymized && user.status !== "DEACTIVATED",
  };
}

/** "Usuario eliminado" para las cuentas anonimizadas; si no, nombre y apellido. */
export const fullName = (user: Pick<AdminUserItem, "firstName" | "lastName">) => `${user.firstName} ${user.lastName}`.trim();
