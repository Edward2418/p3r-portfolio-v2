"use client";

// Oguri, protagonista de la escena. Vive en el layout (dentro de SceneShell), así que no se remonta
// entre pantallas: el idle se carga una sola vez y la posición cambia con la vista (`data-view`) bajo
// la cobertura del barrido. La imagen fija es el primer cuadro del idle (mismo encuadre) y el video
// con transparencia (1.2 MB) se pide "bajo demanda": en la primera interacción del visitante o, si no
// hay ninguna, unos segundos después de cargar la página, y siempre cuando el navegador esté en
// reposo; solo si el movimiento no está reducido ni hay ahorro de datos (research.md, D5 y R8;
// specs/003-identidad-visual-p3r/contracts/character-media.md).
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { character } from "../../content/character.ts";
import { isWebkit, shouldLoadIdle } from "../../lib/motion/idle.ts";
import { useMotionState } from "../../lib/motion/use-motion-state.ts";

/** Espera máxima tras cargar la página, sin ninguna interacción, antes de pedir el video. */
const IDLE_DELAY_MS = 8000;
/** Tope de espera hasta el reposo del navegador una vez llegado el momento de pedir el video. */
const IDLE_TIMEOUT_MS = 2000;

const FIRST_INTERACTION_EVENTS = ["pointerdown", "keydown", "touchstart", "wheel"] as const;

type IdleState = "pending" | "loading" | "playing" | "failed" | "off";

interface NetworkInformationLike {
  saveData?: boolean;
}

let environmentCache: boolean | null = null;

/** Elegibilidad del entorno (sin el movimiento reducido, que se lee de <html>); se calcula una sola vez. */
function environmentAllowsIdle(): boolean {
  if (environmentCache === null) {
    const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
    environmentCache = shouldLoadIdle({
      reducedMotion: false,
      saveData: connection?.saveData === true,
      canPlayWebm: document.createElement("video").canPlayType(character.idle.type) !== "",
      isWebkit: isWebkit(navigator.userAgent),
    });
  }
  return environmentCache;
}

const subscribeNever = () => () => undefined;

/** Ejecuta `callback` cuando el navegador queda en reposo (con tope de espera). */
function scheduleWhenIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(callback, IDLE_TIMEOUT_MS);
  return () => window.clearTimeout(handle);
}

/**
 * Ejecuta `callback` en la primera interacción o, sin ella, tras `IDLE_DELAY_MS` desde que la página
 * terminó de cargar; en ambos casos esperando antes al reposo del navegador.
 */
function scheduleOnDemand(callback: () => void): () => void {
  let cancelIdle: (() => void) | null = null;
  let timer: number | undefined;
  let started = false;

  const stopListening = () => {
    window.clearTimeout(timer);
    for (const type of FIRST_INTERACTION_EVENTS) window.removeEventListener(type, start, { capture: true });
    window.removeEventListener("load", onLoad);
  };
  function start() {
    if (started) return;
    started = true;
    stopListening();
    cancelIdle = scheduleWhenIdle(callback);
  }
  function onLoad() {
    timer = window.setTimeout(start, IDLE_DELAY_MS);
  }

  for (const type of FIRST_INTERACTION_EVENTS) {
    window.addEventListener(type, start, { once: true, passive: true, capture: true });
  }
  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });

  return () => {
    started = true; // evita que un evento tardío arranque la carga tras desmontar
    stopListening();
    cancelIdle?.();
  };
}

export function Character() {
  const { reduced, busy } = useMotionState();
  // La inelegibilidad del entorno (ahorro de datos, sin WebM, WebKit) se conoce al hidratar: en el
  // servidor se asume elegible y el cliente corrige sin discrepancia de hidratación.
  const environmentOk = useSyncExternalStore(subscribeNever, environmentAllowsIdle, () => true);
  const [state, setState] = useState<IdleState>("pending");
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);

  // Pide el video bajo demanda, si el entorno lo permite. Con movimiento reducido no se programa
  // nada; si pasa a reducido después, se descarta más abajo al renderizar.
  useEffect(() => {
    if (reduced || !environmentOk) return;
    return scheduleOnDemand(() => {
      setVideoSrc(character.idle.src);
      setState("loading");
    });
  }, [reduced, environmentOk]);

  // Pausa el video durante las transiciones y con la pestaña oculta; lo reanuda al terminar.
  useEffect(() => {
    const element = video.current;
    if (!element || !videoSrc) return;
    function sync() {
      if (!element) return;
      if (busy || document.hidden) {
        element.pause();
      } else {
        element.play().catch(() => {
          // El navegador rechazó la reproducción: se queda la imagen fija, sin avisos.
          setState("failed");
          setVideoSrc(null);
        });
      }
    }
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [busy, videoSrc]);

  // Con movimiento reducido no se muestra el video aunque ya estuviera cargado.
  const showVideo = videoSrc !== null && !reduced;
  const dataIdle: IdleState = reduced || !environmentOk ? "off" : state;

  return (
    <div data-character-root aria-hidden="true" data-idle={dataIdle}>
      <div data-character>
        {/* Imagen decorativa y estática con dimensiones fijas: next/image no aporta nada (research D3). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={character.poster.src}
          width={character.poster.width}
          height={character.poster.height}
          alt=""
          decoding="async"
          fetchPriority="low"
          draggable={false}
        />
        {showVideo ? (
          <video
            ref={video}
            src={videoSrc}
            muted
            loop
            playsInline
            preload="auto"
            onPlaying={() => setState("playing")}
            onError={() => {
              setState("failed");
              setVideoSrc(null);
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
