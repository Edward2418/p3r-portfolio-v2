import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { menu, uiText } from "../../src/content/index.ts";
import { openReady } from "./helpers.ts";

// Barrido entre pantallas con el personaje (specs/003-identidad-visual-p3r, historia 3).
const lang = "es";
const ids = menu.map((option) => option.id);
const optionLink = (page: Page, index: number) =>
  page.getByRole("navigation", { name: uiText.menuLabel[lang] }).getByRole("link").nth(index);
const urlEndsWith = (path: string) => new RegExp(`${path}$`);

async function openPrefetched(page: Page, path: string) {
  await openReady(page, path);
  await page.waitForTimeout(800);
  await page.evaluate(() => {
    performance.clearMarks();
    performance.clearMeasures();
  });
}

const waitForTransition = (page: Page) =>
  page.waitForFunction(() => performance.getEntriesByName("scene-transition").length > 0);

/** Antes de iniciar la transición: registra las propiedades animadas del personaje, la señal de ocupado y su caja en cada fase. */
async function observe(page: Page) {
  await page.evaluate(() => {
    interface Probe {
      props: string[];
      busy: boolean[];
      boxes: Record<string, { left: number; height: number }>;
    }
    const w = window as unknown as { __probe: Probe };
    w.__probe = { props: [], busy: [], boxes: {} };
    const character = () => document.querySelector<HTMLElement>("[data-character]")!;
    const layer = document.querySelector<HTMLElement>("[data-transition-layer]")!;

    new MutationObserver(() => w.__probe.busy.push(document.documentElement.hasAttribute("data-scene-busy"))).observe(
      document.documentElement,
      { attributes: true, attributeFilter: ["data-scene-busy"] },
    );
    new MutationObserver(() => {
      const phase = layer.dataset.phase ?? "";
      const rect = character().getBoundingClientRect();
      w.__probe.boxes[phase] = { left: rect.left, height: rect.height };
    }).observe(layer, { attributes: true, attributeFilter: ["data-phase"] });

    const sample = () => {
      for (const animation of character().getAnimations()) {
        const effect = animation.effect as KeyframeEffect | null;
        for (const keyframe of effect?.getKeyframes() ?? []) {
          for (const key of Object.keys(keyframe)) {
            if (!["offset", "easing", "composite", "computedOffset"].includes(key) && !w.__probe.props.includes(key)) {
              w.__probe.props.push(key);
            }
          }
        }
      }
      requestAnimationFrame(sample);
    };
    sample();
  });
}

const probe = (page: Page) =>
  page.evaluate(() => (window as unknown as { __probe: { props: string[]; busy: boolean[]; boxes: Record<string, { left: number; height: number }> } }).__probe);

test.describe("el personaje en la transición", () => {
  // La duración medida depende de la carga de la máquina; se permiten reintentos acotados.
  test.describe.configure({ retries: 2 });

  test("menú → pantalla: el personaje se anima solo con transform y opacity, la señal de ocupado se activa y se apaga y la duración sigue en 500–800 ms", async ({ page }) => {
    await openPrefetched(page, `/${lang}`);
    await observe(page);
    await optionLink(page, 1).click();
    await waitForTransition(page);
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));

    const result = await probe(page);
    const props = result.props.filter((prop) => prop !== "animationName");
    expect(props.sort(), "el personaje solo debe animar transform y opacity").toEqual(["opacity", "transform"]);
    expect(result.busy[0], "la señal data-scene-busy debe activarse al empezar").toBe(true);
    expect(result.busy.at(-1), "la señal data-scene-busy debe apagarse al terminar").toBe(false);
    await expect(page.locator("html")).not.toHaveAttribute("data-scene-busy", /.*/);

    const duration = await page.evaluate(() => performance.getEntriesByName("scene-transition")[0].duration);
    expect(duration, "la transición completa debe durar entre 500 y 800 ms").toBeGreaterThanOrEqual(500);
    expect(duration, "la transición completa debe durar entre 500 y 800 ms").toBeLessThanOrEqual(800);
  });

  test("el cambio de vista no se ve antes de que el barrido cubra la pantalla y al terminar está en su posición de pantalla", async ({ page }) => {
    await openPrefetched(page, `/${lang}`);
    const before = await page.locator("[data-character]").evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { left: rect.left, height: rect.height };
    });
    await observe(page);
    await optionLink(page, 1).click();
    await waitForTransition(page);

    const { boxes } = await probe(page);
    // Durante la salida el personaje sigue donde estaba en el menú.
    expect(Math.abs(boxes.exiting.left - before.left), "durante la salida el personaje no debe moverse").toBeLessThan(2);
    expect(Math.abs(boxes.exiting.height - before.height)).toBeLessThan(2);

    // Al terminar está en la posición de la vista de pantalla.
    const after = await page.locator("[data-character]").evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { left: rect.left, height: rect.height };
    });
    expect(after.left !== before.left || after.height !== before.height, "la posición de pantalla debe ser distinta de la del menú").toBe(true);
    if ((page.viewportSize()?.width ?? 0) >= 1024) {
      expect(after.left, "desde 1024 px Oguri queda a la derecha en las pantallas").toBeGreaterThan(before.left);
    }
  });

  test("Esc vuelve al menú con el personaje en su posición del menú y la opción anterior resaltada", async ({ page }) => {
    await openPrefetched(page, `/${lang}`);
    const menuBox = await page.locator("[data-character]").evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return { left: rect.left, height: rect.height };
    });
    await optionLink(page, 2).click();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[2]}`));
    await page.waitForTimeout(900);
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(urlEndsWith(`/${lang}`));
    await expect(optionLink(page, 2)).toHaveAttribute("aria-current", "true");
    await expect(page.locator("[data-view]").first()).toHaveAttribute("data-view", "menu");
    await expect
      .poll(async () =>
        page.locator("[data-character]").evaluate((el) => {
          const rect = el.getBoundingClientRect();
          return Math.round(rect.left) + ":" + Math.round(rect.height);
        }),
      )
      .toBe(Math.round(menuBox.left) + ":" + Math.round(menuBox.height));
  });

  test("una interrupción deja al personaje en su posición final, sin estado intermedio", async ({ page }) => {
    await openPrefetched(page, `/${lang}`);
    await optionLink(page, 1).click();
    await page.keyboard.press("Shift");
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
    await expect(page.locator("html")).not.toHaveAttribute("data-scene-busy", /.*/);
    const state = await page.locator("[data-character]").evaluate((el) => ({
      animations: el.getAnimations().length,
      transform: getComputedStyle(el).transform,
      opacity: getComputedStyle(el).opacity,
    }));
    expect(state.animations, "no debe quedar ninguna animación en curso").toBe(0);
    expect(state.transform, "el personaje no debe quedar desplazado ni rotado").toBe("none");
    expect(state.opacity).toBe("1");
  });
});

test.describe("movimiento reducido", () => {
  test.use({ reducedMotion: "reduce" });

  test("el personaje no se desplaza: sin animaciones de transform sobre él", async ({ page }) => {
    await openPrefetched(page, `/${lang}`);
    await observe(page);
    await optionLink(page, 1).click();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
    await page.waitForTimeout(600);
    const result = await probe(page);
    expect(result.props, "con movimiento reducido el personaje no debe animarse").toEqual([]);
    await expect(page.locator("[data-character]")).toBeVisible();
  });
});

test.describe("idle durante la transición", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "la pausa del idle se comprueba en Chromium");

  test("el video se pausa durante la transición y se reanuda al terminar", async ({ page }) => {
    await openPrefetched(page, `/${lang}`);
    await page.keyboard.press("a"); // la primera interacción adelanta la carga del idle
    await expect(page.locator("[data-character-root]")).toHaveAttribute("data-idle", "playing", { timeout: 15_000 });
    const paused = () => page.evaluate(() => document.querySelector("video")!.paused);
    expect(await paused(), "antes de la transición el idle debe reproducirse").toBe(false);

    await optionLink(page, 1).click();
    await page.waitForFunction(() => document.documentElement.hasAttribute("data-scene-busy"));
    await expect.poll(paused, { message: "durante la transición el video debe estar pausado" }).toBe(true);

    await waitForTransition(page);
    await expect.poll(paused, { message: "al terminar la transición el video debe reanudarse" }).toBe(false);
  });
});
