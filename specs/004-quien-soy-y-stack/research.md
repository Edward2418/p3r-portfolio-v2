# Investigación (Fase 0): Fase 4 — Quién soy y Stack

**Fecha**: 2026-10-23 | **Especificación**: [spec.md](./spec.md) | **Fases anteriores**: [../003-identidad-visual-p3r/research.md](../003-identidad-visual-p3r/research.md) y [../002-escena-y-menu/research.md](../002-escena-y-menu/research.md)

Cada decisión indica su razón y las alternativas evaluadas. No quedaba ningún punto `NEEDS CLARIFICATION` tras las tres aclaraciones de la especificación.

## D1. Los círculos son CSS sobre el propio contenido

- **Decisión**: cada categoría es un bloque HTML (`<section>` con un `<h3>` y una `<ul>`) al que el CSS da forma circular: un borde de color y, tras el texto, un tinte translúcido en un pseudoelemento decorativo. Los tres bloques se colocan con porcentajes dentro de un contenedor de proporción fija para que se solapen. No hay SVG ni biblioteca de gráficos.
- **Razón**:
  - **Un solo DOM**: lo que ve el visitante es lo que leen los lectores de pantalla; el equivalente textual (FR-009) no es una copia que pueda desincronizarse.
  - **Sin JavaScript de cliente nuevo**: son componentes de servidor; no suma peso ni retrasa la hidratación (Principio I y presupuesto de 350 KiB).
  - **Contraste verificable**: el texto es texto HTML sobre el panel marino; axe y las pruebas de tokens pueden comprobarlo (D10).
- **Alternativas evaluadas**:
  - *SVG con los textos dentro*: el texto SVG no se ajusta bien a anchos distintos y duplica la información para lectores de pantalla.
  - *Biblioteca de gráficos (D3, Chart.js)*: dependencia nueva y peso para tres círculos estáticos; viola "sin dependencias nuevas sin justificar".
  - *Canvas*: no accesible.

## D2. Disposición: solapados desde 768 px y apilados por debajo

- **Decisión**:
  - **Desde 768 px**: un contenedor con `aspect-ratio` y tres círculos de ~58 % del ancho: dos arriba (izquierda y derecha) y uno abajo y al centro, de forma que se solapen formando una zona central común. La etiqueta "Full-Stack" va en esa zona. Cada lista queda en la parte propia de su círculo (no solapada).
  - **Por debajo de 768 px** (390 px incluido): los tres círculos se apilan en una columna con solapamiento vertical parcial (márgenes negativos) para conservar la idea de círculos encadenados, con la etiqueta "Full-Stack" como cabecera de la pila. Cada categoría ocupa todo el ancho.
  - Con más tecnologías de las que caben en el círculo (más de unas 6 por categoría), el bloque crece hacia abajo (`min-height` en lugar de alto fijo) y el círculo pasa a ser una elipse suave; el texto nunca se recorta.
- **Razón**: tres círculos solapados a tamaño de escritorio miden más de 300 px cada uno y no caben en 342 px de ancho útil; apilarlos conserva la lectura y la identidad. El contenedor de proporción fija da un solapamiento estable en escritorio.
- **Alternativas**: reducir el escalado proporcionalmente en móvil (el texto queda ilegible), carrusel horizontal (viola "sin desplazamiento horizontal" y la lectura sin interacción).

## D3. Nivel como texto y como puntos

- **Decisión**: cada tecnología muestra "Nivel: n/5" como texto y, junto al texto, cinco puntos (rellenos hasta el nivel) marcados `aria-hidden`. La información no depende del color: un punto relleno y uno vacío se distinguen por forma (relleno frente a contorno), y el valor numérico siempre está.
- **Razón**: FR-007 y el Principio III; los puntos dan el gesto visual de "nivel" del juego y el texto lo hace accesible.
- **Alternativas**: estrellas (más recargado y sugiere calificación), barras (la v1 las usaba y se quitaron por coherencia), solo número (poco visual).

## D4. Etiqueta central "Full-Stack"

- **Decisión**: la etiqueta vive en `src/content/stack.ts` (`stackCenterLabel`, bilingüe). Se muestra en la zona central solo si las tres categorías tienen tecnologías. En el DOM va antes de las categorías (orden de lectura: "Full-Stack", luego Frontend, Backend y Bases de datos y herramientas), de modo que el lector de pantalla la anuncia como el título del conjunto.
- **Razón**: FR-008 y la aclaración 3; los datos son editables sin tocar componentes.

## D5. La ficha de "Quién soy"

- **Decisión**: la ficha es un bloque con el nombre (tipografía de display), el titular, la especialidad, una lista de definición (`<dl>`) con "Institución" y "Semestre" y la presentación. La trayectoria es una lista ordenada (`<ol>`) con cada hito como `<li>`: el periodo (o la etiqueta "Hoy" o "Meta"), el título y la descripción. El hito actual y la meta futura llevan una etiqueta de texto visible y un estilo distinto (la meta, con contorno punteado); el estado no depende solo del estilo.
- **Razón**: la estructura semántica (`dl`, `ol`) comunica la relación entre etiqueta y valor y el orden cronológico a los lectores de pantalla sin ARIA adicional.
- **Alternativas**: tabla (peor en móvil), tarjetas sueltas sin lista (sin orden semántico).

## D6. Datos y privacidad

- **Decisión**:
  - `Profile` se amplía con `specialty`, `institution` y `semester` (los tres `Localized`, p. ej. "7.º semestre" y "7th semester"); `name` sigue siendo "Edward Negrete" (sin apellido completo).
  - Nuevo `TrajectoryEntry` en `src/content/trajectory.ts`: `id`, `period` (`Localized`, p. ej. "2023", "Hoy", "Meta"), `title`, `description`, `kind` (`formation`, `progress`, `current` o `goal`) y `provisional`. El hito de la titulación es `goal` y no lleva año.
  - `stack.ts` suma `stackCenterLabel` y las tecnologías candidatas (Java, SQL y bases de datos, HTML y CSS, JavaScript), todas provisionales con niveles de ejemplo.
  - Una prueba unitaria impide publicar el apellido completo y el año de titulación en `profile`, `trajectory`, `stack` y `ui-text` (FR-004) y comprueba que ningún hito `goal` tiene un año.
- **Razón**: Principios IV y V; la prueba convierte la decisión de privacidad en una regla que no se rompe por accidente.
- **Alternativas**: guardar los datos personales en variables de entorno (innecesario: son decisiones públicas de Edward).

## D7. Oguri por pantalla

- **Decisión**: `SceneShell` publica `data-scene="<id>"` (vacío en el menú) además de `data-view`. El CSS define por pantalla la posición, la altura y la inclinación de `[data-character]` con propiedades personalizadas (`--character-right`, `--character-height`, `--character-tilt`); la inclinación se aplica a la imagen y al video interiores (no a `[data-character]`, cuyo `transform` anima WAAPI en la transición). El cambio de posición ocurre al cambiar la ruta, bajo la cobertura del barrido. Con movimiento reducido, el personaje se funde cuando cambia la **pantalla** (no solo la vista), reutilizando `fadeIn(includeCharacter)` de la fase 3.
- **Valores iniciales** (se afinan con capturas): Quién soy, a la derecha, altura `min(90vh, 60vw)`, sin inclinación; Stack, a la derecha pero más pequeña (`min(78vh, 52vw)`) y con 3° de inclinación. Por debajo de 1024 px siguen las reglas de la fase 3 (detrás del panel, atenuada).
- **Razón**: FR-011; mantiene la regla de la fase 3 (un único elemento animado por WAAPI) y no añade JavaScript.
- **Alternativas**: un componente `Character` por pantalla (remonta el idle), reflejar la imagen horizontalmente (cambia la lectura de la pose y no estaba pedido).

## D8. Movimiento

- **Decisión**: no se añade movimiento nuevo. Las dos pantallas usan la entrada escalonada de bloques de `ScreenFrame` (`data-stagger`); los círculos, los puntos de nivel y la trayectoria son estáticos. Los círculos no se animan al entrar.
- **Razón**: la aclaración por defecto de la especificación (supuestos) y el Principio I: información primero. Si más adelante se quiere una entrada de círculos, será una decisión aparte con `animate` y `review-animations`.

## D9. Accesibilidad

- **Decisión**: jerarquía `h1` (nombre de la pantalla, foco al llegar), `h2` por sección (ficha, trayectoria, Stack) y `h3` por categoría; listas reales para tecnologías e hitos; el gráfico decorativo (`aria-hidden`); ningún control interactivo nuevo, así que el orden de tabulación no cambia. Los textos de nivel y de estado (provisional, actual, meta) son visibles. El idioma se declara por documento (ya hecho).
- **Razón**: Principio III y FR-009, FR-016.

## D10. Contraste con el tinte de los círculos

- **Decisión**: el tinte de cada círculo se define con un token de opacidad (`--opacity-circle-tint`, ≈ 0.14) sobre uno de los colores de la paleta (cian, rojo de marca y blanco azulado). `tokens.test.ts` calcula el color mezclado del tinte sobre `--color-navy` y exige 4.5:1 con `--color-text` y con `--color-cyan` (nombres de categoría); el trazo de cada círculo cumple 3:1 contra el panel.
- **Razón**: el texto está sobre el panel marino y el tinte, que no se puede verificar con axe cuando es un pseudoelemento; la prueba lo cubre.

## D11. Pruebas

- **Unitarias**: validaciones nuevas en `content.test.ts` (niveles de 1 a 5, tecnologías únicas, tres categorías, hitos con exactamente una meta y al final, ningún apellido completo ni año de titulación, idiomas completos) y los pares de contraste del tinte en `tokens.test.ts`; además `presentation.test.ts` para las funciones puras de presentación (categoría vacía, etiqueta central y trayectoria vacía), porque `node --test` no importa componentes y los datos se renderizan en el servidor.
- **E2E**: `profile.spec.ts` (ficha, datos publicados, orden y estado de los hitos, etiquetas provisionales, idioma), `stack.spec.ts` (tres grupos, nivel como texto en cada tecnología, etiqueta central, orden de lectura, sin recorte ni desplazamiento horizontal en 390, 768 y 1280 px, con la categoría más larga) y `character-per-scene.spec.ts` (posiciones distintas por pantalla, sin tapar el contenido, fundido con movimiento reducido).
- **Revisión**: axe-core con 0 violaciones, capturas a 390, 768 y 1280 px y comparación con la pantalla de referencia de P3R.

## D12. Pruebas y código heredados

- **Decisión**: `ProfileSection` y `StackSection` se reemplazan por `ProfileSheet`, `Trajectory` y `StackCircles`; `StackCircles` conserva un `<h2>` "Stack" porque `language.spec.ts` lo espera. Las pruebas de `screen-frame` y de diseño se ajustan solo si dependen del DOM anterior.
- **Razón**: evita código muerto y mantiene los 190 E2E existentes en verde.

## D13. Borradores de contenido

- **Decisión**: el asistente propone, como provisional, la presentación, las descripciones de los hitos (a partir de los datos de la v1) y todas las traducciones al inglés; Edward las revisa y confirma. Los borradores están en [data-model.md](./data-model.md).
- **Razón**: Principio V; nada se publica como cierto sin su confirmación.

## Notas de implementación (Fase 4)

### R1. Los círculos con texto compacto (US3)

El primer diseño (dos líneas por tecnología y una etiqueta "Provisional" en cada una) desbordaba el círculo del frontend, que ya tiene seis tecnologías: el texto cruzaba los trazos vecinos y la etiqueta central. Se compactó: **una línea por tecnología** (nombre a la izquierda; "n/5" y cinco puntos a la derecha), una leyenda visible "Nivel de 1 a 5", el prefijo "Nivel: " solo para lectores de pantalla y la marca "Provisional" **una vez por categoría** cuando todas sus tecnologías son provisionales (`provisionalScope`). Las pruebas comprueban que el texto queda dentro del trazo elíptico de su círculo con los datos reales, y que con ocho tecnologías el bloque crece y no se recorta.

Por debajo de 768 px los círculos se apilan como elipses más anchas que altas (`aspect-ratio: 1 / 0.8`) con solapamiento vertical parcial, para no desperdiciar altura.

### R2. Accesibilidad de Quién soy y Stack (US4, T034 a T038)

- **Árbol de accesibilidad**: en "Stack" se lee "Full-Stack", cada categoría y cada tecnología con "Nivel: n/5" en ese orden (el prefijo "Nivel: " es solo para lectores de pantalla; la leyenda visible es "Nivel de 1 a 5"); en "Quién soy", la ficha como lista de definición y la trayectoria como lista ordenada con "Actual" y "Meta". La jerarquía de encabezados no salta de nivel, el contenido no añade paradas de tabulación y al llegar con R el foco queda en el h1 y se anuncia el título (`tests/e2e/screens-accessibility.spec.ts`).
- **axe-core 4.14** (WCAG 2.2 AA y buenas prácticas): 0 violaciones en las dos pantallas, en español e inglés, a 1280 y 390 px. Lo "por revisar" es el tinte de los círculos (un pseudoelemento que axe no puede evaluar, cubierto por `tokens.test.ts`, también con los tres tintes apilados bajo la etiqueta central) y el solapamiento geométrico de la guía fija.
- **Anchos estrechos**: 320 px (equivalente a zoom del 200 %) y 844×390: sin desplazamiento horizontal y con todo el texto dentro de la ventana (`tests/e2e/mobile-layout.spec.ts`). El orden de tabulación de las pantallas solo contiene los controles de la guía y del encabezado.

### R3. Contenido solo en datos (US6, T039 a T041)

Se agregaron a propósito una tecnología (`DockerXYZ`) en `src/content/stack.ts`, un hito (`HitoPruebaXYZ` / `TestMilestoneXYZ`) en `src/content/trajectory.ts` y se quitó `provisional` de Git: `git status` mostró solo esos dos archivos de datos y la compilación reflejó la tecnología en `/es/stack` y `/en/stack` y el hito en cada idioma en `/es/profile` y `/en/profile`. Se revirtió y el árbol quedó limpio. Los componentes nuevos (`ProfileSheet`, `Trajectory` y `StackCircles`) no contienen textos visibles, colores ni duraciones sueltos (solo comentarios). Las pruebas de cada pantalla comprueban que la cantidad de etiquetas "Provisional" coincide con los datos provisionales (con `provisionalBadgeCount` en el stack) y que no hay elementos de texto vacíos.

### R4. Rendimiento local con la fase 4 (T044)

Lighthouse 12 móvil sobre la compilación de producción local, el 2026-10-23, tres corridas por ruta:

| Ruta | Rendimiento | Accesibilidad | SEO | Prácticas | LCP | TBT | CLS | KiB | Video / audio |
|---|---|---|---|---|---|---|---|---|---|
| `/es/profile` | 82, 80 y 82 | 100 | 100 | 96 | 3.2–3.3 s | 440–530 ms | 0 | 265.8 | no / no |
| `/es/stack` | 82, 82 y 81 | 100 | 100 | 96 | 3.3 s | 420–470 ms | 0 | 270.3 | no / no |

La carga inicial sigue por debajo de 350 KiB (la fase 4 solo añade HTML y CSS: ningún JavaScript de cliente nuevo) y el rendimiento queda al nivel de las fases anteriores en este equipo (80 a 88). Pendiente: PageSpeed Insights en la web de Google, tras fusionar.

### R5. Verificación desde instalación limpia (T050)

Realizada el 2026-10-23 tras `rm -rf node_modules .next` y `npm ci`, por etapas y con 2 trabajadores de Playwright (un navegador a la vez):

| Etapa | Resultado |
|---|---|
| `npm ci` | 290 paquetes |
| `npm run lint` y `tsc --noEmit` | Sin errores |
| `npm run test:unit` | 120 de 120 |
| `npm audit --omit=dev` | 0 vulnerabilidades |
| `npm run build` | Compilación correcta |
| E2E Chromium 390 px | 244 pasadas y 3 omitidas |
| E2E Chromium 768 px | 242 pasadas y 5 omitidas |
| E2E Chromium 1280 px | 245 pasadas y 2 omitidas |
| E2E Firefox 1280 px | 231 pasadas y 15 omitidas a propósito; 1 fallo intermitente de la prueba de la entrada de Oguri tras omitir el splash (cuenta cuadros de animación y falló con la máquina cargada: 3 de 3 en solitario), que ahora exige 2 cuadros intermedios en lugar de 3 y permite 2 reintentos |

`tests/e2e/navigation.spec.ts` ("accesos con pocas interacciones", FR-015) sigue pasando.
