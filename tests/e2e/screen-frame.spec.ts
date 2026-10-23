import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { menu } from "../../src/content/index.ts";
import { screenName } from "../../src/lib/scene/titles.ts";
import { openReady } from "./helpers.ts";

// Marco común de las pantallas internas (specs/003-identidad-visual-p3r, historia 5).
const lang = "es";
const NAVY = "rgb(7, 18, 74)";

const isWide = (page: Page) => (page.viewportSize()?.width ?? 0) >= 1024;

for (const option of menu) {
  test.describe(`pantalla ${option.id}`, () => {
    test("tiene cabecera con el nombre, panel de contenido y la vista de pantalla", async ({ page }) => {
      await openReady(page, `/${lang}/${option.id}`);
      await expect(page.locator("[data-view]").first()).toHaveAttribute("data-view", "screen");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(screenName(option.id, lang));
      const panel = page.locator("main[data-scene]");
      await expect(panel).toBeVisible();
      await expect(panel).toHaveCSS("background-color", NAVY);
    });

    test("el personaje no se superpone al contenido: a un lado en ancho, detrás y atenuado en estrecho", async ({ page }) => {
      await openReady(page, `/${lang}/${option.id}`);
      const panel = await page.locator("main[data-scene]").boundingBox();
      const character = await page.locator("[data-character]").boundingBox();
      expect(panel && character, "el panel y el personaje deben tener caja").toBeTruthy();

      if (isWide(page)) {
        // Desde 1024 px Oguri queda a la derecha y fuera del panel.
        expect(character!.x, "Oguri debe empezar a la derecha del panel").toBeGreaterThanOrEqual(panel!.x + panel!.width);
        await expect(page.locator("[data-character-root]")).toHaveCSS("opacity", "1");
      } else {
        // Por debajo de 1024 px va detrás del panel y atenuado (opacidad máxima 0.5).
        const opacity = await page.locator("[data-character-root]").evaluate((el) => Number(getComputedStyle(el).opacity));
        expect(opacity, "la opacidad del personaje atenuado no debe superar 0.5").toBeLessThanOrEqual(0.5);
      }

      // El título nunca queda cubierto por el personaje.
      const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
      const hit = await page.evaluate(
        ({ x, y }) => document.elementFromPoint(x, y)?.closest("h1") !== null,
        { x: heading!.x + heading!.width / 2, y: heading!.y + heading!.height / 2 },
      );
      expect(hit, "el título debe ser lo que se ve en su posición").toBe(true);
    });
  });
}

test("con L/R el marco se conserva y solo cambia el nombre", async ({ page }) => {
  await openReady(page, `/${lang}/${menu[1].id}`);
  const frame = await page.locator("main[data-scene]").evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.keyboard.press("ArrowRight");
  await expect(page).toHaveURL(new RegExp(`/${lang}/${menu[2].id}$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(screenName(menu[2].id, lang));
  await expect(page.locator("[data-view]").first()).toHaveAttribute("data-view", "screen");
  await expect(page.locator("main[data-scene]")).toHaveCSS("background-color", frame);
});

test("el pie con el aviso queda visible y no queda tapado por el personaje", async ({ page }) => {
  await openReady(page, `/${lang}/${menu[3].id}`);
  const footer = page.locator("[data-footer]");
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeVisible();
  const box = await footer.boundingBox();
  const hit = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.closest("[data-footer]") !== null,
    { x: box!.x + 8, y: box!.y + box!.height / 2 },
  );
  expect(hit, "el aviso debe verse sobre el personaje").toBe(true);
});
