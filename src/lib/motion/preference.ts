// Preferencia de movimiento reducido (contracts/routes-scenes.md, "Atributos observables").
// El modo efectivo es reducido si lo pide el sistema o el sitio. La elección del sitio vive en
// `localStorage`; las funciones reciben el almacenamiento para poder probarlas y para tolerar que
// esté bloqueado.
import type { MotionMode } from "../../content/types.ts";

/** Clave de `localStorage` con la elección del sitio (`reduced` o `full`). */
export const MOTION_KEY = "motion";
/** Clave de `sessionStorage` que indica que el splash ya se vio en esta sesión. */
export const SPLASH_KEY = "splash-seen";

export type StoragePort = Pick<Storage, "getItem" | "setItem">;

/** Reducido si el sistema o el sitio lo piden. */
export function effectiveMotion(systemReduced: boolean, site: MotionMode): MotionMode {
  return systemReduced || site === "reduced" ? "reduced" : "full";
}

/** Elección del sitio; cualquier valor ausente, inválido o un almacenamiento bloqueado dan `full`. */
export function readSitePreference(storage: StoragePort | null | undefined): MotionMode {
  try {
    return storage?.getItem(MOTION_KEY) === "reduced" ? "reduced" : "full";
  } catch {
    return "full";
  }
}

/** Guarda la elección del sitio; devuelve `false` si no se pudo (almacenamiento bloqueado). */
export function writeSitePreference(storage: StoragePort | null | undefined, mode: MotionMode): boolean {
  try {
    if (!storage) return false;
    storage.setItem(MOTION_KEY, mode);
    return true;
  } catch {
    return false;
  }
}
