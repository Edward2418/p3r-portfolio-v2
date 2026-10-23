import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { menu, uiText } from "../../src/content/index.ts";

const lang = "es";
const ids = menu.map((option) => option.id);
const urlEndsWith = (path: string) => new RegExp(`${path}$`);
const splash = (page: Page) => page.locator("[data-splash-layer]");
const menuLinks = (page: Page) =>
  page.getByRole("navigation", { name: uiText.menuLabel[lang] }).getByRole("link");

/** Espera a que React hidrate y el splash registre su escucha de teclado y de clic. */
async function waitReady(page: Page) {
  await page.locator('html[data-scene-ready="true"]').waitFor({ state: "attached" });
}

/**
 * Congela el cierre automático del splash para que las pruebas de "omitir" no dependan de la velocidad
 * de carga de la máquina (con varios navegadores en paralelo el splash podía cerrarse solo antes).
 */
async function freezeSplash(page: Page) {
  await page.addInitScript(() => {
    const style = document.createElement("style");
    style.textContent = "[data-splash-layer]{animation-play-state:paused !important}";
    document.documentElement.append(style);
  });
}

/**
 * Milisegundos que tarda la capa del splash en ocultarse desde que el evento de entrada (tecla o clic)
 * llega a la página; así no se mide la latencia de la herramienta que lo envía.
 */
async function hideTime(page: Page, action: () => Promise<void>) {
  await waitReady(page);
  await page.evaluate(() => {
    const layer = document.querySelector<HTMLElement>("[data-splash-layer]")!;
    const w = window as unknown as { __hiddenAt: number | null; __inputAt: number | null };
    w.__hiddenAt = null;
    w.__inputAt = null;
    for (const type of ["keydown", "click"]) {
      document.addEventListener(type, () => (w.__inputAt ??= performance.now()), true);
    }
    const check = () => {
      const style = getComputedStyle(layer);
      if (w.__hiddenAt === null && (style.visibility === "hidden" || style.display === "none")) {
        w.__hiddenAt = performance.now();
      }
    };
    new MutationObserver(check).observe(document.documentElement, { attributes: true, subtree: true });
    const loop = () => {
      check();
      if (w.__hiddenAt === null) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
  await action();
  await page.waitForFunction(() => (window as unknown as { __hiddenAt: number | null }).__hiddenAt !== null);
  return page.evaluate(() => {
    const w = window as unknown as { __hiddenAt: number; __inputAt: number | null };
    return w.__hiddenAt - (w.__inputAt ?? w.__hiddenAt);
  });
}

test.describe("splash", () => {
  test("aparece en la primera visita y se cierra solo en un máximo de 1.5 s", async ({ page }) => {
    await page.goto(`/${lang}`, { waitUntil: "commit" });
    await expect(splash(page)).toBeVisible();
    const startedAt = Date.now();
    await expect(splash(page)).toBeHidden({ timeout: 4000 });
    const elapsed = Date.now() - startedAt;
    expect(elapsed, "el splash debe cerrarse solo en un máximo de 1.5 s (con margen de la prueba)").toBeLessThan(2000);
    await expect(menuLinks(page).first()).toBeVisible();
  });

  test("la raíz y /en también muestran el splash en la primera visita", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(es|en)$/);
    await expect(splash(page)).toBeVisible();
  });

  test("cualquier tecla lo cierra de inmediato sin activar el menú", async ({ page }) => {
    await freezeSplash(page);
    await page.goto(`/${lang}`);
    await expect(splash(page)).toBeVisible();
    const elapsed = await hideTime(page, () => page.keyboard.press("Enter"));
    expect(elapsed, "debe cerrarse en menos de 150 ms").toBeLessThan(150);
    await page.waitForTimeout(400);
    await expect(page).toHaveURL(urlEndsWith(`/${lang}`));
  });

  test("un clic lo cierra de inmediato sin abrir la opción que tiene debajo", async ({ page }) => {
    await freezeSplash(page);
    await page.goto(`/${lang}`);
    await expect(splash(page)).toBeVisible();
    const link = await menuLinks(page).first().boundingBox();
    const elapsed = await hideTime(page, () =>
      page.mouse.click(link!.x + link!.width / 2, link!.y + link!.height / 2),
    );
    expect(elapsed, "debe cerrarse en menos de 150 ms").toBeLessThan(150);
    await page.waitForTimeout(400);
    await expect(page).toHaveURL(urlEndsWith(`/${lang}`));
  });

  test("tras verlo u omitirlo, recargar no lo muestra de nuevo", async ({ page }) => {
    await freezeSplash(page);
    await page.goto(`/${lang}`);
    await expect(splash(page)).toBeVisible();
    await waitReady(page);
    await page.keyboard.press("x");
    await expect(splash(page)).toBeHidden();

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-splash", "seen");
    await expect(splash(page)).toBeHidden();
    await expect(menuLinks(page).first()).toBeVisible();
  });

  test("recargar mientras se ve el splash tampoco lo repite", async ({ page }) => {
    await freezeSplash(page);
    await page.goto(`/${lang}`);
    await expect(splash(page)).toBeVisible();
    await page.reload();
    await expect(splash(page)).toBeHidden();
  });

  test("una sesión nueva lo vuelve a mostrar", async ({ browser }) => {
    const first = await browser.newContext();
    const firstPage = await first.newPage();
    await firstPage.goto(`/${lang}`);
    await waitReady(firstPage);
    await firstPage.keyboard.press("x");
    await first.close();

    const second = await browser.newContext();
    const secondPage = await second.newPage();
    await secondPage.goto(`/${lang}`);
    await expect(splash(secondPage)).toBeVisible();
    await second.close();
  });

  test("un enlace directo a una pantalla no incluye el splash ni al volver al menú", async ({ page }) => {
    await page.goto(`/${lang}/${ids[2]}`);
    await expect(splash(page)).toHaveCount(0);
    await expect(page.locator("html")).toHaveAttribute("data-splash", "seen");

    await page.locator('html[data-scene-ready="true"]').waitFor({ state: "attached" });
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(urlEndsWith(`/${lang}`));
    await expect(splash(page)).toBeHidden();
  });

  test("una navegación interna al menú nunca lo muestra", async ({ page }) => {
    await freezeSplash(page);
    await page.goto(`/${lang}`);
    await waitReady(page);
    await page.keyboard.press("x");
    await expect(splash(page)).toBeHidden();
    await page.locator('html[data-scene-ready="true"]').waitFor({ state: "attached" });
    await menuLinks(page).nth(1).click();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(urlEndsWith(`/${lang}`));
    await expect(splash(page)).toBeHidden();
  });

  test("el HTML del menú ya está en el documento mientras se ve el splash", async ({ page }) => {
    await page.goto(`/${lang}`);
    await expect(splash(page)).toBeVisible();
    await expect(menuLinks(page)).toHaveCount(5);
  });
});

test.describe("splash con movimiento reducido", () => {
  test.use({ reducedMotion: "reduce" });

  test("no aparece", async ({ page }) => {
    await page.goto(`/${lang}`);
    await expect(splash(page)).toBeHidden();
    await expect(menuLinks(page).first()).toBeVisible();
  });

  test("no se come el primer clic ni la primera tecla del visitante", async ({ page }) => {
    await page.goto(`/${lang}`);
    await waitReady(page);
    await page.keyboard.press("ArrowDown");
    await expect(menuLinks(page).nth(1)).toHaveAttribute("aria-current", "true");
    await menuLinks(page).nth(2).click();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[2]}`));
  });
});

test.describe("splash sin JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("desaparece solo y el menú sigue siendo utilizable", async ({ page }) => {
    await page.goto(`/${lang}`);
    await expect(splash(page)).toBeVisible();
    await expect(splash(page)).toBeHidden({ timeout: 4000 });
    await expect(menuLinks(page)).toHaveCount(5);
    await menuLinks(page).nth(1).click();
    await expect(page).toHaveURL(urlEndsWith(`/${lang}/${ids[1]}`));
  });
});

test.describe("splash con el almacenamiento bloqueado", () => {
  test("se repite en cada carga pero nada se rompe", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript(() => {
      const blocked = () => {
        throw new Error("almacenamiento bloqueado");
      };
      Storage.prototype.getItem = blocked;
      Storage.prototype.setItem = blocked;
    });
    await page.goto(`/${lang}`);
    await expect(splash(page)).toBeVisible();
    await waitReady(page);
    await page.keyboard.press("x");
    await expect(splash(page)).toBeHidden();
    await page.reload();
    await expect(splash(page)).toBeVisible();
    await expect(splash(page)).toBeHidden({ timeout: 4000 });
    await expect(menuLinks(page).first()).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe("splash con el tacto", () => {
  test.skip(({ browserName }) => browserName !== "chromium", "el toque se prueba en Chromium");
  test.use({ hasTouch: true });

  test("un toque lo cierra de inmediato", async ({ page }) => {
    await freezeSplash(page);
    await page.goto(`/${lang}`);
    await expect(splash(page)).toBeVisible();
    const elapsed = await hideTime(page, () => page.touchscreen.tap(200, 300));
    expect(elapsed, "debe cerrarse en menos de 150 ms").toBeLessThan(150);
    await page.waitForTimeout(400);
    await expect(page).toHaveURL(urlEndsWith(`/${lang}`));
  });
});
