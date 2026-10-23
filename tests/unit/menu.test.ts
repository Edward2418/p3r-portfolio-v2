import { test } from "node:test";
import assert from "node:assert/strict";
import { menu, uiText } from "../../src/content/index.ts";
import type { SceneId } from "../../src/content/types.ts";

const SCENE_IDS: SceneId[] = ["profile", "stack", "projects", "social-link", "system"];

test("el menú tiene exactamente cinco opciones", () => {
  assert.equal(menu.length, 5, "el menú debe tener cinco opciones");
});

test("los id del menú son los cinco de SceneId, sin repetirse", () => {
  const ids = menu.map((option) => option.id);
  assert.deepEqual([...ids].sort(), [...SCENE_IDS].sort(), "deben estar exactamente los cinco identificadores");
  assert.equal(new Set(ids).size, ids.length, "no debe haber identificadores repetidos");
});

test("el orden del menú es Quién soy, Stack, Proyectos, Social Link, System", () => {
  assert.deepEqual(
    menu.map((option) => option.id),
    ["profile", "stack", "projects", "social-link", "system"],
    "el orden del arreglo es el orden del menú y de las pestañas",
  );
});

test("los nombres del menú existen en español e inglés", () => {
  const names = menu.map((option) => [option.name.es, option.name.en]);
  assert.deepEqual(
    names,
    [
      ["Quién soy", "About me"],
      ["Stack", "Stack"],
      ["Proyectos", "Projects"],
      ["Social Link", "Social Link"],
      ["System", "System"],
    ],
    "los nombres deben ser los definidos en la especificación",
  );
});

test("todo texto del menú y de los textos nuevos tiene español e inglés no vacíos", () => {
  const empty: string[] = [];
  for (const option of menu) {
    for (const field of ["name", "description"] as const) {
      for (const lang of ["es", "en"] as const) {
        if (option[field][lang].trim() === "") empty.push(`${option.id}.${field}.${lang}`);
      }
    }
  }
  const newKeys = [
    "menuLabel", "confirm", "back", "tabPrevious", "tabNext", "screenAnnouncement", "splashTitle",
    "motionToggleLabel", "motionOn", "motionOff", "motionLockedBySystem", "characterLabel",
    "guideMenuHint", "guideScreenHint",
  ] as const;
  for (const key of newKeys) {
    for (const lang of ["es", "en"] as const) {
      if (uiText[key][lang].trim() === "") empty.push(`uiText.${key}.${lang}`);
    }
  }
  assert.deepEqual(empty, [], "no debe haber textos vacíos");
});
