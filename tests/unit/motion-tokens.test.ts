import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { buildTimeline, parseCssTime } from "../../src/lib/motion/timeline.ts";

// Protege los tokens de movimiento de globals.css (FR-019, SC-010): único lugar donde se definen los
// tiempos y las curvas de la transición de escena.

const css = readFileSync(join("src", "app", "globals.css"), "utf8");

function token(name: string): string {
  const match = new RegExp(`${name}:\\s*([^;]+);`).exec(css);
  assert.ok(match, `falta el token ${name} en globals.css`);
  return match[1].trim();
}

const time = (name: string) => parseCssTime(token(name));

test("existen los tokens de duración de la transición y cada uno es positivo", () => {
  for (const name of [
    "--duration-wipe-out",
    "--duration-stagger-in",
    "--stagger-step",
    "--duration-hold",
    "--duration-circle",
    "--duration-reduced",
    "--duration-splash",
    "--duration-nav-timeout",
  ]) {
    assert.ok(time(name) > 0, `${name} debe ser mayor que cero`);
  }
});

test("la suma de los tramos (salida, entrada, pausa y cierre) está entre 500 y 800 ms", () => {
  const { total } = buildTimeline({
    wipeOut: time("--duration-wipe-out"),
    staggerIn: time("--duration-stagger-in"),
    hold: time("--duration-hold"),
    circle: time("--duration-circle"),
  });
  assert.ok(total >= 500 && total <= 800, `la suma de los tokens es ${total} ms y debe estar entre 500 y 800`);
});

test("la medición real incluye ~130 ms de navegación: la suma de tokens deja margen bajo 800 ms", () => {
  const { total } = buildTimeline({
    wipeOut: time("--duration-wipe-out"),
    staggerIn: time("--duration-stagger-in"),
    hold: time("--duration-hold"),
    circle: time("--duration-circle"),
  });
  assert.ok(total + 130 <= 800, `${total} ms más ~130 ms de navegación supera los 800 ms medidos`);
});

test("el escalonado cabe dentro del tramo de entrada y el paso está entre 30 y 80 ms", () => {
  const step = time("--stagger-step");
  assert.ok(step >= 30 && step <= 80, `--stagger-step es ${step} ms y debe estar entre 30 y 80`);
  assert.ok(step < time("--duration-stagger-in"), "el paso debe ser menor que el tramo de entrada");
});

test("la variante reducida y el splash respetan sus límites", () => {
  assert.ok(time("--duration-reduced") <= 200, "el fundido reducido debe durar como máximo 200 ms");
  assert.ok(time("--duration-splash") <= 1500, "el splash debe cerrarse solo en un máximo de 1.5 s");
  assert.ok(time("--duration-nav-timeout") <= 1500, "la espera del destino es de 1.5 s como máximo");
});

test("existen las curvas --ease-out y --ease-in-out", () => {
  assert.match(token("--ease-out"), /^cubic-bezier\(/, "--ease-out debe ser una curva cubic-bezier");
  assert.match(token("--ease-in-out"), /^cubic-bezier\(/, "--ease-in-out debe ser una curva cubic-bezier");
});

function listFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listFiles(path) : [path];
  });
}

test("los componentes de escena y de menú existen y están dentro de lo que vigila tokens.test.ts", () => {
  const files = listFiles(join("src", "components"));
  for (const expected of ["transition.ts", "SceneShell.tsx", "MainMenu.tsx", "TransitionLayer.tsx"]) {
    assert.ok(
      files.some((file) => file.endsWith(expected)),
      `tokens.test.ts debe recorrer ${expected} para vigilar que no tenga valores sueltos`,
    );
  }
});

test("el controlador de la transición lee los tiempos de los tokens y no los escribe en el código", () => {
  const source = readFileSync(join("src", "components", "scene", "transition.ts"), "utf8");
  assert.match(source, /--duration-wipe-out/, "debe leer el token de la salida");
  assert.match(source, /--duration-circle/, "debe leer el token del cierre");
  assert.doesNotMatch(source, /\b\d{3,4}\s*(?:ms|\))\b/, "no debe escribir duraciones en milisegundos");
});
