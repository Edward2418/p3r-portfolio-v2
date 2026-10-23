// Mapa de acción a sonido y limitador (specs/003-identidad-visual-p3r/contracts/sound.md).
// Funciones puras, sin DOM, para probarlas con `node --test`.
import type { SoundId } from "../../content/types.ts";

/** Acciones de la interfaz que tienen sonido. */
export type SoundAction =
  | "move" //          mover la opción activa del menú
  | "screen-change" // pasar de pantalla con L/R, flechas, RePág o AvPág
  | "confirm" //       Enter, clic o Confirmar sobre una opción
  | "cancel" //        Esc, Atrás o botón Atrás
  | "arrive-screen" // entrada de una pantalla abierta desde el menú
  | "arrive-menu" //   entrada del menú al volver
  | "enable"; //       activar el sonido

const SOUND_FOR_ACTION: Record<SoundAction, SoundId> = {
  move: "cursor",
  "screen-change": "cursor",
  confirm: "confirm",
  cancel: "cancel",
  "arrive-screen": "open",
  "arrive-menu": "close",
  enable: "levelup",
};

export function soundForAction(action: SoundAction): SoundId {
  return SOUND_FOR_ACTION[action];
}

/** Intervalo mínimo entre dos sonidos de cursor: una tecla mantenida no los encadena. */
export const CURSOR_GAP_MS = 80;

export interface RateLimiter {
  /** `true` si el sonido puede reproducirse en `now`; registra el instante si pasa. */
  allow(id: SoundId, now: number): boolean;
}

/** Limitador por sonido: deja pasar un sonido solo si pasaron al menos `gapMs` desde el último que pasó. */
export function createRateLimiter(gapMs: number): RateLimiter {
  const last = new Map<SoundId, number>();
  return {
    allow(id, now) {
      const previous = last.get(id);
      if (previous !== undefined && now - previous < gapMs) return false;
      last.set(id, now);
      return true;
    },
  };
}
