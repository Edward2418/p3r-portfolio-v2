"use client";

// Contenedor persistente de la escena: vive en el layout de `[lang]`, así que se conserva entre las
// pantallas. Ofrece `navigate` (que orquesta la transición), `go`, la opción activa del menú y las
// entradas de teclado y de deslizamiento.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Lang, SceneId, ViewKind } from "../../content/types.ts";
import { neighbors, resolveScreenKey, shouldIgnoreKey } from "../../lib/motion/navigation.ts";
import type { ScreenAction } from "../../lib/motion/navigation.ts";
import { detectSwipe } from "../../lib/motion/swipe.ts";
import { useSound } from "../audio/SoundProvider.tsx";
import { GuideBar } from "./GuideBar.tsx";
import { TransitionLayer } from "./TransitionLayer.tsx";
import {
  createTransitionController,
  prefersReducedMotion,
  readTokens,
  supportsWaapi,
} from "./transition.ts";

/** Ventana en la que una navegación pedida tras interrumpir se considera parte de la interrupción. */
const INTERRUPT_WINDOW_MS = 150;

export interface SceneInfo {
  id: SceneId;
  name: string;
  description: string;
}

export interface SceneLabels {
  confirm: string;
  back: string;
  tabPrevious: string;
  tabNext: string;
  tabPreviousShort: string;
  tabNextShort: string;
  guideLabel: string;
  guideScreenHint: string;
}

interface SceneContextValue {
  lang: Lang;
  scenes: SceneInfo[];
  labels: SceneLabels;
  /** Pantalla actual; `null` en el menú. */
  sceneId: SceneId | null;
  /** Vista actual: el menú o una pantalla interna (fija la posición del personaje y del panel). */
  view: ViewKind;
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
  const [controller] = useState(createTransitionController);
  const { play } = useSound();

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
  const view: ViewKind = sceneId === null ? "menu" : "screen";
  // Vista anterior: decide si la llegada suena `open` (menú → pantalla) o `close` (pantalla → menú).
  const previousView = useRef<ViewKind>(view);

  // Destino lógico: la ruta que se pidió más recientemente. La URL y el estado de React se actualizan
  // un instante después de pedir la navegación; si varias teclas llegan seguidas, cada una debe partir
  // del destino ya pedido y no de la pantalla anterior.
  const logicalPath = useRef(pathname);
  useEffect(() => {
    logicalPath.current = pathname;
  }, [pathname]);

  // Espera de la ruta destino: la resuelve el efecto de cambio de ruta cuando el destino ya se pintó.
  const arrival = useRef<{ path: string; resolve: (arrived: boolean) => void } | null>(null);
  const runId = useRef(0);

  const waitForArrival = useCallback((path: string, timeoutMs: number) => {
    return new Promise<boolean>((resolve) => {
      arrival.current?.resolve(false);
      const timer = setTimeout(() => {
        if (arrival.current?.path === path) arrival.current = null;
        resolve(false);
      }, timeoutMs);
      arrival.current = {
        path,
        resolve: (arrived) => {
          clearTimeout(timer);
          resolve(arrived);
        },
      };
    });
  }, []);

  // Interrupción: un clic, un toque o una tecla durante la transición la termina de inmediato. Si la
  // misma acción pide una navegación (por ejemplo otra pestaña L o R), esta se hace también sin
  // animación: el visitante tiene prisa y el destino final es el de la última acción.
  const lastInterrupt = useRef(0);
  const skipEntrance = useRef(false);
  useEffect(() => {
    function interrupt() {
      if (controller.skip()) lastInterrupt.current = performance.now();
    }
    document.addEventListener("keydown", interrupt, true);
    document.addEventListener("pointerdown", interrupt, true);
    document.addEventListener("click", interrupt, true);
    return () => {
      document.removeEventListener("keydown", interrupt, true);
      document.removeEventListener("pointerdown", interrupt, true);
      document.removeEventListener("click", interrupt, true);
    };
  }, [controller]);

  const navigate = useCallback(
    (href: string) => {
      const path = href.split("?")[0];
      if (path === logicalPath.current && !controller.isBusy()) return;
      logicalPath.current = path;

      const interrupting =
        controller.skip() || performance.now() - lastInterrupt.current < INTERRUPT_WINDOW_MS;

      // Sin movimiento (preferencia reducida o sin Web Animations) o por una interrupción: cambio directo.
      if (!supportsWaapi() || prefersReducedMotion() || interrupting) {
        runId.current += 1; // invalida la transición anterior, si la hubiera
        arrival.current?.resolve(false);
        arrival.current = null;
        skipEntrance.current = interrupting;
        router.push(href);
        return;
      }

      const id = ++runId.current;
      router.prefetch(href);
      void (async () => {
        try {
          const exited = await controller.exit();
          if (id !== runId.current) return;
          router.push(href);
          const arrived = await waitForArrival(path, readTokens().navTimeout);
          if (id !== runId.current) return;
          if (!arrived) {
            // El destino tardó demasiado: se muestra sin entrada escalonada cuando llegue.
            performance.mark("scene-transition-waited");
            controller.release();
            return;
          }
          if (exited) await controller.enter();
          else controller.release();
        } catch {
          // Si el movimiento falla por cualquier causa, la navegación sigue sin animación.
          controller.release();
          if (id === runId.current) router.push(href);
        }
      })();
    },
    [controller, router, waitForArrival],
  );

  const go = useCallback(
    (action: ScreenAction) => {
      if (action === "menu") {
        play("cancel");
        navigate(`/${lang}`);
        return;
      }
      const current = sceneFromPath(logicalPath.current, scenes);
      if (!current) return;
      const { prev, next } = neighbors(scenes, current);
      const target = action === "prev" ? prev : next;
      if (target) {
        play("screen-change");
        navigate(`/${lang}/${target.id}`);
      }
    },
    [lang, navigate, play, scenes],
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

  // Tras cada cambio de ruta: llegada del destino (continúa la transición), entrada corta o fundido
  // cuando el cambio no lo pidió `navigate` (botón Atrás o Adelante del navegador) y foco en el <h1>
  // (o en la opción activa del menú). No actúa en la carga inicial. El anuncio a los lectores de
  // pantalla lo hace el anunciador de rutas de Next.js con el <title> de cada pantalla; una región
  // propia lo duplicaba.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Sonido de llegada: una sola vez por cambio de vista y por cualquier camino (transición completa,
    // interrupción, movimiento reducido o botón Atrás del navegador). Entre pantallas solo suena el cursor.
    if (previousView.current === "menu" && view === "screen") play("arrive-screen");
    else if (previousView.current === "screen" && view === "menu") play("arrive-menu");
    previousView.current = view;

    const pending = arrival.current;
    if (pending && pending.path === pathname) {
      arrival.current = null;
      pending.resolve(true);
    } else if (skipEntrance.current) {
      skipEntrance.current = false; // llegada por una interrupción: sin entrada, el destino ya está visible
    } else if (!supportsWaapi() || prefersReducedMotion()) {
      void controller.fadeIn();
    } else {
      void controller.enterShort();
    }

    const frame = requestAnimationFrame(() => {
      if (sceneId) {
        document.querySelector<HTMLElement>("main h1")?.focus({ preventScroll: true });
      } else {
        document.querySelector<HTMLElement>('nav a[aria-current="true"]')?.focus({ preventScroll: true });
      }
    });
    return () => cancelAnimationFrame(frame);
    // Solo debe ejecutarse al cambiar de ruta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const value = useMemo<SceneContextValue>(
    () => ({ lang, scenes, labels, sceneId, view, previousSceneId, activeMenuId, setActiveMenuId, navigate, go }),
    [lang, scenes, labels, sceneId, view, previousSceneId, activeMenuId, navigate, go],
  );

  return (
    <SceneContext.Provider value={value}>
      <div data-view={view} className="relative flex min-h-screen touch-pan-y flex-col">
        {children}
        <GuideBar />
        <TransitionLayer />
      </div>
    </SceneContext.Provider>
  );
}
