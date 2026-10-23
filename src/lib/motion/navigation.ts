// Reglas de teclado del menú y de las pantallas (contracts/input-navigation.md).
// Funciones puras: se prueban con `node --test` sin DOM.

/** Opción activa tras pulsar una tecla en el menú; se detiene en los extremos (no da la vuelta). */
export function nextIndex(current: number, key: string, length: number): number {
  if (length <= 0) return current;
  const last = length - 1;
  switch (key) {
    case "ArrowDown":
    case "ArrowRight":
      return Math.min(current + 1, last);
    case "ArrowUp":
    case "ArrowLeft":
      return Math.max(current - 1, 0);
    case "Home":
      return 0;
    case "End":
      return last;
    default:
      return current;
  }
}

export type ScreenAction = "prev" | "next" | "menu";

/** Acción de una tecla en una pantalla: ← y RePág son L, → y AvPág son R, Esc vuelve al menú. */
export function resolveScreenKey(key: string): ScreenAction | null {
  switch (key) {
    case "ArrowLeft":
    case "PageUp":
      return "prev";
    case "ArrowRight":
    case "PageDown":
      return "next";
    case "Escape":
      return "menu";
    default:
      return null;
  }
}

export interface KeyContext {
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  /** Etiqueta (`tagName`) del elemento con el foco. */
  targetTag?: string;
  isContentEditable?: boolean;
}

const TEXT_CONTROLS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/** Se ignoran las teclas con Ctrl, Alt o Meta y las pulsadas con el foco en un control de texto. */
export function shouldIgnoreKey(context: KeyContext): boolean {
  if (context.ctrlKey || context.altKey || context.metaKey) return true;
  if (context.isContentEditable) return true;
  return context.targetTag !== undefined && TEXT_CONTROLS.has(context.targetTag.toUpperCase());
}

/** Pantallas vecinas según el orden del arreglo del menú. */
export function neighbors<T extends { id: string }>(
  items: readonly T[],
  id: string,
): { prev: T | null; next: T | null } {
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return { prev: null, next: null };
  return { prev: items[index - 1] ?? null, next: items[index + 1] ?? null };
}
