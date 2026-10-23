import { test } from "node:test";
import assert from "node:assert/strict";
import {
  effectiveMotion,
  MOTION_KEY,
  readSitePreference,
  writeSitePreference,
} from "../../src/lib/motion/preference.ts";

function fakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  };
}

const brokenStorage = {
  getItem: () => {
    throw new Error("almacenamiento bloqueado");
  },
  setItem: () => {
    throw new Error("almacenamiento bloqueado");
  },
};

test("el modo efectivo es reducido si el sistema o el sitio lo piden", () => {
  assert.equal(effectiveMotion(true, "full"), "reduced", "el sistema pide reducido");
  assert.equal(effectiveMotion(false, "reduced"), "reduced", "el sitio pide reducido");
  assert.equal(effectiveMotion(true, "reduced"), "reduced", "ambos piden reducido");
  assert.equal(effectiveMotion(false, "full"), "full", "ninguno lo pide");
});

test("la clave de almacenamiento es motion", () => {
  assert.equal(MOTION_KEY, "motion", "la clave es parte del contrato");
});

test("readSitePreference devuelve reduced solo si está guardado", () => {
  assert.equal(readSitePreference(fakeStorage({ motion: "reduced" })), "reduced", "guardado como reduced");
  assert.equal(readSitePreference(fakeStorage({ motion: "full" })), "full", "guardado como full");
});

test("readSitePreference devuelve full con valores ausentes o inválidos", () => {
  assert.equal(readSitePreference(fakeStorage()), "full", "ausente");
  assert.equal(readSitePreference(fakeStorage({ motion: "mucho" })), "full", "inválido");
  assert.equal(readSitePreference(null), "full", "sin almacenamiento");
  assert.equal(readSitePreference(undefined), "full", "almacenamiento indefinido");
});

test("readSitePreference no lanza si el almacenamiento está bloqueado", () => {
  assert.equal(readSitePreference(brokenStorage), "full", "con almacenamiento bloqueado vuelve a full");
});

test("writeSitePreference guarda el modo y no lanza con almacenamiento bloqueado", () => {
  const storage = fakeStorage();
  assert.equal(writeSitePreference(storage, "reduced"), true, "debe indicar que guardó");
  assert.equal(storage.data.motion, "reduced", "debe guardar reduced");
  assert.equal(writeSitePreference(brokenStorage, "reduced"), false, "debe indicar que no pudo guardar");
  assert.equal(writeSitePreference(null, "reduced"), false, "sin almacenamiento no guarda");
});
