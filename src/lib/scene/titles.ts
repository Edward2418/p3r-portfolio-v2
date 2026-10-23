// Nombres y títulos de las pantallas, a partir de los datos del menú.
import { menu } from "../../content/menu.ts";
import { uiText } from "../../content/ui-text.ts";
import type { Lang, SceneId } from "../../content/types.ts";
import { localize } from "../i18n/localize.ts";

/** Nombre de la pantalla en el idioma activo (el mismo del menú). */
export function screenName(sceneId: SceneId, lang: Lang): string {
  const option = menu.find((candidate) => candidate.id === sceneId);
  if (!option) throw new Error(`Pantalla desconocida: "${sceneId}"`);
  return localize(option.name, lang);
}

/** Título del documento: `{nombre de la pantalla} | {título del sitio}`. */
export function screenTitle(sceneId: SceneId, lang: Lang): string {
  return `${screenName(sceneId, lang)} | ${localize(uiText.siteTitle, lang)}`;
}
