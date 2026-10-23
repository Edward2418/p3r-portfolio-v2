import { test } from "node:test";
import assert from "node:assert/strict";
import { provisionalBadgeCount, provisionalScope, showCenterLabel, visibleCategories } from "../../src/lib/stack/layout.ts";
import { hasTrajectory } from "../../src/lib/profile/trajectory.ts";
import type { StackCategory } from "../../src/content/types.ts";

// Funciones puras de presentación (specs/004-quien-soy-y-stack/data-model.md, "Funciones puras de presentación").

const tech = (id: string) => ({ id, name: id, level: 3 as const });
const category = (id: StackCategory["id"], technologies: string[]): StackCategory => ({
  id,
  name: { es: id, en: id },
  technologies: technologies.map(tech),
});

test("visibleCategories descarta las categorías sin tecnologías y conserva el orden", () => {
  const stack = [category("frontend", ["a"]), category("backend", []), category("data-tools", ["b"])];
  assert.deepEqual(
    visibleCategories(stack).map((c) => c.id),
    ["frontend", "data-tools"],
    "una categoría vacía no debe mostrarse",
  );
});

test("visibleCategories devuelve todas si ninguna está vacía", () => {
  const stack = [category("frontend", ["a"]), category("backend", ["b"]), category("data-tools", ["c"])];
  assert.equal(visibleCategories(stack).length, 3);
});

test("la etiqueta central solo se muestra con tecnologías en las tres categorías", () => {
  const full = [category("frontend", ["a"]), category("backend", ["b"]), category("data-tools", ["c"])];
  assert.equal(showCenterLabel(full), true, "con las tres categorías con tecnologías debe mostrarse");
  const missingOne = [category("frontend", ["a"]), category("backend", []), category("data-tools", ["c"])];
  assert.equal(showCenterLabel(missingOne), false, "con una categoría vacía no debe mostrarse");
  assert.equal(showCenterLabel([category("frontend", ["a"])]), false, "con menos de tres categorías no debe mostrarse");
  assert.equal(showCenterLabel([]), false, "sin categorías no debe mostrarse");
});

test("hasTrajectory es falso con una lista vacía y verdadero con algún hito", () => {
  assert.equal(hasTrajectory([]), false, "sin hitos la sección de trayectoria no debe mostrarse");
  const entry = { id: "x", period: { es: "a", en: "a" }, title: { es: "a", en: "a" }, kind: "formation" as const };
  assert.equal(hasTrajectory([entry]), true, "con un hito la sección debe mostrarse");
});

test("provisionalScope: una marca en el encabezado si todas son provisionales, por tecnología si hay mezcla", () => {
  const all = category("frontend", ["a", "b"]);
  all.technologies.forEach((tech) => (tech.provisional = true));
  assert.equal(provisionalScope(all), "category", "todas provisionales: la marca va en el encabezado");

  const mixed = category("backend", ["a", "b"]);
  mixed.technologies[0].provisional = true;
  assert.equal(provisionalScope(mixed), "technologies", "mezcla: la marca va solo en las provisionales");

  assert.equal(provisionalScope(category("data-tools", ["a"])), "none", "ninguna provisional: sin marca");
});

test("provisionalBadgeCount suma una marca por categoría completa o una por tecnología provisional", () => {
  const a = category("frontend", ["x", "y"]);
  a.technologies.forEach((tech) => (tech.provisional = true));
  const b = category("backend", ["x", "y", "z"]);
  b.technologies[0].provisional = true;
  b.technologies[2].provisional = true;
  const c = category("data-tools", ["x"]);
  assert.equal(provisionalBadgeCount([a, b, c]), 1 + 2 + 0);
});
