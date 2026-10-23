import { expect, test } from "@playwright/test";
import { menu, uiText } from "../../src/content/index.ts";

// Se ejecuta en cada proyecto de Playwright: 390, 768 y 1280 px de ancho (SC-011).
const PATHS = ["", ...menu.map((option) => `/${option.id}`)];

for (const lang of ["es", "en"] as const) {
  test.describe(`diseño en /${lang}`, () => {
    for (const path of PATHS) {
      test(`${path || "menú"}: no hay desplazamiento horizontal`, async ({ page }) => {
        await page.goto(`/${lang}${path}`);
        const { scrollWidth, clientWidth } = await page.evaluate(() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        }));
        expect(scrollWidth, "el ancho del contenido no debe superar el de la ventana").toBeLessThanOrEqual(clientWidth);
      });
    }

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
