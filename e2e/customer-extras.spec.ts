import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll } from "./support/layout";
import { json, me, mockApi, type Handler } from "./support/mock-api";

/*
 * Panel del cliente 5.2: favoritos, notificaciones (campana, lista y avisos) y reseñas, contra la API
 * simulada en el navegador.
 */

const PRO_ID = "00000000-0000-4000-8000-0000000000a1";
const CONVERSATION_ID = "66666666-6666-4666-8666-666666666666";
const CONTRACT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PROFILE_SLUG = "ana-perez-ab12c";

const activeCustomer = me({ status: "ACTIVE", emailVerified: true, verificationStatus: "APPROVED" });

function signedIn(handlers: Record<string, Handler> = {}) {
  return {
    "GET /auth/csrf": () => json(200, { csrfToken: "csrf-1" }),
    "GET /auth/me": () => json(200, activeCustomer),
    "GET /notifications/unread-count": () => json(200, { unread: 0 }),
    "GET /chat/conversations": () => json(200, [conversation]),
    ...handlers,
  };
}

const conversation = {
  id: CONVERSATION_ID,
  myRole: "CUSTOMER",
  counterpart: { userId: PRO_ID, firstName: "Ana", lastName: "Pérez", avatarUrl: null, deactivated: false, slug: PROFILE_SLUG, businessName: null },
  lastMessage: null,
  unread: 0,
  counterpartReadAt: null,
  canWrite: true,
  lastMessageAt: "2026-11-04T12:00:00.000Z",
};

const favorite = (overrides: Record<string, unknown> = {}) => ({
  professionalId: PRO_ID,
  listed: true,
  slug: PROFILE_SLUG,
  firstName: "Ana",
  lastName: "Pérez",
  businessName: "Electricidad Pérez",
  avatarUrl: null,
  availabilityAlerts: false,
  alertsAvailable: true,
  createdAt: "2026-11-04T12:00:00.000Z",
  ...overrides,
});

const notification = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  type: "CONTRACT_UPDATED",
  title: "Ana terminó el trabajo",
  body: "Contanos cómo te fue dejando una reseña.",
  targetType: "CONTRACT",
  targetId: CONTRACT_ID,
  read: false,
  createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
  ...overrides,
});

const completedContract = {
  id: CONTRACT_ID,
  requestId: "77777777-7777-4777-8777-777777777777",
  customerId: activeCustomer.id,
  professionalId: PRO_ID,
  conversationId: CONVERSATION_ID,
  status: "COMPLETED",
  acceptedQuote: null,
  scheduledAt: null,
  startedAt: null,
  completedAt: new Date(Date.now() - 2 * 24 * 60 * 60_000).toISOString(),
  cancelledAt: null,
  cancelReason: null,
  createdAt: "2026-11-04T13:00:00.000Z",
};

test.describe("favoritos", () => {
  test("se guarda desde el perfil y se maneja desde el panel", async ({ page }) => {
    let saved = false;
    let alerts = false;
    const api = await mockApi(
      page,
      signedIn({
        "GET /favorites": () => json(200, saved ? [favorite({ availabilityAlerts: alerts })] : []),
        [`PUT /favorites/${PRO_ID}`]: () => {
          saved = true;
          return json(204);
        },
        [`PATCH /favorites/${PRO_ID}`]: (request) => {
          alerts = (request.postDataJSON() as { availabilityAlerts: boolean }).availabilityAlerts;
          return json(204);
        },
        [`DELETE /favorites/${PRO_ID}`]: () => {
          saved = false;
          return json(204);
        },
      }),
    );

    await page.goto(`/profesionales/${PROFILE_SLUG}`);
    const save = page.getByRole("main").getByRole("button", { name: "Guardar en favoritos" });
    await expect(save).toHaveAttribute("aria-pressed", "false");
    await save.click();
    await expect(page.getByRole("main").getByRole("button", { name: "Guardado en favoritos" })).toHaveAttribute("aria-pressed", "true");
    expect(api.find(`PUT /favorites/${PRO_ID}`)).toHaveLength(1);

    await page.goto("/panel/favoritos");
    await expect(page.getByRole("heading", { level: 2, name: "Ana Pérez" })).toBeVisible();
    // Como una persona: toca el interruptor visible (la casilla real está oculta).
    const alertsSwitch = page.getByRole("switch", { name: "Avisarme cuando Ana Pérez esté disponible" });
    await page.locator("label").filter({ has: alertsSwitch }).click();
    await expect(alertsSwitch).toBeChecked();
    await expect.poll(() => alerts).toBe(true);
    await page.getByRole("button", { name: "Quitar" }).click();
    await expect(page.getByText("Todavía no guardaste a nadie")).toBeVisible();
    await expectNoHorizontalScroll(page);
  });

  test("sin sesión, el corazón lleva a ingresar", async ({ page }) => {
    await mockApi(page);
    await page.goto(`/profesionales/${PROFILE_SLUG}`);
    await expect(page.getByRole("main").getByRole("link", { name: "Ingresá para guardar a Ana en favoritos" })).toHaveAttribute(
      "href",
      `/ingresar?siguiente=${encodeURIComponent(`/profesionales/${PROFILE_SLUG}`)}`,
    );
  });
});

test.describe("notificaciones", () => {
  test("la campana muestra las sin leer y lleva al trabajo marcándola leída", async ({ page }) => {
    let read = false;
    const api = await mockApi(
      page,
      signedIn({
        "GET /notifications/unread-count": () => json(200, { unread: read ? 0 : 1 }),
        "GET /notifications": () => json(200, { data: [notification("n1", { read })], page: 1, limit: 20, total: 1, unread: read ? 0 : 1 }),
        "POST /notifications/n1/read": () => {
          read = true;
          return json(204);
        },
        [`GET /contracts/${CONTRACT_ID}`]: () => json(200, completedContract),
        "GET /reviews/mine": () => json(200, []),
      }),
    );
    await page.goto("/");
    const bell = page.getByRole("button", { name: "Notificaciones (1 sin leer)" });
    await bell.click();
    await page.getByRole("link", { name: /Ana terminó el trabajo/ }).click();
    await expect(page).toHaveURL(new RegExp(`/panel/trabajos/${CONTRACT_ID}$`));
    expect(api.find("POST /notifications/n1/read")).toHaveLength(1);
    await expect(page.getByRole("button", { name: "Notificaciones", exact: true })).toBeVisible();
  });

  test("la página lista, marca todas y guarda los avisos por categoría", async ({ page }) => {
    let readAll = false;
    let preferences = [
      { category: "MESSAGES", push: true },
      { category: "COMMUNITY", push: true },
    ];
    await mockApi(
      page,
      signedIn({
        "GET /notifications/unread-count": () => json(200, { unread: readAll ? 0 : 2 }),
        "GET /notifications": () =>
          json(200, {
            data: [notification("n1", { read: readAll }), notification("n2", { read: readAll, type: "ANNOUNCEMENT", title: "Novedades de Repara Ya", targetType: "ANNOUNCEMENT" })],
            page: 1,
            limit: 20,
            total: 2,
            unread: readAll ? 0 : 2,
          }),
        "POST /notifications/read-all": () => {
          readAll = true;
          return json(204);
        },
        "GET /notifications/preferences": () => json(200, preferences),
        "PUT /notifications/preferences": (request) => {
          preferences = (request.postDataJSON() as { preferences: typeof preferences }).preferences;
          return json(200, preferences);
        },
        "GET /notifications/push/key": () => json(200, { enabled: false, publicKey: null }),
      }),
    );
    await page.goto("/panel/notificaciones");
    await expect(page.getByText("2 sin leer de 2")).toBeVisible();
    await page.getByRole("button", { name: "Marcar todas como leídas" }).click();
    await expect(page.getByText("2 notificaciones, todas leídas")).toBeVisible();

    await expect(page.getByText("todavía no están activados en Repara Ya")).toBeVisible();
    const community = page.getByRole("switch", { name: /Comunidad/ });
    await page.locator("label").filter({ has: community }).click();
    await expect(community).not.toBeChecked();
    await expect.poll(() => preferences.find((p) => p.category === "COMMUNITY")?.push).toBe(false);
    await expectNoHorizontalScroll(page);
  });
});

test.describe("reseñas", () => {
  test("un trabajo terminado se reseña desde su detalle y aparece en mis reseñas", async ({ page }) => {
    let created: { contractId: string; rating: number; comment?: string } | null = null;
    const ownReview = () => ({
      id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      rating: created!.rating,
      comment: created!.comment ?? null,
      author: { displayName: "Lucía G." },
      reply: null,
      edited: false,
      createdAt: new Date().toISOString(),
      contractId: CONTRACT_ID,
      professionalId: PRO_ID,
      status: "VISIBLE",
      hiddenReason: null,
      editableUntil: new Date(Date.now() + 28 * 24 * 60 * 60_000).toISOString(),
    });
    await mockApi(
      page,
      signedIn({
        [`GET /contracts/${CONTRACT_ID}`]: () => json(200, completedContract),
        "GET /contracts": () => json(200, [completedContract]),
        "GET /reviews/mine": () => json(200, created ? [ownReview()] : []),
        "POST /reviews": (request) => {
          created = request.postDataJSON() as typeof created;
          return json(201, ownReview());
        },
      }),
    );
    await page.goto(`/panel/trabajos/${CONTRACT_ID}`);
    await page.getByRole("button", { name: "Publicar reseña" }).click();
    await expect(page.getByText("Elegí de 1 a 5 estrellas.")).toBeVisible();

    // Toca la cuarta estrella (la etiqueta que contiene el radio "4 de 5").
    await page.locator("label").filter({ has: page.getByRole("radio", { name: "4 de 5, Bueno" }) }).click();
    await expect(page.getByRole("radio", { name: "4 de 5, Bueno" })).toBeChecked();
    await page.getByRole("textbox", { name: /Comentario/ }).fill("Muy prolija y puntual.");
    await page.getByRole("button", { name: "Publicar reseña" }).click();
    await expect(page.getByRole("heading", { name: "Tu reseña" })).toBeVisible();
    expect(created).toEqual({ contractId: CONTRACT_ID, rating: 4, comment: "Muy prolija y puntual." });

    await page.goto("/panel/resenas");
    await expect(page.getByText("Muy prolija y puntual.")).toBeVisible();
    await expect(page.getByRole("img", { name: "4 de 5" })).toBeVisible();
  });
});
