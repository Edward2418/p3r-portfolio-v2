import type { Page } from "@playwright/test";

/**
 * Abre una ruta y espera a que `SceneShell` haya hidratado y registrado el teclado y los gestos
 * (atributo `data-scene-ready` en `<html>`), para que las pruebas no pulsen teclas antes de tiempo.
 */
/** Da la sesión por "splash visto" antes de cargar: las pruebas que no son del splash no deben depender de él. */
export async function markSplashSeen(page: Page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem("splash-seen", "1");
    } catch {
      // Almacenamiento bloqueado: el splash puede mostrarse; las pruebas que lo bloquean lo esperan.
    }
  });
}

export async function openReady(page: Page, path: string) {
  await markSplashSeen(page);
  const response = await page.goto(path);
  await page.locator('html[data-scene-ready="true"]').waitFor({ state: "attached" });
  return response;
}
