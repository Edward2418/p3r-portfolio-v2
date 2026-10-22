import { test } from "node:test";
import assert from "node:assert/strict";
import { buildLangCookie } from "../../src/lib/i18n/cookie.ts";
import type { Lang } from "../../src/content/types.ts";

test("la cookie guarda el idioma elegido", () => {
  assert.ok(buildLangCookie("es").startsWith("lang=es;"), "debe empezar con lang=es");
  assert.ok(buildLangCookie("en").startsWith("lang=en;"), "debe empezar con lang=en");
});

test("la cookie vale para todo el sitio y dura un año", () => {
  const cookie = buildLangCookie("es");
  assert.match(cookie, /Path=\//, "debe tener Path=/");
  assert.match(cookie, /Max-Age=31536000/, "debe durar 31536000 segundos (un año)");
});

test("la cookie usa SameSite=Lax y no guarda nada más que el idioma", () => {
  const cookie = buildLangCookie("en");
  assert.match(cookie, /SameSite=Lax/, "debe usar SameSite=Lax");
  assert.equal(cookie.split(";").length, 4, "solo deben existir lang, Path, Max-Age y SameSite");
});

test("rechaza un idioma que no es es ni en", () => {
  assert.throws(() => buildLangCookie("fr" as Lang), /idioma/i, "un idioma inválido debe lanzar un error");
});
