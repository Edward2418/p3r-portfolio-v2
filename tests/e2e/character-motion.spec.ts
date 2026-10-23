import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { menu, uiText } from "../../src/content/index.ts";
import { openReady } from "./helpers.ts";

// Correcciones de la revisión de animaciones de la fase 3 (specs/003-identidad-visual-p3r/research.md, R10).
const lang = "es";
const IDLE = /idle\.webm/;
const root = (page: Page) => page.locator("[data-character-root]");
const optionLink = (page: Page, index: number) =>
  page.getByRole("navigation", { name: uiText.menuLabel[lang] }).getByRole("link").nth(index);
const videoPaused = (page: Page) => page.evaluate(() => document.querySelector("video")!.paused);

/** Pone a reproducir el idle en el menú: la primera interacción adelanta su carga. */
async function startIdle(page: Page) {
  await openReady(page, `/${lang}`);
  await page.keyboard.press("a");
  await expect(root(page)).toHaveAttribute("data-idle", "playing", { timeout: 15_000 });
  await expect(root(page)).toHaveAttribute("data-video", "on");
}

test.describe("entrada de Oguri al omitir el splash", () => {
  test("anima su entrada en el momento de omitirlo en lugar de aparecer de golpe", async ({ page }) => {
    // Sin marcar el splash como visto: se muestra y se omite con una tecla a mitad.
    await page.goto(`/${lang}`);
    await page.locator('html[data-scene-ready="true"]').waitFor({ state: "attached" });
    await page.waitForTimeout(300);
    await page.evaluate(() => {
      const w = window as unknown as { __samples: [number, number][]; __skippedAt: number };
      w.__samples = [];
      const character = document.querySelector<HTMLElement>("[data-character]")!;
      const tick = () => {
        w.__samples.push([performance.now(), Number(getComputedStyle(character).opacity)]);
        if (w.__samples.length < 400) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.evaluate(() => ((window as unknown as { __skippedAt: number }).__skippedAt = performance.now()));
    await page.keyboard.press("a"); // omite el splash
    await page.waitForTimeout(900);

    const { samples, skippedAt } = await page.evaluate(() => {
      const w = window as unknown as { __samples: [number, number][]; __skippedAt: number };
      return { samples: w.__samples, skippedAt: w.__skippedAt };
    });
    const after = samples.filter(([time]) => time > skippedAt);
    const mid = after.filter(([, opacity]) => opacity > 0.05 && opacity < 0.95);
    expect(mid.length, "la entrada debe verse animada (varios cuadros intermedios), no aparecer de golpe").toBeGreaterThanOrEqual(3);
    expect(after.at(-1)![1], "al terminar Oguri debe estar totalmente visible").toBeGreaterThanOrEqual(0.99);
  });

  test("con el splash completo la entrada no se repite al cerrarse solo", async ({ page }) => {
    await page.goto(`/${lang}`);
    await page.locator('html[data-scene-ready="true"]').waitFor({ state: "attached" });
    // La animación empieza a 1.2 s y dura 0.3 s; el splash se cierra solo a 1.5 s.
    await page.waitForTimeout(1750);
    const opacity = await page.locator("[data-character]").evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opacity, "Oguri debe seguir visible (sin reiniciar la entrada) cuando el splash termina").toBeGreaterThanOrEqual(0.99);
  });
});

test.describe("idle solo en el menú", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "la reproducción del idle se comprueba en Chromium");

  test("entrando directo a una pantalla de lectura no se descarga el video", async ({ page }) => {
    const urls: string[] = [];
    page.on("request", (request) => urls.push(request.url()));
    await openReady(page, `/${lang}/${menu[1].id}`);
    await page.keyboard.press("a");
    await page.waitForTimeout(5000);
    expect(urls.filter((url) => IDLE.test(url)), "no debe pedirse idle.webm en una pantalla de lectura").toEqual([]);
    await expect(root(page)).toHaveAttribute("data-idle", "pending");
  });

  test("en una pantalla el video queda pausado y oculto, y al volver al menú se reanuda", async ({ page }) => {
    await startIdle(page);
    await optionLink(page, 1).click();
    await expect(page).toHaveURL(new RegExp(`/${lang}/${menu[1].id}$`));
    await expect.poll(() => videoPaused(page), { message: "en la pantalla el video debe estar pausado" }).toBe(true);
    await expect(root(page)).toHaveAttribute("data-video", "off");

    await page.waitForTimeout(900);
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(new RegExp(`/${lang}$`));
    await expect.poll(() => videoPaused(page), { timeout: 10_000, message: "al volver al menú el video debe reanudarse" }).toBe(false);
    await expect(root(page)).toHaveAttribute("data-video", "on");
  });
});

test.describe("bucle del idle con fundido", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "la reproducción del idle se comprueba en Chromium");

  test("no usa el bucle nativo: al terminar se funde a la imagen fija y vuelve", async ({ page }) => {
    await startIdle(page);
    expect(await page.evaluate(() => document.querySelector("video")!.loop), "el bucle nativo debe estar desactivado").toBe(false);

    await page.evaluate(() => {
      const w = window as unknown as { __states: string[] };
      w.__states = [];
      const layer = document.querySelector("[data-character-root]")!;
      new MutationObserver(() => w.__states.push(layer.getAttribute("data-video") ?? "")).observe(layer, {
        attributes: true,
        attributeFilter: ["data-video"],
      });
      const video = document.querySelector("video")!;
      video.currentTime = video.duration - 0.25; // salta cerca del final para no esperar 10 s
    });

    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __states: string[] }).__states.join(",")), {
        message: "data-video debe pasar por off (imagen fija) y volver a on",
        timeout: 8000,
      })
      .toMatch(/off,on$/);
    expect(await page.evaluate(() => document.querySelector("video")!.currentTime), "el video debe reiniciarse desde el principio").toBeLessThan(2);
  });
});

test.describe("movimiento reducido en marcha", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "la reproducción del idle se comprueba en Chromium");

  test("el video se funde a la imagen fija en lugar de desmontarse de golpe", async ({ page }) => {
    await startIdle(page);
    await page.evaluate(() => document.documentElement.setAttribute("data-motion", "reduced"));
    await expect(root(page)).toHaveAttribute("data-video", "off");
    await expect(page.locator("video")).toHaveCount(1); // sigue montado: se oculta con un fundido
    await expect.poll(() => videoPaused(page)).toBe(true);
    const duration = await page.locator("video").evaluate((el) => getComputedStyle(el).transitionDuration);
    expect(duration, "el fundido del video con movimiento reducido dura --duration-reduced (120 ms)").toBe("0.12s");
  });
});
