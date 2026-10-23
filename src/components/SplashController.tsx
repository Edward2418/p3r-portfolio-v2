"use client";

// Comportamiento mínimo del splash: lo cuenta como visto al mostrarse (recargar no lo repite) y lo cierra
// con la primera tecla o el primer clic. Esa primera entrada se consume para no activar el menú que hay
// debajo; las siguientes funcionan con normalidad. Sin JavaScript, la animación CSS lo cierra sola.
import { useEffect } from "react";
import { SPLASH_KEY } from "../lib/motion/preference.ts";

export function SplashController() {
  useEffect(() => {
    const root = document.documentElement;
    const layer = document.querySelector("[data-splash-layer]");
    if (!layer || root.dataset.splash === "seen") return;
    // Con movimiento reducido la capa no se muestra: no hay nada que cerrar ni que consumir.
    if (getComputedStyle(layer).display === "none") return;

    try {
      sessionStorage.setItem(SPLASH_KEY, "1");
    } catch {
      // Con el almacenamiento bloqueado el splash puede repetirse; nada se rompe.
    }

    function close() {
      root.dataset.splash = "seen";
      document.removeEventListener("keydown", onInput, true);
      document.removeEventListener("click", onInput, true);
    }
    function onInput(event: Event) {
      event.stopPropagation();
      if (event.type === "click") event.preventDefault();
      close();
    }

    document.addEventListener("keydown", onInput, true);
    document.addEventListener("click", onInput, true);
    layer.addEventListener("animationend", close);
    return () => {
      document.removeEventListener("keydown", onInput, true);
      document.removeEventListener("click", onInput, true);
      layer.removeEventListener("animationend", close);
    };
  }, []);

  return null;
}
