import { test } from "node:test";
import assert from "node:assert/strict";
import { negotiateLang, parseAcceptLanguage } from "../../src/lib/i18n/negotiate.ts";

test("es-MX se resuelve como español", () => {
  assert.equal(negotiateLang(undefined, "es-MX,es;q=0.9"), "es", "es-MX debe dar es");
});

test("en-GB se resuelve como inglés", () => {
  assert.equal(negotiateLang(undefined, "en-GB,en;q=0.8"), "en", "en-GB debe dar en");
});

test("un idioma no soportado cae en inglés", () => {
  assert.equal(negotiateLang(undefined, "fr-FR,fr;q=0.9"), "en", "fr debe dar en");
});

test("una cabecera vacía o ausente da inglés", () => {
  assert.equal(negotiateLang(undefined, ""), "en", "cabecera vacía debe dar en");
  assert.equal(negotiateLang(undefined, null), "en", "cabecera nula debe dar en");
  assert.equal(negotiateLang(undefined, undefined), "en", "cabecera ausente debe dar en");
});

test("la cookie válida manda sobre Accept-Language", () => {
  assert.equal(negotiateLang("es", "en-US,en;q=0.9"), "es", "cookie es debe ganar");
  assert.equal(negotiateLang("en", "es-MX"), "en", "cookie en debe ganar");
});

test("una cookie inválida se ignora", () => {
  assert.equal(negotiateLang("fr", "es-MX"), "es", "cookie fr debe ignorarse");
  assert.equal(negotiateLang("", "es-MX"), "es", "cookie vacía debe ignorarse");
});

test("respeta los pesos q de la cabecera", () => {
  assert.equal(negotiateLang(undefined, "en;q=0.5,es;q=0.9"), "es", "es tiene mayor peso");
  assert.deepEqual(parseAcceptLanguage("en;q=0.5,es;q=0.9,fr"), ["fr", "es", "en"], "orden por peso descendente");
});

test("se queda con el primer idioma soportado de mayor prioridad", () => {
  assert.equal(negotiateLang(undefined, "fr,es;q=0.5"), "es", "fr no está soportado, sigue es");
});

test("ignora el comodín y los idiomas con peso cero", () => {
  assert.deepEqual(parseAcceptLanguage("*;q=0.5,es;q=0"), [], "comodín y q=0 no cuentan");
  assert.equal(negotiateLang(undefined, "es;q=0,en;q=0.1"), "en", "es con q=0 no debe elegirse");
});
