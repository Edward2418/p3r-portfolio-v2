// Configuración de idiomas: única fuente de verdad para rutas, cookie y valor por defecto.
import type { Lang } from "../../content/types.ts";

export const LANGS = ["es", "en"] as const satisfies readonly Lang[];

/** Idioma cuando ni la ruta, ni la cookie, ni el navegador indican uno soportado. */
export const DEFAULT_LANG: Lang = "en";

/** Nombre de la cookie que guarda la elección del visitante. */
export const LANG_COOKIE = "lang";

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}
