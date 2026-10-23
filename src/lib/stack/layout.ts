// Qué se muestra del stack (specs/004-quien-soy-y-stack/data-model.md, "Funciones puras de presentación").
// Funciones puras, sin DOM ni JSX, para probarlas con `node --test`.
import type { StackCategory } from "../../content/types.ts";

/** Categorías con al menos una tecnología, en su orden: una categoría vacía no se muestra. */
export function visibleCategories(stack: StackCategory[]): StackCategory[] {
  return stack.filter((category) => category.technologies.length > 0);
}

/** La etiqueta central ("Full-Stack") solo se muestra con tecnologías en las tres categorías. */
export function showCenterLabel(stack: StackCategory[]): boolean {
  return visibleCategories(stack).length === 3;
}
