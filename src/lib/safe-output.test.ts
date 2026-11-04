import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "./json-ld";
import { mediaUrl, safeExternalUrl } from "./media";
import { telHref, whatsappNumber } from "./phone";

describe("serializeJsonLd", () => {
  it("no permite cerrar la etiqueta <script> con texto del usuario", () => {
    const out = serializeJsonLd({ description: '</script><script>alert("x")</script> & más' });
    expect(out).not.toContain("<");
    expect(out).not.toContain(">");
    expect(out).not.toContain("&");
    // Sigue siendo JSON válido con el mismo contenido.
    expect(JSON.parse(out)).toEqual({ description: '</script><script>alert("x")</script> & más' });
  });

  it("escapa los separadores de línea Unicode", () => {
    const text = `x${String.fromCharCode(0x2028)}y${String.fromCharCode(0x2029)}z`;
    expect(serializeJsonLd({ a: text })).toBe('{"a":"x\\u2028y\\u2029z"}');
    expect(JSON.parse(serializeJsonLd({ a: text }))).toEqual({ a: text });
  });
});

describe("safeExternalUrl", () => {
  it.each(["javascript:alert(1)", "data:text/html,<b>x</b>", "vbscript:x", "no es url"])("descarta %s", (url) => {
    expect(safeExternalUrl(url)).toBeNull();
  });
  it("acepta http y https", () => {
    expect(safeExternalUrl("https://instagram.com/ana")).toBe("https://instagram.com/ana");
  });
});

describe("mediaUrl", () => {
  it("antepone el origen de la API a las rutas del almacenamiento local", () => {
    expect(mediaUrl("/api/v1/uploads/abc/content")).toBe("http://localhost:3001/api/v1/uploads/abc/content");
  });
  it("deja las de Cloudinary y descarta esquemas peligrosos o rutas de protocolo relativo", () => {
    expect(mediaUrl("https://res.cloudinary.com/x/image/upload/a.jpg")).toBe("https://res.cloudinary.com/x/image/upload/a.jpg");
    expect(mediaUrl("javascript:alert(1)")).toBeNull();
    expect(mediaUrl("//malicioso.com/a.jpg")).toBeNull();
  });
});

describe("teléfonos", () => {
  it("arma tel: solo con números válidos", () => {
    expect(telHref("351 506-7276")).toBe("tel:3515067276");
    expect(telHref("+54 9 351 506 7276")).toBe("tel:+5493515067276");
    expect(telHref("abc")).toBeNull();
  });

  it("WhatsApp: internacional con +, o celular argentino de 10 dígitos", () => {
    expect(whatsappNumber("+5493515067276")).toBe("5493515067276");
    expect(whatsappNumber("3515067276")).toBe("5493515067276");
  });

  it("no ofrece WhatsApp si el número es ambiguo", () => {
    expect(whatsappNumber("03515067276")).toBeNull();
    expect(whatsappNumber("1550678899")).toBeNull();
    expect(whatsappNumber("12345678")).toBeNull();
  });
});
