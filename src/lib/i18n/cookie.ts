// Cookie `lang` (contracts/routing-i18n.md): solo guarda `es` o `en`, sin datos personales.
import type { Lang } from "../../content/types.ts";
import { isLang, LANG_COOKIE } from "./config.ts";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export function buildLangCookie(lang: Lang): string {
  if (!isLang(lang)) {
    throw new Error(`Idioma no soportado para la cookie: "${String(lang)}"`);
  }
  return `${LANG_COOKIE}=${lang}; Path=/; Max-Age=${ONE_YEAR_IN_SECONDS}; SameSite=Lax`;
}
