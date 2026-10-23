import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { menu, uiText } from "../../src/content/index.ts";
import { openReady } from "./helpers.ts";

const LANGS = ["es", "en"] as const;
const ids = menu.map((option) => option.id);
const guide = (page: Page) => page.locator("[data-guide]");
const button = (page: Page, name: string) => guide(page).getByRole("button", { name });

/** La guía y sus botones están dentro de la ventana y en el cuadrante inferior derecho. */
async function expectBottomRight(page: Page) {
  const viewport = page.viewportSize()!;
  const box = (await guide(page).boundingBox())!;
  expect(box.x + box.width, "no debe salir por la derecha").toBeLessThanOrEqual(viewport.width + 0.5);
  expect(box.y + box.height, "no debe salir por abajo").toBeLessThanOrEqual(viewport.height + 0.5);
  expect(box.x, "no debe salir por la izquierda").toBeGreaterThanOrEqual(0);
  // Anclada abajo a la derecha: en pantallas estrechas ocupa casi todo el ancho, pero su borde derecho
  // e inferior quedan pegados a la ventana.
  expect(viewport.width - (box.x + box.width), "debe estar anclada a la derecha").toBeLessThanOrEqual(24);
  expect(viewport.height - (box.y + box.height), "debe estar anclada abajo").toBeLessThanOrEqual(24);
  expect(box.y, "debe estar en la mitad inferior").toBeGreaterThan(viewport.height / 2);
}

for (const lang of LANGS) {
  test.describe(`guía y botones en /${lang}`, () => {
    test("en el menú: abajo a la derecha, con la descripción de la opción activa y estados coherentes", async ({ page }) => {
      await openReady(page, `/${lang}`);
      await expect(guide(page)).toBeVisible();
      await expectBottomRight(page);

      await expect(guide(page)).toContainText(menu[0].description[lang]);
      await page.keyboard.press("ArrowDown");
      await expect(guide(page)).toContainText(menu[1].description[lang]);

      await expect(button(page, uiText.back[lang])).toBeDisabled();
      await expect(button(page, uiText.confirm[lang])).toBeEnabled();
      await expect(button(page, uiText.tabPrevious[lang])).toHaveCount(0);
      await expect(button(page, uiText.tabNext[lang])).toHaveCount(0);
    });

    for (const [index, id] of ids.entries()) {
      test(`en ${id}: abajo a la derecha, con la ayuda de la pantalla y estados coherentes`, async ({ page }) => {
        await openReady(page, `/${lang}/${id}`);
        await expect(guide(page)).toBeVisible();
        await expectBottomRight(page);
        await expect(guide(page)).toContainText(uiText.guideScreenHint[lang]);

        await expect(button(page, uiText.back[lang])).toBeEnabled();
        await expect(button(page, uiText.confirm[lang])).toBeDisabled();
        const previous = button(page, uiText.tabPrevious[lang]);
        const next = button(page, uiText.tabNext[lang]);
        await expect(previous).toBeVisible();
        await expect(next).toBeVisible();
        if (index === 0) await expect(previous).toBeDisabled();
        else await expect(previous).toBeEnabled();
        if (index === ids.length - 1) await expect(next).toBeDisabled();
        else await expect(next).toBeEnabled();
      });
    }

    test("al llegar al final de la página no tapa el aviso del pie", async ({ page }) => {
      await openReady(page, `/${lang}/${ids[2]}`);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      const footerText = page.getByRole("contentinfo").locator("p");
      const [footerBox, guideBox] = await Promise.all([footerText.boundingBox(), guide(page).boundingBox()]);
      const overlaps =
        footerBox!.x < guideBox!.x + guideBox!.width &&
        footerBox!.x + footerBox!.width > guideBox!.x &&
        footerBox!.y < guideBox!.y + guideBox!.height &&
        footerBox!.y + footerBox!.height > guideBox!.y;
      expect(overlaps, "la guía no debe cubrir el texto del pie").toBe(false);
    });
  });
}

test("Confirmar abre la opción activa del menú y Atrás vuelve al menú", async ({ page }) => {
  await openReady(page, "/es");
  await page.keyboard.press("ArrowDown");
  await button(page, uiText.confirm.es).click();
  await expect(page).toHaveURL(new RegExp(`/es/${ids[1]}$`));
  await button(page, uiText.back.es).click();
  await expect(page).toHaveURL(/\/es$/);
  await expect(button(page, uiText.back.es)).toBeDisabled();
});
