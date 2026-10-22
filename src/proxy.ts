// Redirige las rutas sin idioma a `/es` o `/en` (contracts/routing-i18n.md).
// Una ruta que ya trae su idioma nunca se redirige: la dirección explícita manda sobre la cookie.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { LANG_COOKIE, LANGS } from "./lib/i18n/config.ts";
import { negotiateLang } from "./lib/i18n/negotiate.ts";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLang = LANGS.some((lang) => pathname === `/${lang}` || pathname.startsWith(`/${lang}/`));
  if (hasLang) return NextResponse.next();

  const lang = negotiateLang(
    request.cookies.get(LANG_COOKIE)?.value,
    request.headers.get("accept-language"),
  );
  const url = request.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Excluye los archivos internos de Next y cualquier archivo estático (rutas con punto).
  matcher: ["/((?!_next|.*\\..*).*)"],
};
