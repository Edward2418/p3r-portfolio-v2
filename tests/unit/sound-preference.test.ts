import { test } from "node:test";
import assert from "node:assert/strict";
import { readSoundPreference, SOUND_KEY, writeSoundPreference } from "../../src/lib/audio/preference.ts";

// Preferencia de sonido (specs/003-identidad-visual-p3r/contracts/sound.md): por defecto `off`.

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

test("sin valor guardado el sonido está desactivado", () => {
  assert.equal(readSoundPreference(fakeStorage()), "off", "por defecto debe ser off");
  assert.equal(readSoundPreference(null), "off", "sin almacenamiento debe ser off");
  assert.equal(readSoundPreference(undefined), "off", "sin almacenamiento debe ser off");
});

test("solo el valor on activa el sonido", () => {
  assert.equal(readSoundPreference(fakeStorage({ [SOUND_KEY]: "on" })), "on");
  assert.equal(readSoundPreference(fakeStorage({ [SOUND_KEY]: "off" })), "off");
});

test("un valor inválido da off", () => {
  for (const value of ["", "ON", "true", "1", "sí", "yes"]) {
    assert.equal(readSoundPreference(fakeStorage({ [SOUND_KEY]: value })), "off", `"${value}" debe dar off`);
  }
});

test("un almacenamiento bloqueado da off sin lanzar", () => {
  assert.equal(readSoundPreference(brokenStorage), "off");
});

test("escribir guarda el valor con la clave sound", () => {
  const storage = fakeStorage();
  assert.equal(writeSoundPreference(storage, "on"), true, "debe indicar que se guardó");
  assert.equal(storage.data[SOUND_KEY], "on");
  assert.equal(writeSoundPreference(storage, "off"), true);
  assert.equal(storage.data[SOUND_KEY], "off");
});

test("escribir devuelve false si el almacenamiento falla o no existe", () => {
  assert.equal(writeSoundPreference(brokenStorage, "on"), false, "con almacenamiento bloqueado debe devolver false");
  assert.equal(writeSoundPreference(null, "on"), false, "sin almacenamiento debe devolver false");
});
