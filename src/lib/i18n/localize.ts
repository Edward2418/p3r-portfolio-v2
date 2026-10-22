// Única forma de leer un texto traducible: así un idioma vacío o ausente no pasa en silencio.
import type { Lang, Localized } from "../../content/types.ts";

export function localize(value: Localized, lang: Lang): string {
  const text = value[lang];
  if (typeof text !== "string" || text.trim() === "") {
    throw new Error(`Falta la traducción al idioma "${lang}"`);
  }
  return text;
}
