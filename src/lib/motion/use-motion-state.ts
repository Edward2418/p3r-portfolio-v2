"use client";

// Estado de movimiento de la escena leído de los atributos de <html>:
// - `data-motion="reduced"`: el sistema o el sitio piden movimiento reducido (lo fija el script del <head>
//   y el interruptor de movimiento).
// - `data-scene-busy`: hay una transición en curso (lo fija transition.ts).
// Se observa con un MutationObserver compartido y se lee con useSyncExternalStore, así que en el
// servidor ambos valen `false` y tras hidratar React los vuelve a leer del navegador.
import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let observer: MutationObserver | null = null;

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  if (!observer) {
    observer = new MutationObserver(() => listeners.forEach((listener) => listener()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-motion", "data-scene-busy"],
    });
  }
  return () => {
    listeners.delete(onChange);
    if (listeners.size === 0) {
      observer?.disconnect();
      observer = null;
    }
  };
}

const getReduced = () => document.documentElement.dataset.motion === "reduced";
const getBusy = () => document.documentElement.hasAttribute("data-scene-busy");

export function useMotionState(): { reduced: boolean; busy: boolean } {
  const reduced = useSyncExternalStore(subscribe, getReduced, () => false);
  const busy = useSyncExternalStore(subscribe, getBusy, () => false);
  return { reduced, busy };
}
