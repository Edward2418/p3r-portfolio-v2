import { expect, test } from "@playwright/test";
import { characters, contact, profile, projects, stack } from "../../src/content/index.ts";

// Cantidad de bloques de datos marcados como provisionales (FR-012).
const provisionalCount =
  [profile, ...projects, ...characters].filter((item) => item.provisional).length +
  stack.flatMap((category) => category.technologies).filter((tech) => tech.provisional).length;

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

for (const lang of ["es", "en"] as const) {
  test.describe(`página inicial en /${lang}`, () => {
    test("muestra el nombre, GitHub y el proyecto", async ({ page }) => {
      await page.goto(`/${lang}`);
      await expect(page.locator("html")).toHaveAttribute("lang", lang);
      await expect(page.getByRole("heading", { level: 1, name: profile.name })).toBeVisible();
      await expect(page.locator(`a[href="${contact.github}"]`)).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 3, name: projects[0].title[lang] }),
      ).toBeVisible();
    });

    test("sin correo, LinkedIn, CV ni demo no hay enlaces ni huecos", async ({ page }) => {
      await page.goto(`/${lang}`);
      await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
      await expect(page.locator('a[href*="linkedin"]')).toHaveCount(0);
      await expect(page.getByRole("link", { name: /^Demo$/ })).toHaveCount(0);
      // Ningún elemento de las listas de contacto queda vacío.
      const items = page.locator("#contact li");
      for (const text of await items.allInnerTexts()) {
        expect(text.trim()).not.toBe("");
      }
    });

    test("la cantidad de etiquetas Provisional coincide con los datos", async ({ page }) => {
      await page.goto(`/${lang}`);
      await expect(page.getByText("Provisional", { exact: true })).toHaveCount(provisionalCount);
    });

    test("el pie muestra el aviso de no afiliación", async ({ page }) => {
      await page.goto(`/${lang}`);
      const footer = page.getByRole("contentinfo");
      await expect(footer).toBeVisible();
      await expect(footer).toContainText(lang === "es" ? /no está afiliado/i : /not affiliated/i);
    });
  });
}

test("un idioma no soportado en la ruta devuelve 404", async ({ page }) => {
  // /fr no tiene idioma soportado: la redirección lo lleva a /<idioma>/fr, que no existe.
  const response = await page.goto("/fr");
  expect(response?.status()).toBe(404);
});
