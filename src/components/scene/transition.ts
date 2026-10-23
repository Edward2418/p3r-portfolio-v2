// Controlador de la transición de escena (contracts/scene-transition.md), con la Web Animations API.
// Secuencia: salida (barrido) → navegación → entrada escalonada → pausa → cierre (anillo).
// Solo se animan `transform` y `opacity`; los tiempos y las curvas salen de los tokens de globals.css.
// El efecto equivale al barrido diagonal, la entrada de fichas de abajo hacia arriba y el arco circular
// del menú de pausa de Persona 3 Reload (medido en el video de referencia; ver research.md, D4).
import { parseCssTime, staggerPlan } from "../../lib/motion/timeline.ts";

export type TransitionPhase = "idle" | "exiting" | "navigating" | "entering" | "closing";

interface Tokens {
  wipeOut: number;
  staggerIn: number;
  staggerStep: number;
  hold: number;
  circle: number;
  reduced: number;
  navTimeout: number;
  easeOut: string;
  easeInOut: string;
}

/** Duración mínima de la entrada de una ficha, en milisegundos. */
const MIN_ITEM_DURATION = 100;

export function readTokens(): Tokens {
  const style = getComputedStyle(document.documentElement);
  const time = (name: string) => parseCssTime(style.getPropertyValue(name));
  const curve = (name: string) => style.getPropertyValue(name).trim();
  return {
    wipeOut: time("--duration-wipe-out"),
    staggerIn: time("--duration-stagger-in"),
    staggerStep: time("--stagger-step"),
    hold: time("--duration-hold"),
    circle: time("--duration-circle"),
    reduced: time("--duration-reduced"),
    navTimeout: time("--duration-nav-timeout"),
    easeOut: curve("--ease-out"),
    easeInOut: curve("--ease-in-out"),
  };
}

export function supportsWaapi(): boolean {
  return typeof Element !== "undefined" && typeof Element.prototype.animate === "function";
}

/** Movimiento reducido: preferencia del sistema o atributo del sitio (lo fija el script del <head>). */
export function prefersReducedMotion(): boolean {
  if (document.documentElement.dataset.motion === "reduced") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface TransitionController {
  isBusy(): boolean;
  /** Salida con barrido. Devuelve `false` si se interrumpió. */
  exit(): Promise<boolean>;
  /** Entrada escalonada, pausa y cierre. Devuelve `false` si se interrumpió. */
  enter(): Promise<boolean>;
  /** Solo la entrada, corta (botón Atrás o Adelante del navegador). */
  enterShort(): Promise<void>;
  /** Variante reducida: fundido de opacidad del contenido. */
  fadeIn(): Promise<void>;
  /** Termina de inmediato todas las animaciones y deja el destino visible; devuelve si había algo en curso. */
  skip(): boolean;
  /** Oculta la capa sin animar (por ejemplo, si el destino tarda demasiado). */
  release(): void;
}

export function createTransitionController(): TransitionController {
  const running = new Set<Animation>();
  let phase: TransitionPhase = "idle";
  let skipped = false;

  const layer = () => document.querySelector<HTMLElement>("[data-transition-layer]");
  const part = (name: string) => layer()?.querySelector<HTMLElement>(`[data-${name}]`) ?? null;
  const mark = (name: string) => performance.mark(`scene-transition:${name}`);

  function setPhase(next: TransitionPhase) {
    phase = next;
    const element = layer();
    if (element) element.dataset.phase = next;
  }

  /** Reproduce una animación y la registra para poder terminarla al interrumpir. */
  function run(element: Element | null, keyframes: Keyframe[], options: KeyframeAnimationOptions): Promise<void> {
    if (!element) return Promise.resolve();
    const target = element as HTMLElement;
    if (options.fill !== "backwards") target.style.willChange = "transform, opacity";
    const animation = element.animate(keyframes, options);
    running.add(animation);
    return animation.finished
      .then(
        () => undefined,
        () => undefined,
      )
      .finally(() => {
        running.delete(animation);
        target.style.willChange = "";
      });
  }

  /** Deja la capa en reposo: cancela sus animaciones y la oculta. */
  function releaseLayer() {
    layer()
      ?.getAnimations({ subtree: true })
      .forEach((animation) => animation.cancel());
    const wipe = part("wipe");
    if (wipe) wipe.style.visibility = "";
    setPhase("idle");
  }

  function finish(completed: boolean) {
    releaseLayer();
    if (completed) {
      mark("end");
      performance.measure("scene-transition", "scene-transition:start", "scene-transition:end");
    }
  }

  /** Entrada de las fichas (de abajo hacia arriba) y del personaje (desde la derecha, rotado). */
  function playStagger(totalMs: number, tokens: Tokens): Promise<void>[] {
    const items = [...document.querySelectorAll<HTMLElement>("[data-stagger]")].reverse();
    const plan = staggerPlan(items.length, tokens.staggerStep, totalMs, MIN_ITEM_DURATION);
    const jobs = items.map((item, index) =>
      run(
        item,
        [
          { transform: "translateY(28px)", opacity: 0 },
          { transform: "translateY(0)", opacity: 1 },
        ],
        { duration: plan.duration, delay: plan.delays[index], easing: tokens.easeOut, fill: "backwards" },
      ),
    );
    jobs.push(
      run(
        document.querySelector("[data-character]"),
        [
          { transform: "translateX(40%) rotate(8deg)", opacity: 0 },
          { transform: "translateX(0) rotate(0deg)", opacity: 1 },
        ],
        { duration: totalMs, easing: tokens.easeOut, fill: "backwards" },
      ),
    );
    return jobs;
  }

  return {
    isBusy: () => phase !== "idle",

    async exit() {
      skipped = false;
      const tokens = readTokens();
      performance.mark("scene-transition:start");
      setPhase("exiting");
      mark("wipe-out");
      const wipe = part("wipe");
      if (wipe) wipe.style.visibility = "visible";
      await run(
        wipe,
        [{ transform: "translateX(110%) skewX(-20deg)" }, { transform: "translateX(0%) skewX(-20deg)" }],
        { duration: tokens.wipeOut, easing: tokens.easeInOut, fill: "forwards" },
      );
      if (skipped) return false;
      setPhase("navigating");
      return true;
    },

    async enter() {
      if (skipped) {
        finish(false);
        return false;
      }
      const tokens = readTokens();
      setPhase("entering");
      mark("enter");
      // Se descubre la pantalla nueva: el panel desaparece y un contorno hexagonal se contrae.
      const wipe = part("wipe");
      if (wipe) wipe.style.visibility = "hidden";
      await Promise.all([
        run(
          part("outline"),
          [
            { transform: "scale(1.15)", opacity: 1 },
            { transform: "scale(0.15)", opacity: 0 },
          ],
          { duration: Math.round(tokens.staggerIn / 2), easing: tokens.easeOut, fill: "forwards" },
        ),
        ...playStagger(tokens.staggerIn, tokens),
      ]);
      if (skipped) {
        finish(false);
        return false;
      }

      setPhase("closing");
      mark("hold");
      await run(layer(), [{ opacity: 1 }, { opacity: 1 }], { duration: tokens.hold });
      if (skipped) {
        finish(false);
        return false;
      }

      mark("circle");
      await run(
        part("circle"),
        [
          { transform: "scale(0.1)", opacity: 1 },
          { transform: "scale(1)", opacity: 0 },
        ],
        { duration: tokens.circle, easing: tokens.easeOut, fill: "forwards" },
      );
      finish(!skipped);
      return !skipped;
    },

    async enterShort() {
      skipped = false;
      const tokens = readTokens();
      setPhase("entering");
      mark("enter");
      await Promise.all(playStagger(Math.round(tokens.staggerIn / 2), tokens));
      releaseLayer();
    },

    async fadeIn() {
      const tokens = readTokens();
      await run(document.querySelector("main"), [{ opacity: 0 }, { opacity: 1 }], {
        duration: tokens.reduced,
        easing: tokens.easeOut,
      });
    },

    skip() {
      if (phase === "idle") return false;
      skipped = true;
      performance.mark("scene-transition-skipped");
      for (const animation of [...running]) animation.finish();
      releaseLayer();
      return true;
    },

    release() {
      releaseLayer();
    },
  };
}
