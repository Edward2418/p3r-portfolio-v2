import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { menu, profile, uiText } from "../../src/content/index.ts";
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
