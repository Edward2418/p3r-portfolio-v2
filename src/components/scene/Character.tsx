"use client";

// Oguri, protagonista de la escena. Vive en el layout (dentro de SceneShell), así que no se remonta
// entre pantallas: el idle se carga una sola vez y la posición cambia con la vista (`data-view`) bajo
// la cobertura del barrido. La imagen fija es el primer cuadro del idle (mismo encuadre) y el video
// con transparencia (1.2 MB) se pide "bajo demanda": en la primera interacción del visitante o, si no
// hay ninguna, unos segundos después de cargar la página, y siempre cuando el navegador esté en
// reposo; solo en el menú (en las pantallas de lectura Oguri queda quieta) y solo si el movimiento no
// está reducido ni hay ahorro de datos (research.md, D5, R8 y R10;
// specs/003-identidad-visual-p3r/contracts/character-media.md).
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { character } from "../../content/character.ts";
import { isWebkit, shouldLoadIdle } from "../../lib/motion/idle.ts";
import { useMotionState } from "../../lib/motion/use-motion-state.ts";
import { useScene } from "./SceneShell.tsx";

/** Espera máxima tras cargar la página, sin ninguna interacción, antes de pedir el video. */
const IDLE_DELAY_MS = 8000;
/** Margen tras la primera interacción: deja terminar la transición que esa interacción suele iniciar. */
const SETTLE_AFTER_INTERACTION_MS = 1500;
/** Tope de espera hasta el reposo del navegador una vez llegado el momento de pedir el video. */
const IDLE_TIMEOUT_MS = 2000;
/**
 * Pausa entre el final del video y su reinicio: el video se funde a la imagen fija (el primer cuadro) y
 * vuelve, en vez de saltar del último cuadro al primero. Iguala a `--duration-fast`, que dura el fundido.
 */
const LOOP_GAP_MS = 150;

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
 * Ejecuta `callback` en la primera interacción (con un margen para que termine la transición que suele
 * iniciar) o, sin ella, tras `IDLE_DELAY_MS` desde que la página terminó de cargar; en ambos casos
 * esperando antes al reposo del navegador.
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
  function begin(settleMs: number) {
    if (started) return;
    started = true;
    stopListening();
    timer = window.setTimeout(() => {
      cancelIdle = scheduleWhenIdle(callback);
    }, settleMs);
  }
  function start() {
    begin(SETTLE_AFTER_INTERACTION_MS);
  }
  function onLoad() {
    timer = window.setTimeout(() => begin(0), IDLE_DELAY_MS);
  }

  for (const type of FIRST_INTERACTION_EVENTS) {
    window.addEventListener(type, start, { once: true, passive: true, capture: true });
  }
  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });

  return () => {
    started = true; // evita que un evento tardío arranque la carga tras desmontar
    stopListening();
    window.clearTimeout(timer);
    cancelIdle?.();
  };
}

export function Character() {
  const { reduced, busy } = useMotionState();
  const { view } = useScene();
  // La inelegibilidad del entorno (ahorro de datos, sin WebM, WebKit) se conoce al hidratar: en el
  // servidor se asume elegible y el cliente corrige sin discrepancia de hidratación.
  const environmentOk = useSyncExternalStore(subscribeNever, environmentAllowsIdle, () => true);
  const [state, setState] = useState<IdleState>("pending");
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  // `true` entre el final del video y su reinicio: la imagen fija queda a la vista (fundido del bucle).
  const [gap, setGap] = useState(false);
  const video = useRef<HTMLVideoElement | null>(null);

  // Pide el video bajo demanda, si el entorno lo permite y Oguri está en el menú. Con movimiento
  // reducido no se programa nada; quien entra directo a una pantalla de lectura no lo descarga.
  useEffect(() => {
    if (reduced || !environmentOk || view !== "menu" || videoSrc !== null) return;
    return scheduleOnDemand(() => {
      setVideoSrc(character.idle.src);
      setState("loading");
    });
  }, [reduced, environmentOk, view, videoSrc]);

  // Reproduce solo en el menú, sin movimiento reducido y sin transición en curso; en las pantallas de
  // lectura, con la pestaña oculta o durante el hueco del bucle se queda pausado (sin decodificar).
  const shouldPlay = !busy && view === "menu" && !reduced && !gap;
  useEffect(() => {
    const element = video.current;
    if (!element || !videoSrc) return;
    function sync() {
      if (!element) return;
      if (!shouldPlay || document.hidden) {
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
  }, [shouldPlay, videoSrc]);

  // Hueco del bucle: tras el último cuadro se funde a la imagen fija y se reinicia desde el primero.
  useEffect(() => {
    if (!gap) return;
    const timer = window.setTimeout(() => {
      if (video.current) video.current.currentTime = 0;
      setGap(false);
    }, LOOP_GAP_MS);
    return () => window.clearTimeout(timer);
  }, [gap]);

  const videoVisible = state === "playing" && view === "menu" && !reduced && !gap;
  const dataIdle: IdleState = reduced || !environmentOk ? "off" : state;

  return (
    <div data-character-root aria-hidden="true" data-idle={dataIdle} data-video={videoVisible ? "on" : "off"}>
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
        {videoSrc !== null ? (
          <video
            ref={video}
            src={videoSrc}
            muted
            playsInline
            preload="auto"
            onPlaying={() => setState("playing")}
            onEnded={() => setGap(true)}
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
