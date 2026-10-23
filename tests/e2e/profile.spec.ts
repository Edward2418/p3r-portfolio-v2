import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { menu, profile, trajectory, uiText } from "../../src/content/index.ts";
import { openReady } from "./helpers.ts";

// Pantalla "Quién soy" (specs/004-quien-soy-y-stack, historias 1 y 2).
const LANGS = ["es", "en"] as const;

const sheet = (page: Page) => page.locator('section[aria-labelledby="profile-sheet-title"]');

for (const lang of LANGS) {
  test.describe(`ficha de Quién soy en /${lang}`, () => {
    test("el h1 recibe el foco al llegar desde el menú", async ({ page }) => {
      await openReady(page, `/${lang}`);
      await page.getByRole("navigation").getByRole("link").nth(0).click();
      await expect(page).toHaveURL(new RegExp(`/${lang}/${menu[0].id}$`));
      await expect(page.getByRole("heading", { level: 1 })).toBeFocused();
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(menu[0].name[lang]);
    });

    test("la ficha muestra el nombre, el titular y la especialidad", async ({ page }) => {
      await openReady(page, `/${lang}/${menu[0].id}`);
      await expect(sheet(page).getByRole("heading", { level: 2 })).toHaveText(profile.name);
      await expect(sheet(page)).toContainText(profile.headline[lang]);
      await expect(sheet(page)).toContainText(profile.specialty[lang]);
    });

    test("institución y semestre van en una lista de definición con sus términos traducidos", async ({ page }) => {
      await openReady(page, `/${lang}/${menu[0].id}`);
      const list = sheet(page).locator("dl");
      await expect(list).toHaveCount(1);
      await expect(list.locator("dt")).toHaveText([uiText.profileInstitution[lang], uiText.profileSemester[lang]]);
      await expect(list.locator("dd")).toHaveText([profile.institution[lang], profile.semester[lang]]);
    });

    test("la presentación está en el idioma activo", async ({ page }) => {
      await openReady(page, `/${lang}/${menu[0].id}`);
      await expect(sheet(page)).toContainText(profile.summary[lang]);
    });

    test("la etiqueta Provisional aparece junto al titular mientras el perfil sea provisional", async ({ page }) => {
      await openReady(page, `/${lang}/${menu[0].id}`);
      const headline = sheet(page).locator("[data-headline]");
      await expect(headline).toContainText(uiText.provisional[lang]);
      expect(profile.provisional, "el perfil debe seguir siendo provisional hasta que Edward lo confirme").toBe(true);
    });

    test("no se publican el apellido completo ni el año de titulación", async ({ page }) => {
      await openReady(page, `/${lang}/${menu[0].id}`);
      const text = await page.locator("main").innerText();
      expect(text, "no debe aparecer el apellido completo").not.toMatch(/Bustos/);
      expect(text, "no debe aparecer el año de titulación previsto").not.toMatch(/2027/);
    });
  });
}

// --- Trayectoria (historia 2) ---

const trajectorySection = (page: Page) => page.locator('section[aria-labelledby="trajectory-title"]');

for (const lang of LANGS) {
  test.describe(`trayectoria de Quién soy en /${lang}`, () => {
    test("es una lista ordenada con los cinco hitos en orden cronológico", async ({ page }) => {
      await openReady(page, `/${lang}/${menu[0].id}`);
      await expect(trajectorySection(page).getByRole("heading", { level: 2 })).toHaveText(uiText.sectionTrajectory[lang]);
      const items = trajectorySection(page).locator("ol > li");
      await expect(items).toHaveCount(trajectory.length);
      for (const [index, entry] of trajectory.entries()) {
        await expect(items.nth(index)).toContainText(entry.period[lang]);
        await expect(items.nth(index)).toContainText(entry.title[lang]);
        if (entry.description) await expect(items.nth(index)).toContainText(entry.description[lang]);
      }
    });

    test("el hito actual lleva la etiqueta Actual y la meta la etiqueta Meta con contorno punteado", async ({ page }) => {
      await openReady(page, `/${lang}/${menu[0].id}`);
      const current = trajectorySection(page).locator('li[data-kind="current"]');
      const goal = trajectorySection(page).locator('li[data-kind="goal"]');
      await expect(current).toHaveCount(1);
      await expect(goal).toHaveCount(1);
      await expect(current).toContainText(uiText.trajectoryCurrent[lang]);
      await expect(goal).toContainText(uiText.trajectoryGoal[lang]);
      await expect(goal).toHaveCSS("border-left-style", "dashed");
      await expect(current).toHaveCSS("border-left-style", "solid");
    });

    test("la meta no muestra año y es el último hito", async ({ page }) => {
      await openReady(page, `/${lang}/${menu[0].id}`);
      const items = trajectorySection(page).locator("ol > li");
      const last = items.last();
      await expect(last).toHaveAttribute("data-kind", "goal");
      expect(await last.innerText(), "la meta no debe mostrar un año").not.toMatch(/\d{4}/);
    });

    test("todos los hitos muestran la etiqueta Provisional", async ({ page }) => {
      await openReady(page, `/${lang}/${menu[0].id}`);
      const items = trajectorySection(page).locator("ol > li");
      for (let index = 0; index < trajectory.length; index++) {
        await expect(items.nth(index)).toContainText(uiText.provisional[lang]);
      }
    });
  });
}

test("al cambiar de idioma la pantalla se conserva y la trayectoria cambia de idioma", async ({ page }) => {
  await openReady(page, `/es/${menu[0].id}`);
  await expect(trajectorySection(page).getByRole("heading", { level: 2 })).toHaveText(uiText.sectionTrajectory.es);
  await page.getByRole("link", { name: uiText.switchLanguage.es }).click();
  await expect(page).toHaveURL(new RegExp(`/en/${menu[0].id}$`));
  await expect(trajectorySection(page).getByRole("heading", { level: 2 })).toHaveText(uiText.sectionTrajectory.en);
  await expect(trajectorySection(page)).toContainText(trajectory[0].title.en);
});

// --- Datos provisionales y sin huecos (historia 6) ---

for (const lang of LANGS) {
  test(`en /${lang} la cantidad de etiquetas Provisional coincide con los datos provisionales y no hay textos vacíos`, async ({ page }) => {
    await openReady(page, `/${lang}/${menu[0].id}`);
    const expected = (profile.provisional ? 1 : 0) + trajectory.filter((entry) => entry.provisional).length;
    await expect(page.locator("main").getByText(uiText.provisional[lang], { exact: true })).toHaveCount(expected);
    const empty = await page.locator("main").evaluate((main) =>
      [...main.querySelectorAll<HTMLElement>("p, li, dt, dd, h1, h2, h3")]
        .filter((element) => !element.textContent?.trim())
        .map((element) => element.tagName),
    );
    expect(empty, "no debe haber elementos de texto vacíos").toEqual([]);
  });
}
