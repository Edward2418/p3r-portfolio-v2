import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import { menu, sounds, uiText } from "../../src/content/index.ts";
import { openReady } from "./helpers.ts";

// Sonido opcional (specs/003-identidad-visual-p3r, historia 4).
const lang = "es";
const AUDIO = "/audio/";
const optionLink = (page: Page, index: number) =>
  page.getByRole("navigation", { name: uiText.menuLabel[lang] }).getByRole("link").nth(index);
const toggle = (page: Page) => page.getByRole("button", { name: new RegExp(`^${uiText.soundToggleLabel[lang]}`) });

/** Espía HTMLMediaElement.play: registra el nombre del archivo de cada reproducción (o la rechaza). */
async function spyOnPlay(page: Page, mode: "ok" | "reject" = "ok") {
  await page.addInitScript((spyMode) => {
    const w = window as unknown as { __plays: string[] };
    w.__plays = [];
    const original = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      // Solo los efectos de sonido: el video del idle también llama a play().
      if (this.src.endsWith(".mp3")) w.__plays.push(this.src.split("/").pop()!.replace(".mp3", ""));
      return spyMode === "reject" ? Promise.reject(new DOMException("bloqueado", "NotAllowedError")) : original.call(this);
    };
  }, mode);
}

const plays = (page: Page) => page.evaluate(() => (window as unknown as { __plays: string[] }).__plays);

function trackAudioRequests(page: Page) {
  const urls: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes(AUDIO)) urls.push(request.url().split("/").pop()!);
  });
  return urls;
}

test.describe("silencio por defecto", () => {
  test("al cargar el menú y las cinco pantallas no se pide ningún archivo de audio", async ({ page }) => {
    const urls = trackAudioRequests(page);
    for (const path of ["", ...menu.map((option) => `/${option.id}`)]) {
      await openReady(page, `/${lang}${path}`);
      await page.waitForTimeout(400);
    }
    expect(urls, "no debe haber peticiones a /audio/").toEqual([]);
  });

  test("en System el interruptor está desactivado y es un botón con aria-pressed", async ({ page }) => {
    await openReady(page, `/${lang}/system`);
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
    await expect(toggle(page)).toContainText(uiText.soundOff[lang]);
    const box = await toggle(page).boundingBox();
    expect(box!.height, "el interruptor debe medir al menos 44 px de alto").toBeGreaterThanOrEqual(44);
  });
});

test.describe("activar el sonido", () => {
  test("pide los seis MP3 al activarlo, suena levelup una sola vez y queda activado", async ({ page }) => {
    await spyOnPlay(page);
    const urls = trackAudioRequests(page);
    await openReady(page, `/${lang}/system`);
    await toggle(page).click();

    await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
    await expect(toggle(page)).toContainText(uiText.soundOn[lang]);
    await expect.poll(() => new Set(urls).size, { message: "deben pedirse los seis MP3" }).toBe(sounds.length);
    expect((await plays(page)).filter((name) => name === "levelup"), "levelup debe sonar una sola vez").toHaveLength(1);
  });

  test("se opera con Enter y con Espacio", async ({ page }) => {
    await openReady(page, `/${lang}/system`);
    await toggle(page).focus();
    await page.keyboard.press("Enter");
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Space");
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
  });

  test("la preferencia persiste y con on guardado no se crea audio hasta la primera interacción", async ({ page }) => {
    // Se cuentan los elementos Audio creados: no depende de la caché del navegador (Firefox no notifica
    // como petición un recurso servido desde caché tras recargar).
    await page.addInitScript(() => {
      const w = window as unknown as { __audioCreated: number };
      w.__audioCreated = 0;
      const NativeAudio = window.Audio;
      window.Audio = function (this: unknown, ...args: ConstructorParameters<typeof Audio>) {
        w.__audioCreated += 1;
        return new NativeAudio(...args);
      } as unknown as typeof Audio;
    });
    const created = () => page.evaluate(() => (window as unknown as { __audioCreated: number }).__audioCreated);

    await openReady(page, `/${lang}/system`);
    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
    expect(await created(), "al activarlo se crean los seis audios").toBe(sounds.length);

    await page.reload();
    await page.locator('html[data-scene-ready="true"]').waitFor({ state: "attached" });
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
    await page.waitForTimeout(1000);
    expect(await created(), "antes de interactuar no debe crearse ningún audio").toBe(0);

    await page.keyboard.press("a");
    await expect.poll(created, { message: "tras la primera interacción deben crearse los seis audios" }).toBe(sounds.length);
  });

  test("con on guardado no hay errores de hidratación", async ({ page }) => {
    const messages: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") messages.push(message.text());
    });
    await page.addInitScript(() => localStorage.setItem("sound", "on"));
    await openReady(page, `/${lang}/system`);
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
    expect(messages.filter((text) => /hydrat/i.test(text)), "no debe haber discrepancias de hidratación").toEqual([]);
  });
});

test.describe("sonidos por acción (sonido activado)", () => {
  test.beforeEach(async ({ page }) => {
    await spyOnPlay(page);
    await page.addInitScript(() => localStorage.setItem("sound", "on"));
  });

  test("Esc vuelve con cancel y close; en el menú ↓ suena cursor y Enter suena confirm y open", async ({ page }) => {
    await openReady(page, `/${lang}/${menu[1].id}`);
    await page.keyboard.press("a"); // primera interacción: carga el audio
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(new RegExp(`/${lang}$`));
    await expect.poll(() => plays(page)).toEqual(["cancel", "close"]);

    await page.waitForTimeout(900);
    await page.keyboard.press("ArrowDown");
    await expect.poll(() => plays(page)).toEqual(["cancel", "close", "cursor"]);

    await page.waitForTimeout(150);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(new RegExp(`/${lang}/${menu[2].id}$`));
    await expect.poll(() => plays(page)).toEqual(["cancel", "close", "cursor", "confirm", "open"]);
  });

  test("cambiar de pantalla con L/R suena cursor y no suena open", async ({ page }) => {
    await openReady(page, `/${lang}/${menu[1].id}`);
    await page.keyboard.press("a");
    await page.keyboard.press("ArrowRight");
    await expect(page).toHaveURL(new RegExp(`/${lang}/${menu[2].id}$`));
    await page.waitForTimeout(900);
    expect(await plays(page)).toEqual(["cursor"]);
  });

  test("open suena exactamente una vez también si la transición se interrumpe", async ({ page }) => {
    await openReady(page, `/${lang}`);
    await page.keyboard.press("a");
    await optionLink(page, 1).click();
    await page.keyboard.press("a"); // interrumpe la transición
    await expect(page).toHaveURL(new RegExp(`/${lang}/${menu[1].id}$`));
    await page.waitForTimeout(900);
    const names = await plays(page);
    expect(names.filter((name) => name === "open"), "open debe sonar una sola vez").toHaveLength(1);
    expect(names.filter((name) => name === "confirm"), "confirm debe sonar una sola vez").toHaveLength(1);
  });

  test("con movimiento reducido el sonido sigue funcionando: open suena una vez", async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem("motion", "reduced"));
    await openReady(page, `/${lang}`);
    await page.keyboard.press("a");
    await optionLink(page, 1).click();
    await expect(page).toHaveURL(new RegExp(`/${lang}/${menu[1].id}$`));
    await page.waitForTimeout(500);
    expect((await plays(page)).filter((name) => name === "open")).toHaveLength(1);
  });

  test("al desactivar el sonido no suena nada más", async ({ page }) => {
    await openReady(page, `/${lang}/system`);
    await page.keyboard.press("a");
    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "false");
    const before = (await plays(page)).length;
    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(900);
    expect((await plays(page)).length, "no debe reproducirse nada tras desactivarlo").toBe(before);
  });
});

test.describe("reproducción bloqueada por el navegador", () => {
  test("un play() rechazado no produce errores", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await spyOnPlay(page, "reject");
    await openReady(page, `/${lang}/system`);
    await toggle(page).click();
    await expect(toggle(page)).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(new RegExp(`/${lang}$`));
    await page.waitForTimeout(500);
    expect(errors, "no debe haber excepciones de la página").toEqual([]);
  });
});
