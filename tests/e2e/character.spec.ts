import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { menu, uiText } from "../../src/content/index.ts";
import { openReady } from "./helpers.ts";

// Personaje y carga diferida del idle (specs/003-identidad-visual-p3r, historia 2).
const lang = "es";
const IDLE = /idle\.webm/;

const dataIdle = (page: Page) => page.locator("[data-character-root]");

/** Evita que el navegador "quede en reposo": el idle no debe pedirse antes de que ocurra. */
async function neverIdle(page: Page) {
  await page.addInitScript(() => {
    window.requestIdleCallback = () => 0;
    window.cancelIdleCallback = () => {};
  });
}

function trackRequests(page: Page) {
  const urls: string[] = [];
  page.on("request", (request) => urls.push(request.url()));
  return urls;
}

test.describe("imagen fija", () => {
  test("el póster es decorativo, tiene dimensiones fijas y no compite con la carga", async ({ page }) => {
    await openReady(page, `/${lang}`);
    const root = dataIdle(page);
    await expect(root).toHaveAttribute("aria-hidden", "true");
    const poster = root.locator("img");
    await expect(poster).toHaveAttribute("width", "540");
    await expect(poster).toHaveAttribute("height", "960");
    await expect(poster).toHaveAttribute("fetchpriority", "low");
    await expect(poster).toHaveAttribute("alt", "");
    await expect(page.locator("[data-character]")).toBeVisible();
  });

  test("no se pide ningún archivo de audio", async ({ page }) => {
    const urls = trackRequests(page);
    await openReady(page, `/${lang}`);
    await page.waitForTimeout(2500);
    expect(urls.filter((url) => url.includes("/audio/")), "no debe haber peticiones a /audio/").toEqual([]);
  });

  test("la animación CSS de entrada existe con movimiento completo", async ({ page }) => {
    await openReady(page, `/${lang}`);
    const name = await page.locator("[data-character]").evaluate((el) => getComputedStyle(el).animationName);
    expect(name).toBe("character-in");
  });

  test.describe("movimiento reducido del sistema", () => {
    test.use({ reducedMotion: "reduce" });
    test("no hay animación de entrada del personaje", async ({ page }) => {
      await openReady(page, `/${lang}`);
      const name = await page.locator("[data-character]").evaluate((el) => getComputedStyle(el).animationName);
      expect(name).toBe("none");
    });
  });
});

test.describe("idle diferido", () => {
  test("el menú responde mientras el idle sigue pendiente y el video no se pide antes del reposo", async ({ page }) => {
    await neverIdle(page);
    const urls = trackRequests(page);
    await openReady(page, `/${lang}`);

    // El menú es utilizable sin esperar al idle.
    await expect(dataIdle(page)).toHaveAttribute("data-idle", "pending");
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("navigation", { name: uiText.menuLabel[lang] }).getByRole("link").nth(1)).toHaveAttribute(
      "aria-current",
      "true",
    );
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/${lang}/${menu[1].id}$`));

    await page.waitForTimeout(2500);
    expect(urls.filter((url) => IDLE.test(url)), "no debe pedirse idle.webm antes del reposo").toEqual([]);
  });

  test("sin interacción no se pide el video en los primeros segundos (no entra en la medición de carga)", async ({ page }) => {
    const urls = trackRequests(page);
    await openReady(page, `/${lang}`);
    await page.waitForTimeout(4000);
    expect(urls.filter((url) => IDLE.test(url)), "no debe pedirse idle.webm sin interacción a los 4 s").toEqual([]);
    await expect(dataIdle(page)).toHaveAttribute("data-idle", "pending");
  });

  test("tras la primera interacción se pide el video y el personaje pasa a idle", async ({ page }) => {
    const request = page.waitForRequest(IDLE, { timeout: 10_000 });
    await openReady(page, `/${lang}`);
    await page.keyboard.press("a");
    await request;
    await expect(dataIdle(page)).toHaveAttribute("data-idle", /^(loading|playing)$/);
  });

  test("sin ninguna interacción el video se pide unos segundos después de cargar", async ({ page, browserName, viewport }) => {
    test.skip(browserName !== "chromium" || viewport?.width !== 1280, "prueba lenta: solo en Chromium a 1280 px");
    const request = page.waitForRequest(IDLE, { timeout: 15_000 });
    await openReady(page, `/${lang}`);
    await request;
  });

  test("con el ahorro de datos activado nunca se pide el video", async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "connection", { value: { saveData: true }, configurable: true });
    });
    const urls = trackRequests(page);
    await openReady(page, `/${lang}`);
    await expect(dataIdle(page)).toHaveAttribute("data-idle", "off", { timeout: 6000 });
    expect(urls.filter((url) => IDLE.test(url)), "no debe pedirse idle.webm con ahorro de datos").toEqual([]);
  });

  test.describe("movimiento reducido del sistema", () => {
    test.use({ reducedMotion: "reduce" });
    test("nunca se pide el video", async ({ page }) => {
      const urls = trackRequests(page);
      await openReady(page, `/${lang}`);
      await page.waitForTimeout(3000);
      await expect(dataIdle(page)).toHaveAttribute("data-idle", "off");
      expect(urls.filter((url) => IDLE.test(url)), "no debe pedirse idle.webm con movimiento reducido").toEqual([]);
    });
  });

  test("con movimiento reducido del sitio nunca se pide el video", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("motion", "reduced"));
    const urls = trackRequests(page);
    await openReady(page, `/${lang}`);
    await page.waitForTimeout(3000);
    await expect(dataIdle(page)).toHaveAttribute("data-idle", "off");
    expect(urls.filter((url) => IDLE.test(url)), "no debe pedirse idle.webm con movimiento reducido").toEqual([]);
  });
});

test.describe("fallos de carga", () => {
  test("si el video falla queda la imagen fija y no hay errores de la página", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route(IDLE, (route) => route.abort());
    await openReady(page, `/${lang}`);
    await page.keyboard.press("a");
    await expect(dataIdle(page)).toHaveAttribute("data-idle", "failed", { timeout: 8000 });
    await expect(dataIdle(page).locator("img")).toBeVisible();
    await expect(dataIdle(page).locator("video")).toHaveCount(0);
    expect(errors, "no debe haber excepciones de la página").toEqual([]);
  });

  test("si el póster falla el menú sigue siendo utilizable", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route(/idle-poster\.webp/, (route) => route.abort());
    await openReady(page, `/${lang}`);
    await page.getByRole("navigation", { name: uiText.menuLabel[lang] }).getByRole("link").nth(2).click();
    await expect(page).toHaveURL(new RegExp(`/${lang}/${menu[2].id}$`));
    expect(errors, "no debe haber excepciones de la página").toEqual([]);
  });
});

test.describe("cambio de idioma", () => {
  test("el personaje sigue visible, sin errores y con la preferencia de sonido conservada", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      if (!localStorage.getItem("sound")) localStorage.setItem("sound", "off");
    });
    await openReady(page, `/${lang}`);
    await page.getByRole("link", { name: uiText.switchLanguage[lang] }).click();
    await expect(page).toHaveURL(/\/en$/);
    await page.locator('html[data-scene-ready="true"]').waitFor({ state: "attached" });
    await expect(page.locator("[data-character]")).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("sound"))).toBe("off");
    expect(errors, "no debe haber excepciones de la página").toEqual([]);
  });
});
