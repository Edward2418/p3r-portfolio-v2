import { expect, test } from "@playwright/test";
import { uiText } from "../../src/content/index.ts";

type Lang = "es" | "en";

const switchName: Record<Lang, string> = {
  es: uiText.switchLanguage.es,
  en: uiText.switchLanguage.en,
};

/** Textos de interfaz que difieren entre idiomas: si uno se cuela en la página equivocada, es un error. */
function leakedTexts(visible: string, otherLang: Lang): string[] {
  return Object.values(uiText)
    .filter((text) => text.es !== text.en)
    .map((text) => text[otherLang])
    .filter((text) => visible.includes(text));
}

test.describe("selector de idioma", () => {
  test.use({ locale: "es-MX" });

  test("cambia de /es a /en y actualiza todos los textos", async ({ page }) => {
    await page.goto("/es");
    await page.getByRole("link", { name: switchName.es }).click();

    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 2, name: uiText.sectionProjects.en })).toBeVisible();
    expect(leakedTexts(await page.locator("body").innerText(), "es")).toEqual([]);
  });

  test("cambia de /en a /es y actualiza todos los textos", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("link", { name: switchName.en }).click();

    await expect(page).toHaveURL(/\/es$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    await expect(page.getByRole("heading", { level: 2, name: uiText.sectionProjects.es })).toBeVisible();
    expect(leakedTexts(await page.locator("body").innerText(), "en")).toEqual([]);
  });

  test("tras cambiar, la raíz abre el idioma elegido aunque el navegador esté en otro", async ({ page }) => {
    await page.goto("/es");
    await page.getByRole("link", { name: switchName.es }).click();
    await expect(page).toHaveURL(/\/en$/);

    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
    await page.reload();
    await expect(page).toHaveURL(/\/en$/);
  });

  test("la ruta explícita manda sobre la cookie", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "lang", value: "en", url: baseURL! }]);
    await page.goto("/es");
    await expect(page).toHaveURL(/\/es$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
  });

  test("se opera solo con teclado y tiene foco visible", async ({ page }) => {
    await page.goto("/es");
    await page.keyboard.press("Tab"); // enlace "Saltar al contenido"
    await page.keyboard.press("Tab"); // selector de idioma
    const switcher = page.getByRole("link", { name: switchName.es });
    await expect(switcher).toBeFocused();
    await expect(switcher).toHaveCSS("outline-style", "solid");
    await expect(switcher).toHaveCSS("outline-width", "2px");

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/en$/);
  });

  test("con las cookies bloqueadas el idioma sigue funcionando por la ruta", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Document.prototype, "cookie", { get: () => "", set: () => {} });
    });
    await page.goto("/es");
    await page.getByRole("link", { name: switchName.es }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("cambiar de idioma varias veces seguidas no rompe la página", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    await page.goto("/es");
    for (const [from, to] of [["es", "en"], ["en", "es"], ["es", "en"], ["en", "es"]] as const) {
      await page.getByRole("link", { name: switchName[from] }).click();
      await expect(page).toHaveURL(new RegExp(`/${to}$`));
    }
    await expect(page.locator("html")).toHaveAttribute("lang", "es");
    expect(errors).toEqual([]);
  });
});
