// Atajo para leer un texto de interfaz en el idioma activo.
import { uiText } from "../../content/ui-text.ts";
import type { UiTextKey } from "../../content/ui-text.ts";
import type { Lang } from "../../content/types.ts";
import { localize } from "./localize.ts";

export function t(key: UiTextKey, lang: Lang): string {
  return localize(uiText[key], lang);
}
