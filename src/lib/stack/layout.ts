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

/**
 * Dónde va la marca "Provisional" en una categoría: una sola vez en su encabezado si todas sus tecnologías
 * son provisionales (los círculos tienen poco espacio), solo en las tecnologías provisionales si hay una
 * mezcla, o en ninguna.
 */
export function provisionalScope(category: StackCategory): "category" | "technologies" | "none" {
  const provisional = category.technologies.filter((tech) => tech.provisional === true).length;
  if (provisional === 0) return "none";
  return provisional === category.technologies.length ? "category" : "technologies";
}

/** Cantidad de marcas "Provisional" que muestra el stack (una por categoría o una por tecnología, según el caso). */
export function provisionalBadgeCount(stack: StackCategory[]): number {
  return visibleCategories(stack).reduce((total, category) => {
    const scope = provisionalScope(category);
    if (scope === "category") return total + 1;
    if (scope === "technologies") return total + category.technologies.filter((tech) => tech.provisional === true).length;
    return total;
  }, 0);
}
