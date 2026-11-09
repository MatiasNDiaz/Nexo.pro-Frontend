import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll } from "./support/layout";

test.describe("inicio", () => {
  test("muestra los tres planes con sus precios", async ({ page }) => {
    await page.goto("/");
    const plans = page.locator("#planes");
    for (const [name, price] of [
      ["Basic", "$ 10.000"],
      ["Medium", "$ 15.000"],
      ["Premium", "$ 20.000"],
    ] as const) {
      const card = plans.getByRole("listitem").filter({ has: page.getByRole("heading", { name, exact: true }) });
      await expect(card).toContainText(price);
    }
    await expect(plans.getByRole("link", { name: "Empezar con la prueba" })).toHaveCount(3);
  });

  test("las preguntas frecuentes se abren y cierran", async ({ page }) => {
    await page.goto("/");
    const question = page.getByText("¿Cómo se paga el trabajo?");
    const answer = page.getByText("Repara Ya no cobra ni procesa el pago de los trabajos.");
    await expect(answer).toBeHidden();
    await question.click();
    await expect(answer).toBeVisible();
    await question.click();
    await expect(answer).toBeHidden();
  });

  test("quiénes somos y nuestro objetivo", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 2, name: "Quiénes somos" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Nuestro objetivo" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Crear mi cuenta gratis" })).toHaveAttribute("href", "/registro");
  });

  test("las fotos del héroe se pueden pausar", async ({ page }) => {
    await page.goto("/");
    const region = page.getByRole("region", { name: "Fotos de oficios" });
    await expect(region.getByRole("img").first()).toBeVisible();
    await region.getByRole("button", { name: "Pausar las fotos" }).click();
    await expect(region.getByRole("button", { name: "Reanudar las fotos" })).toBeVisible();
  });

  test("con movimiento reducido, una sola foto quieta y sin controles", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce", baseURL: "http://localhost:3100" });
    const page = await context.newPage();
    await page.goto("/");
    const region = page.getByRole("region", { name: "Fotos de oficios" });
    await expect(region.getByRole("img")).toHaveCount(1);
    await expect(region.getByRole("button")).toHaveCount(0);
    await context.close();
  });

  test("los oficios llevan al catálogo filtrado", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Oficios" }).getByRole("link", { name: "Electricista" }).click();
    await expect(page).toHaveURL(/\/profesionales\?oficio=electricista$/);
  });

  test("el botón para volver arriba aparece al bajar y sube", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: "Volver arriba" });
    await expect(button).toBeHidden();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(button).toBeVisible();
    await button.click();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
    await expectNoHorizontalScroll(page);
  });
});

test("las páginas del menú tienen su foto en el encabezado", async ({ page }) => {
  for (const path of ["/profesionales", "/foro", "/contacto"]) {
    await page.goto(path);
    const image = page.locator("main img").first();
    await expect(image).toBeVisible();
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  }
});
