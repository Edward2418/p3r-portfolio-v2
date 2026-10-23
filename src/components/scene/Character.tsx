"use client";

// Oguri, protagonista de la escena. Vive en el layout (dentro de SceneShell), así que no se remonta
// entre pantallas: el idle se carga una sola vez y la posición cambia con la vista (`data-view`) bajo
// la cobertura del barrido. La imagen fija es el primer cuadro del idle (mismo encuadre) y el video
// con transparencia se pide cuando el navegador queda en reposo, solo si el movimiento no está
// reducido ni hay ahorro de datos (specs/003-identidad-visual-p3r/contracts/character-media.md).
import { useEffect, useRef, useState } from "react";
import { character } from "../../content/character.ts";
import { isWebkit, shouldLoadIdle } from "../../lib/motion/idle.ts";
import { useMotionState } from "../../lib/motion/use-motion-state.ts";

/** Tope de espera hasta el reposo del navegador antes de pedir el video, en milisegundos. */
const IDLE_TIMEOUT_MS = 2000;

type IdleState = "pending" | "loading" | "playing" | "failed" | "off";

interface NetworkInformationLike {
  saveData?: boolean;
}

function scheduleWhenIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS });
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(callback, IDLE_TIMEOUT_MS);
  return () => window.clearTimeout(handle);
}

export function Character() {
  const { reduced, busy } = useMotionState();
  const [state, setState] = useState<IdleState>("pending");
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);

  // Pide el video cuando el navegador queda en reposo, si el entorno lo permite. Con movimiento
  // reducido no se programa nada; si pasa a reducido después, se descarta más abajo al renderizar.
  useEffect(() => {
    if (reduced) return;
    return scheduleWhenIdle(() => {
      const connection = (navigator as Navigator & { connection?: NetworkInformationLike }).connection;
      const eligible = shouldLoadIdle({
        reducedMotion: document.documentElement.dataset.motion === "reduced",
        saveData: connection?.saveData === true,
        canPlayWebm: document.createElement("video").canPlayType(character.idle.type) !== "",
        isWebkit: isWebkit(navigator.userAgent),
      });
      if (eligible) {
        setVideoSrc(character.idle.src);
        setState("loading");
      } else {
        setState("off");
      }
    });
  }, [reduced]);

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
  const dataIdle: IdleState = reduced ? "off" : state;

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
