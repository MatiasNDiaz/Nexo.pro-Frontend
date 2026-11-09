import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll } from "./support/layout";

const PRICES = [
  ["Basic", "$ 10.000"],
  ["Medium", "$ 15.000"],
  ["Premium", "$ 20.000"],
] as const;

test.describe("inicio", () => {
  test("planes: una tarjeta por plan con su precio y lo que incluye", async ({ page }) => {
    await page.goto("/");
    const section = page.locator("#planes");
    for (const [name, price] of PRICES) {
      const card = section.getByRole("listitem").filter({ has: page.getByRole("heading", { name, level: 3 }) });
      await expect(card).toContainText(price);
      await expect(card.getByRole("link", { name: /Probar 30 días/ })).toHaveAttribute("href", "/registro?rol=profesional");
    }
    // Lo que no incluye un plan se anuncia para lectores de pantalla.
    const basic = section.getByRole("listitem").filter({ has: page.getByRole("heading", { name: "Basic", level: 3 }) });
    await expect(basic.getByText("Estadísticas de visitas")).toContainText("(no incluido)");
  });

  test("el buscador del héroe lleva al catálogo con oficio y localidad", async ({ page }) => {
    await page.goto("/");
    const hero = page.getByRole("region", { name: "Fotos de oficios" });
    // Lista propia (no <select>): se abre con el teclado y se elige con Enter.
    const trade = hero.getByRole("combobox", { name: /^Oficio/ });
    await trade.focus();
    await page.keyboard.press("ArrowDown");
    await expect(trade).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(trade).toHaveAccessibleName(/Electricista/);
    // Y con el mouse.
    await hero.getByRole("combobox", { name: /^Localidad/ }).click();
    await hero.getByRole("option", { name: "Toda Córdoba" }).click();
    await hero.getByRole("button", { name: "Buscar" }).click();
    await expect(page).toHaveURL(/\/profesionales\?oficio=electricista&localidad=$/);
    await expect(page.getByRole("heading", { level: 1, name: "Encontrá al profesional indicado" })).toBeVisible();
  });

  test("el mosaico de oficios lleva al catálogo filtrado", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Electricista", exact: true }).click();
    await expect(page).toHaveURL(/\/profesionales\?oficio=electricista$/);
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

  test("quiénes somos, el objetivo y la cuenta gratis", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 2, name: "Quiénes somos" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 3, name: "Nuestro objetivo" })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Lo que tenés con tu cuenta gratis." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Crear mi cuenta gratis" })).toHaveAttribute("href", "/registro");
  });

  test("la historia de la cuenta avanza al tocar cada paso (celular)", async ({ page, isMobile }) => {
    test.skip(!isMobile, "en escritorio el paso lo marca el scroll");
    await page.goto("/");
    const step = page.getByRole("button", { name: /Tu reseña cuenta/ });
    await step.click();
    await expect(step).toHaveAttribute("aria-pressed", "true");
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
    await expect(region.getByRole("button", { name: /fotos/ })).toHaveCount(0);
    await context.close();
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
