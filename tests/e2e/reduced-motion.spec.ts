import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { menu, uiText } from "../../src/content/index.ts";
import { openReady } from "./helpers.ts";

const lang = "es";
const ids = menu.map((option) => option.id);
const urlEndsWith = (path: string) => new RegExp(`${path}$`);
const optionLink = (page: Page, index: number) =>
  page.getByRole("navigation", { name: uiText.menuLabel[lang] }).getByRole("link").nth(index);
const toggle = (page: Page) => page.getByRole("button", { name: uiText.motionToggleLabel[lang] });

/** Guarda qué propiedades y duraciones usan las animaciones (`Element.animate`). */
async function recordAnimations(page: Page) {
  await page.addInitScript(() => {
    const original = Element.prototype.animate;
    const w = window as unknown as { __props: Set<string>; __durations: number[] };
    w.__props = new Set();
    w.__durations = [];
    Element.prototype.animate = function (keyframes, options) {
      if (Array.isArray(keyframes)) {
        for (const frame of keyframes) {
          for (const key of Object.keys(frame)) {
            if (!["offset", "easing", "composite"].includes(key)) w.__props.add(key);
          }
        }
      }
      if (options && typeof options === "object" && typeof options.duration === "number") {
        w.__durations.push(options.duration + (typeof options.delay === "number" ? options.delay : 0));
      }
      return original.call(this, keyframes, options);
    };
  });
}

const readAnimations = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __props: Set<string>; __durations: number[] };
    return { props: [...w.__props], durations: w.__durations };
  });

test.describe("movimiento reducido del sistema", () => {
  test.use({ reducedMotion: "reduce" });

  test("el cambio de pantalla no usa barrido ni desplazamientos, solo opacidad corta", async ({ page }) => {
    await recordAnimations(page);
    await openReady(page, `/${lang}`);
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");

    await optionLink(page, 1).click();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.waitForFunction(() => document.getAnimations().length === 0);

    const { props, durations } = await readAnimations(page);
    for (const prop of props) expect(prop, "solo se permite animar la opacidad").toBe("opacity");
    for (const duration of durations) expect(duration, "los fundidos son cortos").toBeLessThanOrEqual(150);
    expect(await page.locator("[data-transition-layer]").evaluate((el) => getComputedStyle(el).display)).toBe("none");
    expect(await page.evaluate(() => performance.getEntriesByName("scene-transition").length)).toBe(0);
  });

  test("conserva el contenido y las acciones: teclado, pestañas y vuelta al menú", async ({ page }) => {
    await openReady(page, `/${lang}/${ids[1]}`);
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[2]}`));
    await page.getByRole("button", { name: uiText.tabPrevious[lang] }).click();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(urlEndsWith(`/${lang}`));
  });

  test("el interruptor aparece activado y deshabilitado, con su nota", async ({ page }) => {
    await openReady(page, `/${lang}`);
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
    await expect(toggle(page)).toBeDisabled();
    await expect(toggle(page)).toHaveAccessibleDescription(uiText.motionLockedBySystem[lang]);
  });
});

test.describe("movimiento reducido elegido en el sitio", () => {
  test("el interruptor activa el modo reducido, anuncia su estado y se recuerda al recargar", async ({ page }) => {
    await openReady(page, `/${lang}`);
    await expect(page.locator("html")).not.toHaveAttribute("data-motion", "reduced");
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");

    await toggle(page).click();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");

    await toggle(page).click();
    await expect(page.locator("html")).not.toHaveAttribute("data-motion", "reduced");
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  });

  test("se opera con el teclado", async ({ page }) => {
    await openReady(page, `/${lang}`);
    await toggle(page).focus();
    await expect(toggle(page)).toBeFocused();
    await page.keyboard.press("Space");
    await expect(page.locator("html")).toHaveAttribute("data-motion", "reduced");
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).not.toHaveAttribute("data-motion", "reduced");
  });

  test("activarlo con la página abierta afecta a la siguiente transición", async ({ page }) => {
    await recordAnimations(page);
    await openReady(page, `/${lang}`);
    await page.waitForTimeout(800);

    await optionLink(page, 1).click();
    await page.waitForFunction(() => performance.getEntriesByName("scene-transition").length > 0);
    const full = await readAnimations(page);
    expect(full.props, "con movimiento completo se anima también el desplazamiento").toContain("transform");

    await toggle(page).click();
    await page.evaluate(() => {
      performance.clearMeasures();
      (window as unknown as { __props: Set<string> }).__props.clear();
    });
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[2]}`));
    await page.waitForFunction(() => document.getAnimations().length === 0);
    const reduced = await readAnimations(page);
    for (const prop of reduced.props) expect(prop).toBe("opacity");
    expect(await page.evaluate(() => performance.getEntriesByName("scene-transition").length)).toBe(0);
  });

  test("con localStorage bloqueado nada se rompe", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      const blocked = () => {
        throw new Error("almacenamiento bloqueado");
      };
      Storage.prototype.getItem = blocked;
      Storage.prototype.setItem = blocked;
    });
    await openReady(page, `/${lang}`);
    await toggle(page).click();
    await optionLink(page, 1).click();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test("sin Web Animations la navegación y el contenido se conservan (FR-025)", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      (Element.prototype as unknown as { animate: unknown }).animate = undefined;
    });
    await openReady(page, `/${lang}`);
    await optionLink(page, 1).click();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[2]}`));
    expect(errors).toEqual([]);
  });
});
