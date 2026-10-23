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

    // La entrada de Oguri espera al final del splash (retraso en CSS mientras `data-splash` no sea
    // `seen`). Si el splash se omite a mitad, ese retraso desaparece con la animación ya "vencida" y Oguri
    // aparecería de golpe: se reinicia la animación para que entre en el momento de omitirlo.
    function replayCharacterEntrance() {
      const character = document.querySelector<HTMLElement>("[data-character]");
      if (!character) return;
      character.style.animationName = "none";
      void character.offsetWidth; // fuerza el recálculo de estilo: la animación vuelve a empezar
      character.style.animationName = "";
    }
    function close(skipped: boolean) {
      root.dataset.splash = "seen";
      if (skipped) replayCharacterEntrance();
      document.removeEventListener("keydown", onInput, true);
      document.removeEventListener("click", onInput, true);
    }
    function onEnd() {
      close(false);
    }
    function onInput(event: Event) {
      event.stopPropagation();
      if (event.type === "click") event.preventDefault();
      close(true);
    }

    document.addEventListener("keydown", onInput, true);
    document.addEventListener("click", onInput, true);
    layer.addEventListener("animationend", onEnd);
    return () => {
      document.removeEventListener("keydown", onInput, true);
      document.removeEventListener("click", onInput, true);
      layer.removeEventListener("animationend", onEnd);
    };
  }, []);

  return null;
}
