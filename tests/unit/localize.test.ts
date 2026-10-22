import { test } from "node:test";
import assert from "node:assert/strict";
import { localize } from "../../src/lib/i18n/localize.ts";
import type { Localized } from "../../src/content/types.ts";

const saludo: Localized = { es: "Hola", en: "Hello" };

test("devuelve el texto en español cuando se pide español", () => {
  assert.equal(localize(saludo, "es"), "Hola", "debe devolver el texto en español");
});

test("devuelve el texto en inglés cuando se pide inglés", () => {
  assert.equal(localize(saludo, "en"), "Hello", "debe devolver el texto en inglés");
});

test("falla de forma clara con un texto vacío", () => {
  const vacio: Localized = { es: "   ", en: "Hello" };
  assert.throws(() => localize(vacio, "es"), /traducción/, "un texto vacío debe lanzar un error");
});

test("falla de forma clara cuando falta un idioma", () => {
  const incompleto = { en: "Hello" } as unknown as Localized;
  assert.throws(() => localize(incompleto, "es"), /traducción/, "un idioma ausente debe lanzar un error");
});
