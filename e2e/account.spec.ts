import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalScroll } from "./support/layout";
import { apiError, json, me, mockApi, type Handler } from "./support/mock-api";

const USER_ID = "00000000-0000-4000-8000-000000000001";
const FILE_ID = "55555555-5555-4555-8555-555555555555";
const CLOUDINARY = "https://api.cloudinary.com/v1_1/demo/image/upload";
const CHROME_WINDOWS = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0 Safari/537.36";
const CHROME_ANDROID = "Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0 Mobile Safari/537.36";
// PNG real de 1x1.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64");

const personal = (overrides: Record<string, unknown> = {}) => ({
  id: USER_ID,
  firstName: "Ana",
  lastName: "Pérez",
  pendingFirstName: null,
  pendingLastName: null,
  phone: "3511234567",
  neighborhoodId: "44444444-4444-4444-8444-444444444444",
  neighborhoodName: "Nueva Córdoba",
  ...overrides,
});

const uploadedFile = (overrides: Record<string, unknown> = {}) => ({
  id: FILE_ID,
  purpose: "AVATAR",
  kind: "IMAGE",
  status: "PENDING_UPLOAD",
  mimeType: null,
  sizeBytes: null,
  durationMs: null,
  url: null,
  createdAt: "2026-11-04T12:00:00.000Z",
  ...overrides,
});

const device = (id: string, current: boolean, userAgent: string, lastUsedAt: string) => ({
  id,
  current,
  userAgent,
  createdAt: "2026-11-01T12:00:00.000Z",
  lastUsedAt,
});

/** Sesión iniciada: el token CSRF y el usuario vienen de la API simulada. */
function signedIn(user: Record<string, unknown>, handlers: Record<string, Handler> = {}) {
  return {
    "GET /auth/csrf": () => json(200, { csrfToken: "csrf-1" }),
    "GET /auth/me": () => json(200, user),
    ...handlers,
  };
}

const activeCustomer = me({ status: "ACTIVE", emailVerified: true, verificationStatus: "APPROVED" });

async function multipartText(request: { postDataBuffer(): Buffer | null }) {
  return request.postDataBuffer()?.toString("latin1") ?? "";
}

test.describe("panel: navegación", () => {
  test("una cuenta activa ve todas las secciones y la actual queda marcada", async ({ page }) => {
    await mockApi(page, signedIn(activeCustomer, { "GET /users/me": () => json(200, personal()) }));
    await page.goto("/panel/cuenta");
    const nav = page.getByRole("navigation", { name: "Panel" });
    await expect(nav.getByRole("link")).toHaveText([
      "Inicio",
      "Mensajes",
      "Pedidos",
      "Trabajos",
      "Favoritos",
      "Mis reseñas",
      "Notificaciones",
      "Soporte",
      "Mis reportes",
      "Sanciones",
      "Tu opinión",
      "Mi cuenta",
      "Verificación",
      "Seguridad",
    ]);
    await expect(nav.getByRole("link", { name: "Mi cuenta" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { level: 1, name: "Mi cuenta" })).toBeVisible();
  });

  test("ninguna página del panel tiene scroll horizontal", async ({ page }) => {
    await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /users/me": () => json(200, personal()),
        "GET /customers/me": () => json(200, { extraInfo: null }),
        "GET /identity-verification/me": () => json(200, { id: null, kind: null, status: "APPROVED", provider: "MANUAL", attemptNumber: 1, submittedAt: null, decidedAt: null, reasonCode: null }),
        "GET /auth/sessions": () => json(200, [device("d1", true, CHROME_WINDOWS, "2026-11-04T10:00:00.000Z")]),
      }),
    );
    for (const path of ["/panel", "/panel/cuenta", "/panel/verificacion", "/panel/seguridad"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expectNoHorizontalScroll(page);
    }
  });

  test("una cuenta suspendida solo ve Inicio, Sanciones y Seguridad, sin contraseña ni baja", async ({ page }) => {
    await mockApi(
      page,
      signedIn(me({ status: "SUSPENDED", statusReason: "Revisión" }), {
        "GET /auth/sessions": () => json(200, [device("d1", true, CHROME_WINDOWS, "2026-11-04T10:00:00.000Z")]),
      }),
    );
    await page.goto("/panel/seguridad");
    await expect(page.getByRole("navigation", { name: "Panel" }).getByRole("link")).toHaveText(["Inicio", "Sanciones", "Seguridad"]);
    await expect(page.getByText("Chrome en Windows")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Cambiar contraseña" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Dar de baja mi cuenta" })).toHaveCount(0);
  });
});

test.describe("panel: mi cuenta", () => {
  test("datos personales: manda solo lo que cambió y confirma", async ({ page }) => {
    const api = await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /users/me": () => json(200, personal()),
        "GET /customers/me": () => json(200, { extraInfo: null }),
        "PATCH /users/me": () => json(200, personal({ phone: "3517654321" })),
      }),
    );
    await page.goto("/panel/cuenta");
    const save = page.getByRole("button", { name: "Guardar cambios" });
    await expect(save).toBeDisabled();
    await page.getByRole("textbox", { name: "Teléfono" }).fill("(351) 765-4321");
    await save.click();

    await expect(page.getByText("Guardamos tus datos.")).toBeVisible();
    expect(api.find("PATCH /users/me")[0]!.postDataJSON()).toEqual({ phone: "3517654321" });
    expect(api.find("PATCH /users/me")[0]!.headers()["x-csrf-token"]).toBe("csrf-1");
    // Lo guardado pasa a ser el estado sin cambios.
    await expect(save).toBeDisabled();
  });

  test("con la identidad aprobada, el nombre nuevo queda en revisión", async ({ page }) => {
    await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /users/me": () => json(200, personal()),
        "GET /customers/me": () => json(200, { extraInfo: null }),
        "PATCH /users/me": () => json(200, personal({ pendingFirstName: "Anabel" })),
      }),
    );
    await page.goto("/panel/cuenta");
    await expect(page.getByText("Si lo cambiás, lo revisa nuestro equipo.")).toBeVisible();
    await page.getByRole("textbox", { name: "Nombre", exact: true }).fill("Anabel");
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByText("El nombre nuevo queda en revisión")).toBeVisible();
    await expect(page.getByText("Nombre en revisión. Hoy se ve como Ana Pérez.")).toBeVisible();
  });

  test("datos para el profesional: guarda el texto y vacío lo borra", async ({ page }) => {
    let extraInfo: string | null = null;
    const api = await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /users/me": () => json(200, personal()),
        "GET /customers/me": () => json(200, { extraInfo }),
        "PATCH /customers/me": (request) => {
          extraInfo = (request.postDataJSON() as { extraInfo: string | null }).extraInfo;
          return json(200, { extraInfo });
        },
      }),
    );
    await page.goto("/panel/cuenta");
    const field = page.getByRole("textbox", { name: "Datos útiles (opcional)" });
    const save = page.getByRole("button", { name: "Guardar", exact: true });
    await field.fill("  Timbre 3B, de 9 a 13.  ");
    await save.click();
    await expect(page.getByText("Guardamos los datos.")).toBeVisible();
    await expect(save).toBeDisabled();

    await field.fill("");
    await save.click();
    await expect(page.getByText("Guardamos los datos.")).toBeVisible();
    expect(api.find("PATCH /customers/me").map((r) => r.postDataJSON())).toEqual([
      { extraInfo: "Timbre 3B, de 9 a 13." },
      { extraInfo: null },
    ]);
  });

  test("un profesional no ve los datos para el profesional", async ({ page }) => {
    const api = await mockApi(
      page,
      signedIn(me({ role: "PROFESSIONAL", status: "ACTIVE" }), { "GET /users/me": () => json(200, personal()) }),
    );
    await page.goto("/panel/cuenta");
    await expect(page.getByRole("textbox", { name: "Teléfono" })).toBeVisible();
    await expect(page.getByText("Datos para el profesional")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Cambiar barrio" })).toHaveCount(0);
    expect(api.find("GET /customers/me")).toHaveLength(0);
  });
});

test.describe("panel: foto de perfil", () => {
  /** Flujo de subida simulado; `ticket` define el destino (Cloudinary o la API local). */
  async function mockUpload(page: Page, ticket: { method: "POST" | "PUT"; url: string; fields: Record<string, string> }) {
    return mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /users/me": () => json(200, personal()),
        "GET /customers/me": () => json(200, { extraInfo: null }),
        "POST /uploads": () =>
          json(201, {
            file: uploadedFile(),
            upload: { ...ticket, maxBytes: 5 * 1024 * 1024, expiresAt: "2026-11-04T12:15:00.000Z" },
          }),
        [`PUT /uploads/${FILE_ID}/content`]: () => json(204),
        [`POST /uploads/${FILE_ID}/complete`]: () => json(200, uploadedFile({ status: "READY", mimeType: "image/png", sizeBytes: PNG.length })),
        "PUT /users/me/avatar": () => json(200, { ...uploadedFile({ status: "READY" }), underReview: true }),
      }),
    );
  }

  test("Cloudinary: sube sin cookies ni token CSRF y asigna la foto", async ({ page }) => {
    const api = await mockUpload(page, {
      method: "POST",
      url: CLOUDINARY,
      fields: { api_key: "123", timestamp: "1793800000", signature: "firma-de-prueba", public_id: "avatar-x" },
    });
    const cloudinary: { headers: Record<string, string>; body: string }[] = [];
    await page.route(CLOUDINARY, async (route) => {
      const request = route.request();
      cloudinary.push({ headers: await request.allHeaders(), body: await multipartText(request) });
      await route.fulfill({ status: 200, contentType: "application/json", headers: { "Access-Control-Allow-Origin": "*" }, body: "{}" });
    });

    await page.goto("/panel/cuenta");
    await page.locator('input[type="file"]').setInputFiles({ name: "cara.png", mimeType: "image/png", buffer: PNG });
    await expect(page.getByRole("img", { name: "Vista previa de la foto nueva" })).toBeVisible();
    await page.getByRole("button", { name: "Guardar foto" }).click();
    await expect(page.getByText("Foto enviada a revisión")).toBeVisible();

    expect(api.find("POST /uploads")[0]!.postDataJSON()).toEqual({ purpose: "AVATAR", kind: "IMAGE" });
    expect(cloudinary).toHaveLength(1);
    const [sent] = cloudinary;
    // Otro sitio: nada de la sesión de Repara Ya viaja con el archivo.
    expect(sent!.headers["cookie"]).toBeUndefined();
    expect(sent!.headers["x-csrf-token"]).toBeUndefined();
    expect(sent!.headers["x-requested-with"]).toBeUndefined();
    // Los campos firmados viajan tal cual, junto con el archivo.
    expect(sent!.body).toContain('name="signature"\r\n\r\nfirma-de-prueba');
    expect(sent!.body).toContain('name="file"; filename="cara.png"');
    expect(api.find(`POST /uploads/${FILE_ID}/complete`)).toHaveLength(1);
    expect(api.find("PUT /users/me/avatar")[0]!.postDataJSON()).toEqual({ fileId: FILE_ID });
  });

  test("almacenamiento local (desarrollo): sube por la API con la sesión", async ({ page }) => {
    const api = await mockUpload(page, { method: "PUT", url: `/api/v1/uploads/${FILE_ID}/content`, fields: {} });
    await page.goto("/panel/cuenta");
    await page.locator('input[type="file"]').setInputFiles({ name: "cara.png", mimeType: "image/png", buffer: PNG });
    await page.getByRole("button", { name: "Guardar foto" }).click();
    await expect(page.getByText("Foto enviada a revisión")).toBeVisible();

    const [put] = api.find(`PUT /uploads/${FILE_ID}/content`);
    expect(put!.headers()["x-csrf-token"]).toBe("csrf-1");
    expect(put!.headers()["content-type"]).toMatch(/^multipart\/form-data; boundary=/);
    expect(await multipartText(put!)).toContain('name="file"; filename="cara.png"');
  });

  test("rechaza en el navegador un tipo no admitido, sin llamar a la API", async ({ page }) => {
    const api = await mockUpload(page, { method: "POST", url: CLOUDINARY, fields: {} });
    await page.goto("/panel/cuenta");
    await page.locator('input[type="file"]').setInputFiles({ name: "anim.gif", mimeType: "image/gif", buffer: Buffer.from("GIF89a") });
    await expect(page.getByText("Elegí una imagen JPG, PNG o WebP.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Guardar foto" })).toHaveCount(0);
    expect(api.find("POST /uploads")).toHaveLength(0);
  });
});

test.describe("panel: verificación de identidad", () => {
  const notStarted = {
    id: null,
    kind: null,
    status: "NOT_STARTED",
    provider: null,
    attemptNumber: 0,
    submittedAt: null,
    decidedAt: null,
    reasonCode: null,
  };

  test("sin los requisitos no se puede iniciar", async ({ page }) => {
    await mockApi(page, signedIn(me(), { "GET /identity-verification/me": () => json(200, notStarted) }));
    await page.goto("/panel/verificacion");
    await expect(page.getByText("Email verificado: pendiente")).toBeAttached();
    await expect(page.getByRole("link", { name: "Cargar foto" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Iniciar verificación" })).toBeDisabled();
  });

  test("con los requisitos la inicia y queda en revisión", async ({ page }) => {
    let started = false;
    const api = await mockApi(
      page,
      signedIn(me({ emailVerified: true, pendingAvatarUrl: "/api/v1/files/foto" }), {
        "GET /identity-verification/me": () =>
          json(200, started ? { ...notStarted, id: "v1", kind: "IDENTITY", status: "PENDING", provider: "MANUAL", attemptNumber: 1, submittedAt: "2026-11-04T12:00:00.000Z" } : notStarted),
        "POST /identity-verification": () => {
          started = true;
          return json(201, { ...notStarted, id: "v1", kind: "IDENTITY", status: "PENDING", provider: "MANUAL", attemptNumber: 1, alreadyInProgress: false, redirectUrl: null, clientToken: null, manualReview: true });
        },
      }),
    );
    await page.goto("/panel/verificacion");
    await page.getByRole("button", { name: "Iniciar verificación" }).click();
    await expect(page.getByText("Tu identidad está en revisión")).toBeVisible();
    expect(api.find("POST /identity-verification")).toHaveLength(1);
  });

  test("sin intentos restantes no ofrece reintentar", async ({ page }) => {
    await mockApi(
      page,
      signedIn(me({ emailVerified: true, pendingAvatarUrl: "/api/v1/files/foto" }), {
        "GET /identity-verification/me": () => json(200, { ...notStarted, id: "v3", kind: "IDENTITY", status: "REJECTED", attemptNumber: 3 }),
      }),
    );
    await page.goto("/panel/verificacion");
    await expect(page.getByText("Ya usaste todos los intentos.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Volver a intentarlo" })).toHaveCount(0);
  });
});

test.describe("panel: seguridad", () => {
  const devices = [
    device("d2", false, CHROME_ANDROID, "2026-11-03T10:00:00.000Z"),
    device("d1", true, CHROME_WINDOWS, "2026-11-01T10:00:00.000Z"),
  ];

  test("cambiar contraseña: avisa si la actual es incorrecta y confirma el cambio", async ({ page }) => {
    let attempts = 0;
    const api = await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /auth/sessions": () => json(200, devices),
        "POST /auth/password/change": () => (++attempts === 1 ? apiError(400, "INVALID_CURRENT_PASSWORD") : json(204)),
      }),
    );
    await page.goto("/panel/seguridad");
    await page.getByLabel(/^Contraseña actual/).fill("vieja-incorrecta");
    await page.getByLabel(/^Contraseña nueva/).fill("una-clave-nueva");
    await page.getByLabel(/^Repetí la contraseña nueva/).fill("una-clave-nueva");
    await page.getByRole("button", { name: "Cambiar contraseña" }).click();
    await expect(page.getByText("La contraseña actual no es correcta.")).toBeVisible();

    await page.getByLabel(/^Contraseña actual/).fill("la-clave-actual");
    await page.getByRole("button", { name: "Cambiar contraseña" }).click();
    await expect(page.getByText("Cambiaste tu contraseña.")).toBeVisible();
    expect(api.find("POST /auth/password/change")[1]!.postDataJSON()).toEqual({
      currentPassword: "la-clave-actual",
      newPassword: "una-clave-nueva",
    });
    // La lista de dispositivos se vuelve a pedir (el backend cerró los demás).
    await expect.poll(() => api.find("GET /auth/sessions").length).toBeGreaterThan(1);
  });

  test("la contraseña nueva tiene que ser distinta y coincidir", async ({ page }) => {
    const api = await mockApi(page, signedIn(activeCustomer, { "GET /auth/sessions": () => json(200, devices) }));
    await page.goto("/panel/seguridad");
    await page.getByLabel(/^Contraseña actual/).fill("misma-clave-123");
    await page.getByLabel(/^Contraseña nueva/).fill("misma-clave-123");
    await page.getByLabel(/^Repetí la contraseña nueva/).fill("otra-cosa-123");
    await page.getByRole("button", { name: "Cambiar contraseña" }).click();
    await expect(page.getByText("Elegí una contraseña distinta de la actual.")).toBeVisible();
    await expect(page.getByText("Las contraseñas no coinciden.")).toBeVisible();
    expect(api.find("POST /auth/password/change")).toHaveLength(0);
  });

  test("dispositivos: el actual primero; cerrar otro lo quita de la lista", async ({ page }) => {
    let list = devices;
    const api = await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /auth/sessions": () => json(200, list),
        "DELETE /auth/sessions/d2": () => {
          list = devices.filter((d) => d.id !== "d2");
          return json(200, { closed: true });
        },
      }),
    );
    await page.goto("/panel/seguridad");
    const rows = page.locator("#dispositivos li");
    await expect(rows).toHaveCount(2);
    await expect(rows.first()).toContainText("Chrome en Windows");
    await expect(rows.first()).toContainText("Este dispositivo");

    await page.getByRole("button", { name: "Cerrar la sesión en Chrome en Android" }).click();
    await expect(rows).toHaveCount(1);
    expect(api.find("DELETE /auth/sessions/d2")[0]!.headers()["x-csrf-token"]).toBe("csrf-1");
  });

  test("cerrar sesión en todos los dispositivos deja la sesión anónima", async ({ page, isMobile }) => {
    let loggedIn = true;
    const api = await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /auth/csrf": () => (loggedIn ? json(200, { csrfToken: "csrf-1" }) : apiError(401, "UNAUTHORIZED")),
        "GET /auth/sessions": () => json(200, devices),
        "POST /auth/logout-all": () => {
          loggedIn = false;
          return json(204);
        },
      }),
    );
    await page.goto("/panel/seguridad");
    await page.getByRole("button", { name: "Cerrar sesión en todos los dispositivos" }).click();
    await expect(page).toHaveURL(/\/$/);
    expect(api.find("POST /auth/logout-all")[0]!.headers()["x-csrf-token"]).toBe("csrf-1");
    if (isMobile) await page.getByRole("button", { name: "Abrir menú" }).click();
    await expect(page.getByRole("link", { name: "Ingresar" }).first()).toBeVisible();
  });

  test("baja: con la contraseña incorrecta sigue la sesión; con la correcta sale", async ({ page }) => {
    let attempts = 0;
    const api = await mockApi(
      page,
      signedIn(activeCustomer, {
        "GET /auth/sessions": () => json(200, devices),
        "DELETE /users/me": () => (++attempts === 1 ? apiError(400, "INVALID_CURRENT_PASSWORD") : json(204)),
      }),
    );
    await page.goto("/panel/seguridad");
    await page.getByRole("button", { name: "Dar de baja mi cuenta" }).click();
    const dialog = page.getByRole("dialog", { name: "¿Dar de baja tu cuenta?" });
    const confirm = dialog.getByRole("button", { name: "Dar de baja" });
    await expect(confirm).toBeDisabled();
    await dialog.getByLabel(/^Tu contraseña/).fill("incorrecta-000");
    await confirm.click();
    await expect(dialog.getByText("La contraseña no es correcta.")).toBeVisible();
    await expect(page).toHaveURL(/\/panel\/seguridad$/);

    await dialog.getByLabel(/^Tu contraseña/).fill("la-clave-correcta");
    await confirm.click();
    await expect(page).toHaveURL(/\/$/);
    const [, second] = api.find("DELETE /users/me");
    expect(second!.postDataJSON()).toEqual({ password: "la-clave-correcta" });
    // El segundo intento reutiliza el token: el fallido no lo borró.
    expect(second!.headers()["x-csrf-token"]).toBe("csrf-1");
  });

  test("cuenta creada con Google: crea contraseña y no puede desvincular todavía", async ({ page }) => {
    const api = await mockApi(
      page,
      signedIn(me({ status: "ACTIVE", hasPassword: false, googleLinked: true }), {
        "GET /auth/sessions": () => json(200, devices),
        "POST /auth/password/set": () => apiError(403, "REAUTH_REQUIRED"),
      }),
    );
    await page.goto("/panel/seguridad");
    await expect(page.getByRole("heading", { name: "Crear una contraseña" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Desvincular Google" })).toHaveCount(0);
    await expect(page.getByText("primero creá una contraseña")).toBeVisible();

    await page.getByLabel(/^Contraseña/).first().fill("una-clave-nueva");
    await page.getByLabel(/^Repetí la contraseña/).fill("una-clave-nueva");
    await page.getByRole("button", { name: "Crear contraseña" }).click();
    await expect(page.getByText("volvé a ingresar con Google")).toBeVisible();
    expect(api.find("POST /auth/password/set")[0]!.postDataJSON()).toEqual({ newPassword: "una-clave-nueva" });
  });
});
