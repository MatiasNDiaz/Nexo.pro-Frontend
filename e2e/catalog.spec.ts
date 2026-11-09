import { expect, test, type Page } from "@playwright/test";

/*
 * Catálogo y perfil público contra la API simulada (e2e/support/mock-server.mjs): la usa el servidor
 * de Next para armar las páginas y también el navegador para los pedidos de métricas y contacto.
 *
 * Las verificaciones de contenido buscan dentro de <main>: al enviar un bloque en partes (streaming),
 * React lo deja un instante en un <div hidden> al final del documento antes de moverlo a su lugar, y
 * en una máquina lenta la prueba podría ver las dos copias.
 */
const main = (page: Page) => page.getByRole("main");

test.describe("catálogo", () => {
  test("lista profesionales con datos reales del contrato y registra la búsqueda desde el navegador", async ({ page }) => {
    const beacon = page.waitForRequest(
      (request) => request.url().includes("/api/v1/catalog/professionals?") && request.method() === "GET",
    );
    await page.goto("/profesionales");
    await expect(main(page).getByRole("heading", { level: 1, name: "Encontrá al profesional indicado" })).toBeVisible();
    await expect(main(page).getByText("2 profesionales encontrados")).toBeVisible();
    await expect(main(page).getByRole("link", { name: "Ana Pérez" })).toHaveAttribute("href", "/profesionales/ana-perez-ab12c");
    await expect(main(page).getByRole("img", { name: /4,5 de 5 \(12 reseñas\)/ }).first()).toBeVisible();
    // El pedido del navegador es el que cuenta para las métricas Premium (no el del servidor).
    const request = await beacon;
    expect(new URL(request.url()).searchParams.get("limit")).toBe("12");
  });

  test("filtra por oficio y por disponibles con URLs legibles", async ({ page, isMobile }) => {
    await page.goto("/profesionales");
    // En escritorio los filtros están en la columna izquierda; en celular, en el panel que abre "Filtros".
    const panel = isMobile ? page.getByRole("dialog", { name: "Filtros" }) : main(page).getByRole("complementary", { name: "Filtros" });
    const openPanel = async () => {
      if (isMobile) await page.getByRole("button", { name: /^Filtros/ }).click();
    };
    const apply = async () => {
      if (isMobile) await panel.getByRole("button", { name: "Ver resultados" }).click();
    };

    await openPanel();
    await panel.getByRole("button", { name: "Plomero" }).click();
    await apply();
    await expect(page).toHaveURL(/\/profesionales\?oficio=plomero$/);
    await expect(main(page).getByText("1 profesional encontrado")).toBeVisible();
    await expect(main(page).getByRole("link", { name: "Juan Gómez" })).toBeVisible();

    // Como una persona: toca la etiqueta visible (la casilla real está oculta visualmente).
    await openPanel();
    await expect(panel.getByRole("button", { name: "Plomero" })).toHaveAttribute("aria-pressed", "true");
    await panel.locator("label").filter({ hasText: "Disponible ahora" }).click();
    await expect(panel.getByRole("switch", { name: "Disponible ahora" })).toBeChecked();
    await apply();
    await expect(page).toHaveURL(/oficio=plomero&disponible=1/);
    await expect(main(page).getByText("No encontramos profesionales con estos filtros")).toBeVisible();
  });

  test("parámetros inválidos en la URL no rompen la página", async ({ page }) => {
    const response = await page.goto("/profesionales?oficio=%3Cscript%3E&localidad=1%20OR%201=1&pagina=-5");
    expect(response?.status()).toBe(200);
    await expect(main(page).getByText("2 profesionales encontrados")).toBeVisible();
  });

  test("un oficio que no existe muestra el estado vacío, no todos los profesionales", async ({ page }) => {
    await page.goto("/profesionales?oficio=astronauta");
    await expect(main(page).getByText("No encontramos profesionales con estos filtros")).toBeVisible();
  });
});

test.describe("perfil público", () => {
  test("muestra el perfil con metadata, datos estructurados y sin contacto en el HTML", async ({ page, request }) => {
    // El HTML que arma el servidor (lo que queda en caché) no incluye teléfono ni email.
    const html = await (await request.get("/profesionales/ana-perez-ab12c")).text();
    expect(html).not.toContain("3519998877");
    expect(html).not.toContain("ana@example.com");

    await page.goto("/profesionales/ana-perez-ab12c");
    await expect(main(page).getByRole("heading", { level: 1, name: "Ana Pérez" })).toBeVisible();
    await expect(page).toHaveTitle(/Ana Pérez, electricista · Repara Ya/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/profesionales\/ana-perez-ab12c$/);

    const jsonLd = JSON.parse((await main(page).locator('script[type="application/ld+json"]').textContent()) ?? "{}");
    expect(jsonLd).toMatchObject({ "@type": "ProfessionalService", aggregateRating: { reviewCount: 12 } });
    expect(JSON.stringify(jsonLd)).not.toContain("3519998877");
  });

  test("el texto del profesional se muestra como texto: no ejecuta scripts", async ({ page }) => {
    await page.goto("/profesionales/ana-perez-ab12c");
    await expect(main(page).getByText("</script><script>window.__xss = true</script>", { exact: false })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __xss?: boolean }).__xss)).toBeUndefined();
    // Un enlace `javascript:` cargado como red social no se muestra.
    await expect(page.locator('a[href^="javascript:"]')).toHaveCount(0);
    await expect(main(page).getByRole("link", { name: /Instagram/ })).toHaveAttribute("rel", /nofollow ugc noopener noreferrer/);
  });

  test("el contacto se muestra al pedirlo, con WhatsApp y teléfono", async ({ page }) => {
    await page.goto("/profesionales/ana-perez-ab12c");
    await main(page).getByRole("button", { name: "Ver contacto" }).click();
    await expect(main(page).getByRole("link", { name: /Escribir por WhatsApp/ })).toHaveAttribute(
      "href",
      /^https:\/\/wa\.me\/5493519998877\?text=/,
    );
    await expect(main(page).getByRole("link", { name: "3519998877" })).toHaveAttribute("href", "tel:3519998877");
    await expect(main(page).getByRole("link", { name: "ana@example.com" })).toHaveAttribute("href", "mailto:ana@example.com");
  });

  test("reseñas: la primera página llega armada y el resto se carga al pedirlo", async ({ page }) => {
    await page.goto("/profesionales/ana-perez-ab12c");
    // Cada reseña es un <article> dentro del <article> del perfil.
    const reviews = main(page).locator("article article").filter({ hasText: /Cliente \d+\./ });
    await expect(reviews).toHaveCount(10);
    // El HTML de una reseña se muestra como texto.
    await expect(main(page).getByText("<b>Excelente</b> trabajo")).toBeVisible();
    await main(page).getByRole("button", { name: "Ver más reseñas (2)" }).click();
    await expect(reviews).toHaveCount(12);
    await expect(main(page).getByRole("button", { name: /Ver más reseñas/ })).toHaveCount(0);
  });

  test("un perfil inexistente explica que no está disponible y no se indexa", async ({ page }) => {
    await page.goto("/profesionales/no-existe-xxxxx");
    await expect(main(page).getByRole("heading", { level: 1, name: "Este perfil no está disponible" })).toBeVisible();
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute("content", /noindex/);
  });
});
