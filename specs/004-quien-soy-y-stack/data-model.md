# Modelo de datos: Fase 4 — Quién soy y Stack

**Fecha**: 2026-10-23 | **Especificación**: [spec.md](./spec.md) | **Investigación**: [research.md](./research.md)

El contenido sigue en archivos TypeScript tipados en `src/content/`. Esta fase amplía el perfil, añade la trayectoria y completa el stack. No hay base de datos. Los identificadores de código están en inglés y los textos visibles son `Localized` (español e inglés obligatorios y no vacíos). **Todo lo de este documento es un borrador provisional que Edward debe revisar** (Principio V).

## Tipos nuevos o ampliados (`src/content/types.ts`)

| Tipo | Forma | Reglas |
|---|---|---|
| `Profile` (ampliado) | `name`, `headline`, `summary`, **`specialty`**, **`institution`**, **`semester`** (los tres nuevos son `Localized`), `provisional?` | `name` es "Edward Negrete": no incluye el apellido completo (FR-004). `semester` es texto (p. ej. "7.º semestre") para que Edward lo edite sin lógica |
| `TimelineKind` | `'formation' \| 'progress' \| 'current' \| 'goal'` | `goal` es el hito futuro |
| `TimelineEntry` | ver abajo | |
| `stack` y `stackCenterLabel` | `stack` sigue siendo `StackCategory[]` (sin cambios, porque los proyectos y las pruebas lo usan) y se exporta aparte `stackCenterLabel: Localized` | La etiqueta central pertenece al conjunto, no a una categoría |

## Entidades

### Profile (perfil) — `src/content/profile.ts`

| Campo | Valor borrador | Estado |
|---|---|---|
| `name` | "Edward Negrete" | Confirmado como nombre público |
| `headline` | ES "Estudiante de Ingeniería en Sistemas Computacionales" · EN "Computer Systems Engineering student" | Existente |
| `specialty` | ES "Desarrollo Full-Stack y videojuegos" · EN "Full-Stack and game development" | Candidato de la v1, provisional |
| `institution` | ES "TecNM · Instituto Tecnológico Superior de Huauchinango" · EN "TecNM · Instituto Tecnológico Superior de Huauchinango" | Candidato de la v1, provisional |
| `semester` | ES "7.º semestre" · EN "7th semester" | Candidato de la v1, provisional (Edward confirma el semestre actual) |
| `summary` | Borrador abajo | Provisional |
| `provisional` | `true` | Hasta que Edward confirme todo |

**Borrador de la presentación** (solo con hechos ya presentes en el proyecto; Edward la reescribe a su manera):

- ES: "Soy estudiante de Ingeniería en Sistemas Computacionales y me especializo en desarrollo Full-Stack y videojuegos. Me gusta construir cosas que funcionen bien y se vean bien. Este portafolio es mi proyecto más reciente: lo estoy rehaciendo por fases, con especificaciones, para mostrar cómo trabajo."
- EN: "I'm a Computer Systems Engineering student specializing in Full-Stack and game development. I like building things that work well and look good. This portfolio is my most recent project: I'm rebuilding it in phases, with specifications, to show how I work."

### TimelineEntry (hito de trayectoria) — `src/content/timeline.ts`

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | `string` | Sí | Único |
| `period` | `Localized` | Sí | "2023", "2024", "2025", "Hoy" / "Today", "Meta" / "Goal" |
| `title` | `Localized` | Sí | |
| `description` | `Localized` | No | Si falta, no queda hueco |
| `kind` | `TimelineKind` | Sí | |
| `provisional` | `boolean` | No | `true` en los cinco hasta que Edward los confirme |

- La lista `timeline: TimelineEntry[]` está en orden cronológico (el orden del arreglo es el orden en pantalla).
- Exactamente un hito `goal` y siempre el último; como máximo un hito `current`; el `goal` no incluye año (FR-004, FR-005).

**Borradores de los cinco hitos** (de la v1; Edward los revisa):

| # | `period` | `title` | `kind` | `description` (ES) |
|---|---|---|---|---|
| 1 | 2023 | ES "Inicio de carrera" · EN "Start of the degree" | `formation` | "Comienzo de Ingeniería en Sistemas Computacionales: primeras materias de programación, matemáticas y fundamentos de sistemas." |
| 2 | 2024 | ES "3.º y 4.º semestre" · EN "3rd and 4th semester" | `progress` | "Programación orientada a objetos, fundamentos de bases de datos, desarrollo de aplicaciones móviles e ingeniería de software." |
| 3 | 2025 | ES "5.º y 6.º semestre" · EN "5th and 6th semester" | `progress` | "Taller de sistemas operativos, redes, lenguajes y autómatas, UX/UI y administración de bases de datos." |
| 4 | Hoy | ES "Semestre actual" · EN "Current semester" | `current` | "Especialidad en desarrollo Full-Stack y videojuegos. Construyo este portafolio y refuerzo mis conocimientos de HTML, CSS, JavaScript, Java, SQL y Git." |
| 5 | Meta | ES "Titulación" · EN "Graduation" | `goal` | "Titularme como Ingeniero en Sistemas Computacionales con experiencia real en Full-Stack, bases de datos y videojuegos." |

Las descripciones en inglés las propone el asistente al implementar y Edward las confirma.

### Technology y StackCategory — `src/content/stack.ts`

| Campo | Cambio |
|---|---|
| `Technology.level` | Sin cambio: 1 a 5, entero; se rechaza cualquier otro valor al validar |
| `Technology.provisional` | `true` para todas las tecnologías hasta su confirmación |
| `StackCategory.technologies` | Se pueden añadir las candidatas de la v1 (provisionales): en `frontend` HTML/CSS y JavaScript; en `backend` Java; en `data-tools` SQL (o "SQL y bases de datos") |
| `stackCenterLabel` | Nuevo: `Localized` "Full-Stack" / "Full-Stack"; se muestra solo con tecnologías en las tres categorías |

**Niveles de ejemplo** (provisionales): los actuales (2 a 3) y, para las candidatas, 3 para HTML/CSS, 3 para JavaScript, 3 para Java y 3 para SQL; Edward los ajusta.

### Textos de interfaz nuevos (`UiText`)

Se amplía `src/content/ui-text.ts` con: `profileInstitution` ("Institución" / "Institution"), `profileSemester` ("Semestre" / "Semester"), `profileSpecialty` ("Especialidad" / "Specialty"), `sectionTimeline` ("Trayectoria" / "Background"), `timelineCurrent` ("Actual" / "Current"), `timelineGoal` ("Meta" / "Goal") y `timelineCurrentPeriod` ("Hoy" / "Today", solo si el periodo del hito actual no va en los datos). El formato "Nivel: n/5" se arma con el texto `level` ya existente. Todos en español e inglés.

## Reglas de validación (pruebas de `content.test.ts`)

- Cada `Localized` nuevo tiene ambos idiomas no vacíos.
- Identificadores de hito únicos; exactamente un `goal`, último; como máximo un `current`; el `goal` sin año en `period` y `title`.
- Nivel de cada tecnología entero entre 1 y 5; identificadores de tecnología únicos (los proyectos referencian estos identificadores).
- Exactamente tres categorías con al menos una tecnología cada una.
- Ni "Bustos" (apellido completo) ni "2027" (año de titulación) aparecen en `profile`, `timeline`, `stack` ni `ui-text`.
- Todo dato de esta fase sin confirmar lleva `provisional: true`.

## Tokens nuevos (`src/app/globals.css`)

| Token | Valor inicial | Uso |
|---|---|---|
| `--opacity-circle-tint` | `0.14` | Opacidad del tinte de cada círculo del stack |

Los colores de los círculos reutilizan los de la paleta (cian, rojo de marca y blanco azulado); los valores finales se fijan al implementar y los pares se verifican en `tokens.test.ts`.

## Estado en el cliente

No hay estado nuevo. `SceneShell` publica `data-scene` (identificador de la pantalla, vacío en el menú) como atributo derivado de la ruta.
