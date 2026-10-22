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
