import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { menu } from "../../src/content/index.ts";
import { openReady } from "./helpers.ts";

// Oguri por pantalla (specs/004-quien-soy-y-stack, historia 5; contracts/character-per-scene.md).
const lang = "es";
const [profileId, stackId] = [menu[0].id, menu[1].id];

const sceneAttribute = (page: Page) => page.locator("[data-view]").first();

const characterBox = (page: Page) =>
  page.locator("[data-character]").evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return { left: rect.left, right: rect.right, height: rect.height };
  });
const tilt = (page: Page) => page.locator("[data-character] > img").evaluate((el) => getComputedStyle(el).transform);

test.describe("atributo data-scene", () => {
  test("publica el identificador de la pantalla y queda vacío en el menú", async ({ page }) => {
    await openReady(page, `/${lang}`);
    await expect(sceneAttribute(page)).toHaveAttribute("data-scene", "");
    await openReady(page, `/${lang}/${profileId}`);
    await expect(sceneAttribute(page)).toHaveAttribute("data-scene", profileId);
    await openReady(page, `/${lang}/${stackId}`);
    await expect(sceneAttribute(page)).toHaveAttribute("data-scene", stackId);
  });
});

test.describe("posición propia por pantalla (desde 1024 px)", () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, "los valores por pantalla se definen desde 1024 px");

  test("Quién soy y Stack difieren en altura e inclinación y Oguri queda a la derecha del panel", async ({ page }) => {
    await openReady(page, `/${lang}/${profileId}`);
    const profileBox = await characterBox(page);
    const profileTilt = await tilt(page);
    const profilePanel = (await page.locator("main[data-scene]").boundingBox())!;

    await openReady(page, `/${lang}/${stackId}`);
    const stackBox = await characterBox(page);
    const stackTilt = await tilt(page);
    const stackPanel = (await page.locator("main[data-scene]").boundingBox())!;

    expect(Math.abs(profileBox.height - stackBox.height), "la altura de Oguri debe diferir entre pantallas").toBeGreaterThan(20);
    expect(profileTilt, "la inclinación de Oguri debe diferir entre pantallas").not.toBe(stackTilt);
    expect(profileBox.left, "en Quién soy Oguri empieza a la derecha del panel").toBeGreaterThanOrEqual(profilePanel.x + profilePanel.width);
    expect(stackBox.left, "en Stack Oguri empieza a la derecha del panel").toBeGreaterThanOrEqual(stackPanel.x + stackPanel.width);
  });

  test("al pasar de una pantalla a otra el cambio de posición no se ve antes de que el barrido cubra la pantalla", async ({ page }) => {
    await openReady(page, `/${lang}/${profileId}`);
    await page.waitForTimeout(800);
    const before = await characterBox(page);
    await page.evaluate(() => {
      const w = window as unknown as { __boxes: Record<string, number> };
      w.__boxes = {};
      const layer = document.querySelector<HTMLElement>("[data-transition-layer]")!;
      new MutationObserver(() => {
        const phase = layer.dataset.phase ?? "";
        w.__boxes[phase] = document.querySelector("[data-character]")!.getBoundingClientRect().height;
      }).observe(layer, { attributes: true, attributeFilter: ["data-phase"] });
    });
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(new RegExp(`/${lang}/${stackId}$`));
    await page.waitForFunction(() => performance.getEntriesByName("scene-transition").length > 0);

    const boxes = await page.evaluate(() => (window as unknown as { __boxes: Record<string, number> }).__boxes);
    expect(Math.abs(boxes.exiting - before.height), "durante la salida Oguri no se ha movido").toBeLessThan(2);
    const after = await characterBox(page);
    expect(Math.abs(after.height - before.height), "al terminar Oguri ya está en la posición de Stack").toBeGreaterThan(20);
  });
});

test.describe("movimiento reducido", () => {
  test.use({ reducedMotion: "reduce" });

  test("al cambiar de pantalla el personaje solo se funde (opacidad), sin desplazarse", async ({ page }) => {
    await openReady(page, `/${lang}/${profileId}`);
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const w = window as unknown as { __props: string[] };
      w.__props = [];
      const character = document.querySelector<HTMLElement>("[data-character]")!;
      const sample = () => {
        for (const animation of character.getAnimations()) {
          for (const keyframe of (animation.effect as KeyframeEffect | null)?.getKeyframes() ?? []) {
            for (const key of Object.keys(keyframe)) {
              if (!["offset", "easing", "composite", "computedOffset"].includes(key) && !w.__props.includes(key)) w.__props.push(key);
            }
          }
        }
        requestAnimationFrame(sample);
      };
      sample();
    });
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(new RegExp(`/${lang}/${stackId}$`));
    await page.waitForTimeout(600);
    const props = await page.evaluate(() => (window as unknown as { __props: string[] }).__props);
    expect(props, "con movimiento reducido el personaje solo debe fundirse").toEqual(["opacity"]);
  });
});
