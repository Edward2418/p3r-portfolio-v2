// Línea de tiempo de la transición de escena (contracts/scene-transition.md).
// Funciones puras: los valores salen de los tokens de `globals.css`; aquí solo se interpretan y se
// reparten. Se prueban con `node --test` sin DOM.

/** Convierte un tiempo CSS (`150ms` o `0.15s`) a milisegundos. */
export function parseCssTime(value: string): number {
  // El minificador de CSS puede escribir 170ms como .17s, así que el entero inicial es opcional.
  const match = /^\s*(\d*\.?\d+)(ms|s)\s*$/.exec(value);
  if (!match) throw new Error(`No es un tiempo CSS válido: "${value}"`);
  const amount = Number(match[1]);
  return Math.round((match[2] === "s" ? amount * 1000 : amount) * 1000) / 1000;
}

export interface TimelineTokens {
  wipeOut: number;
  staggerIn: number;
  hold: number;
  circle: number;
}

export type SegmentName = "wipe-out" | "enter" | "hold" | "circle";

export interface TimelineSegment {
  name: SegmentName;
  start: number;
  duration: number;
}

/** Tramos en orden (salida, entrada, pausa y cierre) con su inicio y la duración total. */
export function buildTimeline(tokens: TimelineTokens): { segments: TimelineSegment[]; total: number } {
  const ordered: [SegmentName, number][] = [
    ["wipe-out", tokens.wipeOut],
    ["enter", tokens.staggerIn],
    ["hold", tokens.hold],
    ["circle", tokens.circle],
  ];
  let start = 0;
  const segments = ordered.map(([name, duration]) => {
    if (!Number.isFinite(duration) || duration < 0) {
      throw new Error(`Duración inválida en el tramo "${name}": ${duration}`);
    }
    const segment = { name, start, duration };
    start += duration;
    return segment;
  });
  return { segments, total: start };
}

/** Retrasos del escalonado: 0, paso, 2·paso… */
export function staggerDelays(count: number, step: number): number[] {
  return Array.from({ length: Math.max(0, count) }, (_, index) => index * step);
}

/**
 * Reparte el escalonado dentro del tramo de entrada: el paso se reduce si hay muchas fichas para que
 * la última termine dentro de `totalMs`, sin bajar de `minDuration` por ficha.
 */
export function staggerPlan(
  count: number,
  step: number,
  totalMs: number,
  minDuration: number,
): { delays: number[]; duration: number } {
  if (count <= 0) return { delays: [], duration: totalMs };
  if (count === 1) return { delays: [0], duration: totalMs };
  const effectiveStep = Math.min(step, Math.max(0, (totalMs - minDuration) / (count - 1)));
  const delays = staggerDelays(count, effectiveStep);
  const lastDelay = delays[delays.length - 1];
  return { delays, duration: Math.max(minDuration, totalMs - lastDelay) };
}
