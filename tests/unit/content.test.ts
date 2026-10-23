import { test } from "node:test";
import assert from "node:assert/strict";
import {
  characters,
  contact,
  profile,
  projects,
  stack,
  stackCenterLabel,
  trajectory,
  uiText,
} from "../../src/content/index.ts";
import type { Character, Project, StackCategory } from "../../src/content/types.ts";

// --- Validadores (reglas de specs/001-base-y-datos/data-model.md) ---

/** Recorre un valor y devuelve los errores de los objetos que parecen `Localized`. */
function localizedErrors(value: unknown, path: string): string[] {
  const errors: string[] = [];
  if (Array.isArray(value)) {
    value.forEach((item, i) => errors.push(...localizedErrors(item, `${path}[${i}]`)));
  } else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if ("es" in record || "en" in record) {
      for (const lang of ["es", "en"]) {
        const text = record[lang];
        if (typeof text !== "string" || text.trim() === "") {
          errors.push(`${path}.${lang} está vacío o ausente`);
        }
      }
    } else {
      for (const [key, child] of Object.entries(record)) {
        errors.push(...localizedErrors(child, `${path}.${key}`));
      }
    }
  }
  return errors;
}

function duplicates(ids: string[]): string[] {
  return ids.filter((id, i) => ids.indexOf(id) !== i);
}

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

function projectErrors(list: Project[], technologyIds: string[]): string[] {
  const errors: string[] = [];
  duplicates(list.map((p) => p.id)).forEach((id) => errors.push(`id de proyecto repetido: ${id}`));
  for (const project of list) {
    for (const techId of project.technologies) {
      if (!technologyIds.includes(techId)) {
        errors.push(`el proyecto ${project.id} usa la tecnología inexistente ${techId}`);
      }
    }
    for (const [name, url] of Object.entries(project.links ?? {})) {
      if (url !== undefined && !isHttpsUrl(url)) {
        errors.push(`el enlace ${name} del proyecto ${project.id} no es una URL https válida`);
      }
    }
    for (const [i, shot] of (project.screenshots ?? []).entries()) {
      errors.push(...localizedErrors(shot.alt, `${project.id}.screenshots[${i}].alt`));
    }
  }
  return errors;
}

const technologyIds = stack.flatMap((category: StackCategory) =>
  category.technologies.map((t) => t.id),
);

// --- Reglas sobre los datos reales ---

test("todo texto traducible tiene español e inglés no vacíos", () => {
  const errors = [
    ...localizedErrors(profile, "profile"),
    ...localizedErrors(stack, "stack"),
    ...localizedErrors(projects, "projects"),
    ...localizedErrors(characters, "characters"),
    ...localizedErrors(uiText, "uiText"),
  ];
  assert.deepEqual(errors, [], "no debe haber idiomas vacíos o ausentes");
});

test("el stack tiene exactamente tres categorías únicas", () => {
  const ids = stack.map((c) => c.id).sort();
  assert.deepEqual(ids, ["backend", "data-tools", "frontend"], "las categorías deben ser frontend, backend y data-tools");
  stack.forEach((c) => assert.ok(c.technologies.length >= 1, `la categoría ${c.id} necesita al menos una tecnología`));
});

test("los id de tecnologías, proyectos y personajes son únicos", () => {
  assert.deepEqual(duplicates(technologyIds), [], "id de tecnología repetido");
  assert.deepEqual(duplicates(projects.map((p) => p.id)), [], "id de proyecto repetido");
  assert.deepEqual(duplicates(characters.map((c: Character) => c.id)), [], "id de personaje repetido");
});

test("el nivel de cada tecnología está entre 1 y 5", () => {
  for (const category of stack) {
    for (const tech of category.technologies) {
      assert.ok(
        Number.isInteger(tech.level) && tech.level >= 1 && tech.level <= 5,
        `el nivel de ${tech.id} debe estar entre 1 y 5`,
      );
    }
  }
});

test("el rango de cada personaje está entre 1 y 10", () => {
  for (const character of characters) {
    assert.ok(
      Number.isInteger(character.rank) && character.rank >= 1 && character.rank <= 10,
      `el rango de ${character.id} debe estar entre 1 y 10`,
    );
  }
});

test("los proyectos usan tecnologías existentes y enlaces https válidos", () => {
  assert.deepEqual(projectErrors(projects, technologyIds), [], "los proyectos deben ser válidos");
});

test("el contacto tiene GitHub y los datos opcionales pueden faltar", () => {
  assert.equal(contact.github, "https://github.com/Edward2418", "GitHub debe ser el de Edward");
  assert.ok(isHttpsUrl(contact.github), "GitHub debe ser una URL https");
  for (const key of ["email", "linkedin", "cv"] as const) {
    assert.ok(contact[key] === undefined || contact[key] !== "", `${key} no debe ser una cadena vacía`);
  }
});

test("los bloques de ejemplo están marcados como provisionales", () => {
  assert.equal(profile.provisional, true, "el perfil de ejemplo debe ser provisional");
  assert.ok(projects.every((p) => p.provisional === true), "el texto del proyecto debe ser provisional");
  assert.ok(characters.every((c) => c.provisional === true), "los personajes de ejemplo deben ser provisionales");
  assert.ok(
    stack.every((cat) => cat.technologies.every((t) => t.provisional === true)),
    "los niveles de ejemplo deben ser provisionales",
  );
});

// --- Fase 4: perfil, trayectoria y stack (specs/004-quien-soy-y-stack/data-model.md) ---

test("el perfil, la trayectoria y la etiqueta central tienen español e inglés no vacíos", () => {
  const errors = [
    ...localizedErrors(profile, "profile"),
    ...localizedErrors(trajectory, "trajectory"),
    ...localizedErrors(stackCenterLabel, "stackCenterLabel"),
  ];
  assert.deepEqual(errors, [], "no debe haber idiomas vacíos o ausentes");
});

test("el perfil publica la especialidad, la institución y el semestre", () => {
  for (const field of ["specialty", "institution", "semester"] as const) {
    assert.ok(profile[field].es.trim() && profile[field].en.trim(), `el perfil necesita ${field} en ambos idiomas`);
  }
  assert.equal(profile.name, "Edward Negrete", "el nombre público es Edward Negrete");
});

test("los hitos de la trayectoria tienen id único", () => {
  assert.deepEqual(duplicates(trajectory.map((entry) => entry.id)), [], "id de hito repetido");
});

test("hay exactamente un hito goal, siempre el último, y como máximo un hito current", () => {
  const goals = trajectory.filter((entry) => entry.kind === "goal");
  assert.equal(goals.length, 1, "debe haber exactamente un hito goal");
  assert.equal(trajectory.at(-1)?.kind, "goal", "el hito goal debe ser el último");
  assert.ok(trajectory.filter((entry) => entry.kind === "current").length <= 1, "como máximo un hito current");
});

test("el hito goal no muestra año en su periodo ni en su título", () => {
  const goal = trajectory.find((entry) => entry.kind === "goal")!;
  for (const text of [goal.period.es, goal.period.en, goal.title.es, goal.title.en]) {
    assert.doesNotMatch(text, /d{4}/, `el hito goal no debe incluir un año: "${text}"`);
  }
});

test("no se publican el apellido completo ni el año de titulación", () => {
  const published = JSON.stringify({ profile, trajectory, stack, stackCenterLabel, uiText });
  assert.doesNotMatch(published, /Bustos/, "no debe publicarse el apellido completo");
  assert.doesNotMatch(published, /2027/, "no debe publicarse el año de titulación previsto");
});

test("los hitos de la trayectoria sin confirmar están marcados como provisionales", () => {
  assert.ok(trajectory.length === 5, "deben ser los cinco hitos de la versión anterior");
  assert.ok(trajectory.every((entry) => entry.provisional === true), "los hitos deben ser provisionales hasta que Edward los confirme");
});

// --- CA-6: agregar un proyecto solo requiere datos ---

test("una lista con un segundo proyecto de prueba valida sin tocar código", () => {
  const segundo: Project = {
    id: "proyecto-de-prueba",
    title: { es: "Proyecto de prueba", en: "Test project" },
    summary: { es: "Resumen", en: "Summary" },
    description: { es: "Descripción", en: "Description" },
    technologies: [technologyIds[0]],
    status: "planning",
    links: { repository: "https://github.com/Edward2418/ejemplo" },
  };
  assert.deepEqual(projectErrors([...projects, segundo], technologyIds), [], "dos proyectos deben validar");
});

test("el validador detecta un idioma faltante y una tecnología inexistente", () => {
  const roto = {
    id: "roto",
    title: { es: "Roto", en: "" },
    summary: { es: "a", en: "b" },
    description: { es: "a", en: "b" },
    technologies: ["no-existe"],
    status: "planning",
    links: { demo: "http://inseguro.example" },
  } as Project;
  assert.ok(localizedErrors(roto, "roto").length > 0, "debe detectar el inglés vacío");
  assert.ok(projectErrors([roto], technologyIds).length >= 2, "debe detectar la tecnología y el enlace");
});
