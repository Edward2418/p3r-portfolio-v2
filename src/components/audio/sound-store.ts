// Almacén del sonido en el cliente (specs/003-identidad-visual-p3r/contracts/sound.md).
// - La preferencia vive en `localStorage` (con un respaldo en memoria por si está bloqueado) y se
//   expone con `subscribeSound` y `getSoundEnabled` para `useSyncExternalStore`.
// - Los archivos de audio se crean solo al activar el sonido (o tras la primera interacción si ya
//   estaba activado): hasta entonces no se descarga ninguno.
// - Reproducir reinicia el sonido y descarta cualquier rechazo del navegador sin avisos.
import { sounds } from "../../content/audio.ts";
import type { SoundId } from "../../content/types.ts";
import { CURSOR_GAP_MS, createRateLimiter, soundForAction } from "../../lib/audio/events.ts";
import type { SoundAction } from "../../lib/audio/events.ts";
import { readSoundPreference, writeSoundPreference } from "../../lib/audio/preference.ts";
import type { StoragePort } from "../../lib/audio/preference.ts";

function safeStorage(): StoragePort | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

let sessionOverride: boolean | null = null;
const listeners = new Set<() => void>();

export function subscribeSound(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function getSoundEnabled(): boolean {
  return sessionOverride ?? readSoundPreference(safeStorage()) === "on";
}

export function setSoundEnabled(enabled: boolean) {
  sessionOverride = enabled;
  writeSoundPreference(safeStorage(), enabled ? "on" : "off");
  if (enabled) loadSounds();
  listeners.forEach((listener) => listener());
}

const pool = new Map<SoundId, HTMLAudioElement>();

/** Crea los elementos de audio (y con ello pide los archivos). Es idempotente. */
export function loadSounds() {
  if (pool.size > 0) return;
  for (const sound of sounds) {
    const audio = new Audio(sound.src);
    audio.preload = "auto";
    pool.set(sound.id, audio);
  }
}

const limiter = createRateLimiter(CURSOR_GAP_MS);

export function playSound(action: SoundAction) {
  if (!getSoundEnabled()) return;
  const id = soundForAction(action);
  if (id === "cursor" && !limiter.allow(id, performance.now())) return;
  loadSounds();
  const audio = pool.get(id);
  if (!audio) return;
  try {
    audio.currentTime = 0;
  } catch {
    // Aún sin metadatos: se reproduce desde el inicio de todos modos.
  }
  // El navegador puede rechazar la reproducción (política de reproducción automática): se ignora.
  void audio.play().catch(() => undefined);
}
