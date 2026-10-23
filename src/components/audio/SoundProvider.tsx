"use client";

// Proveedor del sonido: expone si está activado, cómo cambiarlo y cómo reproducir una acción. El
// estado se lee con useSyncExternalStore (valor de servidor `false`) para no producir discrepancias
// de hidratación cuando hay `on` guardado. Si el sonido ya estaba activado en una visita anterior, el
// audio se pide tras la primera interacción (tecla, clic o toque), no antes.
import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import type { SoundAction } from "../../lib/audio/events.ts";
import { getSoundEnabled, loadSounds, playSound, setSoundEnabled, subscribeSound } from "./sound-store.ts";

interface SoundContextValue {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  play: (action: SoundAction) => void;
}

const SoundContext = createContext<SoundContextValue | null>(null);

export function useSound(): SoundContextValue {
  const value = useContext(SoundContext);
  if (!value) throw new Error("useSound debe usarse dentro de SoundProvider");
  return value;
}

const FIRST_INTERACTION_EVENTS = ["pointerdown", "keydown", "touchstart"] as const;

export function SoundProvider({ children }: { children: ReactNode }) {
  const enabled = useSyncExternalStore(subscribeSound, getSoundEnabled, () => false);

  useEffect(() => {
    if (!enabled) return;
    const onFirstInteraction = () => loadSounds();
    for (const type of FIRST_INTERACTION_EVENTS) {
      window.addEventListener(type, onFirstInteraction, { once: true, passive: true, capture: true });
    }
    return () => {
      for (const type of FIRST_INTERACTION_EVENTS) {
        window.removeEventListener(type, onFirstInteraction, { capture: true });
      }
    };
  }, [enabled]);

  const value = useMemo<SoundContextValue>(
    () => ({ enabled, setEnabled: setSoundEnabled, play: playSound }),
    [enabled],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}
