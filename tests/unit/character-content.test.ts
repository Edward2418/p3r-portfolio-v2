import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { character } from "../../src/content/character.ts";

// Datos del personaje (specs/003-identidad-visual-p3r/data-model.md, CharacterAsset).

const publicPath = (src: string) => join("public", ...src.split("/").filter(Boolean));

test("las rutas del póster y del video existen en public/", () => {
  assert.ok(existsSync(publicPath(character.poster.src)), `no existe ${character.poster.src}`);
  assert.ok(existsSync(publicPath(character.idle.src)), `no existe ${character.idle.src}`);
});

test("el póster mide 540×960 y el video es WebM con VP9", () => {
  assert.equal(character.poster.width, 540, "el ancho del póster debe ser 540");
  assert.equal(character.poster.height, 960, "el alto del póster debe ser 960");
  assert.match(character.idle.type, /^video\/webm; codecs="vp9"$/, "el tipo del video debe ser WebM con VP9");
});

test("la descripción accesible tiene español e inglés", () => {
  assert.ok(character.alt.es.trim().length > 0, "falta la descripción en español");
  assert.ok(character.alt.en.trim().length > 0, "falta la descripción en inglés");
});
