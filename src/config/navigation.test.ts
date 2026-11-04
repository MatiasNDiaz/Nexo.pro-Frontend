import { describe, expect, it } from "vitest";
import { isActive, mainNavFor } from "./navigation";
import { whatsappUrl } from "./site";

const labels = (items: { label: string }[]) => items.map((item) => item.label);

describe("mainNavFor", () => {
  it("sin sesión: Inicio, Profesionales, Foro y Contacto", () => {
    expect(labels(mainNavFor({ status: "anonymous" }))).toEqual(["Inicio", "Profesionales", "Foro", "Contacto"]);
  });

  it("mientras se resuelve la sesión muestra solo lo público", () => {
    expect(labels(mainNavFor({ status: "loading" }))).toEqual(["Inicio", "Profesionales", "Foro", "Contacto"]);
  });

  it("profesional: Clientes en lugar de Profesionales, y Panel", () => {
    expect(labels(mainNavFor({ status: "authenticated", role: "PROFESSIONAL", firstName: "Ana" }))).toEqual([
      "Inicio",
      "Clientes",
      "Foro",
      "Contacto",
      "Panel",
    ]);
  });

  it("cliente: Profesionales y Panel", () => {
    expect(labels(mainNavFor({ status: "authenticated", role: "CUSTOMER", firstName: "Juan" }))).toEqual([
      "Inicio",
      "Profesionales",
      "Foro",
      "Contacto",
      "Panel",
    ]);
  });
});

describe("isActive", () => {
  it("Inicio solo coincide exacto", () => {
    expect(isActive("/", "/")).toBe(true);
    expect(isActive("/", "/foro")).toBe(false);
  });

  it("las secciones coinciden con sus subrutas pero no con prefijos parecidos", () => {
    expect(isActive("/foro", "/foro/123")).toBe(true);
    expect(isActive("/panel", "/panelito")).toBe(false);
  });
});

describe("whatsappUrl", () => {
  it("usa wa.me con el número internacional y codifica el mensaje", () => {
    expect(whatsappUrl("Hola, quiero consultar")).toBe(
      "https://wa.me/5493515067276?text=Hola%2C+quiero+consultar",
    );
    expect(whatsappUrl()).toBe("https://wa.me/5493515067276");
  });
});
