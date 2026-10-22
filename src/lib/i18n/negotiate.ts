// Resolución del idioma para rutas sin idioma (contracts/routing-i18n.md):
// cookie válida > Accept-Language > idioma por defecto.
import type { Lang } from "../../content/types.ts";
import { DEFAULT_LANG, isLang } from "./config.ts";

/**
 * Devuelve los códigos base de idioma de la cabecera `Accept-Language`
 * (`es-MX` → `es`), ordenados por peso `q` descendente y sin repetir.
 * Ignora el comodín `*` y los idiomas con peso cero.
 */
export function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) return [];

  const entries: { base: string; q: number; order: number }[] = [];
  header.split(",").forEach((part, order) => {
    const [tag, ...params] = part.trim().split(";");
    const base = tag.trim().split("-")[0].toLowerCase();
    if (base === "" || base === "*") return;

    const qParam = params.map((p) => p.trim()).find((p) => p.startsWith("q="));
    const q = qParam === undefined ? 1 : Number(qParam.slice(2));
    if (Number.isNaN(q) || q <= 0) return;

    entries.push({ base, q, order });
  });

  entries.sort((a, b) => b.q - a.q || a.order - b.order);
  return [...new Set(entries.map((e) => e.base))];
}

export function negotiateLang(
  cookie: string | null | undefined,
  acceptLanguage: string | null | undefined,
): Lang {
  if (isLang(cookie)) return cookie;
  return parseAcceptLanguage(acceptLanguage).find(isLang) ?? DEFAULT_LANG;
}
