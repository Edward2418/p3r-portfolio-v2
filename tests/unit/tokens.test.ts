import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

// Regresión: los tokens ya existen desde la fase de fundamentos; estas pruebas los protegen.

const GLOBALS_CSS = join("src", "app", "globals.css");

/** Lee los colores `--color-*: #rrggbb;` de globals.css. */
function readColorTokens(): Record<string, string> {
  const css = readFileSync(GLOBALS_CSS, "utf8");
  const tokens: Record<string, string> = {};
  for (const match of css.matchAll(/--color-([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    tokens[match[1]] = match[2];
  }
  return tokens;
}

/** Luminancia relativa según WCAG 2.x. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const tokens = readColorTokens();

test("los tokens de color existen en globals.css", () => {
  for (const name of ["bg", "text", "cyan", "red", "red-text", "red-fill"]) {
    assert.ok(tokens[name], `falta el token --color-${name}`);
  }
});

test("el texto normal cumple contraste AA (4.5:1)", () => {
  const pairs: [string, string][] = [
    ["text", "bg"],
    ["cyan", "bg"],
    ["red-text", "bg"],
    ["text", "red-fill"],
  ];
  for (const [fg, bg] of pairs) {
    const ratio = contrast(tokens[fg], tokens[bg]);
    assert.ok(ratio >= 4.5, `--color-${fg} sobre --color-${bg} tiene ${ratio.toFixed(2)}:1, mínimo 4.5:1`);
  }
});

test("el rojo de marca cumple contraste para texto grande y gráficos (3:1)", () => {
  const ratio = contrast(tokens.red, tokens.bg);
  assert.ok(ratio >= 3, `--color-red sobre --color-bg tiene ${ratio.toFixed(2)}:1, mínimo 3:1`);
});

test("los tokens de la identidad visual P3R existen", () => {
  for (const name of ["sky", "deep", "panel", "navy", "on-panel", "focus-inner", "focus-outer"]) {
    assert.ok(tokens[name], `falta el token --color-${name}`);
  }
});

test("las superficies de la identidad visual cumplen contraste AA para texto (4.5:1)", () => {
  const pairs: [string, string][] = [
    ["text", "navy"],
    ["cyan", "navy"],
    ["on-panel", "panel"],
  ];
  for (const [fg, bg] of pairs) {
    const ratio = contrast(tokens[fg], tokens[bg]);
    assert.ok(ratio >= 4.5, `--color-${fg} sobre --color-${bg} tiene ${ratio.toFixed(2)}:1, mínimo 4.5:1`);
  }
});

test("el borde rojo y el anillo de foco cumplen contraste de gráficos (3:1) sobre cada superficie", () => {
  // El borde rojo rodea la opción activa, que es blanca.
  const red = contrast(tokens.red, tokens.panel);
  assert.ok(red >= 3, `--color-red sobre --color-panel tiene ${red.toFixed(2)}:1, mínimo 3:1`);

  // Anillo de doble capa: sobre cada superficie debe verse al menos una de las dos capas.
  const surfaces: [string, string][] = [
    ["panel", "focus-inner"],
    ["sky", "focus-inner"],
    ["navy", "focus-outer"],
    ["deep", "focus-outer"],
  ];
  for (const [surface, ring] of surfaces) {
    const ratio = contrast(tokens[ring], tokens[surface]);
    assert.ok(ratio >= 3, `--color-${ring} sobre --color-${surface} tiene ${ratio.toFixed(2)}:1, mínimo 3:1`);
  }
});

// --- Fase 4: tinte y trazo de los círculos del stack (specs/004-quien-soy-y-stack/research.md, D10) ---

/** Mezcla `top` con opacidad `alpha` sobre `base` (colores #rrggbb). */
function blend(top: string, base: string, alpha: number): string {
  const channel = (hex: string, i: number) => parseInt(hex.slice(i, i + 2), 16);
  const mixed = [1, 3, 5].map((i) => Math.round(channel(top, i) * alpha + channel(base, i) * (1 - alpha)));
  return "#" + mixed.map((v) => v.toString(16).padStart(2, "0")).join("");
}

function readOpacityToken(name: string): number | null {
  const match = readFileSync(GLOBALS_CSS, "utf8").match(new RegExp(`--opacity-${name}:\\s*([0-9.]+)\\s*;`));
  return match ? Number(match[1]) : null;
}

test("el token --opacity-circle-tint existe y es un tinte suave (entre 0.08 y 0.2)", () => {
  const tint = readOpacityToken("circle-tint");
  assert.ok(tint !== null, "falta el token --opacity-circle-tint");
  assert.ok(tint >= 0.08 && tint <= 0.2, `el tinte debe estar entre 0.08 y 0.2, es ${tint}`);
});

test("el texto sobre el tinte de cada círculo mantiene contraste AA (4.5:1)", () => {
  const tint = readOpacityToken("circle-tint") ?? 0.14;
  for (const circle of ["cyan", "red", "panel"]) {
    const surface = blend(tokens[circle], tokens.navy, tint);
    for (const text of ["text", "cyan"]) {
      const ratio = contrast(tokens[text], surface);
      assert.ok(ratio >= 4.5, `--color-${text} sobre el tinte de --color-${circle} tiene ${ratio.toFixed(2)}:1, mínimo 4.5:1`);
    }
  }
});

test("el trazo de cada círculo mantiene contraste de gráficos (3:1) contra el panel marino", () => {
  for (const circle of ["cyan", "red", "panel"]) {
    const ratio = contrast(tokens[circle], tokens.navy);
    assert.ok(ratio >= 3, `el trazo --color-${circle} sobre --color-navy tiene ${ratio.toFixed(2)}:1, mínimo 3:1`);
  }
});

/** Lista recursivamente los archivos con las extensiones dadas. */
function listFiles(dir: string, extensions: string[]): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listFiles(path, extensions);
    return extensions.some((ext) => name.endsWith(ext)) ? [path] : [];
  });
}

test("no hay colores sueltos fuera de globals.css", () => {
  const files = [
    ...listFiles(join("src", "components"), [".ts", ".tsx"]),
    ...listFiles(join("src", "app", "[lang]"), [".ts", ".tsx"]),
    join("src", "app", "fonts.ts"),
  ];
  const loose = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch)\(/;
  const offenders = files.filter((file) => loose.test(readFileSync(file, "utf8")));
  assert.deepEqual(offenders, [], "los colores deben venir de los tokens de globals.css");
});

test("no hay duraciones ni curvas sueltas fuera de globals.css", () => {
  const files = [
    ...listFiles(join("src", "components"), [".ts", ".tsx"]),
    ...listFiles(join("src", "app", "[lang]"), [".ts", ".tsx"]),
  ];
  const loose = /\b\d+(?:\.\d+)?m?s\b|cubic-bezier\(/;
  const offenders = files.filter((file) => loose.test(readFileSync(file, "utf8")));
  assert.deepEqual(offenders, [], "las duraciones y curvas deben venir de los tokens");
});
