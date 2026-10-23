import type { Page } from "@playwright/test";

/**
 * Abre una ruta y espera a que `SceneShell` haya hidratado y registrado el teclado y los gestos
 * (atributo `data-scene-ready` en `<html>`), para que las pruebas no pulsen teclas antes de tiempo.
 */
export async function openReady(page: Page, path: string) {
  const response = await page.goto(path);
  await page.locator('html[data-scene-ready="true"]').waitFor({ state: "attached" });
  return response;
}
