import { expect, test } from "@playwright/test";
import { characters, contact, menu, profile, projects, stack, trajectory, uiText } from "../../src/content/index.ts";
import { provisionalBadgeCount } from "../../src/lib/stack/layout.ts";

type Lang = "es" | "en";
const LANGS: Lang[] = ["es", "en"];

// Cantidad de bloques de datos marcados como provisionales (FR-012), repartidos entre pantallas.
const provisionalCount =
  [profile, ...trajectory, ...projects, ...characters].filter((item) => item.provisional).length +
  provisionalBadgeCount(stack);

test.describe("idioma inicial según el navegador", () => {
  test.describe("navegador en español", () => {
    test.use({ locale: "es-MX" });
    test("la raíz redirige a /es", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/es$/);
      await expect(page.locator("html")).toHaveAttribute("lang", "es");
    });
  });

  test.describe("navegador en inglés", () => {
    test.use({ locale: "en-US" });
    test("la raíz redirige a /en", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/en$/);
      await expect(page.locator("html")).toHaveAttribute("lang", "en");
    });
  });

  test.describe("navegador en otro idioma", () => {
    test.use({ locale: "fr-FR" });
    test("la raíz redirige a /en", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/en$/);
    });
  });
});

for (const lang of LANGS) {
  test.describe(`menú principal en /${lang}`, () => {
    test("muestra las cinco opciones en orden, la primera activa y los textos en el idioma", async ({ page }) => {
      await page.goto(`/${lang}`);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);

      const nav = page.getByRole("navigation", { name: uiText.menuLabel[lang] });
      const links = nav.getByRole("link");
      await expect(links).toHaveCount(5);
      for (const [index, option] of menu.entries()) {
        await expect(links.nth(index)).toHaveText(option.name[lang]);
        await expect(links.nth(index)).toHaveAttribute("href", `/${lang}/${option.id}`);
      }
      await expect(links.nth(0)).toHaveAttribute("aria-current", "true");
      await expect(nav.locator('[aria-current="true"]')).toHaveCount(1);
    });

    test("muestra el marcador del personaje y el pie con el aviso", async ({ page }) => {
      await page.goto(`/${lang}`);
      await expect(page.locator("[data-character]")).toBeVisible();
      const footer = page.getByRole("contentinfo");
      await expect(footer).toBeVisible();
      await expect(footer).toContainText(lang === "es" ? /no está afiliado/i : /not affiliated/i);
    });

    test("no hace peticiones de audio ni de video (FR-023)", async ({ page }) => {
      const media: string[] = [];
      page.on("request", (request) => {
        if (request.resourceType() === "media") media.push(request.url());
      });
      await page.goto(`/${lang}`);
      await page.goto(`/${lang}/stack`);
      expect(media).toEqual([]);
    });
  });
}

for (const lang of LANGS) {
  test.describe(`pantallas en /${lang}`, () => {
    for (const option of menu) {
      test(`${option.id}: responde, tiene un único h1 y su título`, async ({ page }) => {
        const response = await page.goto(`/${lang}/${option.id}`);
        expect(response?.status()).toBe(200);
        await expect(page.locator("html")).toHaveAttribute("lang", lang);
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(option.name[lang]);
        await expect(page).toHaveTitle(`${option.name[lang]} | ${uiText.siteTitle[lang]}`);
        const footer = page.getByRole("contentinfo");
        await expect(footer).toContainText(lang === "es" ? /no está afiliado/i : /not affiliated/i);
      });
    }

    test("cada pantalla muestra su contenido", async ({ page }) => {
      await page.goto(`/${lang}/profile`);
      await expect(page.getByRole("heading", { level: 2, name: profile.name })).toBeVisible();

      await page.goto(`/${lang}/stack`);
      for (const category of stack) {
        await expect(page.getByRole("heading", { level: 3, name: category.name[lang] })).toBeVisible();
      }

      await page.goto(`/${lang}/projects`);
      await expect(page.getByRole("heading", { level: 3, name: projects[0].title[lang] })).toBeVisible();

      await page.goto(`/${lang}/social-link`);
      for (const character of characters) {
        await expect(page.getByRole("heading", { level: 3, name: character.name })).toBeVisible();
      }

      await page.goto(`/${lang}/system`);
      await expect(page.locator(`a[href="${contact.github}"]`)).toBeVisible();
    });

    test("la cantidad de etiquetas Provisional entre pantallas coincide con los datos", async ({ page }) => {
      let total = 0;
      for (const option of menu) {
        await page.goto(`/${lang}/${option.id}`);
        total += await page.getByText("Provisional", { exact: true }).count();
      }
      expect(total).toBe(provisionalCount);
    });

    test("sin correo, LinkedIn, CV ni demo no hay enlaces ni huecos", async ({ page }) => {
      await page.goto(`/${lang}/system`);
      await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
      await expect(page.locator('a[href*="linkedin"]')).toHaveCount(0);
      const items = page.locator("#contact li");
      for (const text of await items.allInnerTexts()) {
        expect(text.trim()).not.toBe("");
      }
      await page.goto(`/${lang}/projects`);
      await expect(page.getByRole("link", { name: /^Demo$/ })).toHaveCount(0);
    });
  });
}

test("un idioma no soportado en la ruta devuelve 404", async ({ page }) => {
  // /fr no tiene idioma soportado: la redirección lo lleva a /<idioma>/fr, que no existe.
  const response = await page.goto("/fr");
  expect(response?.status()).toBe(404);
});

test("una pantalla inexistente devuelve 404", async ({ page }) => {
  const response = await page.goto("/es/otra-cosa");
  expect(response?.status()).toBe(404);
});
