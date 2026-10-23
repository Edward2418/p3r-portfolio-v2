// Detección del deslizamiento horizontal (contracts/input-navigation.md, sección "Deslizamiento").
// Función pura: el componente de cliente solo recoge las coordenadas de los eventos de puntero.

export const SWIPE_CONFIG = {
  /** Distancia horizontal mínima, en px. */
  minDistance: 56,
  /** Relación mínima `|dx| / |dy|`: el gesto debe ser claramente horizontal. */
  ratio: 1.5,
  /** Margen del borde horizontal de la pantalla que se ignora (gesto "atrás" del sistema), en px. */
  edgeMargin: 24,
} as const;

export interface SwipeInput {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  /** Cantidad máxima de punteros durante el gesto; solo cuenta uno. */
  pointers: number;
  viewportWidth: number;
}

export type SwipeDirection = "next" | "prev";

/** Hacia la izquierda pasa a la pantalla siguiente; hacia la derecha, a la anterior. */
export function detectSwipe(input: SwipeInput, config = SWIPE_CONFIG): SwipeDirection | null {
  if (input.pointers !== 1) return null;
  if (input.startX < config.edgeMargin || input.startX > input.viewportWidth - config.edgeMargin) return null;

  const dx = input.endX - input.startX;
  const dy = input.endY - input.startY;
  if (Math.abs(dx) < config.minDistance) return null;
  if (Math.abs(dx) < config.ratio * Math.abs(dy)) return null;

  return dx < 0 ? "next" : "prev";
}
