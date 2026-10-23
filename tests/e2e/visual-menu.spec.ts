import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { menu, uiText } from "../../src/content/index.ts";
import { openReady } from "./helpers.ts";

// Aspecto del menú (specs/003-identidad-visual-p3r, historia 1). Valores de los tokens:
// --color-panel #f4f9ff, --color-navy #07124a, --color-red #e8203a, --color-focus-outer #ffffff.
const PANEL = "rgb(244, 249, 255)";
const NAVY = "rgb(7, 18, 74)";
const RED = "rgb(232, 32, 58)";
const WHITE = "rgb(255, 255, 255)";

const optionLink = (page: Page, lang: "es" | "en", index: number) =>
  page.getByRole("navigation", { name: uiText.menuLabel[lang] }).getByRole("link").nth(index);

for (const lang of ["es", "en"] as const) {
  test.describe(`aspecto del menú en /${lang}`, () => {
    test("el panel muestra el título vertical en el idioma activo", async ({ page }) => {
      await openReady(page, `/${lang}`);
      const title = page.locator("[data-panel-title]");
      await expect(title).toHaveText(uiText.panelTitle[lang]);
      await expect(title).toHaveCSS("writing-mode", "vertical-rl");
    });

    test("las cinco opciones están inclinadas y la activa es blanca con borde rojo", async ({ page }) => {
      await openReady(page, `/${lang}`);
      for (let index = 0; index < menu.length; index++) {
        // La inclinación va en el enlace: el <li> lo anima la entrada escalonada (transform) y no debe pisarla.
        const transform = await optionLink(page, lang, index).evaluate((element) => getComputedStyle(element).transform);
        expect(transform, `la opción ${index + 1} debe estar inclinada`).not.toBe("none");
      }
      await expect(optionLink(page, lang, 0)).toHaveCSS("background-color", PANEL);
      await expect(optionLink(page, lang, 0)).toHaveCSS("border-top-color", RED);
      await expect(optionLink(page, lang, 1)).toHaveCSS("background-color", NAVY);
    });

    test("el resaltado sigue al teclado", async ({ page }) => {
      await openReady(page, `/${lang}`);
      await page.keyboard.press("ArrowDown");
      await expect(optionLink(page, lang, 1)).toHaveAttribute("aria-current", "true");
      await expect(optionLink(page, lang, 1)).toHaveCSS("background-color", PANEL);
      await expect(optionLink(page, lang, 0)).toHaveCSS("background-color", NAVY);
    });

    test("el foco visible usa el anillo doble también sobre la opción activa blanca", async ({ page }) => {
      await openReady(page, `/${lang}`);
      await page.keyboard.press("ArrowDown"); // enfoca la segunda opción con el teclado
      const link = optionLink(page, lang, 1);
      await expect(link).toBeFocused();
      await expect(link).toHaveCSS("outline-color", NAVY);
      const shadow = await link.evaluate((element) => getComputedStyle(element).boxShadow);
      expect(shadow, "el halo exterior del anillo de foco debe ser blanco").toContain(WHITE);
    });

    test("no hay desplazamiento horizontal", async ({ page }) => {
      await openReady(page, `/${lang}`);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth, "el ancho del contenido no debe superar el de la ventana").toBeLessThanOrEqual(clientWidth);
    });
  });
}
