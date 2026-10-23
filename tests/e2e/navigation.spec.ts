import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { menu, uiText } from "../../src/content/index.ts";
import { openReady } from "./helpers.ts";

const lang = "es";
const ids = menu.map((option) => option.id);
const nav = (page: Page) => page.getByRole("navigation", { name: uiText.menuLabel[lang] });
const optionLink = (page: Page, index: number) => nav(page).getByRole("link").nth(index);
const urlEndsWith = (path: string) => new RegExp(`${path}$`);

test.describe("teclado en el menú", () => {
  test("↓ ↑ Inicio y Fin cambian la opción activa y su foco", async ({ page }) => {
    await openReady(page, `/${lang}`);

    await page.keyboard.press("ArrowDown");
    await expect(optionLink(page, 1)).toHaveAttribute("aria-current", "true");
    await expect(optionLink(page, 1)).toBeFocused();
    await expect(nav(page).locator('[aria-current="true"]')).toHaveCount(1);

    await page.keyboard.press("End");
    await expect(optionLink(page, 4)).toHaveAttribute("aria-current", "true");
    await page.keyboard.press("ArrowDown");
    await expect(optionLink(page, 4)).toHaveAttribute("aria-current", "true");

    await page.keyboard.press("Home");
    await expect(optionLink(page, 0)).toHaveAttribute("aria-current", "true");
    await page.keyboard.press("ArrowUp");
    await expect(optionLink(page, 0)).toHaveAttribute("aria-current", "true");

    await page.keyboard.press("ArrowRight");
    await expect(optionLink(page, 1)).toHaveAttribute("aria-current", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(optionLink(page, 0)).toHaveAttribute("aria-current", "true");
  });

  test("Enter abre la opción activa", async ({ page }) => {
    await openReady(page, `/${lang}`);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
  });

  test("Enter abre la primera opción activa sin haber movido nada", async ({ page }) => {
    await openReady(page, `/${lang}`);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[0]}`));
  });

  test("un clic sobre una opción abre su pantalla", async ({ page }) => {
    await openReady(page, `/${lang}`);
    await optionLink(page, 2).click();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[2]}`));
  });
});

test.describe("teclado en las pantallas", () => {
  test("← y → pasan a la pantalla anterior y siguiente según el orden del menú", async ({ page }) => {
    await openReady(page, `/${lang}/${ids[1]}`);
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[2]}`));
    await page.keyboard.press("ArrowLeft");
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
  });

  test("RePág y AvPág equivalen a L y R", async ({ page }) => {
    await openReady(page, `/${lang}/${ids[1]}`);
    await page.keyboard.press("PageDown");
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[2]}`));
    await page.keyboard.press("PageUp");
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
  });

  test("en los extremos no hay efecto", async ({ page }) => {
    await openReady(page, `/${lang}/${ids[0]}`);
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(300);
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[0]}`));

    await openReady(page, `/${lang}/${ids[4]}`);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(300);
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[4]}`));
  });

  test("Esc vuelve al menú y resalta la opción de la pantalla de la que se vuelve", async ({ page }) => {
    await openReady(page, `/${lang}`);
    await optionLink(page, 1).click();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(urlEndsWith(`/${lang}`));
    await expect(optionLink(page, 1)).toHaveAttribute("aria-current", "true");
  });

  test("las pestañas L y R y el botón Atrás hacen lo mismo que el teclado", async ({ page }) => {
    await openReady(page, `/${lang}/${ids[1]}`);
    await page.getByRole("button", { name: uiText.tabNext[lang] }).click();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[2]}`));
    await page.getByRole("button", { name: uiText.tabPrevious[lang] }).click();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
    await page.getByRole("button", { name: uiText.back[lang] }).click();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}`));
  });

  test("el botón Confirmar abre la opción activa del menú", async ({ page }) => {
    await openReady(page, `/${lang}`);
    await page.keyboard.press("ArrowDown");
    await page.getByRole("button", { name: uiText.confirm[lang] }).click();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
  });

  test("una tecla mantenida (repeat) no encadena transiciones", async ({ page }) => {
    await openReady(page, `/${lang}/${ids[1]}`);
    await page.evaluate(() => {
      for (let i = 0; i < 5; i++) {
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", repeat: true, bubbles: true }));
      }
    });
    await page.waitForTimeout(400);
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
  });
});

test.describe("foco y anuncio tras cambiar de pantalla", () => {
  test("el foco queda en el h1 de la pantalla y, al volver, en la opción activa del menú", async ({ page }) => {
    await openReady(page, `/${lang}`);
    await optionLink(page, 2).click();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[2]}`));
    await expect(page.getByRole("heading", { level: 1 })).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(urlEndsWith(`/${lang}`));
    await expect(optionLink(page, 2)).toBeFocused();
  });

  test("se anuncia el nombre de la pantalla en una región aria-live", async ({ page }) => {
    await openReady(page, `/${lang}`);
    await optionLink(page, 1).click();
    await expect(page.getByRole("status")).toHaveText(`${uiText.screenAnnouncement[lang]}: ${menu[1].name[lang]}`);
  });
});

test.describe("accesos con pocas interacciones", () => {
  for (const id of ["profile", "stack", "projects"] as const) {
    test(`desde la raíz, ${id} se alcanza con un solo clic`, async ({ page }) => {
      await openReady(page, "/");
      await expect(page).toHaveURL(/\/(es|en)$/);
      await page.locator(`nav a[href$="/${id}"]`).click();
      await expect(page).toHaveURL(urlEndsWith(`/${id}`));
    });
  }
});

test("el orden de tabulación del menú es: saltar al contenido, idioma, opciones y Confirmar", async ({ page }) => {
  await openReady(page, `/${lang}`);
  const order: string[] = [];
  for (let i = 0; i < 14; i++) {
    await page.keyboard.press("Tab");
    order.push(
      await page.evaluate(() => {
        const el = document.activeElement;
        return (el?.getAttribute("aria-label") ?? el?.textContent ?? "").trim();
      }),
    );
  }
  const position = (text: string) => order.findIndex((entry) => entry.includes(text));
  const markers = [
    uiText.skipToContent[lang],
    uiText.switchLanguage[lang],
    menu[0].name[lang],
    menu[4].name[lang],
    uiText.confirm[lang],
  ];
  const positions = markers.map(position);
  expect(positions.every((value) => value >= 0), `faltan elementos en el orden: ${JSON.stringify(order)}`).toBe(true);
  expect([...positions].sort((a, b) => a - b), `orden inesperado: ${JSON.stringify(order)}`).toEqual(positions);
});

test.describe("tacto", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "el deslizamiento táctil se prueba con CDP (Chromium)");
  test.use({ hasTouch: true });

  async function swipe(page: Page, from: [number, number], to: [number, number]) {
    const client = await page.context().newCDPSession(page);
    const steps = 8;
    await client.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: from[0], y: from[1] }] });
    for (let step = 1; step <= steps; step++) {
      const x = from[0] + ((to[0] - from[0]) * step) / steps;
      const y = from[1] + ((to[1] - from[1]) * step) / steps;
      await client.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x, y }] });
    }
    await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  }

  test("un toque abre una opción", async ({ page }) => {
    await openReady(page, `/${lang}`);
    await optionLink(page, 3).tap();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[3]}`));
  });

  test("un deslizamiento horizontal pasa de pantalla y uno vertical no", async ({ page }) => {
    await openReady(page, `/${lang}/${ids[1]}`);
    const { width, height } = page.viewportSize()!;
    const midY = Math.round(height / 2);

    await swipe(page, [Math.round(width * 0.75), midY], [Math.round(width * 0.25), midY]);
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[2]}`));

    await swipe(page, [Math.round(width * 0.25), midY], [Math.round(width * 0.75), midY]);
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));

    await swipe(page, [Math.round(width * 0.5), Math.round(height * 0.7)], [Math.round(width * 0.5), Math.round(height * 0.2)]);
    await page.waitForTimeout(300);
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
  });

  test("un deslizamiento que empieza en el borde se ignora", async ({ page }) => {
    await openReady(page, `/${lang}/${ids[1]}`);
    const { width, height } = page.viewportSize()!;
    await swipe(page, [6, Math.round(height / 2)], [Math.round(width * 0.6), Math.round(height / 2)]);
    await page.waitForTimeout(300);
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
  });

  test("las pestañas L y R funcionan con un toque", async ({ page }) => {
    await openReady(page, `/${lang}/${ids[1]}`);
    await page.getByRole("button", { name: uiText.tabNext[lang] }).tap();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[2]}`));
  });
});
