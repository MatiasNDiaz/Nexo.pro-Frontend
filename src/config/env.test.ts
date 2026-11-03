import { describe, expect, it } from "vitest";
import { parsePublicEnv } from "./env";

const valid = {
  NEXT_PUBLIC_API_URL: "https://api.dominio.com",
  NEXT_PUBLIC_SITE_URL: "https://dominio.com",
};

describe("parsePublicEnv", () => {
  it("acepta orígenes exactos y deja el CAPTCHA opcional", () => {
    expect(parsePublicEnv(valid)).toEqual(valid);
  });

  it.each(["https://api.dominio.com/", "https://api.dominio.com/api/v1", "api.dominio.com"])(
    "rechaza %s como origen de la API",
    (value) => {
      expect(() => parsePublicEnv({ ...valid, NEXT_PUBLIC_API_URL: value })).toThrow(/NEXT_PUBLIC_API_URL/);
    },
  );

  it("nombra las variables faltantes sin mostrar valores", () => {
    expect(() => parsePublicEnv({ NEXT_PUBLIC_API_URL: "https://secreto.example" })).toThrow(
      /NEXT_PUBLIC_SITE_URL/,
    );
    expect(() => parsePublicEnv({ NEXT_PUBLIC_API_URL: "no-es-url", NEXT_PUBLIC_SITE_URL: "x" })).not.toThrow(
      /no-es-url/,
    );
  });
});
