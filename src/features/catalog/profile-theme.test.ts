import { describe, expect, it, vi } from "vitest";
import { contrastRatio, sectionAttributes, themeForLevel, type ProfileTheme } from "./profile-theme";

// next/font solo funciona dentro de Next: acá alcanza con su forma.
vi.mock("next/font/google", () => ({ Caveat: () => ({ variable: "font-caveat", className: "font-caveat" }) }));

const theme: ProfileTheme = {
  color: "azul",
  animation: "zoom",
  sections: {
    sobre: { background: "#123b7a", backgroundTo: "#3b82f6", text: "#ffffff", size: 110, animation: "rebote" },
    resenas: { animation: "girar" },
  },
};

describe("themeForLevel (mismas reglas que el backend)", () => {
  it("Medium: solo fondo y letra, sin la animación del nombre ni secciones vacías", () => {
    expect(themeForLevel(theme, "STANDARD")).toEqual({ color: "azul", sections: { sobre: { background: "#123b7a", text: "#ffffff" } } });
  });
  it("Premium: todo; Basic: nada", () => {
    expect(themeForLevel(theme, "EXTENDED")).toEqual(theme);
    expect(themeForLevel(theme, "NONE")).toEqual({});
  });
  it("un degradé sin color de inicio no queda", () => {
    expect(themeForLevel({ sections: { datos: { backgroundTo: "#000000" } } }, "EXTENDED")).toEqual({});
  });
});

describe("sectionAttributes", () => {
  it("arma degradé, letra (con los colores del sistema), tamaño y animación", () => {
    const attrs = sectionAttributes(theme.sections, "sobre");
    const style = attrs.style as Record<string, unknown>;
    expect(style.background).toBe("linear-gradient(135deg, #123b7a, #3b82f6)");
    expect(style.color).toBe("#ffffff");
    expect(style["--color-ink"]).toBe("#ffffff");
    expect(style["--color-brand-800"]).toBeUndefined();
    expect(style.zoom).toBe(1.1);
    expect(attrs["data-reveal"]).toBe("anim-rebote");
    expect(attrs.className).toContain("p-5");
  });
  it("ignora valores que no son #rrggbb", () => {
    const attrs = sectionAttributes({ zonas: { background: "red;position:fixed", text: "url(x)" } }, "zonas", null);
    expect(attrs.style).toEqual({});
    expect(attrs["data-reveal"]).toBeUndefined();
  });
  it("sin estilo, conserva la aparición común", () => {
    expect(sectionAttributes(undefined, "trabajos")["data-reveal"]).toBe("");
  });
});

describe("contrastRatio", () => {
  it("negro sobre blanco es 21:1 y blanco sobre blanco 1:1", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
    expect(contrastRatio("#ffffff", "#ffffff")).toBe(1);
  });
});
