"use client";

// Único componente de cliente de la fase 1: escribe la cookie `lang` al activar el enlace.
// Es un enlace real (<a>), así que también cambia de idioma sin JavaScript.
import { usePathname } from "next/navigation";
import type { Lang } from "../content/types.ts";
import { LANG_NAMES } from "../lib/i18n/config.ts";
import { buildLangCookie } from "../lib/i18n/cookie.ts";

interface LanguageSwitcherProps {
  /** Idioma al que cambia el enlace. */
  target: Lang;
  /** Descripción de la acción, ya traducida al idioma activo; se añade al nombre visible. */
  label: string;
}

export function LanguageSwitcher({ target, label }: LanguageSwitcherProps) {
  const pathname = usePathname();
  // Misma página en el otro idioma: se sustituye el primer segmento de la ruta.
  const href = `/${target}${pathname.replace(/^\/[^/]+/, "")}`;

  function rememberLanguage() {
    try {
      document.cookie = buildLangCookie(target);
    } catch {
      // Con las cookies bloqueadas el idioma sigue funcionando por la ruta.
    }
  }

  return (
    <a
      href={href}
      hrefLang={target}
      lang={target}
      aria-label={`${LANG_NAMES[target]} — ${label}`}
      onClick={rememberLanguage}
      className="inline-flex min-h-11 items-center border border-cyan bg-navy px-4 text-cyan transition-transform duration-(--duration-fast) ease-(--ease-out) active:scale-[0.97] hover:bg-cyan hover:text-bg"
    >
      {LANG_NAMES[target]}
    </a>
  );
}
