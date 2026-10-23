import { test } from "node:test";
import assert from "node:assert/strict";
import { neighbors, nextIndex, resolveScreenKey, shouldIgnoreKey } from "../../src/lib/motion/navigation.ts";

test("↓ y → avanzan una opción y se detienen en la última", () => {
  assert.equal(nextIndex(0, "ArrowDown", 5), 1, "↓ debe avanzar");
  assert.equal(nextIndex(1, "ArrowRight", 5), 2, "→ debe avanzar");
  assert.equal(nextIndex(4, "ArrowDown", 5), 4, "no debe pasar de la última");
});

test("↑ y ← retroceden una opción y se detienen en la primera", () => {
  assert.equal(nextIndex(3, "ArrowUp", 5), 2, "↑ debe retroceder");
  assert.equal(nextIndex(2, "ArrowLeft", 5), 1, "← debe retroceder");
  assert.equal(nextIndex(0, "ArrowUp", 5), 0, "no debe pasar de la primera");
});

test("Inicio y Fin van a la primera y a la última opción", () => {
  assert.equal(nextIndex(3, "Home", 5), 0, "Home va a la primera");
  assert.equal(nextIndex(1, "End", 5), 4, "End va a la última");
});

test("una tecla desconocida no cambia la opción activa", () => {
  assert.equal(nextIndex(2, "a", 5), 2, "otras teclas no deben moverla");
  assert.equal(nextIndex(2, "ArrowDown", 0), 2, "con lista vacía no debe cambiar");
});

test("las pantallas resuelven ←/RePág como anterior, →/AvPág como siguiente y Esc como menú", () => {
  assert.equal(resolveScreenKey("ArrowLeft"), "prev", "← es anterior");
  assert.equal(resolveScreenKey("PageUp"), "prev", "RePág es anterior");
  assert.equal(resolveScreenKey("ArrowRight"), "next", "→ es siguiente");
  assert.equal(resolveScreenKey("PageDown"), "next", "AvPág es siguiente");
  assert.equal(resolveScreenKey("Escape"), "menu", "Esc vuelve al menú");
  assert.equal(resolveScreenKey("Enter"), null, "otras teclas no hacen nada");
});

test("se ignoran las teclas con Ctrl, Alt o Meta", () => {
  assert.equal(shouldIgnoreKey({ ctrlKey: true }), true, "Ctrl se ignora");
  assert.equal(shouldIgnoreKey({ altKey: true }), true, "Alt se ignora");
  assert.equal(shouldIgnoreKey({ metaKey: true }), true, "Meta se ignora");
  assert.equal(shouldIgnoreKey({}), false, "sin modificadores no se ignora");
});

test("se ignoran las teclas con el foco en campos de texto, select o contenido editable", () => {
  assert.equal(shouldIgnoreKey({ targetTag: "INPUT" }), true, "input se ignora");
  assert.equal(shouldIgnoreKey({ targetTag: "TEXTAREA" }), true, "textarea se ignora");
  assert.equal(shouldIgnoreKey({ targetTag: "SELECT" }), true, "select se ignora");
  assert.equal(shouldIgnoreKey({ targetTag: "DIV", isContentEditable: true }), true, "contentEditable se ignora");
  assert.equal(shouldIgnoreKey({ targetTag: "A" }), false, "un enlace no se ignora");
});

test("neighbors devuelve la pantalla anterior y siguiente según el orden del arreglo", () => {
  const items = [{ id: "a" }, { id: "b" }, { id: "c" }];
  assert.deepEqual(neighbors(items, "b"), { prev: items[0], next: items[2] }, "en medio hay ambos vecinos");
  assert.deepEqual(neighbors(items, "a"), { prev: null, next: items[1] }, "la primera no tiene anterior");
  assert.deepEqual(neighbors(items, "c"), { prev: items[1], next: null }, "la última no tiene siguiente");
  assert.deepEqual(neighbors(items, "x"), { prev: null, next: null }, "un id desconocido no tiene vecinos");
});

test("reordenar el arreglo cambia los vecinos", () => {
  const reordered = [{ id: "c" }, { id: "a" }, { id: "b" }];
  assert.deepEqual(neighbors(reordered, "a"), { prev: reordered[0], next: reordered[2] }, "el orden del arreglo manda");
});
