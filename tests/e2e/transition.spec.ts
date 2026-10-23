import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { menu, uiText } from "../../src/content/index.ts";
import { openReady } from "./helpers.ts";

const lang = "es";
const ids = menu.map((option) => option.id);
const optionLink = (page: Page, index: number) =>
  page.getByRole("navigation", { name: uiText.menuLabel[lang] }).getByRole("link").nth(index);
const urlEndsWith = (path: string) => new RegExp(`${path}$`);

/** Abre una ruta, espera a que se precarguen las rutas vecinas y limpia las marcas de rendimiento. */
async function openPrefetched(page: Page, path: string) {
  await openReady(page, path);
  await page.waitForTimeout(800);
  await clearMarks(page);
}

async function clearMarks(page: Page) {
  await page.evaluate(() => {
    performance.clearMarks();
    performance.clearMeasures();
  });
}

/** Espera a que termine una transición completa (la medida `scene-transition` existe). */
async function waitForTransition(page: Page) {
  await page.waitForFunction(() => performance.getEntriesByName("scene-transition").length > 0);
}

/** Registra todas las fases de la capa (y cuántas fichas se animan al entrar) antes de iniciar la transición. */
async function observePhases(page: Page) {
  await page.evaluate(() => {
    const layer = document.querySelector<HTMLElement>("[data-transition-layer]")!;
    const w = window as unknown as { __phases: string[]; __animatedAtEnter: number };
    w.__phases = [];
    w.__animatedAtEnter = -1;
    new MutationObserver(() => {
      const phase = layer.dataset.phase ?? "";
      w.__phases.push(phase);
      if (phase === "entering") {
        w.__animatedAtEnter = [...document.querySelectorAll("[data-stagger]")].filter(
          (element) => element.getAnimations().length > 0,
        ).length;
      }
    }).observe(layer, { attributes: true, attributeFilter: ["data-phase"] });
  });
}

const markTime = (page: Page, name: string) =>
  page.evaluate((markName) => performance.getEntriesByName(markName)[0]?.startTime ?? null, name);

test.describe("transición de escena", () => {
  // La duración medida depende de la carga de la máquina: con varios navegadores en paralelo una
  // transición puede tardar más. Se permiten reintentos acotados solo en esta prueba.
  test.describe.configure({ retries: 2 });

  test("dura entre 500 y 800 ms y reproduce los tramos en orden", async ({ page }) => {
    await openPrefetched(page, `/${lang}`);
    await optionLink(page, 1).click();
    await waitForTransition(page);

    const duration = await page.evaluate(() => performance.getEntriesByName("scene-transition")[0].duration);
    expect(duration, "la transición completa debe durar entre 500 y 800 ms").toBeGreaterThanOrEqual(500);
    expect(duration, "la transición completa debe durar entre 500 y 800 ms").toBeLessThanOrEqual(800);

    const wipe = await markTime(page, "scene-transition:wipe-out");
    const enter = await markTime(page, "scene-transition:enter");
    const hold = await markTime(page, "scene-transition:hold");
    const circle = await markTime(page, "scene-transition:circle");
    for (const mark of [wipe, enter, hold, circle]) expect(mark).not.toBeNull();
    expect(wipe!).toBeLessThan(enter!);
    expect(enter!).toBeLessThan(hold!);
    expect(hold!).toBeLessThan(circle!);
  });

  test("usa una capa decorativa, recorre las fases en orden y deja todo en reposo al terminar", async ({ page }) => {
    await openPrefetched(page, `/${lang}`);
    await observePhases(page);
    await expect(page.locator("[data-transition-layer]")).toHaveAttribute("aria-hidden", "true");
    await optionLink(page, 2).click();
    await waitForTransition(page);

    const phases = await page.evaluate(() => (window as unknown as { __phases: string[] }).__phases);
    expect(phases, "las fases deben ser: salida, navegación, entrada, cierre y reposo").toEqual([
      "exiting",
      "navigating",
      "entering",
      "closing",
      "idle",
    ]);
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[2]}`));
    await expect(page.locator("[data-transition-layer]")).toHaveAttribute("data-phase", "idle");
    await expect(page.locator("[data-transition-layer]")).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });

  test("la entrada escalona las fichas de la pantalla nueva", async ({ page }) => {
    await openPrefetched(page, `/${lang}`);
    await observePhases(page);
    await optionLink(page, 3).click();
    await waitForTransition(page);
    const animated = await page.evaluate(
      () => (window as unknown as { __animatedAtEnter: number }).__animatedAtEnter,
    );
    expect(animated, "las fichas de la pantalla deben estar animándose al empezar la entrada").toBeGreaterThan(0);
  });

  test("también se reproduce al pasar de pantalla con el teclado y al volver con Esc", async ({ page }) => {
    await openPrefetched(page, `/${lang}/${ids[1]}`);
    await page.keyboard.press("ArrowRight");
    await waitForTransition(page);
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[2]}`));

    await clearMarks(page);
    await page.keyboard.press("Escape");
    await waitForTransition(page);
    await expect(page).toHaveURL(urlEndsWith(`/${lang}`));
  });

  test("el botón Atrás del navegador reproduce solo la entrada, sin la salida", async ({ page }) => {
    await openPrefetched(page, `/${lang}`);
    await optionLink(page, 1).click();
    await waitForTransition(page);

    await clearMarks(page);
    await page.goBack();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}`));
    await page.waitForFunction(() => performance.getEntriesByName("scene-transition:enter").length > 0);
    expect(await markTime(page, "scene-transition:wipe-out")).toBeNull();
    await page.waitForFunction(() => document.getAnimations().length === 0);
  });

  test("solo anima transform y opacity", async ({ page }) => {
    await page.addInitScript(() => {
      const original = Element.prototype.animate;
      const seen = new Set<string>();
      (window as unknown as { __animatedProps: Set<string> }).__animatedProps = seen;
      Element.prototype.animate = function (keyframes, options) {
        if (Array.isArray(keyframes)) {
          for (const frame of keyframes) {
            for (const key of Object.keys(frame)) {
              if (!["offset", "easing", "composite"].includes(key)) seen.add(key);
            }
          }
        }
        return original.call(this, keyframes, options);
      };
    });
    await openPrefetched(page, `/${lang}`);
    await optionLink(page, 1).click();
    await waitForTransition(page);
    const props = await page.evaluate(() => [
      ...(window as unknown as { __animatedProps: Set<string> }).__animatedProps,
    ]);
    expect(props.length, "debe haberse animado algo").toBeGreaterThan(0);
    for (const prop of props) expect(["transform", "opacity"]).toContain(prop);
  });
});

test.describe("fluidez (indicador)", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "el limitador de CPU usa CDP (Chromium)");

  test("cuenta los fotogramas largos durante la transición con la CPU limitada 4×", async ({ page }) => {
    await openPrefetched(page, `/${lang}`);
    const client = await page.context().newCDPSession(page);
    await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.evaluate(() => {
      const w = window as unknown as { __frames: number[]; __stop: boolean };
      w.__frames = [];
      w.__stop = false;
      let last = performance.now();
      const tick = (now: number) => {
        w.__frames.push(now - last);
        last = now;
        if (!w.__stop) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await optionLink(page, 1).click();
    await waitForTransition(page);
    const frames = await page.evaluate(() => {
      const w = window as unknown as { __frames: number[]; __stop: boolean };
      w.__stop = true;
      return w.__frames;
    });
    await client.send("Emulation.setCPUThrottlingRate", { rate: 1 });

    const long = frames.filter((delta) => delta > 50).length;
    test.info().annotations.push({
      type: "fotogramas largos (> 50 ms) con CPU 4×",
      description: `${long} de ${frames.length}`,
    });
    expect(frames.length).toBeGreaterThan(0);
  });
});
