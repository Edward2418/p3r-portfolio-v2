import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { menu, stack, stackCenterLabel, uiText } from "../../src/content/index.ts";
import { screenName, screenTitle } from "../../src/lib/scene/titles.ts";
import { openReady } from "./helpers.ts";

// Accesibilidad de Quién soy y Stack (specs/004-quien-soy-y-stack, historia 4; contracts/*.md).
const LANGS = ["es", "en"] as const;
const [profileId, stackId] = [menu[0].id, menu[1].id];

/** Comprueba que los textos aparecen en el árbol de accesibilidad en ese orden. */
function expectInOrder(snapshot: string, tokens: string[]) {
  let from = 0;
  for (const token of tokens) {
    const at = snapshot.indexOf(token, from);
    expect(at, `"${token}" debe aparecer en el árbol de accesibilidad después de la posición ${from}`).toBeGreaterThanOrEqual(0);
    from = at + token.length;
  }
}

const headingLevels = (page: Page) =>
  page.locator("main").evaluate((main) => [...main.querySelectorAll("h1, h2, h3, h4")].map((h) => Number(h.tagName[1])));

for (const lang of LANGS) {
  test.describe(`accesibilidad en /${lang}`, () => {
    test("Stack se lee como Full-Stack, cada categoría y cada tecnología con su nivel, en orden", async ({ page }) => {
      await openReady(page, `/${lang}/${stackId}`);
      const snapshot = await page.locator("main").ariaSnapshot();
      const tokens = [stackCenterLabel[lang]];
      for (const category of stack) {
        tokens.push(category.name[lang]);
        for (const tech of category.technologies) tokens.push(tech.name, `${uiText.level[lang]}: ${tech.level}/5`);
      }
      expectInOrder(snapshot, tokens);
    });

    test("Quién soy se lee como ficha con lista de definición y trayectoria como lista ordenada con Actual y Meta", async ({ page }) => {
      await openReady(page, `/${lang}/${profileId}`);
      const snapshot = await page.locator("main").ariaSnapshot();
      expectInOrder(snapshot, [
        uiText.profileInstitution[lang],
        uiText.profileSemester[lang],
        uiText.sectionTrajectory[lang],
        uiText.trajectoryCurrent[lang],
        uiText.trajectoryGoal[lang],
      ]);
      await expect(page.locator("main dl")).toHaveCount(1);
      await expect(page.locator("main ol")).toHaveCount(1);
    });

    for (const id of [profileId, stackId]) {
      test(`${id}: la jerarquía de encabezados no salta de nivel y no hay controles interactivos nuevos`, async ({ page }) => {
        await openReady(page, `/${lang}/${id}`);
        const levels = await headingLevels(page);
        expect(levels[0], "el primer encabezado debe ser el h1").toBe(1);
        levels.slice(1).forEach((level, index) => {
          expect(level - levels[index], `salto de nivel de encabezado: ${levels.join(",")}`).toBeLessThanOrEqual(1);
        });
        const focusable = await page
          .locator("main")
          .evaluate((main) => main.querySelectorAll('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])').length);
        expect(focusable, "el contenido de la pantalla no debe añadir paradas de tabulación").toBe(0);
      });
    }

    test("al llegar con R el foco queda en el h1 y se anuncia el título de la pantalla", async ({ page }) => {
      await openReady(page, `/${lang}/${profileId}`);
      await page.waitForTimeout(800);
      await page.keyboard.press("ArrowRight");
      await expect(page).toHaveURL(new RegExp(`/${lang}/${stackId}$`));
      await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(screenName(stackId, lang));
      await expect(page.getByRole("alert")).toHaveText(screenTitle(stackId, lang));
    });
  });
}
