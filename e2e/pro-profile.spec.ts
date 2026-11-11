import { expect, test } from "@playwright/test";
import { expectNoHorizontalScroll } from "./support/layout";
import { json, LOCALITY, me, mockApi, PROFESSION, type Handler } from "./support/mock-api";

/* Etapa 6: el profesional edita su perfil (datos, fotos, estilo) contra la API simulada. */

const pro = me({ role: "PROFESSIONAL", status: "ACTIVE", emailVerified: true, verificationStatus: "APPROVED" });

const baseProfile = {
  id: "p1",
  slug: "ana-perez-ab12c",
  businessName: null,
  bio: null,
  yearsExperience: 5,
  worksWithTeam: false,
  hasMobility: true,
  referenceRate: null,
  rateMode: null,
  freeQuote: true,
  theme: {},
  attention: { manual: "AVAILABLE", until: null, autoFromSchedule: false, effective: "AVAILABLE" },
  professions: [{ id: PROFESSION.id, name: PROFESSION.name, isPrimary: true, status: "ACTIVE" }],
  serviceAreas: [{ localityId: LOCALITY.id, localityName: LOCALITY.name, neighborhoodId: null, neighborhoodName: null }],
  media: [] as Record<string, unknown>[],
  certifications: [],
  socialLinks: [],
  availability: { slots: [], exceptions: [] },
};

const plan = (code: "BASIC" | "PREMIUM") => ({
  status: code === "BASIC" ? "TRIAL" : "ACTIVE",
  live: true,
  plan: {
    code,
    name: code === "BASIC" ? "Basic" : "Premium",
    maxProfessions: code === "BASIC" ? 1 : 3,
    maxImages: 5,
    maxVideos: code === "BASIC" ? 0 : 2,
    maxVideoSeconds: 60,
    maxImageBytes: 5_000_000,
    maxVideoBytes: 50_000_000,
    themeLevel: code === "BASIC" ? "NONE" : "EXTENDED",
  },
  trialEndsAt: null,
  trialDaysLeft: code === "BASIC" ? 20 : null,
  currentPeriodEnd: null,
  periodDaysLeft: null,
});

function signedIn(profile: () => typeof baseProfile, code: "BASIC" | "PREMIUM", handlers: Record<string, Handler> = {}) {
  return {
    "GET /auth/csrf": () => json(200, { csrfToken: "csrf-1" }),
    "GET /auth/me": () => json(200, pro),
    "GET /notifications/unread-count": () => json(200, { unread: 0 }),
    "GET /chat/conversations": () => json(200, []),
    "GET /professionals/me": () => json(200, profile()),
    "GET /subscriptions/me": () => json(200, plan(code)),
    ...handlers,
  };
}

test.describe("perfil profesional", () => {
  test("datos y estilo se guardan; una foto de trabajo se sube y aparece", async ({ page }) => {
    let profile = { ...baseProfile };
    let patch: Record<string, unknown> | null = null;
    let theme: Record<string, unknown> | null = null;
    await mockApi(
      page,
      signedIn(() => profile, "PREMIUM", {
        "PATCH /professionals/me": (req) => {
          patch = req.postDataJSON() as Record<string, unknown>;
          profile = { ...profile, bio: patch.bio as null };
          return json(200, profile);
        },
        "PUT /professionals/me/theme": (req) => {
          theme = req.postDataJSON() as Record<string, unknown>;
          profile = { ...profile, theme: theme as never };
          return json(200, profile);
        },
        "POST /uploads": () =>
          json(201, { file: { id: "f1" }, upload: { method: "PUT", url: "/api/v1/uploads/f1/content", fields: {}, maxBytes: 5_000_000 } }),
        "PUT /uploads/f1/content": () => json(204),
        "POST /uploads/f1/complete": () => json(200, { id: "f1", status: "READY" }),
        "POST /professionals/me/media": (req) => {
          const body = req.postDataJSON() as { fileId: string; purpose: string };
          const item = { id: "m1", fileId: body.fileId, purpose: body.purpose, kind: "IMAGE", position: 0, status: "ACTIVE", url: null, hiddenReason: null };
          profile = { ...profile, media: [item] };
          return json(201, item);
        },
      }),
    );
    await page.goto("/panel/perfil");
    await expect(page.getByRole("heading", { level: 1, name: "Mi perfil profesional" })).toBeVisible();

    await page.getByRole("textbox", { name: "Descripción" }).fill("Electricista con 5 años de oficio. Trabajo prolijo.");
    await page.locator("#datos").getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Guardamos los datos del perfil" })).toBeVisible();
    expect(patch).toMatchObject({ bio: "Electricista con 5 años de oficio. Trabajo prolijo.", yearsExperience: 5, hasMobility: true, freeQuote: true });

    await page.locator("#trabajos input[type=file]").setInputFiles({
      name: "trabajo.png",
      mimeType: "image/png",
      buffer: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"),
    });
    await expect(page.locator("#trabajos").getByText("Principal")).toBeVisible();
    await expect(page.locator("#trabajos").getByText("Fotos 1 de 5")).toBeVisible();

    const style = page.locator("#estilo");
    await style.locator("label").filter({ has: page.getByRole("radio", { name: "Verde" }) }).first().click();
    await style.locator("label").filter({ hasText: "Manuscrita" }).click();
    await style.getByRole("textbox", { name: /Frase destacada/ }).fill("Trabajos con garantía");
    await style.getByRole("button", { name: "Guardar" }).click();
    await expect(page.getByRole("status").filter({ hasText: "Guardamos el estilo de tu página" })).toBeVisible();
    expect(theme).toEqual({ color: "verde", font: "manuscrita", headline: "Trabajos con garantía" });
    await expectNoHorizontalScroll(page);
  });

  test("con la prueba gratis, portada y estilo explican que son de otros planes", async ({ page }) => {
    await mockApi(page, signedIn(() => baseProfile, "BASIC"));
    await page.goto("/panel/perfil");
    await expect(page.getByText("La portada personalizada está en los planes Medium y Premium")).toBeVisible();
    await expect(page.locator("#estilo").getByRole("link", { name: "Ver planes" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Panel" }).getByRole("link", { name: "Mi perfil" })).toHaveAttribute("aria-current", "page");
  });
});
