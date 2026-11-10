import { expect, test } from "@playwright/test";
import { apiError, json, LOCALITY, me, mockApi, PROFESSION } from "./support/mock-api";
import { chooseOption } from "./support/listbox";

const session = { user: me(), csrfToken: "csrf-1" };

test.describe("ingreso", () => {
  test("ingresa, guarda el token solo en memoria y lleva al panel", async ({ page }) => {
    let loggedIn = false;
    const api = await mockApi(page, {
      "GET /auth/csrf": () => json(200, { csrfToken: loggedIn ? "csrf-1" : null }),
      "POST /auth/login": () => {
        loggedIn = true;
        return json(200, session);
      },
      "GET /auth/me": () => (loggedIn ? json(200, me()) : apiError(401, "UNAUTHORIZED")),
    });

    await page.goto("/ingresar");
    await page.getByRole("textbox", { name: "Email" }).fill("ana@example.com");
    await page.getByLabel(/^Contraseña/).fill("clave-de-prueba-123");
    await page.getByRole("button", { name: "Ingresar" }).click();

    await expect(page).toHaveURL(/\/panel$/);
    await expect(page.getByRole("heading", { level: 1, name: "Hola, Ana" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Activá tu cuenta" })).toBeVisible();

    const [login] = api.find("POST /auth/login");
    expect(login!.headers()["x-requested-with"]).toBe("XMLHttpRequest");
    expect(login!.postDataJSON()).toEqual({ email: "ana@example.com", password: "clave-de-prueba-123" });
    // Ningún token en el almacenamiento del navegador (contrato §2).
    const stored = await page.evaluate(() => localStorage.length + sessionStorage.length);
    expect(stored).toBe(0);
  });

  test("credenciales incorrectas muestran un mensaje claro y no navegan", async ({ page }) => {
    await mockApi(page, {
      "POST /auth/login": () => apiError(401, "INVALID_CREDENTIALS", "Email o contraseña incorrectos."),
    });
    await page.goto("/ingresar");
    await page.getByRole("textbox", { name: "Email" }).fill("ana@example.com");
    await page.getByLabel(/^Contraseña/).fill("incorrecta");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "El email o la contraseña no son correctos." })).toBeVisible();
    await expect(page).toHaveURL(/\/ingresar$/);
  });

  test("valida en el navegador antes de enviar", async ({ page }) => {
    const api = await mockApi(page);
    await page.goto("/ingresar");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page.getByText("Ingresá un email válido.")).toBeVisible();
    await expect(page.getByText("Ingresá tu contraseña.")).toBeVisible();
    expect(api.find("POST /auth/login")).toHaveLength(0);
  });

  test("si el backend pide CAPTCHA, lo muestra", async ({ page }) => {
    await mockApi(page, { "POST /auth/login": () => apiError(400, "CAPTCHA_REQUIRED", "Completá la verificación.") });
    await page.goto("/ingresar");
    await page.getByRole("textbox", { name: "Email" }).fill("ana@example.com");
    await page.getByLabel(/^Contraseña/).fill("clave");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await expect(page.getByRole("alert").first()).toHaveText("Completá la verificación para seguir.");
    // En las pruebas no hay clave pública de Turnstile: se avisa en vez de mostrar un widget roto.
    await expect(page.getByText("No podemos mostrar la verificación")).toBeVisible();
  });

  test("el admin pasa por el segundo factor", async ({ page }) => {
    let loggedIn = false;
    const api = await mockApi(page, {
      "GET /auth/csrf": () => json(200, { csrfToken: loggedIn ? "csrf-1" : null }),
      "POST /auth/login": () => json(200, { mfaRequired: true }),
      "POST /auth/mfa/verify": () => {
        loggedIn = true;
        return json(200, { user: me({ role: "ADMIN", status: "ACTIVE" }), csrfToken: "csrf-1" });
      },
      "GET /auth/me": () => json(200, me({ role: "ADMIN", status: "ACTIVE", firstName: "Admin" })),
    });
    await page.goto("/ingresar");
    await page.getByRole("textbox", { name: "Email" }).fill("admin@example.com");
    await page.getByLabel(/^Contraseña/).fill("clave-admin-segura");
    await page.getByRole("button", { name: "Ingresar" }).click();
    await page.getByRole("textbox", { name: "Código" }).fill("123456");
    await page.getByRole("button", { name: "Verificar" }).click();
    await expect(page).toHaveURL(/\/panel$/);
    expect(api.find("POST /auth/mfa/verify")[0]!.postDataJSON()).toEqual({ code: "123456" });
  });
});

test.describe("sesión", () => {
  test("al recargar recupera la sesión; si el acceso venció, renueva una vez y sigue", async ({ page }) => {
    let refreshed = false;
    const api = await mockApi(page, {
      "GET /auth/csrf": () => json(200, { csrfToken: "csrf-1" }),
      "GET /auth/me": () => (refreshed ? json(200, me({ status: "ACTIVE" })) : apiError(401, "ACCESS_TOKEN_EXPIRED")),
      "POST /auth/refresh": () => {
        refreshed = true;
        return json(200, { csrfToken: "csrf-2" });
      },
    });
    await page.goto("/panel");
    await expect(page.getByRole("heading", { level: 1, name: "Hola, Ana" })).toBeVisible();
    await expect(page.getByText("Tu cuenta está activa")).toBeVisible();
    const [refresh] = api.find("POST /auth/refresh");
    expect(refresh!.headers()["x-csrf-token"]).toBe("csrf-1");
    expect(api.find("POST /auth/refresh")).toHaveLength(1);
  });

  test("cerrar sesión vuelve al estado anónimo", async ({ page, isMobile }) => {
    let loggedIn = true;
    const api = await mockApi(page, {
      "GET /auth/csrf": () => json(200, { csrfToken: loggedIn ? "csrf-1" : null }),
      "GET /auth/me": () => json(200, me({ status: "ACTIVE" })),
      "POST /auth/logout": () => {
        loggedIn = false;
        return json(204);
      },
    });
    await page.goto("/panel");
    await expect(page.getByRole("heading", { level: 1, name: "Hola, Ana" })).toBeVisible();

    if (isMobile) {
      await page.getByRole("button", { name: "Abrir menú" }).click();
      await page.getByRole("dialog", { name: "Menú" }).getByRole("button", { name: "Cerrar sesión" }).click();
    } else {
      await page.getByRole("button", { name: /Ana/ }).click();
      await page.getByRole("button", { name: "Cerrar sesión" }).click();
    }
    await expect(page).toHaveURL(/\/$/);
    expect(api.find("POST /auth/logout")[0]!.headers()["x-csrf-token"]).toBe("csrf-1");
    if (isMobile) await page.getByRole("button", { name: "Abrir menú" }).click();
    await expect(page.getByRole("link", { name: "Ingresar" }).first()).toBeVisible();
  });

  test("el panel sin sesión manda a ingresar y vuelve después", async ({ page }) => {
    await mockApi(page);
    await page.goto("/panel");
    await expect(page).toHaveURL(/\/ingresar\?siguiente=%2Fpanel$/);
  });

  test("una cuenta suspendida ve el motivo", async ({ page }) => {
    await mockApi(page, {
      "GET /auth/csrf": () => json(200, { csrfToken: "csrf-1" }),
      "GET /auth/me": () => json(200, me({ status: "SUSPENDED", statusReason: "Incumplimiento de las normas" })),
    });
    await page.goto("/panel");
    await expect(page.getByText("Tu cuenta está suspendida")).toBeVisible();
    await expect(page.getByText("Motivo: Incumplimiento de las normas")).toBeVisible();
  });
});

test.describe("registro", () => {
  test("cliente: manda solo los campos del rol y explica el siguiente paso", async ({ page }) => {
    const api = await mockApi(page, {
      "POST /auth/register": () => json(202, { message: "Si el email no estaba registrado, te enviamos un enlace." }),
    });
    await page.goto("/registro");
    await page.getByRole("textbox", { name: "Nombre", exact: true }).fill("Lucía");
    await page.getByRole("textbox", { name: "Apellido" }).fill("Gómez");
    await page.getByRole("textbox", { name: "Teléfono" }).fill("(351) 506-7276");
    await chooseOption(page, "Localidad", LOCALITY.name);
    await page.getByRole("combobox", { name: "Barrio" }).fill("Nueva Córdoba");
    await page.getByRole("textbox", { name: "Email" }).fill("lucia@example.com");
    await page.getByLabel(/^Contraseña/).fill("una-clave-larga");
    await page.getByRole("button", { name: "Crear mi cuenta" }).click();

    await expect(page.getByRole("heading", { name: "Revisá tu email" })).toBeVisible();
    expect(api.find("POST /auth/register")[0]!.postDataJSON()).toEqual({
      role: "CUSTOMER",
      firstName: "Lucía",
      lastName: "Gómez",
      phone: "3515067276",
      neighborhood: { localityId: LOCALITY.id, name: "Nueva Córdoba" },
      email: "lucia@example.com",
      password: "una-clave-larga",
    });
  });

  test("profesional: oficio y zonas (toda la localidad si el barrio queda vacío)", async ({ page }) => {
    const api = await mockApi(page, { "POST /auth/register": () => json(202, { message: "ok" }) });
    await page.goto("/registro?rol=profesional");
    await expect(page.getByRole("radio", { name: /Soy profesional/ })).toBeChecked();
    await page.getByRole("textbox", { name: "Nombre", exact: true }).fill("Juan");
    await page.getByRole("textbox", { name: "Apellido" }).fill("López");
    await page.getByRole("textbox", { name: "Teléfono" }).fill("3515067276");
    await chooseOption(page, "Oficio principal", PROFESSION.name);
    await chooseOption(page, "Zona 1: localidad", LOCALITY.name);
    await page.getByRole("textbox", { name: "Email" }).fill("juan@example.com");
    await page.getByLabel(/^Contraseña/).fill("una-clave-larga");
    await page.getByRole("button", { name: "Crear mi cuenta" }).click();

    await expect(page.getByRole("heading", { name: "Revisá tu email" })).toBeVisible();
    expect(api.find("POST /auth/register")[0]!.postDataJSON()).toMatchObject({
      role: "PROFESSIONAL",
      professionId: PROFESSION.id,
      serviceAreas: [{ localityId: LOCALITY.id }],
    });
  });

  test("marca los campos inválidos y no envía", async ({ page }) => {
    const api = await mockApi(page);
    await page.goto("/registro");
    await page.getByRole("textbox", { name: "Nombre", exact: true }).fill("Ana1");
    await page.getByRole("textbox", { name: "Teléfono" }).fill("123");
    await page.getByRole("button", { name: "Crear mi cuenta" }).click();
    await expect(page.getByText(/El nombre solo puede tener letras/)).toBeVisible();
    await expect(page.getByText(/Ingresá un teléfono con código de área/)).toBeVisible();
    await expect(page.getByText("Ingresá el barrio.")).toBeVisible();
    expect(api.find("POST /auth/register")).toHaveLength(0);
  });
});

test.describe("enlaces de email", () => {
  test("verificar email: confirma y quita el token de la URL", async ({ page }) => {
    const api = await mockApi(page, { "POST /auth/email/verify": () => json(204) });
    await page.goto("/verificar-email?token=token-de-prueba-123456789");
    await expect(page.getByRole("heading", { name: "¡Email verificado!" })).toBeVisible();
    expect(page.url()).not.toContain("token=");
    expect(api.find("POST /auth/email/verify")[0]!.postDataJSON()).toEqual({ token: "token-de-prueba-123456789" });
    expect(api.find("POST /auth/email/verify")).toHaveLength(1);
  });

  test("verificar email con un enlace vencido lo explica", async ({ page }) => {
    await mockApi(page, { "POST /auth/email/verify": () => apiError(401, "INVALID_TOKEN") });
    await page.goto("/verificar-email?token=token-vencido-123456789");
    await expect(page.getByRole("heading", { name: "El enlace venció o ya se usó" })).toBeVisible();
  });

  test("cerrar sesión desde el email requiere tocar el botón", async ({ page }) => {
    const api = await mockApi(page, { "POST /auth/sessions/close-by-link": () => json(200, { closed: true }) });
    await page.goto("/cerrar-sesion?token=token-de-cierre-123456789");
    // Abrir el enlace no cierra nada (los servicios de email abren enlaces para revisarlos).
    expect(api.find("POST /auth/sessions/close-by-link")).toHaveLength(0);
    await page.getByRole("button", { name: "Cerrar esa sesión" }).click();
    await expect(page.getByRole("heading", { name: "Cerramos esa sesión" })).toBeVisible();
  });

  test("restablecer contraseña exige que coincidan", async ({ page }) => {
    const api = await mockApi(page, { "POST /auth/password/reset": () => json(204) });
    await page.goto("/restablecer-contrasena?token=token-de-reset-123456789");
    await page.getByLabel(/^Contraseña nueva/).fill("una-clave-larga");
    await page.getByLabel(/^Repetí la contraseña/).fill("otra-clave-larga");
    await page.getByRole("button", { name: "Guardar contraseña" }).click();
    await expect(page.getByText("Las contraseñas no coinciden.")).toBeVisible();
    await page.getByLabel(/^Repetí la contraseña/).fill("una-clave-larga");
    await page.getByRole("button", { name: "Guardar contraseña" }).click();
    await expect(page.getByRole("heading", { name: "Listo, cambiaste tu contraseña" })).toBeVisible();
    expect(api.find("POST /auth/password/reset")[0]!.postDataJSON()).toEqual({
      token: "token-de-reset-123456789",
      newPassword: "una-clave-larga",
    });
  });

  test("Google con error muestra el motivo", async ({ page }) => {
    await mockApi(page);
    await page.goto("/ingresar/google?resultado=error&codigo=CANCELLED");
    await expect(page.getByText("Cancelaste el ingreso con Google.")).toBeVisible();
  });
});
