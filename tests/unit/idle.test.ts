import { test } from "node:test";
import assert from "node:assert/strict";
import { isWebkit, shouldLoadIdle } from "../../src/lib/motion/idle.ts";

// Elegibilidad del idle de Oguri (specs/003-identidad-visual-p3r/contracts/character-media.md).

const eligible = { reducedMotion: false, saveData: false, canPlayWebm: true, isWebkit: false };

test("el idle se carga solo si se cumplen las cuatro condiciones", () => {
  assert.equal(shouldLoadIdle(eligible), true, "con todas las condiciones debe cargarse");
});

test("cada condición por separado impide cargar el idle", () => {
  assert.equal(shouldLoadIdle({ ...eligible, reducedMotion: true }), false, "con movimiento reducido no debe cargarse");
  assert.equal(shouldLoadIdle({ ...eligible, saveData: true }), false, "con ahorro de datos no debe cargarse");
  assert.equal(shouldLoadIdle({ ...eligible, canPlayWebm: false }), false, "sin soporte de WebM no debe cargarse");
  assert.equal(shouldLoadIdle({ ...eligible, isWebkit: true }), false, "en WebKit no debe cargarse");
});

const WEBKIT = [
  // Safari de escritorio
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
  // Safari de iPhone
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1",
  // Chrome en iPhone (usa WebKit)
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0.6478.153 Mobile/15E148 Safari/604.1",
  // Firefox en iPad (usa WebKit)
  "Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/127.0 Mobile/15E148 Safari/605.1.15",
];

const NOT_WEBKIT = [
  // Chrome de escritorio
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  // Edge
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0",
  // Firefox de escritorio
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
  // Chrome en Android
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36",
];

test("isWebkit reconoce Safari y cualquier navegador de iOS", () => {
  for (const userAgent of WEBKIT) assert.equal(isWebkit(userAgent), true, `debe ser WebKit: ${userAgent}`);
});

test("isWebkit no confunde Chrome, Edge, Firefox ni Chrome en Android", () => {
  for (const userAgent of NOT_WEBKIT) assert.equal(isWebkit(userAgent), false, `no debe ser WebKit: ${userAgent}`);
});
