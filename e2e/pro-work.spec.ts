import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll } from "./support/layout";
import { apiError, json, LOCALITY, me, mockApi, PROFESSION, type Handler } from "./support/mock-api";

/*
 * Etapa 6, el trabajo del profesional: pedidos recibidos y presupuesto, el trabajo (agendar, empezar,
 * terminar), agenda, reseñas recibidas, plan y métricas, contra la API simulada en el navegador.
 */

const CUSTOMER_ID = "00000000-0000-4000-8000-0000000000c1";
const CONVERSATION_ID = "66666666-6666-4666-8666-666666666666";
const REQUEST_ID = "77777777-7777-4777-8777-777777777777";
const TARGET_ID = "88888888-8888-4888-8888-888888888888";
const CONTRACT_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const REVIEW_ID = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const pro = me({ role: "PROFESSIONAL", status: "ACTIVE", emailVerified: true, verificationStatus: "APPROVED" });

const conversation = {
  id: CONVERSATION_ID,
  myRole: "PROFESSIONAL",
  counterpart: { userId: CUSTOMER_ID, firstName: "Camila", lastName: "Herrera", avatarUrl: null, deactivated: false },
  lastMessage: null,
  unread: 0,
  counterpartReadAt: null,
  canWrite: true,
  lastMessageAt: "2026-11-04T12:00:00.000Z",
};

const profile = {
  id: "p1",
  slug: "ana-perez-ab12c",
  businessName: null,
  bio: null,
  yearsExperience: 5,
  worksWithTeam: false,
  hasMobility: true,
  referenceRate: null,
  rateMode: null,
  freeQuote: true,
  theme: {},
  attention: { manual: "AVAILABLE", until: null, autoFromSchedule: false, effective: "AVAILABLE" },
  professions: [{ id: PROFESSION.id, name: PROFESSION.name, isPrimary: true, status: "ACTIVE" }],
  serviceAreas: [{ localityId: LOCALITY.id, localityName: LOCALITY.name, neighborhoodId: null, neighborhoodName: null }],
  media: [],
  certifications: [],
  socialLinks: [],
  availability: { slots: [], exceptions: [] },
};

const subscription = (status: "TRIAL" | "ACTIVE", code: "BASIC" | "PREMIUM") => ({
  status,
  live: true,
  plan: { code, name: code === "BASIC" ? "Basic" : "Premium", maxProfessions: 1, maxImages: 5, maxVideos: 0, maxVideoSeconds: 15, maxImageBytes: 5_000_000, maxVideoBytes: 30_000_000, themeLevel: "NONE" },
  trialEndsAt: status === "TRIAL" ? "2026-12-08T12:00:00.000Z" : null,
  trialDaysLeft: status === "TRIAL" ? 20 : null,
  currentPeriodEnd: status === "ACTIVE" ? "2026-12-08T12:00:00.000Z" : null,
  periodDaysLeft: status === "ACTIVE" ? 20 : null,
});

function signedIn(handlers: Record<string, Handler> = {}) {
  return {
    "GET /auth/csrf": () => json(200, { csrfToken: "csrf-1" }),
    "GET /auth/me": () => json(200, pro),
    "GET /notifications/unread-count": () => json(200, { unread: 0 }),
    "GET /chat/conversations": () => json(200, [conversation]),
    "GET /professionals/me": () => json(200, profile),
    "GET /subscriptions/me": () => json(200, subscription("TRIAL", "BASIC")),
    ...handlers,
  };
}

const quote = (amount: string) => ({
  id: "99999999-9999-4999-8999-999999999999",
  amount,
  currency: "ARS",
  description: "Cambio de toma y revisión del circuito.",
  proposedDate: null,
  status: "SENT",
  createdAt: "2026-11-04T13:00:00.000Z",
});

const request = (targetStatus: string, currentQuote: ReturnType<typeof quote> | null = null) => ({
  id: REQUEST_ID,
  customerId: CUSTOMER_ID,
  professionId: PROFESSION.id,
  description: "Se me quemó un enchufe del living y salta la térmica.",
  urgency: "IMPATIENT",
  status: "OPEN",
  targets: [{ id: TARGET_ID, requestId: REQUEST_ID, professionalId: pro.id, conversationId: CONVERSATION_ID, status: targetStatus, currentQuote }],
  contractId: null,
  createdAt: "2026-11-04T12:00:00.000Z",
});

const contract = (overrides: Record<string, unknown> = {}) => ({
  id: CONTRACT_ID,
  requestId: REQUEST_ID,
  customerId: CUSTOMER_ID,
  professionalId: pro.id,
  conversationId: CONVERSATION_ID,
  status: "ACCEPTED",
  acceptedQuote: { ...quote("32000.00"), status: "ACCEPTED" },
  scheduledAt: null,
  startedAt: null,
  completedAt: null,
  cancelledAt: null,
  cancelReason: null,
  createdAt: "2026-11-04T14:00:00.000Z",
  ...overrides,
});

test.describe("pedidos recibidos", () => {
  test("el pedido nuevo aparece primero y el profesional manda su presupuesto", async ({ page }) => {
    let current = request("PENDING");
    let sent: Record<string, unknown> | null = null;
    await mockApi(
      page,
      signedIn({
        "GET /requests/received": () => json(200, [current]),
        [`GET /requests/${REQUEST_ID}`]: () => json(200, current),
        [`POST /requests/targets/${TARGET_ID}/quotes`]: (req) => {
          sent = req.postDataJSON() as Record<string, unknown>;
          current = request("QUOTED", quote("32000.00"));
          return json(201, current);
        },
      }),
    );
    await page.goto("/panel/solicitudes");
    await expect(page.getByRole("heading", { level: 1, name: "Pedidos recibidos" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Para responder/ })).toContainText("1");
    await page.getByRole("link", { name: /Camila Herrera/ }).click();

    await expect(page.getByRole("heading", { level: 1, name: "Pedido de Camila Herrera" })).toBeVisible();
    await page.getByRole("spinbutton", { name: /Monto total/ }).fill("32000");
    await page.getByRole("textbox", { name: /Qué incluye/ }).fill("Cambio de toma y revisión del circuito.");
    await page.getByRole("button", { name: "Mandar presupuesto" }).click();
    await expect(page.getByText("Presupuesto enviado. Te avisamos cuando responda.")).toBeVisible();
    expect(sent).toEqual({ amount: 32000, description: "Cambio de toma y revisión del circuito." });
    await expect(page.getByText("Tu presupuesto vigente")).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});

test.describe("trabajos del profesional", () => {
  test("agenda, empieza y termina el trabajo, confirmando cada paso", async ({ page }) => {
    let current = contract();
    const calls: string[] = [];
    const step = (path: string, next: Record<string, unknown>) => (req: { postDataJSON: () => unknown }) => {
      calls.push(`${path} ${JSON.stringify(req.postDataJSON() ?? null)}`);
      current = contract(next);
      return json(200, current);
    };
    await mockApi(
      page,
      signedIn({
        "GET /contracts": () => json(200, [current]),
        [`GET /contracts/${CONTRACT_ID}`]: () => json(200, current),
        [`POST /contracts/${CONTRACT_ID}/schedule`]: step("schedule", { status: "SCHEDULED", scheduledAt: "2026-11-10T13:00:00.000Z" }),
        [`POST /contracts/${CONTRACT_ID}/start`]: step("start", { status: "IN_PROGRESS", scheduledAt: "2026-11-10T13:00:00.000Z", startedAt: "2026-11-10T13:05:00.000Z" }),
        [`POST /contracts/${CONTRACT_ID}/complete`]: step("complete", {
          status: "COMPLETED",
          scheduledAt: "2026-11-10T13:00:00.000Z",
          startedAt: "2026-11-10T13:05:00.000Z",
          completedAt: "2026-11-10T15:00:00.000Z",
        }),
      }),
    );
    await page.goto(`/panel/trabajos/${CONTRACT_ID}`);
    await expect(page.getByRole("heading", { level: 1, name: "Trabajo con Camila Herrera" })).toBeVisible();

    // Siempre en el futuro (una fecha fija se vuelve pasada y la pantalla la rechaza, con razón).
    const tomorrow = new Date(Date.now() + 864e5);
    const day = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
    await page.locator("input[type=datetime-local]").fill(`${day}T10:00`);
    await page.getByRole("button", { name: "Agendar" }).click();
    await expect(page.getByText("Trabajo agendado")).toBeVisible();
    expect(calls[0]).toMatch(/^schedule \{"scheduledAt":"\d{4}-\d\d-\d\dT\d\d:00:00\.000Z"\}$/);

    await page.getByRole("button", { name: "Empezar el trabajo" }).click();
    await page.locator("dialog[open]").getByRole("button", { name: "Empezar" }).click();
    await expect(page.getByText("¿Terminaste?")).toBeVisible();

    await page.getByRole("button", { name: "Marcar como terminado" }).click();
    await page.locator("dialog[open]").getByRole("button", { name: "Terminado" }).click();
    await expect(page.getByRole("button", { name: "Marcar como terminado" })).toBeHidden();
    expect(calls.map((c) => c.split(" ")[0])).toEqual(["schedule", "start", "complete"]);
    // La reseña la deja el cliente: el profesional no ve el formulario.
    await expect(page.getByRole("button", { name: "Publicar reseña" })).toHaveCount(0);
  });
});

test.describe("agenda", () => {
  test("cambiar el estado de atención lo guarda al toque", async ({ page }) => {
    let body: Record<string, unknown> | null = null;
    await mockApi(
      page,
      signedIn({
        "PUT /professionals/me/attention-status": (req) => {
          body = req.postDataJSON() as Record<string, unknown>;
          return json(200, { ...profile, attention: { manual: "RESTING", until: null, autoFromSchedule: false, effective: "RESTING" } });
        },
      }),
    );
    await page.goto("/panel/agenda");
    const resting = page.getByRole("radio", { name: /Descansando/ });
    await expect(page.getByRole("radio", { name: /Disponible/ })).toHaveAttribute("aria-checked", "true");
    await resting.click();
    await expect(resting).toHaveAttribute("aria-checked", "true");
    expect(body).toEqual({ status: "RESTING", until: null });
  });
});

test.describe("reseñas recibidas", () => {
  test("responder en público muestra la respuesta", async ({ page }) => {
    let reply: string | null = null;
    const review = () => ({
      id: REVIEW_ID,
      rating: 5,
      comment: "Vino puntual y dejó todo limpio.",
      author: { displayName: "Camila H." },
      reply: reply ? { body: reply, repliedAt: "2026-11-05T10:00:00.000Z" } : null,
      edited: false,
      createdAt: "2026-11-05T09:00:00.000Z",
      contractId: CONTRACT_ID,
      professionalId: pro.id,
      status: "VISIBLE",
      hiddenReason: null,
      editableUntil: "2026-12-05T09:00:00.000Z",
    });
    await mockApi(
      page,
      signedIn({
        "GET /reviews/received": () => json(200, [review()]),
        [`PUT /reviews/${REVIEW_ID}/reply`]: (req) => {
          reply = (req.postDataJSON() as { body: string }).body;
          return json(200, review());
        },
      }),
    );
    await page.goto("/panel/resenas");
    await expect(page.getByRole("heading", { level: 1, name: "Reseñas recibidas" })).toBeVisible();
    await expect(page.getByText("1 reseña publicada")).toBeVisible();
    await page.getByRole("textbox", { name: "Respondé en público" }).fill("¡Gracias, Camila!");
    await page.getByRole("button", { name: "Responder" }).click();
    await expect(page.getByText("Tu respuesta")).toBeVisible();
    await expect(page.getByText("¡Gracias, Camila!")).toBeVisible();
  });
});

test.describe("plan", () => {
  test("elegir un plan lleva al checkout de Mercado Pago", async ({ page }) => {
    let chosen: unknown = null;
    await mockApi(
      page,
      signedIn({
        "GET /subscriptions/plans": () =>
          json(200, [
            { code: "BASIC", name: "Basic", price: "10000.00", currency: "ARS", current: true, available: true, purpose: "SUBSCRIPTION", amount: "10000.00" },
            { code: "MEDIUM", name: "Medium", price: "15000.00", currency: "ARS", current: false, available: true, purpose: "SUBSCRIPTION", amount: "15000.00" },
            { code: "PREMIUM", name: "Premium", price: "20000.00", currency: "ARS", current: false, available: true, purpose: "SUBSCRIPTION", amount: "20000.00" },
          ]),
        "GET /subscriptions/me/payments": () => json(200, []),
        "POST /subscriptions/checkout": (req) => {
          chosen = req.postDataJSON();
          return json(201, { paymentId: "p-1", purpose: "SUBSCRIPTION", amount: "20000.00", currency: "ARS", checkoutUrl: "https://checkout.example.test/pref-1" });
        },
      }),
    );
    await page.route("https://checkout.example.test/**", (route) => route.fulfill({ contentType: "text/html", body: "<h1>Checkout</h1>" }));
    await page.goto("/panel/plan");
    await expect(page.getByText("Prueba gratis")).toBeVisible();
    // En la prueba, pagar el plan propio no es "renovar".
    await expect(page.getByRole("button", { name: "Pagar Basic" })).toBeVisible();
    // El detalle de los planes: en pantallas anchas, tabla con encabezados de fila y el plan actual
    // marcado; en celular, cada cosa con sus tres valores abajo y sin desplazamiento horizontal.
    if ((page.viewportSize()?.width ?? 0) >= 640) {
      const comparison = page.getByRole("table", { name: "Qué incluye cada plan" });
      await expect(comparison.getByRole("rowheader", { name: /Certificados y matrículas/ })).toBeVisible();
      await expect(comparison.getByRole("columnheader", { name: /Basic\s*Tu plan/ })).toBeVisible();
    } else {
      await expect(page.getByRole("table")).toBeHidden();
      await expect(page.getByText("Certificados y matrículas").filter({ visible: true })).toBeVisible();
    }
    await expectNoHorizontalScroll(page);
    await page.getByRole("button", { name: "Elegir Premium" }).click();
    await page.waitForURL("https://checkout.example.test/pref-1");
    expect(chosen).toEqual({ planCode: "PREMIUM" });
  });
});

test.describe("métricas", () => {
  test("sin Premium, explica que son del plan y lleva a los planes", async ({ page }) => {
    await mockApi(page, signedIn({ "GET /professionals/me/metrics": () => apiError(403, "PLAN_FEATURE_REQUIRED") }));
    await page.goto("/panel/metricas");
    await expect(page.getByRole("heading", { name: "Tus estadísticas, con Premium" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver planes" })).toHaveAttribute("href", "/panel/plan");
  });

  test("con Premium, los números, el gráfico y la tabla", async ({ page }) => {
    const values = { profileViewers: 12, searchAppearances: 40, firstPlace: 3, requests: 4, completed: 2, ratingCount: 1, ratingAverage: 5 };
    const bucket = (start: string, profileViewers: number) => ({ ...values, profileViewers, start });
    await mockApi(
      page,
      signedIn({
        "GET /subscriptions/me": () => json(200, subscription("ACTIVE", "PREMIUM")),
        "GET /professionals/me/metrics": () =>
          json(200, {
            from: "2026-11-01",
            to: "2026-11-03",
            groupBy: "day",
            buckets: [bucket("2026-11-01", 2), bucket("2026-11-02", 7), bucket("2026-11-03", 3)],
            total: values,
            previous: { ...values, profileViewers: 6, from: "2026-10-29", to: "2026-10-31" },
            overallRating: { count: 1, average: 5 },
          }),
      }),
    );
    await page.goto("/panel/metricas");
    await expect(page.getByText("Visitas al perfil").first()).toBeVisible();
    await expect(page.getByText("1 reseña", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Ver como tabla" }).click();
    await expect(page.getByRole("table")).toContainText("7");
    await expectNoHorizontalScroll(page);
  });
});
