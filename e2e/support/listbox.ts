import type { Locator, Page } from "@playwright/test";

/**
 * Elige una opción de un desplegable propio (src/components/ui/listbox.tsx) como una persona: abre la
 * lista tocando el botón y toca la opción. Reemplaza a `selectOption`, que solo sirve para <select>.
 */
export async function chooseOption(scope: Page | Locator, combobox: string | RegExp, option: string) {
  await scope.getByRole("combobox", { name: combobox, exact: typeof combobox === "string" }).click();
  await scope.getByRole("option", { name: option, exact: true }).click();
}
