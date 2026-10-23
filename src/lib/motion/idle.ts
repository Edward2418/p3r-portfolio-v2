// Elegibilidad del idle de Oguri (specs/003-identidad-visual-p3r/contracts/character-media.md).
// Funciones puras: reciben los datos del entorno y no tocan el DOM, para probarlas con `node --test`.

export interface IdleEnvironment {
  /** El sistema o el sitio piden movimiento reducido. */
  reducedMotion: boolean;
  /** El visitante activó el ahorro de datos (`navigator.connection.saveData`). */
  saveData: boolean;
  /** El navegador reproduce WebM con VP9 (`canPlayType`). */
  canPlayWebm: boolean;
  /** Motor WebKit (Safari y cualquier navegador de iOS): no dibuja el alfa de WebM. */
  isWebkit: boolean;
}

/** El idle (video de 1.8 MB) solo se carga si se cumplen las cuatro condiciones. */
export function shouldLoadIdle(env: IdleEnvironment): boolean {
  return !env.reducedMotion && !env.saveData && env.canPlayWebm && !env.isWebkit;
}

/**
 * WebKit por agente de usuario: Safari (contiene `Safari` sin `Chrome`, `Chromium`, `Android` ni
 * `Firefox`) o cualquier navegador de iOS (`iPhone`, `iPad`, `iPod`), porque todos usan WebKit.
 */
export function isWebkit(userAgent: string): boolean {
  if (/iPhone|iPad|iPod/.test(userAgent)) return true;
  return /Safari/.test(userAgent) && !/Chrome|Chromium|Android|Firefox/.test(userAgent);
}
