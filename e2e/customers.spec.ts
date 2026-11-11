import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll } from "./support/layout";
import { chooseOption } from "./support/listbox";
import { apiError, json, LOCALITY, me, mockApi, PROFESSION, type Handler } from "./support/mock-api";

/*
 * "Clientes" (ADR 0037 del backend): cualquier profesional con sesión ve a todos los clientes activos
 * y, en la ficha, lo que preguntaron y pidieron en el foro.
 */

const SOFIA = "00000000-0000-4000-8000-0000000000a1";
const MATEO = "00000000-0000-4000-8000-0000000000a2";

const card = (overrides: Record<string, unknown> = {}) => ({
  userId: SOFIA,
  firstName: "Sofía",
  lastName: "Molina",
  avatarUrl: null,
  memberSince: "2026-10-02T12:00:00.000Z",
  postCount: 2,
  openRequestCount: 1,
  lastPostAt: "2026-11-08T12:00:00.000Z",
  professions: [{ id: PROFESSION.id, name: PROFESSION.name }],
  localities: [LOCALITY],
  ...overrides,
});

const quiet = card({ userId: MATEO, firstName: "Mateo", lastName: "Castro", postCount: 0, openRequestCount: 0, lastPostAt: null, professions: [], localities: [] });

const post = {
  id: "00000000-0000-4000-8000-0000000000f1",
  type: "PROFESSIONAL_WANTED",
  body: "Necesito cambiar el tablero de la casa antes de fin de mes.",
  author: { userId: SOFIA, firstName: "Sofía", lastName: "Molina", avatarUrl: null, role: "CUSTOMER", memberSince: "2026-10-02T12:00:00.000Z" },
  professions: [{ id: PROFESSION.id, name: PROFESSION.name }],
  locality: LOCALITY,
  neighborhood: null,
  budgetEstimate: "60000.00",
  deadline: null,
  resolved: false,
  media: [],
  likeCount: 0,
  replyCount: 2,
  edited: false,
  createdAt: "2026-11-08T12:00:00.000Z",
};

function asProfessional(handlers: Record<string, Handler> = {}, status = "ACTIVE") {
  return {
    "GET /auth/csrf": () => json(200, { csrfToken: "csrf-1" }),
    "GET /auth/me": () => json(200, me({ role: "PROFESSIONAL", status, emailVerified: true, verificationStatus: "APPROVED" })),
    "GET /notifications/unread-count": () => json(200, { unread: 0 }),
    "GET /chat/conversations": () => json(200, []),
    "GET /customers": () => json(200, { data: [card(), quiet], page: 1, limit: 24, total: 2 }),
    ...handlers,
  };
}

test("catálogo: todos los clientes, con sus pedidos, y los filtros van a la URL y al backend", async ({ page }) => {
  const api = await mockApi(page, asProfessional());
  await page.goto("/panel/clientes");
  await expect(page.getByRole("heading", { level: 1, name: "Clientes" })).toBeVisible();
  await expect(page.getByText("2 clientes")).toBeVisible();
  const sofia = page.getByRole("link", { name: /Sofía Molina/ });
  await expect(sofia).toContainText("1 pedido abierto");
  await expect(sofia).toContainText("Electricista");
  await expect(page.getByRole("link", { name: /Mateo Castro/ })).toContainText("Todavía no publicó en el foro");

  await chooseOption(page, "Pidió un oficio", PROFESSION.name);
  await page.getByRole("checkbox", { name: "Con pedidos abiertos" }).check();
  await expect(page).toHaveURL(new RegExp(`oficio=${PROFESSION.id}`));
  await expect(page).toHaveURL(/pedidos=abiertos/);
  await expect
    .poll(() => api.find("GET /customers").map((request) => new URL(request.url()).searchParams.toString()))
    .toContain(`professionId=${PROFESSION.id}&withOpenRequests=true&limit=24`);

  // El menú del panel y el del sitio marcan solo "Clientes".
  await expect(page.getByRole("navigation", { name: "Panel" }).getByRole("link", { name: "Clientes" })).toHaveAttribute("aria-current", "page");
  await expectNoHorizontalScroll(page);
});

test("ficha: sus publicaciones del foro, por tipo, y cada una abre su hilo", async ({ page }) => {
  const api = await mockApi(
    page,
    asProfessional({
      [`GET /customers/${SOFIA}`]: () => json(200, card()),
      "GET /forum/posts": () => json(200, { data: [post], page: 1, limit: 10, total: 1 }),
    }),
  );
  await page.goto("/panel/clientes");
  await page.getByRole("link", { name: /Sofía Molina/ }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Sofía Molina" })).toBeVisible();
  await expect(page.getByText("Publicó en Córdoba")).toBeVisible();
  await expect(page.getByRole("link", { name: /Necesito cambiar el tablero/ })).toHaveAttribute("href", `/foro/${post.id}`);
  await expect(page.getByText("Ofrece desde $ 60.000")).toBeVisible();

  await page.getByRole("button", { name: "Busca profesional" }).click();
  await expect
    .poll(() => api.find("GET /forum/posts").map((request) => new URL(request.url()).searchParams.toString()))
    .toContain(`authorId=${SOFIA}&type=PROFESSIONAL_WANTED&page=1&limit=10`);
  await expectNoHorizontalScroll(page);
});

test("ficha de un cliente que ya no está disponible", async ({ page }) => {
  await mockApi(page, asProfessional({ [`GET /customers/${MATEO}`]: () => apiError(404, "CUSTOMER_NOT_FOUND") }));
  await page.goto(`/panel/clientes/${MATEO}`);
  await expect(page.getByRole("heading", { level: 1, name: "Este cliente no está disponible" })).toBeVisible();
});

test("con la cuenta por activar también entra; un cliente no", async ({ page }) => {
  await mockApi(page, asProfessional({}, "PENDING_VERIFICATION"));
  await page.goto("/panel/clientes");
  await expect(page.getByText("2 clientes")).toBeVisible();

  await mockApi(page, { ...asProfessional(), "GET /auth/me": () => json(200, me({ role: "CUSTOMER", status: "ACTIVE" })) });
  await page.goto("/panel/clientes");
  await expect(page.getByRole("heading", { level: 1, name: "Esta sección es para profesionales" })).toBeVisible();
});

test("la dirección vieja /clientes lleva al panel", async ({ page }) => {
  await mockApi(page, asProfessional());
  await page.goto("/clientes");
  await expect(page).toHaveURL(/\/panel\/clientes$/);
});
