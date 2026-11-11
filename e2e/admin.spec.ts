import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll } from "./support/layout";
import { chooseOption } from "./support/listbox";
import { apiError, json, LOCALITY, me, mockApi, PROFESSION, type Handler } from "./support/mock-api";

/*
 * Etapa 7.1, el panel del admin: resumen, búsqueda de usuarios, ficha y acciones sobre la cuenta,
 * contra la API simulada en el navegador.
 */

const USER_ID = "00000000-0000-4000-8000-0000000000c1";
const SANCTION_ID = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const STRIKE_ID = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";

const admin = me({ role: "ADMIN", status: "ACTIVE", emailVerified: true, verificationStatus: "APPROVED", firstName: "Equipo", lastName: "Repara Ya" });

const dashboard = {
  usersByRole: { CUSTOMER: 12, PROFESSIONAL: 8 },
  usersByStatus: { ACTIVE: 15, PENDING_VERIFICATION: 4, SUSPENDED: 1 },
  subscriptionsByStatus: { TRIAL: 5, ACTIVE: 3 },
  professionalsByPlan: { BASIC: 6, PREMIUM: 2 },
  newUsersLast7Days: 3,
  newForumPostsLast7Days: 2,
  newReportsLast7Days: 1,
  openReports: 2,
  openAppeals: 0,
  openSupportTickets: 1,
  pendingVerifications: 4,
  sanctionedUsers: 1,
  paymentsToReview: 0,
};

const listItem = {
  id: USER_ID,
  email: "camila@example.com",
  firstName: "Camila",
  lastName: "Herrera",
  role: "CUSTOMER",
  status: "ACTIVE",
  verificationStatus: "APPROVED",
  avatarUrl: null,
  phone: "+5493515067276",
  google: true,
  hasPassword: true,
  emailVerifiedAt: "2026-10-01T12:05:00.000Z",
  lastLoginAt: "2026-11-10T09:00:00.000Z",
  location: "Nueva Córdoba, Córdoba",
  professional: null,
  activeSanctions: 0,
  activeStrikeWeight: 1,
  reportsAgainst: 1,
  openReportsAgainst: 0,
  createdAt: "2026-10-01T12:00:00.000Z",
};

const detail = (overrides: Record<string, unknown> = {}) => ({
  ...listItem,
  phone: "+5493515067276",
  statusReason: null,
  deletedAt: null,
  deletionScheduledFor: null,
  subscription: null,
  sanctions: [],
  strikes: [],
  activeStrikeWeight: 0,
  reportsAgainst: 1,
  validReportsAgainst: 0,
  reportsMade: 2,
  payments: [],
  ...overrides,
});

function asAdmin(handlers: Record<string, Handler> = {}) {
  return {
    "GET /auth/csrf": () => json(200, { csrfToken: "csrf-1" }),
    "GET /auth/me": () => json(200, admin),
    "GET /notifications/unread-count": () => json(200, { unread: 0 }),
    "GET /admin/dashboard": () => json(200, dashboard),
    ...handlers,
  };
}

test.describe("resumen del admin", () => {
  test("muestra lo pendiente y los números, con su navegación", async ({ page }) => {
    await mockApi(page, asAdmin());
    await page.goto("/panel");
    await expect(page.getByRole("heading", { name: "Para revisar" })).toBeVisible();
    // Cada acceso dice qué se hace ahí y cuántas cosas esperan.
    await expect(page.getByRole("link", { name: /^Reportes .* 2 sin resolver$/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Identidades .* 4 por revisar$/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "La plataforma" })).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Panel" });
    await expect(nav.getByRole("link", { name: "Usuarios" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Resumen" })).toHaveAttribute("aria-current", "page");
    await expectNoHorizontalScroll(page);
  });

  test("otro rol no ve la administración", async ({ page }) => {
    await mockApi(page, asAdmin({ "GET /auth/me": () => json(200, me({ role: "CUSTOMER", status: "ACTIVE" })) }));
    await page.goto("/panel/admin/usuarios");
    await expect(page.getByRole("heading", { name: "Esta sección es del equipo de Repara Ya" })).toBeVisible();
  });
});

test.describe("búsqueda de usuarios", () => {
  test("los filtros van a la URL y al backend, y la fila abre la ficha", async ({ page }) => {
    const api = await mockApi(
      page,
      asAdmin({
        "GET /admin/users": () => json(200, { data: [listItem], page: 1, limit: 20, total: 1 }),
        [`GET /admin/users/${USER_ID}`]: () => json(200, detail()),
      }),
    );
    await page.goto("/panel/admin/usuarios");
    await expect(page.getByText("1 usuario", { exact: true })).toBeVisible();

    // La fila muestra los datos para decidir sin abrir la ficha.
    const row = page.getByRole("link", { name: /Camila Herrera/ });
    await expect(row).toContainText("Nueva Córdoba, Córdoba");
    await expect(row).toContainText("1 strike");
    await expect(row.getByRole("img", { name: "Ingresa con Google" })).toBeVisible();

    await page.getByRole("searchbox", { name: "Nombre, apellido, nombre comercial o email" }).fill("cami");
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page).toHaveURL(/q=cami/);
    await page.getByRole("button", { name: "Profesionales" }).click();
    await expect(page).toHaveURL(/rol=PROFESSIONAL/);
    await expect
      .poll(() => api.find("GET /admin/users").map((request) => new URL(request.url()).searchParams.toString()))
      .toContain("q=cami&role=PROFESSIONAL&limit=20");

    await row.click();
    await expect(page.getByRole("heading", { level: 1, name: "Camila Herrera" })).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("moderación, filtros avanzados y orden se combinan en la URL y en el backend", async ({ page }) => {
    const api = await mockApi(page, asAdmin({ "GET /admin/users": () => json(200, { data: [listItem], page: 1, limit: 20, total: 1 }) }));
    await page.goto("/panel/admin/usuarios");
    await page.getByRole("button", { name: "Con strikes" }).click();
    await expect(page.getByRole("button", { name: "Con strikes" })).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("button", { name: "Últimos 7 días" }).click();
    await page.getByRole("button", { name: "Más filtros" }).click();
    await chooseOption(page, "Plan (profesionales)", "En prueba gratis");
    await chooseOption(page, "Orden", "Por nombre");
    await expect(page).toHaveURL(/moderacion=strikes/);
    await expect(page).toHaveURL(/alta=7d/);
    await expect(page).toHaveURL(/plan=TRIAL/);
    await expect(page).toHaveURL(/orden=name/);
    await expect
      .poll(() => api.find("GET /admin/users").map((request) => new URL(request.url()).searchParams.toString()))
      .toContain("joined=7d&plan=TRIAL&sort=name&flags=strikes&limit=20");

    await page.getByRole("button", { name: "Limpiar" }).click();
    await expect(page).toHaveURL(/\/panel\/admin\/usuarios\?orden=name$/);
  });

  test("buscar y tocar un filtro enseguida no pierde la búsqueda", async ({ page }) => {
    await mockApi(page, asAdmin({ "GET /admin/users": () => json(200, { data: [listItem], page: 1, limit: 20, total: 1 }) }));
    await page.goto("/panel/admin/usuarios");
    await page.getByRole("searchbox").fill("cami");
    await page.getByRole("button", { name: "Buscar" }).click();
    await page.getByRole("button", { name: "Profesionales" }).click();
    await expect(page).toHaveURL(/q=cami/);
    await expect(page).toHaveURL(/rol=PROFESSIONAL/);
  });

  test("una búsqueda de una letra no se manda", async ({ page }) => {
    const api = await mockApi(page, asAdmin({ "GET /admin/users": () => json(200, { data: [], page: 1, limit: 20, total: 0 }) }));
    await page.goto("/panel/admin/usuarios");
    await expect(page.getByRole("heading", { name: "No encontramos usuarios" })).toBeVisible();
    await page.getByRole("searchbox").fill("c");
    await page.getByRole("button", { name: "Buscar" }).click();
    await expect(page.getByText("Escribí al menos 2 letras.")).toBeVisible();
    expect(api.find("GET /admin/users").every((request) => !new URL(request.url()).searchParams.has("q"))).toBe(true);
  });
});

test.describe("ficha del usuario", () => {
  test("de un profesional: cómo ingresa, dónde está y qué le falta a su página", async ({ page }) => {
    const professional = { slug: "camila-herrera-x1", businessName: "Herrera Pinturas", published: false, professions: ["Pintor"], planCode: null, subscriptionStatus: null };
    await mockApi(
      page,
      asAdmin({
        [`GET /admin/users/${USER_ID}`]: () =>
          json(200, detail({ role: "PROFESSIONAL", professional, publicationMissing: ["IDENTITY_NOT_VERIFIED", "NO_LIVE_PLAN"], hasPassword: false })),
        [`GET /admin/professionals/${USER_ID}/profile`]: () => apiError(404, "PROFILE_NOT_FOUND"),
        [`GET /admin/users/${USER_ID}/metrics`]: () => apiError(404, "PROFILE_NOT_FOUND"),
      }),
    );
    await page.goto(`/panel/admin/usuarios/${USER_ID}`);
    await expect(page.getByRole("heading", { level: 1, name: "Camila Herrera" })).toBeVisible();
    await expect(page.getByText("Herrera Pinturas")).toBeVisible();
    await expect(page.getByText("Solo con Google")).toBeVisible();
    await expect(page.getByText("Nueva Córdoba, Córdoba")).toBeVisible();
    const section = page.getByRole("region", { name: "Página pública" });
    await expect(section.getByText("Sin publicar: le faltan 2 cosas")).toBeVisible();
    await expect(section.getByRole("listitem")).toHaveText(["Verificar la identidad", "Tener la prueba o un plan vigente"]);
    await expectNoHorizontalScroll(page);
  });

  test("suspender pide motivo y muestra la sanción vigente", async ({ page }) => {
    let current = detail();
    let body: Record<string, unknown> | null = null;
    await mockApi(
      page,
      asAdmin({
        [`GET /admin/users/${USER_ID}`]: () => json(200, current),
        [`POST /admin/users/${USER_ID}/sanctions`]: (request) => {
          body = request.postDataJSON();
          current = detail({
            status: "SUSPENDED",
            statusReason: "Insultos reiterados en el chat.",
            sanctions: [{ id: SANCTION_ID, type: "SUSPENSION", reason: "Insultos reiterados en el chat.", startsAt: "2026-11-10T12:00:00.000Z", endsAt: null, active: true, liftedAt: null }],
          });
          return json(201, current.sanctions[0]);
        },
      }),
    );
    await page.goto(`/panel/admin/usuarios/${USER_ID}`);
    await page.getByRole("button", { name: "Sancionar" }).click();
    const dialog = page.locator("dialog[open]");
    await dialog.getByRole("radio", { name: /Suspensión/ }).check();
    await dialog.getByRole("button", { name: "Aplicar suspensión" }).click();
    await expect(dialog.getByText("Escribí el motivo (al menos 10 caracteres).")).toBeVisible();
    expect(body).toBeNull();

    await dialog.getByRole("textbox", { name: /Motivo/ }).fill("Insultos reiterados en el chat.");
    await dialog.getByRole("button", { name: "Aplicar suspensión" }).click();
    await expect(page.getByText("Aplicaste: suspensión.")).toBeVisible();
    expect(body).toEqual({ type: "SUSPENSION", reason: "Insultos reiterados en el chat." });
    await expect(page.getByText("Vigente", { exact: true })).toBeVisible();
    // Con la cuenta suspendida, se ofrece restaurar y ya no suspender.
    await expect(page.getByRole("button", { name: "Restaurar la cuenta" })).toBeVisible();
  });

  test("anular un strike manda el motivo", async ({ page }) => {
    let voided: Record<string, unknown> | null = null;
    const strike = { id: STRIKE_ID, weight: 2, reason: "Spam en el foro.", voided: false, voidReason: null, createdAt: "2026-11-01T12:00:00.000Z" };
    await mockApi(
      page,
      asAdmin({
        [`GET /admin/users/${USER_ID}`]: () => json(200, detail({ strikes: voided ? [{ ...strike, voided: true, voidReason: "Fue un error." }] : [strike], activeStrikeWeight: voided ? 0 : 2 })),
        [`POST /admin/strikes/${STRIKE_ID}/void`]: (request) => {
          voided = request.postDataJSON();
          return json(200, { ...strike, voided: true });
        },
      }),
    );
    await page.goto(`/panel/admin/usuarios/${USER_ID}`);
    await expect(page.getByRole("heading", { name: "Strikes (suman 2)" })).toBeVisible();
    await page.getByRole("button", { name: "Anular", exact: true }).click();
    await page.locator("dialog[open]").getByRole("textbox", { name: "Motivo" }).fill("Fue un error.");
    await page.locator("dialog[open]").getByRole("button", { name: "Anular el strike" }).click();
    await expect(page.getByText("Anulaste el strike.")).toBeVisible();
    expect(voided).toEqual({ reason: "Fue un error." });
    await expect(page.getByRole("heading", { name: "Strikes (suman 0)" })).toBeVisible();
  });

  test("pasar a profesional pide oficio y zonas si nunca lo fue", async ({ page }) => {
    const bodies: Record<string, unknown>[] = [];
    await mockApi(
      page,
      asAdmin({
        [`GET /admin/users/${USER_ID}`]: () => json(200, detail({ role: bodies.length === 2 ? "PROFESSIONAL" : "CUSTOMER" })),
        [`POST /admin/users/${USER_ID}/change-role`]: (request) => {
          bodies.push(request.postDataJSON());
          return bodies.length === 1
            ? apiError(400, "PROFESSIONAL_DATA_REQUIRED", "Para pasar a profesional hacen falta la profesión y las zonas de trabajo.")
            : json(200, { id: USER_ID, role: "PROFESSIONAL", status: "ACTIVE" });
        },
        [`GET /admin/users/${USER_ID}/metrics`]: () => apiError(404, "PROFILE_NOT_FOUND"),
      }),
    );
    await page.goto(`/panel/admin/usuarios/${USER_ID}`);
    await page.getByRole("button", { name: "Pasar a profesional" }).click();
    const dialog = page.locator("dialog[open]");
    await dialog.getByRole("textbox", { name: "Motivo" }).fill("Lo pidió por soporte, ticket 123.");
    await dialog.getByRole("button", { name: "Cambiar el rol" }).click();
    await expect(dialog.getByText("Esta cuenta nunca fue profesional")).toBeVisible();
    expect(bodies[0]).toEqual({ role: "PROFESSIONAL", reason: "Lo pidió por soporte, ticket 123." });

    await chooseOption(dialog, "Oficio principal", PROFESSION.name);
    await chooseOption(dialog, "Zona 1: localidad", LOCALITY.name);
    await dialog.getByRole("button", { name: "Cambiar el rol" }).click();
    await expect(page.getByText("La cuenta ahora es de profesional. Sus sesiones se cerraron.")).toBeVisible();
    expect(bodies[1]).toEqual({
      role: "PROFESSIONAL",
      reason: "Lo pidió por soporte, ticket 123.",
      professionId: PROFESSION.id,
      serviceAreas: [{ localityId: LOCALITY.id }],
    });
    await expect(page.getByText("No tiene perfil profesional activo.")).toBeVisible();
  });

  test("una cuenta con baja en curso ofrece cancelarla y no darla de baja otra vez", async ({ page }) => {
    await mockApi(
      page,
      asAdmin({
        [`GET /admin/users/${USER_ID}`]: () => json(200, detail({ status: "DEACTIVATED", deletionScheduledFor: "2026-12-10T12:00:00.000Z" })),
      }),
    );
    await page.goto(`/panel/admin/usuarios/${USER_ID}`);
    await expect(page.getByText(/Baja en curso/)).toBeVisible();
    await expect(page.getByRole("button", { name: "Cancelar la baja" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Dar de baja" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Sancionar" })).toHaveCount(0);
  });
});
