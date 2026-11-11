import { expect, test, type Page } from "@playwright/test";
import { expectNoHorizontalScroll } from "./support/layout";
import { json, LOCALITY, me, mockApi, PROFESSION, type Handler } from "./support/mock-api";

/*
 * Diseño por sección de la página del profesional (ADR 0034 del backend): la página pública con
 * estilos (armada en el servidor con e2e/support/mock-server.mjs) y el editor del panel, por plan.
 */

const SLUG = "ana-perez-ab12c";
const pro = me({ role: "PROFESSIONAL", status: "ACTIVE", emailVerified: true, verificationStatus: "APPROVED" });

const subscription = (code: "BASIC" | "MEDIUM" | "PREMIUM") => ({
  status: "ACTIVE",
  live: true,
  plan: { code, name: code.charAt(0) + code.slice(1).toLowerCase(), maxProfessions: 3, maxImages: 5, maxVideos: 2, maxVideoSeconds: 15, maxImageBytes: 5_000_000, maxVideoBytes: 30_000_000, themeLevel: code === "PREMIUM" ? "EXTENDED" : code === "MEDIUM" ? "STANDARD" : "NONE" },
  trialEndsAt: null,
  trialDaysLeft: null,
  currentPeriodEnd: "2026-12-08T12:00:00.000Z",
  periodDaysLeft: 20,
});

const theme = { color: "violeta", headline: "Urgencias en el día" };

const professionalMe = {
  id: "p1",
  slug: SLUG,
  businessName: null,
  bio: "Instalaciones eléctricas.",
  yearsExperience: 8,
  worksWithTeam: false,
  hasMobility: true,
  referenceRate: "15000.00",
  rateMode: "PER_VISIT",
  freeQuote: true,
  theme,
  attention: { manual: "AVAILABLE", until: null, autoFromSchedule: false, effective: "AVAILABLE" },
  professions: [{ id: PROFESSION.id, name: PROFESSION.name, isPrimary: true, status: "ACTIVE" }],
  serviceAreas: [{ localityId: LOCALITY.id, localityName: LOCALITY.name, neighborhoodId: null, neighborhoodName: null }],
  media: [],
  certifications: [],
  socialLinks: [],
  availability: { slots: [], exceptions: [] },
};

const publicProfile = {
  slug: SLUG,
  professionalUserId: pro.id,
  firstName: "Ana",
  lastName: "Pérez",
  businessName: null,
  avatarUrl: null,
  bio: "Instalaciones eléctricas.",
  yearsExperience: 8,
  referenceRate: "15000.00",
  rateMode: "PER_VISIT",
  freeQuote: true,
  attentionStatus: "AVAILABLE",
  identityVerified: true,
  professions: [{ id: PROFESSION.id, name: PROFESSION.name, isPrimary: true }],
  serviceAreas: [{ localityId: LOCALITY.id, localityName: LOCALITY.name, neighborhoodId: null, neighborhoodName: null }],
  coverImageUrl: null,
  catalogVideoUrl: null,
  ratingAverage: null,
  ratingCount: 0,
  worksWithTeam: false,
  hasMobility: true,
  theme,
  banner: null,
  media: [],
  certifications: [],
  socialLinks: [],
  availability: { slots: [], exceptions: [] },
};

function signedIn(plan: "BASIC" | "MEDIUM" | "PREMIUM", handlers: Record<string, Handler> = {}) {
  return {
    "GET /auth/csrf": () => json(200, { csrfToken: "csrf-1" }),
    "GET /auth/me": () => json(200, pro),
    "GET /notifications/unread-count": () => json(200, { unread: 0 }),
    "GET /chat/conversations": () => json(200, []),
    "GET /professionals/me": () => json(200, professionalMe),
    "GET /subscriptions/me": () => json(200, subscription(plan)),
    "GET /professionals/me/public-page": () => json(200, { published: true, missing: [], profile: publicProfile }),
    [`GET /catalog/professionals/${SLUG}/reviews`]: () => json(200, { data: [], average: null, count: 0, page: 1, limit: 10 }),
    ...handlers,
  };
}

test.describe("mi página", () => {
  test("publicada: se ve como la ven los clientes y se copia el enlace", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await mockApi(page, signedIn("PREMIUM"));
    await page.goto("/panel/mi-pagina");
    await expect(page.getByRole("heading", { name: "Tu página está publicada" })).toBeVisible();
    await expect(page.getByText(`/profesionales/${SLUG}`)).toBeVisible();
    // La vista previa es la página real, solo para mirar.
    await expect(page.locator("article[data-section='pagina']").getByText("Instalaciones eléctricas.").first()).toBeAttached();
    await page.getByRole("button", { name: "Copiar enlace" }).click();
    await expect(page.getByRole("region", { name: "Avisos" }).getByRole("status")).toContainText("Enlace copiado");
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(new RegExp(`/profesionales/${SLUG}$`));
    await expect(page.getByRole("navigation", { name: "Panel" }).getByRole("link", { name: "Ver mi página" })).toHaveAttribute("aria-current", "page");
    await expectNoHorizontalScroll(page);
  });

  test("sin publicar: dice qué falta y dónde se resuelve, sin pedir las reseñas públicas", async ({ page }) => {
    const api = await mockApi(
      page,
      signedIn("BASIC", {
        "GET /professionals/me/public-page": () =>
          json(200, { published: false, missing: ["IDENTITY_NOT_VERIFIED", "NO_AVATAR", "NO_LIVE_PLAN"], profile: { ...publicProfile, identityVerified: false } }),
      }),
    );
    await page.goto("/panel/mi-pagina");
    await expect(page.getByRole("heading", { name: "Tu página todavía no se ve en el catálogo" })).toBeVisible();
    await expect(page.getByText("Te faltan 3 cosas")).toBeVisible();
    await expect(page.getByRole("link", { name: "Verificar" })).toHaveAttribute("href", "/panel/verificacion");
    await expect(page.getByRole("link", { name: "Subir foto" })).toHaveAttribute("href", "/panel/cuenta");
    await expect(page.getByRole("link", { name: "Ver planes" })).toHaveAttribute("href", "/panel/plan");
    expect(api.find(`GET /catalog/professionals/${SLUG}/reviews`)).toHaveLength(0);
    await expectNoHorizontalScroll(page);
  });

  test("el editor de diseño funciona con la página sin publicar y avisa", async ({ page }) => {
    await mockApi(
      page,
      signedIn("PREMIUM", {
        "GET /professionals/me/public-page": () => json(200, { published: false, missing: ["NO_AVATAR"], profile: publicProfile }),
      }),
    );
    await page.goto("/panel/perfil/diseno");
    await expect(page.getByText("Tu página todavía no está publicada")).toBeVisible();
    await expect(page.getByRole("link", { name: "Mirá qué te falta" })).toHaveAttribute("href", "/panel/mi-pagina");
    await expect(page.getByRole("button", { name: "Aplicar estilos" })).toBeVisible();
  });
});

const menuOf = (page: Page, label: string) => page.getByRole("button", { name: new RegExp(`Estilo de “${label}”`) });

test.describe("página pública con estilo por sección", () => {
  test("aplica fondo, letra, degradé y tamaño, e ignora lo que no es un color #rrggbb", async ({ page }) => {
    await page.goto("/profesionales/maria-estilo-zz99");
    const sobre = page.locator('[data-section="sobre"]');
    await expect(sobre).toHaveCSS("background-color", "rgb(253, 230, 138)");
    await expect(sobre).toHaveCSS("color", "rgb(31, 41, 55)");
    await expect(sobre).toHaveAttribute("data-reveal", "anim-rebote");
    const stat = page.locator('[data-section="datos"] > div').first();
    await expect(stat).toHaveCSS("background-image", /linear-gradient/);
    await expect(stat).toHaveCSS("zoom", "1.15");
    await expect(page.locator('article[data-section="pagina"]')).toHaveCSS("background-color", "rgb(245, 243, 255)");
    // "red;position:fixed" no se aplica; la letra válida sí.
    const zonas = page.locator('[data-section="zonas"]');
    await expect(zonas).not.toHaveCSS("background-color", "rgb(255, 0, 0)");
    await expect(zonas).not.toHaveCSS("position", "fixed");
    await expect(zonas).toHaveCSS("color", "rgb(18, 52, 86)");
    await expectNoHorizontalScroll(page);
  });
});

test.describe("editor de diseño", () => {
  test("Basic: invita a Medium o Premium", async ({ page }) => {
    await mockApi(page, signedIn("BASIC"));
    await page.goto("/panel/perfil/diseno");
    await expect(page.getByRole("heading", { name: "Diseñá tu página con Medium o Premium" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver planes" })).toHaveAttribute("href", "/panel/plan");
  });

  test("Medium: solo fondo y letra; aplicar conserva el resto del tema", async ({ page }) => {
    let body: unknown = null;
    await mockApi(
      page,
      signedIn("MEDIUM", {
        "PUT /professionals/me/theme": (request) => {
          body = request.postDataJSON();
          return json(200, { ...professionalMe, theme: body });
        },
      }),
    );
    await page.goto("/panel/perfil/diseno");
    await menuOf(page, "Sobre vos").click();
    await expect(page.getByRole("menuitem", { name: /Tamaño/ })).toHaveAttribute("aria-disabled", "true");
    await expect(page.getByRole("menuitem", { name: /Animación/ })).toHaveAttribute("aria-disabled", "true");
    await page.getByRole("menuitem", { name: /Color de fondo/ }).click();
    await expect(page.getByText("Degradés con Premium.")).toBeVisible();
    await page.locator('input[type="color"]').first().fill("#fde68a");
    await page.keyboard.press("Escape");
    await expect(page.locator('[data-section="sobre"]')).toHaveCSS("background-color", "rgb(253, 230, 138)");
    await page.getByRole("button", { name: "Aplicar estilos" }).click();
    await expect(page.getByText("Listo: tu página ya se ve así.")).toBeVisible();
    expect(body).toEqual({ ...theme, sections: { sobre: { background: "#fde68a" } } });
    await expectNoHorizontalScroll(page);
  });

  test("Premium: animación, tamaño y degradé; descartar vuelve a lo guardado", async ({ page }) => {
    let body: { sections?: Record<string, unknown> } | null = null;
    await mockApi(
      page,
      signedIn("PREMIUM", {
        "PUT /professionals/me/theme": (request) => {
          body = request.postDataJSON();
          return json(200, { ...professionalMe, theme: body });
        },
      }),
    );
    await page.goto("/panel/perfil/diseno");
    await menuOf(page, "Contacto").click();
    await page.getByRole("menuitem", { name: /Animación/ }).click();
    await expect(page.locator(".anim-demo")).toHaveCount(6);
    await page.getByRole("button", { name: /^Rebote/ }).click();
    await page.getByRole("button", { name: "Contacto", exact: true }).click();
    await page.getByRole("menuitem", { name: /Tamaño/ }).click();
    await page.getByRole("slider", { name: /Tamaño/ }).fill("110");
    await page.getByRole("button", { name: "Contacto", exact: true }).click();
    await page.getByRole("menuitem", { name: /Color de fondo/ }).click();
    await page.getByRole("checkbox", { name: "Degradé" }).check();
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Descartar" }).click();
    await expect(page.getByRole("button", { name: "Aplicar estilos" })).toBeDisabled();

    await menuOf(page, "Contacto").click();
    await page.getByRole("menuitem", { name: /Animación/ }).click();
    await page.getByRole("button", { name: /^Girar/ }).click();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "Aplicar estilos" }).click();
    await expect(page.getByText("Listo: tu página ya se ve así.")).toBeVisible();
    expect(body).toEqual({ ...theme, sections: { contacto: { animation: "girar" } } });
  });
});

test("panel en el celular: el contador de notificaciones no agranda la página", async ({ page }) => {
  await mockApi(page, signedIn("PREMIUM", { "GET /notifications/unread-count": () => json(200, { unread: 13 }) }));
  await page.goto("/panel");
  await expect(page.getByRole("navigation", { name: "Panel" }).getByText("13")).toBeAttached();
  await expectNoHorizontalScroll(page);
});
