"use client";

// Interruptor de movimiento reducido del encabezado (hasta que exista System en la fase 6).
// Anuncia su estado con aria-pressed; si el sistema ya pide movimiento reducido aparece activado y
// deshabilitado con una nota. La elección se guarda en `localStorage` y el script en línea del <head>
// la aplica antes de pintar; aquí solo se actualiza el atributo cuando el visitante cambia el ajuste.
import { useSyncExternalStore } from "react";
import { effectiveMotion, readSitePreference, writeSitePreference } from "../lib/motion/preference.ts";
import type { StoragePort } from "../lib/motion/preference.ts";

const SYSTEM_QUERY = "(prefers-reduced-motion: reduce)";

function safeStorage(): StoragePort | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function applyMotionAttribute(reduced: boolean) {
  const root = document.documentElement;
  if (reduced) root.setAttribute("data-motion", "reduced");
  else root.removeAttribute("data-motion");
}

// Preferencia del sistema: se lee de la media query y se avisa cuando cambia.
function subscribeSystem(onChange: () => void) {
  const query = window.matchMedia(SYSTEM_QUERY);
  const listener = () => {
    applyMotionAttribute(effectiveMotion(query.matches, getSite() ? "reduced" : "full") === "reduced");
    onChange();
  };
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
const getSystem = () => window.matchMedia(SYSTEM_QUERY).matches;

// Elección del sitio: `localStorage`, con un respaldo en memoria por si está bloqueado.
let sessionOverride: boolean | null = null;
const siteListeners = new Set<() => void>();
function subscribeSite(onChange: () => void) {
  siteListeners.add(onChange);
  return () => siteListeners.delete(onChange);
}
function getSite(): boolean {
  return sessionOverride ?? readSitePreference(safeStorage()) === "reduced";
}
function setSite(next: boolean) {
  sessionOverride = next;
  writeSitePreference(safeStorage(), next ? "reduced" : "full");
  siteListeners.forEach((listener) => listener());
}

interface MotionToggleProps {
  /** Nombre accesible, ya traducido. */
  label: string;
  onText: string;
  offText: string;
  /** Nota que explica por qué está deshabilitado cuando el sistema ya pide movimiento reducido. */
  lockedText: string;
}

export function MotionToggle({ label, onText, offText, lockedText }: MotionToggleProps) {
  // En el servidor ambos valen `false`; tras hidratar React los vuelve a leer del navegador.
  const system = useSyncExternalStore(subscribeSystem, getSystem, () => false);
  const site = useSyncExternalStore(subscribeSite, getSite, () => false);
  const reduced = system || site;

  function toggle() {
    const next = !site;
    setSite(next);
    applyMotionAttribute(effectiveMotion(system, next ? "reduced" : "full") === "reduced");
  }

  return (
    <>
      <button
        type="button"
        aria-pressed={reduced}
        aria-describedby={system ? "motion-locked" : undefined}
        disabled={system}
        onClick={toggle}
        className="inline-flex min-h-11 items-center gap-2 border border-cyan bg-navy px-4 text-cyan transition-transform duration-(--duration-fast) ease-(--ease-out) active:scale-[0.97] hover:bg-cyan hover:text-bg aria-pressed:bg-cyan aria-pressed:text-bg disabled:cursor-not-allowed"
      >
        {label}
        <span aria-hidden="true" className="text-xs font-semibold uppercase">
          {reduced ? onText : offText}
        </span>
      </button>
      {system ? (
        <span id="motion-locked" className="sr-only">
          {lockedText}
        </span>
      ) : null}
    </>
  );
}
