---

description: "Lista de tareas de la Fase 4 — Quién soy y Stack"
---

# Tareas: Fase 4 — Quién soy y Stack

**Entrada**: documentos de diseño en `specs/004-quien-soy-y-stack/`

**Requisitos previos**: plan.md, spec.md, research.md, data-model.md, contracts/ (`profile-screen.md`, `stack-circles.md`, `character-per-scene.md`), quickstart.md

**Pruebas**: se incluyen porque la especificación las exige (SC-010). Las pruebas de cada historia se escriben primero y deben fallar antes de implementar.

**Organización**: las tareas se agrupan por historia de usuario y siguen el orden de implementación. Prioridades: US1, US2, US3 y US4 son P1; US5 y US6 son P2. US5 (Oguri por pantalla) se implementa antes que US4 porque la revisión de accesibilidad y de móvil necesita las pantallas y el personaje ya construidos.

## Formato: `[ID] [P?] [Historia] Descripción con ruta`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[US#]**: historia de usuario a la que pertenece la tarea
- Reglas del proyecto: comentarios, pruebas y textos visibles en español; identificadores en inglés; antes de escribir código de Next.js, leer `node_modules/next/dist/docs/` (T002); aplicar `vercel-react-best-practices` a los componentes y `frontend-design` a las decisiones visuales.
- **Contenido**: todo lo de `data-model.md` es un borrador provisional; nada se marca como confirmado sin que Edward lo confirme (Principio V). Las traducciones al inglés las propone el asistente.
- Trabajar en la rama `004-quien-soy-y-stack` (nunca directamente en `main`).
- Sin dependencias nuevas. Con memoria limitada, ejecutar las pruebas E2E con `--workers=2` y un proyecto a la vez (`--project=chromium-390`, etc.).

## Convenciones de rutas

Proyecto único en la raíz del repositorio: `src/`, `tests/`, `public/` (ver plan.md, "Código fuente").

---

## Fase 1: Preparación (infraestructura compartida)

**Propósito**: rama lista, guías de Next leídas y línea base verificada.

- [x] T001 Confirmar con `git branch --show-current` que estás en `004-quien-soy-y-stack`, que `specs/004-quien-soy-y-stack/` y `docs/sprints/fase-4-quien-soy-y-stack.md` están confirmados y subidos, y que el video de referencia de P3R sigue fuera de git (`git ls-files | grep -ci "Pause Menu"` da 0).
- [x] T002 Leer en `node_modules/next/dist/docs/` las guías de componentes de servidor y cliente (qué puede ser componente de servidor sin JavaScript de cliente) y de renderizado estático de rutas con segmento dinámico; si algo contradice a `research.md` (D1 o D12), anotarlo allí antes de seguir.
- [x] T003 Ejecutar `npm run lint` y `npm run test:unit` como línea base (103 pruebas unitarias en verde) y revisar `tests/e2e/helpers.ts` (`openReady`) y `tests/e2e/screen-frame.spec.ts` para reutilizarlos.

**Punto de control**: base verificada. No requiere commit de código.

---

## Fase 2: Fundamentos (requisitos bloqueantes)

**Propósito**: tipos, datos, textos y tokens que necesitan todas las historias.

**⚠️ CRÍTICO**: ninguna historia puede empezar hasta terminar esta fase.

- [x] T004 [P] Ampliar `tests/unit/content.test.ts` primero, con las reglas de `data-model.md`: cada `Localized` nuevo tiene ambos idiomas no vacíos; identificadores de hito únicos; "exactamente un hito `goal` y siempre el último; como máximo un `current`; el `goal` sin año" en `period` y `title`; nivel de cada tecnología "entero entre 1 y 5"; identificadores de tecnología únicos; "exactamente tres categorías con al menos una tecnología cada una"; "Ni \"Bustos\" (apellido completo) ni \"2027\" (año de titulación)" en el texto de `profile`, `trajectory`, `stack` y `ui-text`; todo dato de esta fase sin confirmar lleva `provisional: true`. Crear además `tests/unit/presentation.test.ts` primero, con las funciones puras de presentación (`data-model.md`, "Funciones puras de presentación"): `visibleCategories` descarta las categorías sin tecnologías, `showCenterLabel` es `true` solo si las tres categorías tienen tecnologías y `hasTrajectory` es `false` con una lista vacía. Mensajes de las aserciones en español.
- [x] T005 [P] Ampliar `tests/unit/tokens.test.ts` primero: el token `--opacity-circle-tint` existe y está entre 0.08 y 0.2; el color del tinte de cada círculo (cian, rojo de marca y blanco azulado mezclados sobre `--color-navy` con esa opacidad) mantiene 4.5:1 con `--color-text` y con `--color-cyan`; el trazo de cada círculo (`--color-cyan`, `--color-red`, `--color-panel`) mantiene 3:1 contra `--color-navy`.
- [x] T006 [P] Ampliar `src/content/types.ts` con `TrajectoryKind` (`'formation' | 'progress' | 'current' | 'goal'`), `TrajectoryEntry` (`id`, `period: Localized`, `title: Localized`, `description?: Localized`, `kind: TrajectoryKind` y `provisional?`) y los campos nuevos de `Profile`: `specialty`, `institution` y `semester` (los tres `Localized`); `name` sigue siendo "Edward Negrete" (sin el apellido completo).
- [x] T007 [P] Ampliar `src/content/ui-text.ts` con textos `Localized` en ambos idiomas: `profileInstitution` ("Institución" / "Institution"), `profileSemester` ("Semestre" / "Semester"), `profileSpecialty` ("Especialidad" / "Specialty"), `sectionTrajectory` ("Trayectoria" / "Background"), `trajectoryCurrent` ("Actual" / "Current") y `trajectoryGoal` ("Meta" / "Goal"). El formato "Nivel: n/5" usa el texto `level` existente.
- [x] T008 [P] Agregar a `src/app/globals.css` (bloque `@theme`) el token `--opacity-circle-tint: 0.14` (opacidad del tinte de cada círculo del stack), con su comentario; sin valores sueltos en los componentes.
- [x] T009 Ampliar `src/content/profile.ts` con los borradores provisionales de `data-model.md`: `specialty` ("Desarrollo Full-Stack y videojuegos" / "Full-Stack and game development"), `institution` ("TecNM · Instituto Tecnológico Superior de Huauchinango" en ambos idiomas), `semester` ("7.º semestre" / "7th semester") y la presentación en `summary`; `provisional: true`. Debe pasar lo que corresponde de T004.
- [x] T010 Crear `src/content/trajectory.ts` con los cinco hitos de `data-model.md` en orden cronológico (2023 `formation`, 2024 `progress`, 2025 `progress`, "Hoy" / "Today" `current` y "Futuro" / "Upcoming" `goal` sin año; la etiqueta visible "Meta" sale de `trajectoryGoal`, no del periodo), con título y descripción bilingües propuestos por el asistente, todos `provisional: true`.
- [x] T011 Ampliar `src/content/stack.ts`: exportar `stackCenterLabel` (`Localized`, "Full-Stack" en ambos idiomas) y añadir las tecnologías candidatas de la v1, todas `provisional: true` con nivel de ejemplo 3: en `frontend` HTML/CSS y JavaScript, en `backend` Java y en `data-tools` SQL; mantener `stack` como `StackCategory[]` sin cambiar su forma.
- [x] T012 Exportar `trajectory` y `stackCenterLabel` desde `src/content/index.ts`; crear `src/lib/stack/layout.ts` (`visibleCategories(stack)` y `showCenterLabel(stack)`) y `src/lib/profile/trajectory.ts` (`hasTrajectory(entries)`), funciones puras con importaciones relativas con extensión `.ts`; y ejecutar `npm run test:unit`: T004 y T005 deben pasar.

**Punto de control**: tipos, datos y tokens listos. Commit: `feat(content): agregar los datos de quién soy y del stack`.

---

## Fase 3: Historia de usuario 1 — Conocer quién es Edward (Prioridad: P1) 🎯 MVP

**Meta**: "Quién soy" muestra la ficha con el nombre, el titular, la especialidad, la institución, el semestre y la presentación, con lo no confirmado marcado como provisional.

**Prueba independiente**: abrir `/es/profile` y `/en/profile` y comprobar la ficha y la etiqueta de provisional.

### Pruebas de la historia (escribirlas primero y comprobar que fallan)

- [x] T013 [P] [US1] Crear `tests/e2e/profile.spec.ts` (parte de la ficha): el `<h1>` "Quién soy" / "About me" recibe el foco al llegar; una sección con `<h2>` muestra el nombre "Edward Negrete", el titular y la especialidad; una lista de definición (`<dl>`) muestra institución y semestre con sus términos traducidos; la presentación está en el idioma activo; la etiqueta "Provisional" aparece junto al titular mientras `profile.provisional` sea `true`; el texto de la pantalla no contiene "Bustos" ni "2027".

### Implementación de la historia

- [x] T014 [P] [US1] Crear `src/components/profile/ProfileSheet.tsx` (componente de servidor, sin JavaScript de cliente): `<section>` con `aria-labelledby` y `<h2>`, nombre en tipografía de display, titular, especialidad, `<dl>` con "Institución" y "Semestre" (si faltan, no se muestran) y la presentación en un `<p>`; `ProvisionalBadge` junto al titular; textos de `ui-text.ts` y de `profile.ts`, nunca en el componente (`contracts/profile-screen.md`).
- [x] T015 [US1] Agregar a `src/app/globals.css` los estilos de la ficha (bloque con borde, nombre grande, `<dl>` en rejilla, presentación con ancho de lectura de menos de 80 caracteres) con los tokens existentes; mantener el contraste de los textos de la fase 3 sobre `--color-navy`.
- [x] T016 [US1] Modificar `src/app/[lang]/profile/page.tsx` para renderizar `ProfileSheet` dentro de `ScreenFrame` en lugar de `ProfileSection` (la sección anterior se elimina en T042); debe pasar T013.
- [x] T017 [US1] Capturar `/es/profile` a 1280 y 390 px, compararla con la pantalla Stats de referencia de P3R, ajustar espaciados y jerarquía con `frontend-design`, y mostrar las capturas a Edward. Los cuadros de referencia se extraen con `ffmpeg` del video de referencia (fuera del repositorio; ver la memoria del proyecto) y, si Stats no aparece en él, la única referencia disponible es la de Social Stats.

**Punto de control**: la ficha de "Quién soy" funciona. Commit: `feat(profile): agregar la ficha de quién soy`.

---

## Fase 4: Historia de usuario 2 — Ver su formación y trayectoria (Prioridad: P1)

**Meta**: "Quién soy" muestra la trayectoria en orden cronológico, con el hito actual y la meta futura distinguidos con etiquetas de texto, sin año en la meta.

**Prueba independiente**: abrir "Quién soy" y comprobar los cinco hitos, su orden y sus etiquetas.

### Pruebas de la historia (escribirlas primero y comprobar que fallan)

- [ ] T018 [P] [US2] Ampliar `tests/e2e/profile.spec.ts` (parte de la trayectoria): una sección con `<h2>` "Trayectoria" / "Background" y una lista ordenada (`<ol>`) de cinco `<li>` en el orden de `trajectory`; cada hito muestra periodo, título y descripción; el hito actual muestra la etiqueta "Actual" y el último la etiqueta "Meta" con la clase de contorno punteado; la meta no muestra año; los cinco muestran "Provisional"; con el cambio de idioma los textos cambian y la pantalla se conserva; la regla de que sin hitos la sección no aparece se prueba con `hasTrajectory` en T004 (los datos se renderizan en el servidor y no se pueden inyectar en la página).

### Implementación de la historia

- [ ] T019 [P] [US2] Crear `src/components/profile/Trajectory.tsx` (componente de servidor): `<section>` con `<h2>` `sectionTrajectory` y `<ol>` con un `<li>` por hito: periodo, título, descripción (si no existe, sin hueco), etiqueta visible "Actual" o "Meta" según `kind` y `ProvisionalBadge` si `provisional`; no se renderiza si `hasTrajectory` es `false` (`contracts/profile-screen.md`).
- [ ] T020 [US2] Agregar a `src/app/globals.css` los estilos de la trayectoria: línea vertical con marcadores a la izquierda, la meta con contorno punteado, la etiqueta "Actual" con el rojo de marca como relleno y texto claro, ajuste de textos largos (`overflow-wrap`) en 390 px y sin desplazamiento horizontal.
- [ ] T021 [US2] Modificar `src/app/[lang]/profile/page.tsx` para añadir `Trajectory` como bloque de `ScreenFrame` tras la ficha (cada bloque con `data-stagger`, sin movimiento nuevo); debe pasar T018.
- [ ] T022 [US2] Capturar la trayectoria a 1280 y 390 px, comprobar que los cinco hitos y sus etiquetas se leen, y mostrar las capturas a Edward.

**Punto de control**: "Quién soy" completa. Commit: `feat(profile): agregar la trayectoria`.

---

## Fase 5: Historia de usuario 3 — Ver las tecnologías en círculos solapados (Prioridad: P1)

**Meta**: "Stack" muestra tres círculos solapados con las tecnologías de cada categoría, su nivel como texto y puntos, y la etiqueta central "Full-Stack".

**Prueba independiente**: abrir `/es/stack` y comprobar los tres grupos, los niveles y la etiqueta.

### Pruebas de la historia (escribirlas primero y comprobar que fallan)

- [ ] T023 [P] [US3] Crear `tests/e2e/stack.spec.ts`: un `<h2>` "Stack" y tres secciones con `<h3>` (Frontend, Backend, Bases de datos y herramientas) en ese orden, cada una con una lista (`<ul>`); cada tecnología muestra su nombre y el texto "Nivel: n/5" y cinco puntos `aria-hidden`; las provisionales muestran "Provisional"; la etiqueta "Full-Stack" aparece en el DOM antes de las categorías; cada tecnología está en un solo grupo; a 768 y 1280 px los tres círculos se solapan (cajas delimitadoras que se intersectan); no hay desplazamiento horizontal ni texto recortado (cada elemento de texto dentro del viewport y de su bloque) en 390, 768 y 1280 px, en español e inglés.
- [ ] T024 [P] [US3] Añadir a `tests/e2e/stack.spec.ts` los casos límite: con ocho tecnologías en una categoría (se simulan clonando elementos `<li>` de su lista con `page.evaluate`) el bloque crece y no se recorta el texto; la regla de que una categoría vacía no se muestra ni la etiqueta central se prueba con `visibleCategories` y `showCenterLabel` en T004.

### Implementación de la historia

- [ ] T025 [P] [US3] Crear `src/components/stack/StackCircles.tsx` (componente de servidor): `<section>` con `<h2>` "Stack"; `<p>` con `stackCenterLabel` antes de las categorías (solo si las tres categorías tienen tecnologías); una `<section>` por categoría con `<h3>` y `<ul>`; por tecnología, el nombre, el texto `level` + "n/5", cinco puntos `aria-hidden` (relleno hasta el nivel, contorno el resto) y `ProvisionalBadge`; una categoría vacía no se muestra, según `visibleCategories` y `showCenterLabel` de `src/lib/stack/layout.ts` (`contracts/stack-circles.md`).
- [ ] T026 [US3] Agregar a `src/app/globals.css` los estilos de los círculos: desde 768 px un contenedor con `aspect-ratio` y tres círculos de ~58 % del ancho solapados (dos arriba y uno abajo al centro) con borde de color (cian, rojo de marca y blanco azulado) y tinte translúcido en un pseudoelemento con `--opacity-circle-tint`; etiqueta central en la zona común; `min-height` en lugar de alto fijo para que el bloque crezca con muchas tecnologías; sin recorte del texto; puntos de nivel como casillas rellenas o de contorno.
- [ ] T027 [US3] Agregar a `src/app/globals.css` la adaptación por debajo de 768 px: una columna con los tres círculos apilados y solapamiento vertical parcial (márgenes negativos), la etiqueta "Full-Stack" como cabecera de la pila y cada categoría a todo el ancho, sin desplazamiento horizontal.
- [ ] T028 [US3] Modificar `src/app/[lang]/stack/page.tsx` para renderizar `StackCircles` dentro de `ScreenFrame` en lugar de `StackSection` (la sección anterior se elimina en T042), conservando el `<h2>` "Stack" que espera `tests/e2e/language.spec.ts`; deben pasar T023 y T024.
- [ ] T029 [US3] Capturar `/es/stack` a 1280, 768 y 390 px, compararla con la pantalla Social Stats de referencia de P3R, afinar tamaños y solapamiento con `frontend-design` y mostrar las capturas a Edward. Los cuadros de Social Stats se extraen con `ffmpeg` del tramo de transición del video de referencia (fuera del repositorio).

**Punto de control**: "Stack" funciona. Commit: `feat(stack): agregar los círculos de tecnologías`.

---

## Fase 6: Historia de usuario 5 — Que Oguri acompañe las pantallas (Prioridad: P2)

**Meta**: Oguri tiene una posición, una escala y una inclinación propias en cada pantalla, cambia bajo la cobertura del barrido y con movimiento reducido se funde.

**Prueba independiente**: abrir cada pantalla y comprobar que Oguri difiere entre ambas, sin tapar el contenido.

### Pruebas de la historia (escribirlas primero y comprobar que fallan)

- [ ] T030 [P] [US5] Crear `tests/e2e/character-per-scene.spec.ts`: el contenedor raíz tiene `data-scene` igual al identificador de la pantalla (y vacío en el menú); a 1280 px las cajas de `[data-character]` de `profile` y de `stack` difieren en altura y la inclinación calculada de la imagen interior difiere entre `stack` y `profile` (valores iniciales 3° y 0°, que T033 puede afinar sin romper la prueba); en ambas la caja de Oguri empieza a la derecha del panel; al pasar de una pantalla a otra con R el cambio de posición no es visible antes de que el barrido cubra la pantalla (medición durante la fase `exiting`); con movimiento reducido el personaje se anima solo en `opacity` al cambiar de pantalla.

### Implementación de la historia

- [ ] T031 [US5] Modificar `src/components/scene/SceneShell.tsx`: publicar `data-scene` (identificador de la pantalla o vacío) en el contenedor raíz junto a `data-view`, y calcular `sceneChanged` (pantalla anterior distinta de la actual) para pasar `includeCharacter` a `controller.fadeIn(viewChanged || sceneChanged)` con movimiento reducido (`contracts/character-per-scene.md`).
- [ ] T032 [US5] Agregar a `src/app/globals.css` las propiedades `--character-right`, `--character-height` y `--character-tilt` por `data-scene` (`profile`: derecha 3vw, altura `min(90vh, 60vw)`, 0°; `stack`: derecha 2vw, altura `min(78vh, 52vw)`, 3°) desde 1024 px, aplicando la inclinación a la imagen y al video interiores y **no** a `[data-character]`; mantener sin cambios las reglas de la fase 3 por debajo de 1024 px. Cualificar los selectores existentes `[data-view="screen"] [data-scene]` como `main[data-scene]` para que no coincidan con el contenedor raíz.
- [ ] T033 [US5] Revisar a 1024, 1280 y 1920 px con capturas que Oguri se distingue entre las dos pantallas, no tapa el contenido y mantiene el aspecto de las fases anteriores; ajustar los valores y registrar los finales en `contracts/character-per-scene.md`; debe pasar T030.

**Punto de control**: Oguri acompaña cada pantalla. Commit: `feat(character): dar a oguri una posición propia por pantalla`.

---

## Fase 7: Historia de usuario 4 — Acceder sin depender de lo visual (Prioridad: P1)

**Meta**: la misma información de ambas pantallas está disponible para lectores de pantalla, teclado y móviles pequeños, sin depender de lo visual.

**Prueba independiente**: recorrer ambas pantallas con lector de pantalla y a 390 px.

### Pruebas de la historia (escribirlas primero y comprobar que fallan)

- [ ] T034 [P] [US4] Crear `tests/e2e/screens-accessibility.spec.ts`: el árbol de accesibilidad (`ariaSnapshot`) de "Stack" muestra "Full-Stack", cada categoría como encabezado y, por tecnología, su nombre con "Nivel: n/5" en ese orden; el de "Quién soy" muestra la ficha como lista de definición y la trayectoria como lista ordenada con "Actual" y "Meta"; la jerarquía de encabezados es `h1` > `h2` (> `h3` en Stack) sin saltos; no hay elementos interactivos nuevos (el orden de tabulación de la pantalla solo contiene los controles de la guía y del encabezado); el foco queda en el `<h1>` al llegar; el anuncio de ruta lee el título de la pantalla.
- [ ] T035 [P] [US4] Ampliar `tests/e2e/layout.spec.ts` y `tests/e2e/mobile-layout.spec.ts` para recorrer las dos pantallas nuevas a 390, 768, 1280 y 320 px sin desplazamiento horizontal y con el texto de los círculos y de la trayectoria dentro del viewport.

### Implementación de la historia

- [ ] T036 [US4] Corregir lo que fallen T034 y T035 en `src/components/profile/*.tsx`, `src/components/stack/StackCircles.tsx` y `src/app/globals.css` (por ejemplo, orden del DOM, `aria-hidden` de los puntos o ajuste de texto largo), sin añadir texto oculto duplicado: el equivalente textual es la propia estructura.
- [ ] T037 [US4] Pasar axe-core (reglas WCAG 2.2 AA y buenas prácticas, instalado fuera del repositorio) sobre ambas pantallas en español e inglés, a 390 y 1280 px; resolver cualquier violación de contraste, de foco o de regiones. El barrido final de 12 casos va en T043.
- [ ] T038 [US4] Recorrer ambas pantallas con el teclado y con una emulación de zoom del 200 % (viewport de 320 px) y anotar en `research.md` (nueva sección R) lo comprobado.

**Punto de control**: ambas pantallas accesibles. Commit: `test(screens): comprobar la accesibilidad de quién soy y stack`.

---

## Fase 8: Historia de usuario 6 — Publicar solo lo confirmado y cambiarlo sin tocar componentes (Prioridad: P2)

**Meta**: agregar una tecnología o un hito solo exige datos; lo no confirmado se ve marcado como provisional y lo confirmado no.

**Prueba independiente**: agregar una tecnología y un hito a los datos y quitar `provisional` de un dato.

### Pruebas de la historia (escribirlas primero y comprobar que fallan)

- [ ] T039 [P] [US6] Ampliar `tests/e2e/profile.spec.ts` y `tests/e2e/stack.spec.ts`: con un dato confirmado (sin `provisional`) no aparece su etiqueta "Provisional" y con uno provisional sí; la cantidad de etiquetas "Provisional" en cada pantalla coincide con la cantidad de datos provisionales de `src/content/` (cálculo en la prueba); un hito sin descripción no deja hueco ni texto vacío.

### Implementación de la historia

- [ ] T040 [US6] Verificar que agregar una tecnología a `src/content/stack.ts`, un hito a `src/content/trajectory.ts` y quitar `provisional` de un dato se refleja en ambas pantallas, en los dos idiomas, sin editar ningún componente (`git status` muestra solo los archivos de datos); revertir los cambios y anotar el resultado en `research.md`.
- [ ] T041 [US6] Verificar que no hay textos, colores ni duraciones sueltos en los componentes nuevos (`grep` de cadenas en español e inglés, de `#` y de `ms` en `src/components/profile` y `src/components/stack`) y que la prueba de tokens sigue impidiendo colores fuera de `globals.css`.

**Punto de control**: contenido en datos. Commit: `test(content): comprobar que el contenido solo vive en los datos`.

---

## Fase 9: Pulido y cierre (transversal)

**Propósito**: limpieza, accesibilidad, rendimiento, documentación y fusión.

- [ ] T042 Eliminar `src/components/sections/ProfileSection.tsx` y `src/components/sections/StackSection.tsx`, y las claves de `ui-text.ts` o importaciones que queden sin uso (`grep -r "ProfileSection\|StackSection" src tests`); ajustar `tests/e2e/language.spec.ts`, `tests/e2e/layout.spec.ts` y `tests/e2e/screen-frame.spec.ts` solo si dependen del DOM anterior.
- [ ] T043 [P] Pasar axe-core sobre 12 casos (menú con y sin splash, en español e inglés, con movimiento reducido, en móvil, y las cinco pantallas) y recorrer el orden de tabulación; debe dar 0 violaciones.
- [ ] T044 Medir Lighthouse móvil sobre la compilación de producción local en `/es/profile` y `/es/stack`, tres corridas cada una, y la carga inicial (≤ 350 KiB); anotar los resultados en la tabla de `quickstart.md` y en `research.md`.
- [ ] T045 **Acción de Edward**: revisar y confirmar el contenido de ambas pantallas (presentación, **semestre actual exacto** —el "7.º" es un valor de la v1, no confirmado—, institución, hitos y sus descripciones, tecnologías y niveles, y las traducciones al inglés) y decir qué datos dejan de ser provisionales; el asistente quita entonces `provisional` de lo confirmado.
- [ ] T046 Ejecutar la skill `review-animations` sobre el cambio de posición y el fundido de Oguri por pantalla y sobre la entrada de los bloques, y corregir los hallazgos. **Acción de Edward**: esa skill solo la puede invocar el usuario; confirmar además la comparación con las pantallas de referencia de P3R (SC-009).
- [ ] T047 [P] **Acción de Edward**: revisión manual con lector de pantalla (por ejemplo NVDA) de ambas pantallas: la ficha, la trayectoria, "Full-Stack", las categorías y los niveles.
- [ ] T048 [P] **Acción de Edward (móvil real)**: comprobar la lectura de los círculos apilados y de la trayectoria en un móvil real y que Oguri se distingue sin tapar nada.
- [ ] T049 Actualizar `README.md`: las dos pantallas, cómo agregar una tecnología o un hito (solo datos), qué datos se publican y cuáles no, la etiqueta central y la posición de Oguri por pantalla.
- [ ] T050 Ejecutar `npm run verify` desde una instalación limpia (`npm ci`), por etapas y con `--workers=2` si la memoria es limitada (lint, unitarias, compilación, E2E de cada proyecto y `npm audit --omit=dev`); registrar el resultado en `research.md`; comprobar también que `tests/e2e/navigation.spec.ts` ("accesos con pocas interacciones") sigue pasando (FR-015).
- [ ] T051 Subir la rama y revisar la vista previa de Vercel; abrir el pull request `004-quien-soy-y-stack` → `main` (con `gh`, ya instalado y con sesión iniciada) y dejar la fusión a Edward.
- [ ] T052 **Acción de Edward**: fusionar el pull request; luego medir Lighthouse en la dirección pública (`/es/profile` y `/es/stack`) y anotar los resultados (rendimiento ≥ 90 en PageSpeed, accesibilidad 100, ≤ 350 KiB).
- [ ] T053 Marcar CA-1 a CA-9 en `docs/sprints/fase-4-quien-soy-y-stack.md` con su evidencia, registrar los cambios finales y las lecciones en `research.md`, actualizar el estado en `docs/project-context.md` (fase 4 completada) y confirmar el cierre con Edward.

---

## Dependencias y orden de ejecución

- **Fase 1** → **Fase 2** (bloquea todo) → **Fase 3 (US1)** → **Fase 4 (US2)** → **Fase 5 (US3)** → **Fase 6 (US5)** → **Fase 7 (US4)** → **Fase 8 (US6)** → **Fase 9**. US1 y US2 comparten `profile/page.tsx` y `globals.css`; US3 solo toca `stack/page.tsx` y `globals.css`, así que puede ir en paralelo a US1 y US2 si hay capacidad, pero los archivos compartidos obligan a hacer en secuencia las tareas que los modifican.
- Dentro de cada historia: las pruebas se escriben primero y fallan; luego componentes, estilos e integración y, por último, capturas y revisión.
- Los archivos compartidos (`globals.css`, `profile/page.tsx`, `SceneShell.tsx`, `profile.spec.ts` y `stack.spec.ts`) se tocan en varias historias: las tareas que los modifican van en secuencia, no en paralelo.
- T045 (confirmación de Edward) puede hacerse en cualquier momento y desbloquea el cierre; conviene pedirlo después de ver las capturas de T017, T022 y T029.

### Oportunidades de paralelismo

- Fase 2: T004, T005, T006, T007 y T008 son independientes entre sí; T009 a T011 esperan a T006 y T007; T012 va al final.
- US1: T013 y T014 pueden hacerse a la vez. US2: T018 y T019. US3: T023, T024 y T025.
- Fase 9: T043, T047 y T048 son independientes.

## Estrategia de implementación

- **MVP**: Fases 1 a 4 (US1 y US2): "Quién soy" completa con su ficha y su trayectoria. Se demuestra y se revisa con Edward antes de seguir con "Stack".
- **Entrega incremental**: cada fase de historia termina con un punto de control, las pruebas en verde y un commit; la rama se sube después de cada punto de control.
- **Riesgos a vigilar**: la legibilidad del texto dentro de los círculos y su adaptación a 390 px (T026 y T027), el contraste del tinte (T005), la posición de Oguri (T033) y que el contenido siga siendo provisional hasta T045.
