import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll } from "./support/layout";
import { apiError, json, me, mockApi, PROFESSION, type Handler } from "./support/mock-api";

const ME_ID = "00000000-0000-4000-8000-000000000001";
const PRO_ID = "00000000-0000-4000-8000-0000000000a1";
const CONVERSATION_ID = "66666666-6666-4666-8666-666666666666";
const REQUEST_ID = "77777777-7777-4777-8777-777777777777";
const TARGET_ID = "88888888-8888-4888-8888-888888888888";
const QUOTE_ID = "99999999-9999-4999-8999-999999999999";
const CONTRACT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
/** Perfil del servidor simulado (e2e/support/mock-server.mjs). */
const PROFILE_SLUG = "ana-perez-ab12c";

const activeCustomer = me({ status: "ACTIVE", emailVerified: true, verificationStatus: "APPROVED" });

const message = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  conversationId: CONVERSATION_ID,
  senderType: "PROFESSIONAL",
  senderId: PRO_ID,
  body: `Mensaje ${id}`,
  edited: false,
  deleted: false,
  serviceRequestId: null,
  attachments: [],
  createdAt: new Date(Date.now() - 60_000).toISOString(),
  ...overrides,
});

const conversation = (overrides: Record<string, unknown> = {}, counterpart: Record<string, unknown> = {}) => ({
  id: CONVERSATION_ID,
  myRole: "CUSTOMER",
  counterpart: {
    userId: PRO_ID,
    firstName: "Ana",
    lastName: "Pérez",
    avatarUrl: null,
    deactivated: false,
    slug: PROFILE_SLUG,
    businessName: null,
    ...counterpart,
  },
  lastMessage: message("m1", { body: "¡Hola! ¿En qué te ayudo?" }),
  unread: 2,
  counterpartReadAt: null,
  canWrite: true,
  lastMessageAt: new Date(Date.now() - 60_000).toISOString(),
  ...overrides,
});

const quote = { id: QUOTE_ID, amount: "45000.00", currency: "ARS", description: "Incluye materiales.", proposedDate: null, status: "SENT", createdAt: "2026-11-04T12:00:00.000Z" };

const serviceRequest = (overrides: Record<string, unknown> = {}) => ({
  id: REQUEST_ID,
  customerId: ME_ID,
  professionId: PROFESSION.id,
  description: "Cambiar dos enchufes y revisar el tablero.",
  urgency: "IMPATIENT",
  status: "OPEN",
  targets: [
    { id: TARGET_ID, requestId: REQUEST_ID, professionalId: PRO_ID, conversationId: CONVERSATION_ID, status: "QUOTED", currentQuote: quote },
  ],
  contractId: null,
  createdAt: "2026-11-04T12:00:00.000Z",
  ...overrides,
});

const contract = (overrides: Record<string, unknown> = {}) => ({
  id: CONTRACT_ID,
  requestId: REQUEST_ID,
  customerId: ME_ID,
  professionalId: PRO_ID,
  conversationId: CONVERSATION_ID,
  status: "ACCEPTED",
  acceptedQuote: { ...quote, status: "ACCEPTED" },
  scheduledAt: null,
  startedAt: null,
  completedAt: null,
  cancelledAt: null,
  cancelReason: null,
  createdAt: "2026-11-04T13:00:00.000Z",
  ...overrides,
});

function signedIn(user: Record<string, unknown>, handlers: Record<string, Handler> = {}) {
  return {
    "GET /auth/csrf": () => json(200, { csrfToken: "csrf-1" }),
    "GET /auth/me": () => json(200, user),
    ...handlers,
  };
}

test.describe("perfil: chat y presupuesto", () => {
  test("sin sesión invita a ingresar y vuelve al perfil", async ({ page }) => {
    await mockApi(page);
    await page.goto(`/profesionales/${PROFILE_SLUG}`);
    const link = page.getByRole("link", { name: "ingresá a tu cuenta" });
    await expect(link).toHaveAttribute("href", `/ingresar?siguiente=${encodeURIComponent(`/profesionales/${PROFILE_SLUG}`)}`);
    await expect(page.getByRole("button", { name: "Escribirle por el chat" })).toHaveCount(0);
  });

  test("un cliente sin activar no puede escribir y ve cómo activarla", async ({ page }) => {
    await mockApi(page, signedIn(me()));
    await page.goto(`/profesionales/${PROFILE_SLUG}`);
    await expect(page.getByText("primero activá tu cuenta")).toBeVisible();
    await expect(page.getByRole("button", { name: "Escribirle por el chat" })).toHaveCount(0);
  });

  test("un profesional no ve las acciones de cliente", async ({ page }) => {
    await mockApi(page, signedIn(me({ role: "PROFESSIONAL", status: "ACTIVE" })));
    await page.goto(`/profesionales/${PROFILE_SLUG}`);
    await expect(page.getByRole("button", { name: "Ver contacto" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Escribirle por el chat" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Pedir presupuesto" })).toHaveCount(0);
  });

  test("cliente activo: abre el chat con el id de usuario del profesional", async ({ page }) => {
    const api = await mockApi(
      page,
      signedIn(activeCustomer, {
        "POST /chat/conversations": () => json(201, conversation()),
        "GET /chat/conversations": () => json(200, [conversation()]),
        [`GET /chat/conversations/${CONVERSATION_ID}`]: () => json(200, conversation()),
        [`GET /chat/conversations/${CONVERSATION_ID}/messages`]: () => json(200, [message("m1", { body: "¡Hola! ¿En qué te ayudo?" })]),
        [`POST /chat/conversations/${CONVERSATION_ID}/read`]: () => json(204),
      }),
    );
    await page.goto(`/profesionales/${PROFILE_SLUG}`);
    await page.getByRole("button", { name: "Escribirle por el chat" }).click();
    await expect(page).toHaveURL(new RegExp(`/panel/mensajes/${CONVERSATION_ID}$`));
    expect(api.find("POST /chat/conversations")[0]!.postDataJSON()).toEqual({ professionalId: PRO_ID });
    await expect(page.getByRole("region", { name: "Conversación" }).getByText("¡Hola! ¿En qué te ayudo?")).toBeVisible();
  });

  test("pedir presupuesto: valida, manda el pedido y lleva al detalle", async ({ page }) => {
    const api = await mockApi(
      page,
      signedIn(activeCustomer, {
        "POST /requests": () => json(201, serviceRequest({ targets: [{ ...serviceRequest().targets[0], status: "PENDING", currentQuote: null }] })),
        [`GET /requests/${REQUEST_ID}`]: () => json(200, serviceRequest({ targets: [{ ...serviceRequest().targets[0], status: "PENDING", currentQuote: null }] })),
        "GET /requests": () => json(200, []),
        "GET /chat/conversations": () => json(200, [conversation()]),
      }),
    );
    await page.goto(`/profesionales/${PROFILE_SLUG}`);
    await page.getByRole("button", { name: "Pedir presupuesto" }).click();
    const dialog = page.getByRole("dialog", { name: /Pedir presupuesto/ });
    await dialog.getByRole("button", { name: "Enviar pedido" }).click();
    await expect(dialog.getByText("Contá un poco más")).toBeVisible();
    expect(api.find("POST /requests")).toHaveLength(0);

    await dialog.getByRole("textbox", { name: /Qué necesitás/ }).fill("  Cambiar dos enchufes y revisar el tablero.  ");
    await dialog.getByText("Urgente", { exact: true }).click();
    await dialog.getByRole("button", { name: "Enviar pedido" }).click();
    await expect(page).toHaveURL(new RegExp(`/panel/pedidos/${REQUEST_ID}$`));
    expect(api.find("POST /requests")[0]!.postDataJSON()).toEqual({
      professionalIds: [PRO_ID],
      professionId: PROFESSION.id,
      description: "Cambiar dos enchufes y revisar el tablero.",
      urgency: "URGENT",
    });
    await expect(page.getByText("Sin respuesta todavía")).toBeVisible();
    // Se navegó desde un diálogo abierto: la página nueva tiene que responder a los clics.
    await page.getByRole("button", { name: "Cancelar el pedido" }).click({ timeout: 5_000 });
    await expect(page.getByRole("dialog", { name: "¿Cancelar el pedido?" })).toBeVisible();
  });
});

test.describe("mensajes", () => {
  test("la lista muestra no leídos y el menú del panel los suma", async ({ page }) => {
    await mockApi(page, signedIn(activeCustomer, { "GET /chat/conversations": () => json(200, [conversation()]) }));
    await page.goto("/panel/mensajes");
    const item = page.getByRole("list", { name: "Conversaciones" }).getByRole("link", { name: /Ana Pérez/ });
    await expect(item).toContainText("¡Hola! ¿En qué te ayudo?");
    await expect(item).toContainText("2 mensajes sin leer");
    await expect(page.getByRole("navigation", { name: "Panel" }).getByRole("link", { name: /Mensajes/ })).toContainText("2");
  });

  test("sin conversaciones invita a buscar profesionales", async ({ page }) => {
    await mockApi(page, signedIn(activeCustomer, { "GET /chat/conversations": () => json(200, []) }));
    await page.goto("/panel/mensajes");
    await expect(page.getByRole("heading", { name: "Todavía no tenés conversaciones" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Buscar profesionales" })).toBeVisible();
  });

  test("mandar un mensaje: lo agrega, confirma la lectura y lleva el token CSRF", async ({ page }) => {
    const api = await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /chat/conversations": () => json(200, [conversation()]),
        [`GET /chat/conversations/${CONVERSATION_ID}`]: () => json(200, conversation()),
        [`GET /chat/conversations/${CONVERSATION_ID}/messages`]: () => json(200, [message("m1", { body: "¡Hola! ¿En qué te ayudo?" })]),
        [`POST /chat/conversations/${CONVERSATION_ID}/read`]: () => json(204),
        [`POST /chat/conversations/${CONVERSATION_ID}/messages`]: (request) =>
          json(201, message("m2", { senderType: "CUSTOMER", senderId: ME_ID, body: (request.postDataJSON() as { body: string }).body, createdAt: new Date().toISOString() })),
      }),
    );
    await page.goto(`/panel/mensajes/${CONVERSATION_ID}`);
    const convo = page.getByRole("region", { name: "Conversación" });
    await expect(convo.getByText("¡Hola! ¿En qué te ayudo?")).toBeVisible();
    // Había 2 sin leer: al abrirla se confirma la lectura.
    await expect.poll(() => api.find(`POST /chat/conversations/${CONVERSATION_ID}/read`).length).toBe(1);

    const box = convo.getByRole("textbox", { name: "Escribí un mensaje" });
    await box.fill("Se corta la luz al prender el horno.");
    await box.press("Enter");
    await expect(convo.getByText("Se corta la luz al prender el horno.")).toBeVisible();
    await expect(box).toHaveValue("");
    const [sent] = api.find(`POST /chat/conversations/${CONVERSATION_ID}/messages`);
    expect(sent!.postDataJSON()).toEqual({ body: "Se corta la luz al prender el horno." });
    expect(sent!.headers()["x-csrf-token"]).toBe("csrf-1");
    await expectNoHorizontalScroll(page);
  });

  test("Shift+Enter hace un salto de línea y no envía", async ({ page }) => {
    const api = await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /chat/conversations": () => json(200, [conversation({ unread: 0 })]),
        [`GET /chat/conversations/${CONVERSATION_ID}`]: () => json(200, conversation({ unread: 0 })),
        [`GET /chat/conversations/${CONVERSATION_ID}/messages`]: () => json(200, []),
      }),
    );
    await page.goto(`/panel/mensajes/${CONVERSATION_ID}`);
    const box = page.getByRole("textbox", { name: "Escribí un mensaje" });
    await box.fill("Primera línea");
    await box.press("Shift+Enter");
    await box.pressSequentially("Segunda");
    await expect(box).toHaveValue("Primera línea\nSegunda");
    expect(api.find(`POST /chat/conversations/${CONVERSATION_ID}/messages`)).toHaveLength(0);
  });

  test("editar y eliminar un mensaje propio", async ({ page }) => {
    const mine = message("m2", { senderType: "CUSTOMER", senderId: ME_ID, body: "Texto con herror", createdAt: new Date().toISOString() });
    const api = await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /chat/conversations": () => json(200, [conversation({ unread: 0 })]),
        [`GET /chat/conversations/${CONVERSATION_ID}`]: () => json(200, conversation({ unread: 0 })),
        [`GET /chat/conversations/${CONVERSATION_ID}/messages`]: () => json(200, [mine]),
        "PATCH /chat/messages/m2": (request) => json(200, { ...mine, body: (request.postDataJSON() as { body: string }).body, edited: true }),
        "DELETE /chat/messages/m2": () => json(204),
      }),
    );
    await page.goto(`/panel/mensajes/${CONVERSATION_ID}`);
    const convo = page.getByRole("region", { name: "Conversación" });
    await convo.getByRole("button", { name: "Opciones del mensaje" }).click();
    await convo.getByRole("button", { name: "Editar" }).click();
    const box = convo.getByRole("textbox", { name: "Editar mensaje" });
    await expect(box).toHaveValue("Texto con herror");
    await box.fill("Texto sin error");
    await box.press("Enter");
    await expect(convo.getByText("Texto sin error")).toBeVisible();
    await expect(convo.getByText("editado")).toBeVisible();
    expect(api.find("PATCH /chat/messages/m2")[0]!.postDataJSON()).toEqual({ body: "Texto sin error" });

    await convo.getByRole("button", { name: "Opciones del mensaje" }).click();
    await convo.getByRole("button", { name: "Eliminar" }).click();
    await page.getByRole("dialog", { name: "¿Eliminar el mensaje?" }).getByRole("button", { name: "Eliminar" }).click();
    await expect(convo.getByText("Mensaje eliminado")).toBeVisible();
    expect(api.find("DELETE /chat/messages/m2")).toHaveLength(1);
  });

  test("si la otra parte se dio de baja, el chat queda de solo lectura", async ({ page }) => {
    const deleted = conversation({ canWrite: false, unread: 0 }, { firstName: "Cuenta", lastName: "eliminada", deactivated: true, slug: null });
    await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /chat/conversations": () => json(200, [deleted]),
        [`GET /chat/conversations/${CONVERSATION_ID}`]: () => json(200, deleted),
        [`GET /chat/conversations/${CONVERSATION_ID}/messages`]: () => json(200, [message("m1")]),
      }),
    );
    await page.goto(`/panel/mensajes/${CONVERSATION_ID}`);
    const convo = page.getByRole("region", { name: "Conversación" });
    await expect(convo.getByText("Cuenta eliminada dio de baja su cuenta")).toBeVisible();
    await expect(convo.getByRole("textbox", { name: "Escribí un mensaje" })).toHaveCount(0);
    await expect(convo.getByRole("link", { name: "Ver perfil" })).toHaveCount(0);
  });

  test("si el envío falla porque la otra parte no está disponible, lo explica y conserva el texto", async ({ page }) => {
    await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /chat/conversations": () => json(200, [conversation({ unread: 0 })]),
        [`GET /chat/conversations/${CONVERSATION_ID}`]: () => json(200, conversation({ unread: 0 })),
        [`GET /chat/conversations/${CONVERSATION_ID}/messages`]: () => json(200, []),
        [`POST /chat/conversations/${CONVERSATION_ID}/messages`]: () =>
          apiError(409, "PROFESSIONAL_UNAVAILABLE", "El profesional no está disponible por ahora. Podés leer la conversación."),
      }),
    );
    await page.goto(`/panel/mensajes/${CONVERSATION_ID}`);
    const box = page.getByRole("textbox", { name: "Escribí un mensaje" });
    await box.fill("¿Seguís ahí?");
    await box.press("Enter");
    await expect(page.getByRole("alert").filter({ hasText: "no está disponible por ahora" })).toBeVisible();
    await expect(box).toHaveValue("¿Seguís ahí?");
  });

  test("una conversación ajena o inexistente lo explica", async ({ page }) => {
    await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /chat/conversations": () => json(200, []),
        [`GET /chat/conversations/${CONVERSATION_ID}`]: () => apiError(404, "CONVERSATION_NOT_FOUND", "La conversación no existe."),
      }),
    );
    await page.goto(`/panel/mensajes/${CONVERSATION_ID}`);
    await expect(page.getByRole("heading", { name: "No encontramos esa conversación" })).toBeVisible();
  });
});

test.describe("pedidos y trabajos", () => {
  test("aceptar el presupuesto elige al profesional y lleva al trabajo", async ({ page }) => {
    const api = await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /chat/conversations": () => json(200, [conversation({ unread: 0 })]),
        "GET /requests": () => json(200, [serviceRequest()]),
        [`GET /requests/${REQUEST_ID}`]: () => json(200, serviceRequest()),
        [`POST /requests/targets/${TARGET_ID}/select`]: () => json(201, contract()),
        "GET /contracts": () => json(200, [contract()]),
        [`GET /contracts/${CONTRACT_ID}`]: () => json(200, contract()),
      }),
    );
    await page.goto("/panel/pedidos");
    const card = page.getByRole("link", { name: /Electricista/ });
    await expect(card).toContainText("Esperando respuestas");
    await expect(card).toContainText("1 respuesta");
    await card.click();

    await expect(page.getByRole("heading", { level: 1, name: "Electricista" })).toBeVisible();
    await expect(page.getByText("Mandó presupuesto")).toBeVisible();
    await expect(page.getByText("$ 45.000").first()).toBeVisible();
    await page.getByRole("button", { name: "Aceptar presupuesto" }).click();
    await page.getByRole("dialog").getByRole("button", { name: /^Aceptar/ }).click();
    await expect(page).toHaveURL(new RegExp(`/panel/trabajos/${CONTRACT_ID}$`));
    expect(api.find(`POST /requests/targets/${TARGET_ID}/select`)[0]!.postDataJSON()).toEqual({ quoteId: QUOTE_ID });
    await expect(page.getByRole("heading", { level: 1, name: "Trabajo con Ana Pérez" })).toBeVisible();
    await expect(page.getByText("Presupuesto aceptado")).toBeVisible();
  });

  test("cancelar el pedido manda el motivo (opcional) y lo actualiza", async ({ page }) => {
    const api = await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /chat/conversations": () => json(200, [conversation({ unread: 0 })]),
        [`GET /requests/${REQUEST_ID}`]: () => json(200, serviceRequest()),
        [`POST /requests/${REQUEST_ID}/cancel`]: () => json(200, serviceRequest({ status: "CANCELLED" })),
        "GET /requests": () => json(200, []),
      }),
    );
    await page.goto(`/panel/pedidos/${REQUEST_ID}`);
    await page.getByRole("button", { name: "Cancelar el pedido" }).click();
    const dialog = page.getByRole("dialog", { name: "¿Cancelar el pedido?" });
    await dialog.getByRole("button", { name: "Cancelar el pedido" }).click();
    await expect(page.getByText("Cancelado", { exact: true })).toBeVisible();
    // Sin motivo no se manda el campo (el backend pide 1 a 300 caracteres si viene).
    expect(api.find(`POST /requests/${REQUEST_ID}/cancel`)[0]!.postDataJSON()).toEqual({});
    await expect(page.getByRole("button", { name: "Aceptar presupuesto" })).toHaveCount(0);
  });

  test("cancelar un trabajo en curso con motivo", async ({ page }) => {
    const api = await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /chat/conversations": () => json(200, [conversation({ unread: 0 })]),
        [`GET /contracts/${CONTRACT_ID}`]: () => json(200, contract({ status: "SCHEDULED", scheduledAt: "2026-11-10T15:00:00.000Z" })),
        [`POST /contracts/${CONTRACT_ID}/cancel`]: () =>
          json(200, contract({ status: "CANCELLED_BY_CLIENT", cancelledAt: "2026-11-05T10:00:00.000Z", cancelReason: "Ya lo resolví" })),
        "GET /contracts": () => json(200, []),
        "GET /requests": () => json(200, []),
      }),
    );
    await page.goto(`/panel/trabajos/${CONTRACT_ID}`);
    await expect(page.getByText("Con fecha")).toBeVisible();
    await expect(page.getByText("Fecha agendada")).toBeVisible();
    await page.getByRole("button", { name: "Cancelar el trabajo" }).click();
    const dialog = page.getByRole("dialog", { name: "¿Cancelar el trabajo?" });
    await dialog.getByRole("textbox", { name: "Motivo (opcional)" }).fill("  Ya lo resolví  ");
    await dialog.getByRole("button", { name: "Cancelar el trabajo" }).click();
    await expect(page.getByText("Lo cancelaste")).toBeVisible();
    expect(api.find(`POST /contracts/${CONTRACT_ID}/cancel`)[0]!.postDataJSON()).toEqual({ reason: "Ya lo resolví" });
    await expect(page.getByRole("button", { name: "Cancelar el trabajo" })).toHaveCount(0);
  });

  test("listas vacías explican el siguiente paso", async ({ page }) => {
    await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /chat/conversations": () => json(200, []),
        "GET /requests": () => json(200, []),
        "GET /contracts": () => json(200, []),
      }),
    );
    await page.goto("/panel/pedidos");
    await expect(page.getByRole("heading", { name: "Todavía no pediste presupuestos" })).toBeVisible();
    await page.goto("/panel/trabajos");
    await expect(page.getByRole("heading", { name: "Todavía no tenés trabajos" })).toBeVisible();
  });
});
