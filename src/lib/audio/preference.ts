// Preferencia de sonido (specs/003-identidad-visual-p3r/contracts/sound.md). Vive en `localStorage`
// con la clave `sound`; las funciones reciben el almacenamiento para poder probarlas y para tolerar
// que esté bloqueado. Por defecto y ante cualquier error el sonido está desactivado.
import type { SoundPreference } from "../../content/types.ts";

/** Clave de `localStorage` con la preferencia de sonido (`on` u `off`). */
export const SOUND_KEY = "sound";

export type StoragePort = Pick<Storage, "getItem" | "setItem">;

/** Solo el valor `on` activa el sonido; cualquier otro valor, o un almacenamiento bloqueado, da `off`. */
export function readSoundPreference(storage: StoragePort | null | undefined): SoundPreference {
  try {
    return storage?.getItem(SOUND_KEY) === "on" ? "on" : "off";
  } catch {
    return "off";
  }
}

/** Guarda la preferencia; devuelve `false` si no se pudo (almacenamiento bloqueado o ausente). */
export function writeSoundPreference(storage: StoragePort | null | undefined, preference: SoundPreference): boolean {
  try {
    if (!storage) return false;
    storage.setItem(SOUND_KEY, preference);
    return true;
  } catch {
    return false;
  }
}
