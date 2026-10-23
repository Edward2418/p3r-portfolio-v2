import { test } from "node:test";
import assert from "node:assert/strict";
import { CURSOR_GAP_MS, createRateLimiter, soundForAction } from "../../src/lib/audio/events.ts";
import type { SoundAction } from "../../src/lib/audio/events.ts";
import type { SoundId } from "../../src/content/types.ts";

// Mapa de acción a sonido (specs/003-identidad-visual-p3r/contracts/sound.md).

test("cada acción suena con el efecto del contrato", () => {
  const expected: Record<SoundAction, SoundId> = {
    move: "cursor",
    "screen-change": "cursor",
    confirm: "confirm",
    cancel: "cancel",
    "arrive-screen": "open",
    "arrive-menu": "close",
    enable: "levelup",
  };
  for (const [action, sound] of Object.entries(expected)) {
    assert.equal(soundForAction(action as SoundAction), sound, `la acción ${action} debe sonar ${sound}`);
  }
});

test("el limitador deja pasar el primer sonido y bloquea los siguientes dentro del intervalo", () => {
  const limiter = createRateLimiter(CURSOR_GAP_MS);
  assert.equal(limiter.allow("cursor", 1000), true, "el primero debe pasar");
  assert.equal(limiter.allow("cursor", 1000 + CURSOR_GAP_MS - 1), false, "dentro del intervalo debe bloquearse");
  assert.equal(limiter.allow("cursor", 1000 + CURSOR_GAP_MS), true, "al cumplirse el intervalo debe pasar");
});

test("el intervalo del cursor es de 80 ms", () => {
  assert.equal(CURSOR_GAP_MS, 80);
});

test("el limitador cuenta por separado cada sonido", () => {
  const limiter = createRateLimiter(CURSOR_GAP_MS);
  assert.equal(limiter.allow("cursor", 500), true);
  assert.equal(limiter.allow("confirm", 510), true, "otro sonido no debe verse afectado por el cursor");
  assert.equal(limiter.allow("cursor", 520), false);
});
