/**
 * "Chrome en Windows" a partir del User-Agent que guarda el backend. Aproximado a propósito: solo
 * ayuda a reconocer el dispositivo (el orden importa: Edge y Opera también dicen "Chrome").
 */
export function deviceLabel(userAgent: string | null): string {
  if (!userAgent) return "Dispositivo desconocido";
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\/|Opera/.test(userAgent)
      ? "Opera"
      : /SamsungBrowser/.test(userAgent)
        ? "Samsung Internet"
        : /Firefox\/|FxiOS/.test(userAgent)
          ? "Firefox"
          : /Chrome\/|CriOS/.test(userAgent)
            ? "Chrome"
            : /Safari\//.test(userAgent)
              ? "Safari"
              : "Navegador";
  const system = /Android/.test(userAgent)
    ? "Android"
    : /iPhone|iPad|iPod/.test(userAgent)
      ? "iPhone o iPad"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(userAgent)
          ? "Mac"
          : /Linux/.test(userAgent)
            ? "Linux"
            : null;
  return system ? `${browser} en ${system}` : browser;
}
