"use client";

// Contenedor persistente de la escena: vive en el layout de `[lang]`, así que se conserva entre las
// pantallas. Ofrece `navigate`, `go`, la opción activa del menú y las entradas de teclado y de
// deslizamiento. En la historia de las transiciones, `navigate` pasa a orquestar la animación.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Lang, SceneId } from "../../content/types.ts";
import { neighbors, resolveScreenKey, shouldIgnoreKey } from "../../lib/motion/navigation.ts";
import type { ScreenAction } from "../../lib/motion/navigation.ts";
import { detectSwipe } from "../../lib/motion/swipe.ts";
import { GuideBar } from "./GuideBar.tsx";

export interface SceneInfo {
  id: SceneId;
  name: string;
  description: string;
}

export interface SceneLabels {
  menuLabel: string;
  confirm: string;
  back: string;
  tabPrevious: string;
  tabNext: string;
  tabPreviousShort: string;
  tabNextShort: string;
  guideScreenHint: string;
  screenAnnouncement: string;
}

interface SceneContextValue {
  lang: Lang;
  scenes: SceneInfo[];
  labels: SceneLabels;
  /** Pantalla actual; `null` en el menú. */
  sceneId: SceneId | null;
  /** Pantalla de la que se viene (para resaltarla al volver al menú). */
  previousSceneId: SceneId | null;
  activeMenuId: SceneId;
  setActiveMenuId: (id: SceneId) => void;
  navigate: (href: string) => void;
  go: (action: ScreenAction) => void;
}

const SceneContext = createContext<SceneContextValue | null>(null);

export function useScene(): SceneContextValue {
  const value = useContext(SceneContext);
  if (!value) throw new Error("useScene debe usarse dentro de SceneShell");
  return value;
}

function sceneFromPath(pathname: string, scenes: SceneInfo[]): SceneId | null {
  const segment = pathname.split("/")[2];
  return scenes.find((scene) => scene.id === segment)?.id ?? null;
}

interface SceneShellProps {
  lang: Lang;
  scenes: SceneInfo[];
  labels: SceneLabels;
  children: ReactNode;
}

export function SceneShell({ lang, scenes, labels, children }: SceneShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Seguimiento de la pantalla actual y la anterior; se ajusta durante el renderizado para que el
  // menú ya nazca con la opción correcta al volver (sin un parpadeo posterior).
  const [track, setTrack] = useState(() => ({
    pathname,
    sceneId: sceneFromPath(pathname, scenes),
    previousSceneId: null as SceneId | null,
  }));
  const [activeMenuId, setActiveMenuId] = useState<SceneId>(scenes[0].id);
  if (track.pathname !== pathname) {
    const sceneId = sceneFromPath(pathname, scenes);
    setTrack({ pathname, sceneId, previousSceneId: track.sceneId });
    if (sceneId === null) setActiveMenuId(track.sceneId ?? scenes[0].id);
  }
  const { sceneId, previousSceneId } = track;

  // Destino lógico: la ruta que se pidió más recientemente. La URL y el estado de React se actualizan
  // un instante después de pedir la navegación; si varias teclas llegan seguidas, cada una debe partir
  // del destino ya pedido y no de la pantalla anterior.
  const logicalPath = useRef(pathname);
  useEffect(() => {
    logicalPath.current = pathname;
  }, [pathname]);

  const navigate = useCallback(
    (href: string) => {
      logicalPath.current = href;
      router.push(href);
    },
    [router],
  );

  const go = useCallback(
    (action: ScreenAction) => {
      if (action === "menu") {
        navigate(`/${lang}`);
        return;
      }
      const current = sceneFromPath(logicalPath.current, scenes);
      if (!current) return;
      const { prev, next } = neighbors(scenes, current);
      const target = action === "prev" ? prev : next;
      if (target) navigate(`/${lang}/${target.id}`);
    },
    [lang, navigate, scenes],
  );

  // Precarga las pantallas vecinas y el menú para que el destino ya esté listo al navegar.
  useEffect(() => {
    router.prefetch(`/${lang}`);
    if (!sceneId) return;
    const { prev, next } = neighbors(scenes, sceneId);
    if (prev) router.prefetch(`/${lang}/${prev.id}`);
    if (next) router.prefetch(`/${lang}/${next.id}`);
  }, [lang, router, sceneId, scenes]);

  // Teclado en las pantallas: ← → (RePág, AvPág) y Esc. Las repeticiones de tecla no encadenan cambios.
  useEffect(() => {
    if (!sceneId) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (
        shouldIgnoreKey({
          ctrlKey: event.ctrlKey,
          altKey: event.altKey,
          metaKey: event.metaKey,
          targetTag: target?.tagName,
          isContentEditable: target?.isContentEditable,
        })
      ) {
        return;
      }
      const action = resolveScreenKey(event.key);
      if (!action) return;
      event.preventDefault();
      go(action);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [go, sceneId]);

  // Deslizamiento horizontal con el tacto: solo cuenta si es claramente horizontal.
  const gesture = useRef({ startX: 0, startY: 0, pointers: new Set<number>(), max: 0 });
  useEffect(() => {
    if (!sceneId) return;
    const state = gesture.current;
    function onPointerDown(event: PointerEvent) {
      if (event.pointerType === "mouse") return;
      state.pointers.add(event.pointerId);
      if (state.pointers.size === 1) {
        state.startX = event.clientX;
        state.startY = event.clientY;
        state.max = 1;
      } else {
        state.max = Math.max(state.max, state.pointers.size);
      }
    }
    function onPointerUp(event: PointerEvent) {
      if (!state.pointers.delete(event.pointerId) || state.pointers.size > 0) return;
      const direction = detectSwipe({
        startX: state.startX,
        startY: state.startY,
        endX: event.clientX,
        endY: event.clientY,
        pointers: state.max,
        viewportWidth: window.innerWidth,
      });
      state.max = 0;
      if (direction) go(direction);
    }
    function onPointerCancel(event: PointerEvent) {
      state.pointers.delete(event.pointerId);
      state.max = 0;
    }
    document.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("pointerup", onPointerUp, { passive: true });
    document.addEventListener("pointercancel", onPointerCancel, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [go, sceneId]);

  // Señal de que el componente ya hidrató y registró el teclado y los gestos (la usan las pruebas).
  useEffect(() => {
    document.documentElement.dataset.sceneReady = "true";
    return () => {
      delete document.documentElement.dataset.sceneReady;
    };
  }, []);

  // Tras cada cambio de ruta: el foco va al <h1> de la pantalla (o a la opción activa del menú) y se
  // anuncia el cambio a los lectores de pantalla. No actúa en la carga inicial.
  const [announcement, setAnnouncement] = useState("");
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const frame = requestAnimationFrame(() => {
      if (sceneId) {
        document.querySelector<HTMLElement>("main h1")?.focus({ preventScroll: true });
      } else {
        document.querySelector<HTMLElement>('nav a[aria-current="true"]')?.focus({ preventScroll: true });
      }
    });
    const name = sceneId ? scenes.find((scene) => scene.id === sceneId)?.name : labels.menuLabel;
    setAnnouncement(`${labels.screenAnnouncement}: ${name ?? ""}`);
    return () => cancelAnimationFrame(frame);
    // Solo debe ejecutarse al cambiar de ruta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const value = useMemo<SceneContextValue>(
    () => ({ lang, scenes, labels, sceneId, previousSceneId, activeMenuId, setActiveMenuId, navigate, go }),
    [lang, scenes, labels, sceneId, previousSceneId, activeMenuId, navigate, go],
  );

  return (
    <SceneContext.Provider value={value}>
      <div className="flex min-h-screen touch-pan-y flex-col">
        {children}
        <GuideBar />
        <div role="status" aria-live="polite" className="sr-only">
          {announcement}
        </div>
      </div>
    </SceneContext.Provider>
  );
}
