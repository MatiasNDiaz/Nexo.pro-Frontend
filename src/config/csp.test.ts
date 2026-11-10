import { describe, expect, it } from "vitest";
import { buildCsp } from "./csp";

function directives(policy: string): Map<string, string[]> {
  return new Map(
    policy.split("; ").map((part) => {
      const [name, ...values] = part.split(" ");
      return [name!, values];
    }),
  );
}

describe("buildCsp", () => {
  const prod = directives(buildCsp({ apiUrl: "https://api.reparaya.test", dev: false }));

  it("no deja que otro sitio muestre la página en un marco ni cargue plugins", () => {
    expect(prod.get("frame-ancestors")).toEqual(["'none'"]);
    expect(prod.get("object-src")).toEqual(["'none'"]);
    expect(prod.get("base-uri")).toEqual(["'self'"]);
    expect(prod.get("form-action")).toEqual(["'self'"]);
  });

  it("solo conecta con la API (también por WebSocket), Cloudinary y el propio sitio", () => {
    expect(prod.get("connect-src")).toEqual(["'self'", "https://api.reparaya.test", "wss://api.reparaya.test", "https://api.cloudinary.com"]);
  });

  it("scripts: el sitio y Turnstile; eval solo en desarrollo", () => {
    expect(prod.get("script-src")).toEqual(["'self'", "'unsafe-inline'", "https://challenges.cloudflare.com"]);
    expect(prod.get("frame-src")).toEqual(["https://challenges.cloudflare.com"]);
    const dev = directives(buildCsp({ apiUrl: "http://localhost:3001", dev: true }));
    expect(dev.get("script-src")).toContain("'unsafe-eval'");
  });

  it("pasa a https solo si la API ya es https (en la red local rompería los pedidos)", () => {
    expect(prod.has("upgrade-insecure-requests")).toBe(true);
    const local = directives(buildCsp({ apiUrl: "http://192.168.0.253:3001/", dev: false }));
    expect(local.has("upgrade-insecure-requests")).toBe(false);
    expect(local.get("connect-src")).toContain("ws://192.168.0.253:3001");
    expect(local.get("img-src")).toContain("http://192.168.0.253:3001");
  });
});
