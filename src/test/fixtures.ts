import type { Me } from "@/features/session/api";

/** Usuario de prueba con la forma real de `GET /auth/me` (MeDto). */
export function makeMe(overrides: Partial<Me> = {}): Me {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    email: "ana@example.com",
    firstName: "Ana",
    lastName: "Pérez",
    role: "CUSTOMER",
    status: "ACTIVE",
    statusReason: null,
    verificationStatus: "APPROVED",
    emailVerified: true,
    avatarUrl: null,
    pendingAvatarUrl: null,
    createdAt: "2026-11-01T12:00:00.000Z",
    hasPassword: true,
    googleLinked: false,
    ...overrides,
  };
}
