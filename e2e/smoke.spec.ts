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
  const csp = headers["content-security-policy"] ?? "";
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).not.toContain("unsafe-eval");
});

// La CSP no puede bloquear nada propio: si el navegador reporta una violación, algo dejó de andar.
for (const path of ["/", "/profesionales", "/profesionales/ana-perez-ab12c", "/profesionales/maria-estilo-zz99", "/foro", "/contacto", "/ingresar", "/registro"] as const) {
  test(`la CSP no bloquea nada en ${path}`, async ({ page }) => {
    const violations: string[] = [];
    await page.exposeFunction("reportCspViolation", (text: string) => violations.push(text));
    await page.addInitScript(() => {
      document.addEventListener("securitypolicyviolation", (event) => {
        (window as unknown as { reportCspViolation: (t: string) => void }).reportCspViolation(
          `${event.violatedDirective} → ${event.blockedURI}`,
        );
      });
    });
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await page.waitForLoadState("networkidle");
    expect(violations).toEqual([]);
  });
}

for (const path of ["/", "/profesionales", "/foro", "/contacto", "/ingresar", "/registro"] as const) {
  test(`no hay scroll horizontal en ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
}
