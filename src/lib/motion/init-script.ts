// Script en línea del <head>: se ejecuta de forma síncrona antes del primer pintado y fija en <html>
// `data-motion` y `data-splash`, para que el movimiento reducido y el splash visto se apliquen sin
// parpadeo (guía "How to prevent flash before hydration" de Next.js). Cada acceso al almacenamiento
// va en try/catch porque puede estar bloqueado.
//
// - data-motion="reduced": el sistema o el sitio piden movimiento reducido.
// - data-splash="seen": el splash ya se vio en la sesión, o la primera página cargada no es la raíz
//   (cualquier primera carga de documento cuenta como visita).
import { MOTION_KEY, SPLASH_KEY } from "./preference.ts";

export const INIT_SCRIPT = `(function(){
  try {
    var root = document.documentElement;
    var reduced = false;
    try { reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
    try { if (localStorage.getItem("${MOTION_KEY}") === "reduced") reduced = true; } catch (e) {}
    if (reduced) root.setAttribute("data-motion", "reduced");

    var seen = false;
    try { seen = sessionStorage.getItem("${SPLASH_KEY}") === "1"; } catch (e) {}
    if (!/^\\/(es|en)\\/?$/.test(location.pathname)) {
      try { sessionStorage.setItem("${SPLASH_KEY}", "1"); } catch (e) {}
      seen = true;
    }
    if (seen) root.setAttribute("data-splash", "seen");
  } catch (e) {}
})();`;
