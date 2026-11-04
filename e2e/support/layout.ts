import { expect, type Page } from "@playwright/test";

/**
 * Sin scroll horizontal. Se compara con el ancho configurado de la pantalla y no con `clientWidth`:
 * en modo celular, si algo desborda, el navegador agranda el área de diseño (y `clientWidth` con ella),
 * así que la resta daría 0 aunque la página no entre en la pantalla.
 */
export async function expectNoHorizontalScroll(page: Page) {
  const width = page.viewportSize()!.width;
  const measured = await page.evaluate(() => ({
    layout: window.innerWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(measured.layout, "el área de diseño no se agrandó").toBe(width);
  expect(measured.content, `el contenido entra en ${width}px`).toBeLessThanOrEqual(width);
}
