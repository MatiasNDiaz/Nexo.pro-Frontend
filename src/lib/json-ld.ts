/** Separadores de línea y de párrafo Unicode: válidos en JSON, pero cortan líneas en JavaScript. */
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

/**
 * Serializa datos estructurados (JSON-LD) para un `<script type="application/ld+json">`.
 * JSON.stringify no alcanza: un texto del usuario con `</script>` cerraría la etiqueta (XSS). Se
 * escapan `<`, `>` y `&` como en la guía de Next.js, y además U+2028 y U+2029.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026")
    .replaceAll(LINE_SEPARATOR, "\\u2028")
    .replaceAll(PARAGRAPH_SEPARATOR, "\\u2029");
}
