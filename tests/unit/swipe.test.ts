import { test } from "node:test";
import assert from "node:assert/strict";
import { detectSwipe, SWIPE_CONFIG } from "../../src/lib/motion/swipe.ts";

const base = { pointers: 1, viewportWidth: 390 };

test("la configuración usa 56 px, relación 1.5 y margen de borde de 24 px", () => {
  assert.equal(SWIPE_CONFIG.minDistance, 56, "distancia mínima");
  assert.equal(SWIPE_CONFIG.ratio, 1.5, "relación horizontal/vertical");
  assert.equal(SWIPE_CONFIG.edgeMargin, 24, "margen de borde");
});

test("un deslizamiento horizontal hacia la izquierda pasa a la pantalla siguiente", () => {
  assert.equal(detectSwipe({ ...base, startX: 300, startY: 400, endX: 150, endY: 410 }), "next", "izquierda = siguiente");
});

test("un deslizamiento horizontal hacia la derecha pasa a la pantalla anterior", () => {
  assert.equal(detectSwipe({ ...base, startX: 100, startY: 400, endX: 250, endY: 395 }), "prev", "derecha = anterior");
});

test("rechaza un movimiento corto", () => {
  assert.equal(detectSwipe({ ...base, startX: 200, startY: 400, endX: 160, endY: 400 }), null, "40 px no alcanzan");
  assert.equal(detectSwipe({ ...base, startX: 200, startY: 400, endX: 145, endY: 400 }), null, "55 px no alcanzan");
  assert.equal(detectSwipe({ ...base, startX: 200, startY: 400, endX: 144, endY: 400 }), "next", "56 px sí alcanzan");
});

test("rechaza un movimiento vertical o diagonal", () => {
  assert.equal(detectSwipe({ ...base, startX: 200, startY: 100, endX: 190, endY: 400 }), null, "vertical");
  assert.equal(detectSwipe({ ...base, startX: 300, startY: 300, endX: 200, endY: 400 }), null, "diagonal a 45°");
  assert.equal(detectSwipe({ ...base, startX: 300, startY: 300, endX: 150, endY: 400 }), "next", "150 en x y 100 en y cumple 1.5");
});

test("rechaza los gestos con más de un puntero", () => {
  assert.equal(detectSwipe({ ...base, pointers: 2, startX: 300, startY: 400, endX: 100, endY: 400 }), null, "dos dedos");
});

test("rechaza los gestos que empiezan a menos de 24 px del borde", () => {
  assert.equal(detectSwipe({ ...base, startX: 10, startY: 400, endX: 200, endY: 400 }), null, "borde izquierdo");
  assert.equal(detectSwipe({ ...base, startX: 380, startY: 400, endX: 150, endY: 400 }), null, "borde derecho");
  assert.equal(detectSwipe({ ...base, startX: 24, startY: 400, endX: 200, endY: 400 }), "prev", "justo en el margen sí cuenta");
});
