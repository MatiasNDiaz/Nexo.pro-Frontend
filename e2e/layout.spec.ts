import { expect, test } from "@playwright/test";

test.describe("navegación", () => {
  test("sin sesión ofrece las secciones públicas, Ingresar y Crear cuenta", async ({ page, isMobile }) => {
    await page.goto("/");
    if (isMobile) await page.getByRole("button", { name: "Abrir menú" }).click();
    const nav = page.getByRole("navigation", { name: isMobile ? "Principal (móvil)" : "Principal", exact: true });
    for (const label of ["Inicio", "Profesionales", "Foro", "Contacto"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(nav.getByRole("link", { name: "Inicio", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("link", { name: "Ingresar" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Crear cuenta" }).first()).toBeVisible();
  });

  test("el menú móvil navega, se cierra al elegir y con Esc", async ({ page, isMobile }) => {
    test.skip(!isMobile, "solo en celular");
    await page.goto("/");
    const menu = page.getByRole("dialog", { name: "Menú" });

    await page.getByRole("button", { name: "Abrir menú" }).click();
    await expect(menu).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();

    await page.getByRole("button", { name: "Abrir menú" }).click();
    await menu.getByRole("link", { name: "Foro" }).click();
    await expect(page).toHaveURL(/\/foro$/);
    await expect(menu).toBeHidden();
    await expect(page.getByRole("heading", { level: 1, name: "Foro" })).toBeVisible();
  });
});

test.describe("footer", () => {
  test("contacto por WhatsApp y email, redes y legales", async ({ page }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: /351 506-7276/ })).toHaveAttribute(
      "href",
      /^https:\/\/wa\.me\/5493515067276\?text=/,
    );
    await expect(footer.getByRole("link", { name: "matidiazargentino21@gmail.com" })).toHaveAttribute(
      "href",
      "mailto:matidiazargentino21@gmail.com",
    );
    await expect(footer.getByRole("link", { name: /LinkedIn/ })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/matias--diaz/",
    );
    await expect(footer.getByRole("link", { name: /Instagram/ })).toHaveAttribute(
      "href",
      "https://www.instagram.com/_maty_diaz_/",
    );
    // Los enlaces externos que abren otra pestaña no le dan acceso a esta página.
    for (const link of await footer.locator('a[target="_blank"]').all()) {
      await expect(link).toHaveAttribute("rel", /noopener/);
    }
  });

  test("las páginas legales avisan que el texto es provisorio y no se indexan", async ({ page }) => {
    for (const [path, title] of [
      ["/aviso-legal", "Aviso legal"],
      ["/terminos", "Términos y condiciones"],
    ] as const) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
      await expect(page.getByText("Texto provisorio")).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    }
  });
});

test("una ruta inexistente responde 404 con navegación para seguir", async ({ page }) => {
  const response = await page.goto("/no-existe");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "No encontramos esta página" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ir al inicio", exact: true })).toBeVisible();
});

test("el muestrario del sistema de diseño no existe en producción", async ({ page }) => {
  const response = await page.goto("/sistema-de-diseno");
  expect(response?.status()).toBe(404);
});
