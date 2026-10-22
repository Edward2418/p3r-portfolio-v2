import { expect, test } from "@playwright/test";
import { uiText } from "../../src/content/index.ts";

// Se ejecuta en cada proyecto de Playwright: 390, 768 y 1280 px de ancho (CA-10, SC-007).
for (const lang of ["es", "en"] as const) {
  test.describe(`diseño en /${lang}`, () => {
    test("no hay desplazamiento horizontal", async ({ page }) => {
      await page.goto(`/${lang}`);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth, "el ancho del contenido no debe superar el de la ventana").toBeLessThanOrEqual(clientWidth);
    });

    test("el selector de idioma es visible y se puede pulsar", async ({ page }) => {
      await page.goto(`/${lang}`);
      const switcher = page.getByRole("link", { name: uiText.switchLanguage[lang] });
      await expect(switcher).toBeVisible();
      await expect(switcher).toBeEnabled();
      const box = await switcher.boundingBox();
      expect(box?.height ?? 0, "el área de toque debe medir al menos 44 px de alto").toBeGreaterThanOrEqual(44);
    });
  });
}
