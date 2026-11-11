import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll } from "./support/layout";
import { json, me, mockApi, type Handler } from "./support/mock-api";

/*
 * Etapa 7.2 y 7.3, el panel del admin: reportes, apelaciones, identidades, barrios, soporte, opiniones,
 * novedades e ingresos, contra la API simulada en el navegador.
 */

const REPORT_ID = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const TICKET_ID = "ffffffff-ffff-4fff-8fff-ffffffffffff";
const USER = { id: "00000000-0000-4000-8000-0000000000c1", firstName: "Camila", lastName: "Herrera", email: "camila@example.com", role: "CUSTOMER", status: "ACTIVE" };
const PRO = { id: "00000000-0000-4000-8000-0000000000a1", firstName: "Marcos", lastName: "Acosta", email: "marcos@example.com", role: "PROFESSIONAL", status: "ACTIVE" };
const admin = me({ role: "ADMIN", status: "ACTIVE", emailVerified: true, verificationStatus: "APPROVED" });

const empty = { data: [], page: 1, limit: 20, total: 0 };
function asAdmin(handlers: Record<string, Handler> = {}) {
  return {
    "GET /auth/csrf": () => json(200, { csrfToken: "csrf-1" }),
    "GET /auth/me": () => json(200, admin),
    "GET /notifications/unread-count": () => json(200, { unread: 0 }),
    ...handlers,
  };
}

const report = (overrides: Record<string, unknown> = {}) => ({
  id: REPORT_ID,
  targetType: "FORUM_POST",
  targetId: "abababab-abab-4bab-8bab-abababababab",
  reason: "SPAM",
  status: "SUBMITTED",
  createdAt: "2026-11-09T12:00:00.000Z",
  description: "Publica lo mismo todos los días.",
  reporter: USER,
  reportedUser: PRO,
  evidenceFileIds: [],
  target: { body: "Compren mis servicios <script>window.__xss=1</script>", status: "VISIBLE", deleted: false },
  resolvedAt: null,
  resolutionNote: null,
  ...overrides,
});

test("reportes: la cola lleva al reporte, se oculta el contenido y se resuelve", async ({ page }) => {
  let current = report();
  const bodies: Record<string, unknown> = {};
  await mockApi(
    page,
    asAdmin({
      "GET /admin/reports": () => json(200, { data: [current], page: 1, limit: 20, total: 1 }),
      [`GET /admin/reports/${REPORT_ID}`]: () => json(200, current),
      [`POST /admin/forum/posts/${current.targetId}/hide`]: (request) => {
        bodies.hide = request.postDataJSON();
        current = report({ target: { ...current.target, status: "HIDDEN_BY_ADMIN" } });
        return json(204);
      },
      [`POST /admin/reports/${REPORT_ID}/resolve`]: (request) => {
        bodies.resolve = request.postDataJSON();
        current = report({ status: "VALID", resolvedAt: "2026-11-10T12:00:00.000Z", resolutionNote: "Confirmado", target: current.target });
        return json(200, current);
      },
    }),
  );
  await page.goto("/panel/admin/reportes");
  await page.getByRole("link", { name: /Spam o publicidad/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Spam o publicidad" })).toBeVisible();
  // El texto reportado se muestra como texto, nunca se ejecuta.
  await expect(page.getByText("Compren mis servicios <script>")).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();

  await page.getByRole("button", { name: "Ocultar el contenido" }).click();
  await page.locator("dialog[open]").getByRole("textbox", { name: /Motivo/ }).fill("Spam repetido");
  await page.locator("dialog[open]").getByRole("button", { name: "Ocultar", exact: true }).click();
  await expect(page.getByText("Ocultaste el contenido.")).toBeVisible();
  expect(bodies.hide).toEqual({ reason: "Spam repetido" });
  await expect(page.getByRole("button", { name: "Volver a mostrar" })).toBeVisible();

  await page.getByRole("button", { name: "Resolver" }).click();
  const dialog = page.locator("dialog[open]");
  await dialog.getByRole("textbox", { name: /Nota/ }).fill("Confirmado");
  await dialog.getByRole("button", { name: "Resolver" }).click();
  await expect(dialog.getByText("Elegí si el reporte es válido o no.")).toBeVisible();
  await dialog.getByRole("radio", { name: /Válido/ }).check();
  await dialog.getByRole("button", { name: "Resolver" }).click();
  await expect(page.getByText("Marcaste el reporte como válido.")).toBeVisible();
  expect(bodies.resolve).toEqual({ valid: true, note: "Confirmado" });
  await expect(page.getByRole("button", { name: "Resolver" })).toHaveCount(0);
  await expectNoHorizontalScroll(page);
});

test("apelaciones: aceptar manda la decisión con la nota", async ({ page }) => {
  let body: unknown = null;
  const appeal = { id: "12121212-1212-4212-8212-121212121212", strikeId: null, sanctionId: "34343434-3434-4434-8434-343434343434", body: "Fue un error, no hice nada.", status: "OPEN", decisionNote: null, createdAt: "2026-11-09T12:00:00.000Z", user: USER };
  await mockApi(
    page,
    asAdmin({
      "GET /admin/appeals": () => json(200, { data: body ? [] : [appeal], page: 1, limit: 20, total: body ? 0 : 1 }),
      [`POST /admin/appeals/${appeal.id}/decide`]: (request) => {
        body = request.postDataJSON();
        return json(200, { ...appeal, status: "ACCEPTED" });
      },
    }),
  );
  await page.goto("/panel/admin/apelaciones");
  await page.getByRole("button", { name: "Aceptar" }).click();
  await page.locator("dialog[open]").getByRole("textbox", { name: /Nota/ }).fill("Revisamos y fue un error.");
  await page.locator("dialog[open]").getByRole("button", { name: "Aceptar" }).click();
  await expect(page.getByText("Aceptaste la apelación.")).toBeVisible();
  expect(body).toEqual({ decision: "ACCEPTED", note: "Revisamos y fue un error." });
});

test("identidades: un cambio de foto muestra la actual y la nueva, y se aprueba", async ({ page }) => {
  let body: unknown = null;
  const item = {
    id: "56565656-5656-4656-8656-565656565656",
    kind: "PROFILE_CHANGE",
    status: "REQUIRES_REVIEW",
    provider: null,
    attemptNumber: 1,
    submittedAt: "2026-11-09T12:00:00.000Z",
    decidedAt: null,
    reasonCode: null,
    userId: PRO.id,
    decisionSource: null,
    decidedBy: null,
    adminNote: null,
    subject: { ...PRO, phone: "+5493510000000", avatarUrl: null, pendingFirstName: null, pendingLastName: null, pendingAvatarUrl: "/api/v1/uploads/x/content" },
  };
  await mockApi(
    page,
    asAdmin({
      "GET /admin/identity-verifications": () => json(200, { data: [item], meta: { page: 1, limit: 20, total: 1, totalPages: 1 } }),
      [`POST /admin/identity-verifications/${item.id}/decision`]: (request) => {
        body = request.postDataJSON();
        return json(200, { ...item, status: "APPROVED" });
      },
    }),
  );
  await page.goto("/panel/admin/identidades");
  await expect(page.getByText("Foto nueva")).toBeVisible();
  await page.getByRole("button", { name: "Aprobar" }).click();
  await page.locator("dialog[open]").getByRole("textbox", { name: /Motivo/ }).fill("Coincide la cara.");
  await page.locator("dialog[open]").getByRole("button", { name: "Aprobar" }).click();
  await expect(page.getByText("Aprobaste la verificación.")).toBeVisible();
  expect(body).toEqual({ decision: "APPROVE", reason: "Coincide la cara." });
});

test("barrios: aprobar uno pendiente", async ({ page }) => {
  const item = { id: "78787878-7878-4878-8878-787878787878", localityId: "11111111-1111-4111-8111-111111111111", name: "Villa Belgrano", normalizedName: "villa belgrano", status: "PENDING", mergedIntoId: null, createdByUserId: null, reviewedById: null, reviewedAt: null, createdAt: "2026-11-09T12:00:00.000Z", usage: { residents: 2, serviceAreas: 1 } };
  let approved = false;
  await mockApi(
    page,
    asAdmin({
      "GET /admin/neighborhoods": () => json(200, { data: approved ? [] : [item], page: 1, limit: 20, total: approved ? 0 : 1 }),
      [`POST /admin/neighborhoods/${item.id}/approve`]: () => {
        approved = true;
        return json(200, { ...item, status: "APPROVED" });
      },
    }),
  );
  await page.goto("/panel/admin/barrios");
  await expect(page.getByText("2 clientes · 1 zona de trabajo", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Aprobar" }).click();
  await page.locator("dialog[open]").getByRole("button", { name: "Aprobar" }).click();
  await expect(page.getByText("Aprobaste «Villa Belgrano».")).toBeVisible();
});

test("soporte: responder una consulta del formulario público avisa que falta el email", async ({ page }) => {
  let body: unknown = null;
  const ticket = { id: TICKET_ID, category: "OTHER", status: "OPEN", messages: [{ id: "m1", fromStaff: false, body: "¿Atienden en Villa Allende?", fileId: null, createdAt: "2026-11-09T12:00:00.000Z" }], createdAt: "2026-11-09T12:00:00.000Z", updatedAt: "2026-11-09T12:00:00.000Z", userId: null, email: "visita@example.com", name: "Visita" };
  await mockApi(
    page,
    asAdmin({
      "GET /admin/support/tickets": () => json(200, { data: [ticket], page: 1, limit: 20, total: 1 }),
      [`GET /admin/support/tickets/${TICKET_ID}`]: () => json(200, ticket),
      [`POST /admin/support/tickets/${TICKET_ID}/messages`]: (request) => {
        body = request.postDataJSON();
        return json(201, { ...ticket, status: "ANSWERED", messages: [...ticket.messages, { id: "m2", fromStaff: true, body: "¡Sí!", fileId: null, createdAt: "2026-11-10T12:00:00.000Z" }] });
      },
    }),
  );
  await page.goto("/panel/admin/soporte");
  await page.getByRole("link", { name: /Otro/ }).click();
  await expect(page.getByText(/no le llega a la persona/)).toBeVisible();
  await page.getByRole("textbox", { name: "Tu respuesta" }).fill("¡Sí!");
  await page.getByRole("button", { name: "Responder" }).click();
  await expect(page.getByText("Respondiste la consulta.")).toBeVisible();
  expect(body).toEqual({ body: "¡Sí!" });
  await expect(page.getByRole("list", { name: "Mensajes" }).getByText("Repara Ya")).toBeVisible();
});

test("novedades: pide confirmación y manda el segmento elegido", async ({ page }) => {
  let body: unknown = null;
  await mockApi(
    page,
    asAdmin({
      "GET /admin/announcements": () => json(200, []),
      "POST /admin/announcements": (request) => {
        body = request.postDataJSON();
        return json(201, { id: "a1", title: "Hola", body: "Mensaje", publishedAt: "2026-11-10T12:00:00.000Z", segment: { roles: ["CUSTOMER"] }, recipients: 12 });
      },
    }),
  );
  await page.goto("/panel/admin/novedades");
  await page.getByRole("textbox", { name: "Título" }).fill("Hola");
  await page.getByRole("textbox", { name: "Mensaje" }).fill("Mensaje");
  await page.getByRole("checkbox", { name: "Clientes" }).check();
  await page.getByRole("button", { name: "Publicar" }).click();
  await expect(page.locator("dialog[open]")).toContainText("clientes");
  expect(body).toBeNull();
  await page.locator("dialog[open]").getByRole("button", { name: "Publicar" }).click();
  await expect(page.getByText("Publicaste la novedad: le llegó a 12 personas.")).toBeVisible();
  expect(body).toEqual({ title: "Hola", body: "Mensaje", segment: { roles: ["CUSTOMER"] } });
});

test("ingresos: resumen con el neto y la tabla por período; exportar descarga el CSV", async ({ page }) => {
  const amounts = (gross: string, net: string) => ({ gross, refunds: "0.00", chargebacks: "0.00", net, payments: 2, returns: 0 });
  await mockApi(
    page,
    asAdmin({
      "GET /admin/revenue/summary": () =>
        json(200, {
          from: "2026-01-01",
          to: "2026-11-10",
          groupBy: "month",
          currency: "ARS",
          buckets: [
            { ...amounts("30000.00", "30000.00"), byPlan: [], start: "2026-10-01" },
            { ...amounts("45000.00", "45000.00"), byPlan: [], start: "2026-11-01" },
          ],
          total: { ...amounts("75000.00", "75000.00"), byPlan: [{ ...amounts("75000.00", "75000.00"), planCode: "PREMIUM" }] },
          previous: { ...amounts("50000.00", "50000.00"), byPlan: [], from: "2025-01-01", to: "2025-11-10" },
          change: { net: "25000.00", netPercent: 50 },
          localityMayOverlap: false,
        }),
      "POST /admin/revenue/exports": () => ({ status: 200, body: "fecha;neto\n2026-11;45000,00" }),
    }),
  );
  await page.goto("/panel/admin/ingresos");
  await expect(page.getByText("+50 % contra el período anterior")).toBeVisible();
  await page.getByRole("button", { name: "Ver como tabla" }).click();
  await expect(page.getByRole("table").first()).toContainText("45.000");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar CSV" }).click();
  expect((await download).suggestedFilename()).toMatch(/\.csv$/);
  await expectNoHorizontalScroll(page);
});

test("el menú del admin tiene moderación y negocio", async ({ page }) => {
  await mockApi(page, asAdmin({ "GET /admin/dashboard": () => json(200, { usersByRole: {}, usersByStatus: {}, subscriptionsByStatus: {}, professionalsByPlan: {}, newUsersLast7Days: 0, newForumPostsLast7Days: 0, newReportsLast7Days: 0, openReports: 0, openAppeals: 0, openSupportTickets: 0, pendingVerifications: 0, sanctionedUsers: 0, paymentsToReview: 0 }), "GET /admin/reports": () => json(200, empty) }));
  await page.goto("/panel");
  const nav = page.getByRole("navigation", { name: "Panel" });
  for (const name of ["Reportes", "Apelaciones", "Identidades", "Barrios", "Soporte", "Opiniones", "Novedades", "Ingresos"]) {
    await expect(nav.getByRole("link", { name })).toBeAttached();
  }
});
