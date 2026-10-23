import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { menu, uiText } from "../../src/content/index.ts";
import { openReady } from "./helpers.ts";

// Menú en móvil (specs/003-identidad-visual-p3r, historia 6).
const lang = "es";
const PATHS = ["", ...menu.map((option) => `/${option.id}`)];

const optionLink = (page: Page, index: number) =>
  page.getByRole("navigation", { name: uiText.menuLabel[lang] }).getByRole("link").nth(index);

async function expectNoHorizontalScroll(page: Page) {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, "el ancho del contenido no debe superar el de la ventana").toBeLessThanOrEqual(clientWidth);
}

/** En el centro de cada opción debe verse la propia opción (nunca el personaje ni otra capa). */
async function expectOptionsOnTop(page: Page) {
  for (let index = 0; index < menu.length; index++) {
    const link = optionLink(page, index);
    // Se centra al desplazar: la guía fija ocupa la esquina inferior derecha de la ventana.
    await link.evaluate((element) => element.scrollIntoView({ block: "center" }));
    const box = (await link.boundingBox())!;
    const hit = await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest("a[data-menu-item]") !== null,
      { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    );
    expect(hit, `la opción ${index + 1} debe verse encima del personaje`).toBe(true);
  }
}

test.describe("menú en ancho de móvil", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 768, "solo aplica a anchos de móvil");

  test("las cinco opciones se ven completas, encima del personaje y se pulsan con facilidad", async ({ page }) => {
    await openReady(page, `/${lang}`);
    await expectOptionsOnTop(page);
    const width = page.viewportSize()!.width;
    for (let index = 0; index < menu.length; index++) {
      const box = (await optionLink(page, index).boundingBox())!;
      expect(box.height, `la opción ${index + 1} debe medir al menos 44 px de alto`).toBeGreaterThanOrEqual(44);
      expect(box.width, `la opción ${index + 1} debe ocupar casi todo el ancho`).toBeGreaterThanOrEqual(width * 0.6);
      expect(box.x + box.width, "la opción no debe salirse de la pantalla").toBeLessThanOrEqual(width + 1);
    }
  });

  test("el personaje va atenuado (opacidad máxima 0.5) y sin ocupar espacio", async ({ page }) => {
    await openReady(page, `/${lang}`);
    const opacity = await page.locator("[data-character-root]").evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opacity, "la opacidad del personaje atenuado no debe superar 0.5").toBeLessThanOrEqual(0.5);
    await expect(page.locator("[data-character-root]")).toHaveCSS("position", "fixed");
    await expect(page.locator("[data-character-root]")).toHaveCSS("pointer-events", "none");
  });
});

test.describe("sin desplazamiento horizontal", () => {
  for (const path of PATHS) {
    test(`${path || "menú"}`, async ({ page }) => {
      await openReady(page, `/${lang}${path}`);
      await expectNoHorizontalScroll(page);
    });
  }
});

test.describe("móvil en horizontal (844×390)", () => {
  test.use({ viewport: { width: 844, height: 390 } });

  test("las cinco opciones siguen alcanzables, encima del personaje y sin desplazamiento horizontal", async ({ page }) => {
    await openReady(page, `/${lang}`);
    await expectNoHorizontalScroll(page);
    await expectOptionsOnTop(page);
  });
});

test.describe("ancho mínimo de reflujo (320 px, equivalente a zoom del 200 %)", () => {
  test.use({ viewport: { width: 320, height: 640 } });

  test("el menú y las pantallas siguen siendo utilizables y sin desplazamiento horizontal", async ({ page }) => {
    await openReady(page, `/${lang}`);
    await expectNoHorizontalScroll(page);
    await expectOptionsOnTop(page);
    await optionLink(page, 1).click();
    await expect(page).toHaveURL(new RegExp(`/${lang}/${menu[1].id}$`));
    await expectNoHorizontalScroll(page);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

// --- Quién soy y Stack en anchos estrechos (specs/004-quien-soy-y-stack, historia 4) ---

test.describe("Quién soy y Stack en 320 px y en horizontal", () => {
  for (const viewport of [
    { width: 320, height: 640 },
    { width: 844, height: 390 },
  ]) {
    test.describe(`${viewport.width}×${viewport.height}`, () => {
      test.use({ viewport });

      for (const id of [menu[0].id, menu[1].id]) {
        test(`${id}: sin desplazamiento horizontal y con todo el texto dentro de la ventana`, async ({ page }) => {
          await openReady(page, `/${lang}/${id}`);
          await expectNoHorizontalScroll(page);
          const outside = await page.locator("main").evaluate((main) => {
            const width = window.innerWidth;
            return [...main.querySelectorAll<HTMLElement>("h1, h2, h3, p, li, dt, dd, span")]
              .filter((element) => element.getBoundingClientRect().width > 0)
              .filter((element) => {
                const rect = element.getBoundingClientRect();
                return rect.left < -1 || rect.right > width + 1;
              })
              .map((element) => `${element.tagName}: ${element.textContent?.trim().slice(0, 30)}`);
          });
          expect(outside, "ningún texto debe salirse de la ventana").toEqual([]);
        });
      }
    });
  }
});
