import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import { sounds } from "../../src/content/audio.ts";
import type { SoundId } from "../../src/content/types.ts";

// Efectos de sonido (specs/003-identidad-visual-p3r/data-model.md, SoundEffect).

const EXPECTED: SoundId[] = ["cursor", "confirm", "cancel", "open", "close", "levelup"];
const publicPath = (src: string) => join("public", ...src.split("/").filter(Boolean));

test("hay exactamente seis efectos con los seis identificadores, sin repetirse", () => {
  const ids = sounds.map((sound) => sound.id);
  assert.equal(new Set(ids).size, ids.length, "hay identificadores repetidos");
  assert.deepEqual([...ids].sort(), [...EXPECTED].sort(), "los identificadores deben ser los seis esperados");
});

test("cada sonido apunta a /audio/<id>.mp3 y el archivo existe", () => {
  for (const sound of sounds) {
    assert.equal(sound.src, `/audio/${sound.id}.mp3`, `la ruta de ${sound.id} no sigue la forma /audio/<id>.mp3`);
    assert.ok(existsSync(publicPath(sound.src)), `no existe ${sound.src}`);
  }
});

test("el peso total de los MP3 no supera 100 KiB", () => {
  const total = sounds.reduce((sum, sound) => sum + statSync(publicPath(sound.src)).size, 0);
  assert.ok(total <= 100 * 1024, `los sonidos pesan ${(total / 1024).toFixed(1)} KiB, máximo 100 KiB`);
});
