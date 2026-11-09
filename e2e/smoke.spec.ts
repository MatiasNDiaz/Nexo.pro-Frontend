import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll } from "./support/layout";

test("la portada se sirve en español y con encabezados de seguridad", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);

  await expect(page.getByRole("heading", { level: 1, name: /Oficios de confianza en Córdoba/ })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "es-AR");

  const headers = response!.headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-powered-by"]).toBeUndefined();
});

for (const path of ["/", "/profesionales", "/foro", "/contacto", "/ingresar", "/registro"] as const) {
  test(`no hay scroll horizontal en ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
}
