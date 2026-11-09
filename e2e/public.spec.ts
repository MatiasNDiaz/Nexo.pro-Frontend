import { expect, test, type Page } from "@playwright/test";
import { API, apiError } from "./support/mock-api";
import { chooseOption } from "./support/listbox";

/** Contenido dentro de <main> (ver la nota de catalog.spec.ts sobre el streaming). */
const main = (page: Page) => page.getByRole("main");

test.describe("foro", () => {
  test("lista publicaciones con tipo, zona, presupuesto y contadores", async ({ page }) => {
    await page.goto("/foro");
    await expect(main(page).getByText("2 publicaciones")).toBeVisible();
    const wanted = main(page).getByRole("article").filter({ hasText: "Busco electricista" });
    await expect(wanted.getByText("Busco profesional")).toBeVisible();
    await expect(wanted.getByText("Nueva Córdoba, Córdoba")).toBeVisible();
    await expect(wanted.getByText(/Ofrezco a partir de \$\s?50\.000/)).toBeVisible();
    await expect(main(page).getByRole("article").filter({ hasText: "instalación de gas" }).getByText("Resuelta")).toBeVisible();
    // Sin sesión invita a ingresar para participar.
    await expect(main(page).getByRole("link", { name: "Ingresar" })).toHaveAttribute("href", "/ingresar?siguiente=%2Fforo");
  });

  test("las pestañas filtran por tipo con URLs legibles", async ({ page }) => {
    await page.goto("/foro");
    await main(page).getByRole("link", { name: "Preguntas", exact: true }).click();
    await expect(page).toHaveURL(/\/foro\?tipo=preguntas$/);
    await expect(main(page).getByText("1 publicación")).toBeVisible();
    await expect(main(page).getByRole("link", { name: "Preguntas", exact: true })).toHaveAttribute("aria-current", "page");
  });

  test("cambiar de pestaña no mueve la pantalla", async ({ page }) => {
    await page.goto("/foro");
    const tab = main(page).getByRole("link", { name: "Busco profesional", exact: true });
    // Con la página bajada lo justo para que las pestañas sigan a la vista.
    await page.evaluate(() => window.scrollTo(0, 200));
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(200);
    await tab.click();
    await expect(page).toHaveURL(/tipo=busco-profesional/);
    await expect(tab).toHaveAttribute("aria-current", "page");
    expect(await page.evaluate(() => window.scrollY)).toBe(200);
  });

  test("detalle: texto seguro, respuestas anidadas y respuesta eliminada", async ({ page }) => {
    await page.goto("/foro/aaaaaaaa-0000-4000-8000-000000000001");
    // El texto aparece en el párrafo y en el título para lectores de pantalla: se mira el párrafo.
    await expect(main(page).locator("p").filter({ hasText: "<script>window.__xss = true</script>" })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __xss?: boolean }).__xss)).toBeUndefined();
    await expect(main(page).getByText("Propone: $")).toBeVisible();
    await expect(main(page).getByText("Respuesta eliminada")).toBeVisible();
    // La respuesta a un mensaje borrado queda anidada debajo del lugar vacío.
    const removed = main(page).locator("li").filter({ has: page.getByText("Respuesta eliminada") });
    await expect(removed.getByText("Respuesta a un mensaje borrado.")).toBeVisible();
    const jsonLd = JSON.parse((await main(page).locator('script[type="application/ld+json"]').textContent()) ?? "{}");
    expect(jsonLd).toMatchObject({ "@type": "DiscussionForumPosting", commentCount: 3 });
  });

  test("una publicación inexistente o un id inválido no rompen la página", async ({ page }) => {
    for (const id of ["aaaaaaaa-0000-4000-8000-000000000099", "no-es-un-id"]) {
      await page.goto(`/foro/${id}`);
      await expect(main(page).getByRole("heading", { level: 1, name: "Esta publicación no está disponible" })).toBeVisible();
    }
  });
});

test.describe("contacto", () => {
  test("valida antes de enviar y confirma el envío con el plazo de respuesta", async ({ page }) => {
    await page.goto("/contacto");
    await main(page).getByRole("button", { name: "Enviar mensaje" }).click();
    await expect(main(page).getByText("Elegí el motivo.")).toBeVisible();
    await expect(main(page).getByText("Contanos un poco más (al menos 10 caracteres).")).toBeVisible();

    await main(page).getByRole("textbox", { name: "Nombre" }).fill("Ana Pérez");
    await main(page).getByRole("textbox", { name: "Email" }).fill("ana@example.com");
    await chooseOption(main(page), "Motivo", "Reclamo");
    await main(page).getByRole("textbox", { name: "Mensaje" }).fill("Quiero hacer un reclamo sobre un trabajo.");
    const request = page.waitForRequest((r) => r.url().endsWith("/support/contact") && r.method() === "POST");
    await main(page).getByRole("button", { name: "Enviar mensaje" }).click();

    const sent = await request;
    expect(sent.postDataJSON()).toEqual({
      name: "Ana Pérez",
      email: "ana@example.com",
      category: "COMPLAINT",
      body: "Quiero hacer un reclamo sobre un trabajo.",
    });
    expect(sent.headers()["x-requested-with"]).toBe("XMLHttpRequest");
    await expect(main(page).getByRole("heading", { name: "¡Recibimos tu mensaje!" })).toBeVisible();
    await expect(main(page).getByText(/48 a 72 horas hábiles/).first()).toBeVisible();
  });

  test("si se superó el límite por hora lo explica", async ({ page }) => {
    await page.route(`${API}/support/contact`, (route) =>
      route.request().method() === "OPTIONS"
        ? route.fulfill({ status: 204, headers: { "Access-Control-Allow-Origin": "http://localhost:3100", "Access-Control-Allow-Credentials": "true", "Access-Control-Allow-Headers": "Content-Type, X-Requested-With, X-CSRF-Token" } })
        : route.fulfill({
            status: 429,
            contentType: "application/json",
            headers: { "Access-Control-Allow-Origin": "http://localhost:3100", "Access-Control-Allow-Credentials": "true" },
            body: JSON.stringify(apiError(429, "TOO_MANY_REQUESTS").body),
          }),
    );
    await page.goto("/contacto");
    await main(page).getByRole("textbox", { name: "Nombre" }).fill("Ana Pérez");
    await main(page).getByRole("textbox", { name: "Email" }).fill("ana@example.com");
    await chooseOption(main(page), "Motivo", "Otro");
    await main(page).getByRole("textbox", { name: "Mensaje" }).fill("Mensaje de prueba suficientemente largo.");
    await main(page).getByRole("button", { name: "Enviar mensaje" }).click();
    await expect(main(page).getByText(/varios mensajes desde tu conexión/)).toBeVisible();
  });
});

test("robots.txt y sitemap.xml con las páginas públicas, perfiles y publicaciones", async ({ request }) => {
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toContain("Allow: /");
  expect(robots).toContain("Sitemap: http://localhost:3100/sitemap.xml");

  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of ["/", "/profesionales", "/foro", "/contacto", "/profesionales/ana-perez-ab12c", "/foro/aaaaaaaa-0000-4000-8000-000000000001"]) {
    expect(sitemap).toContain(`<loc>http://localhost:3100${path}</loc>`);
  }
  // Nada privado ni provisorio.
  for (const path of ["/panel", "/ingresar", "/terminos", "/aviso-legal"]) {
    expect(sitemap).not.toContain(`http://localhost:3100${path}<`);
  }
});
