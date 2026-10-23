---

description: "Lista de tareas de la Fase 3 — Identidad visual P3R"
---

# Tareas: Fase 3 — Identidad visual P3R

**Entrada**: documentos de diseño en `specs/003-identidad-visual-p3r/`

**Requisitos previos**: plan.md, spec.md, research.md, data-model.md, contracts/ (`scene-layout.md`, `character-media.md`, `sound.md`), quickstart.md

**Pruebas**: se incluyen porque la especificación las exige (SC-009). Las pruebas de cada historia se escriben primero y deben fallar antes de implementar.

**Organización**: las tareas se agrupan por historia de usuario y, dentro de las fases, siguen el orden de implementación. Prioridades: US1, US2, US3 y US6 son P1; US4 y US5 son P2; US7 es P3. US5 (marco de las pantallas) se implementa antes que US3 porque el barrido necesita la vista de pantalla ya construida.

## Formato: `[ID] [P?] [Historia] Descripción con ruta`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[US#]**: historia de usuario a la que pertenece la tarea
- Reglas del proyecto: comentarios, pruebas y textos visibles en español; identificadores en inglés; antes de escribir código de Next.js, leer `node_modules/next/dist/docs/` (T002); aplicar `vercel-react-best-practices` a los componentes y `animate`, `animation-performance` y `emil-design-eng` al movimiento.
- Trabajar en la rama `003-identidad-visual-p3r` (nunca directamente en `main`).
- Sin dependencias nuevas. Si la memoria del equipo es limitada, ejecutar las pruebas E2E con `--workers=2` y un navegador a la vez (`--project=chromium-390`, etc.).

## Convenciones de rutas

Proyecto único en la raíz del repositorio: `src/`, `tests/`, `public/` (ver plan.md, "Código fuente").

---

## Fase 1: Preparación (infraestructura compartida)

**Propósito**: rama lista, guías de Next leídas y línea base verificada.

- [x] T001 Confirmar con `git branch --show-current` que estás en `003-identidad-visual-p3r`, que `specs/003-identidad-visual-p3r/` y `public/img/oguri/` y `public/audio/` ya están confirmados y subidos (commit `f76a2e6` para el arte), y que el video de referencia de P3R sigue fuera de git (`git ls-files | grep -ci "Pause Menu"` da 0).
- [x] T002 Leer en `node_modules/next/dist/docs/` las guías de layouts compartidos (estado que se conserva entre rutas), componentes de cliente dentro de layouts de servidor, imágenes (`<img>` frente a `next/image` y la regla de ESLint correspondiente) y archivos estáticos de `public/`; si algo contradice a `research.md` (D1 o D3), anotarlo allí antes de seguir. Comprobar además si el layout de `[lang]` se remonta al cambiar de idioma (`/es` → `/en`), porque entonces el personaje y el proveedor de sonido se reinician (D1).
- [x] T003 Revisar `playwright.config.ts` y `tests/e2e/helpers.ts` (`openReady`, `markSplashSeen`) para reutilizarlos, y ejecutar `npm run lint` y `npm run test:unit` como línea base (80 pruebas unitarias en verde).

**Punto de control**: base verificada. No requiere commit de código.

---

## Fase 2: Fundamentos (requisitos bloqueantes)

**Propósito**: tipos, tokens, textos, datos y señales que necesitan todas las historias.

**⚠️ CRÍTICO**: ninguna historia puede empezar hasta terminar esta fase.

- [x] T004 [P] Ampliar `src/content/types.ts` con `SoundId` (`'cursor' | 'confirm' | 'cancel' | 'open' | 'close' | 'levelup'`), `SoundPreference` (`'on' | 'off'`; "por defecto `off`"), `ViewKind` (`'menu' | 'screen'`), `CharacterAsset` (`poster: { src, width, height }`, `idle: { src, type }` y `alt: Localized`) y `SoundEffect` (`id: SoundId` "Único; los seis valores de `SoundId` deben estar" y `src: string` con la forma `/audio/<id>.mp3`).
- [x] T005 [P] Agregar a `src/app/globals.css` (bloque `@theme`) los tokens nuevos con estos valores iniciales, que T008 verifica: `--color-sky: #4fe3ff`, `--color-deep: #0a1a9e`, `--color-panel: #f4f9ff`, `--color-navy: #07124a`, `--color-on-panel: #07124a`, `--angle-skew: -10deg`, `--duration-character-in: 300ms`, `--opacity-character-dim: 0.45` (personaje atenuado en móvil y en pantallas estrechas), `--color-focus-inner: #07124a` y `--color-focus-outer: #ffffff` (anillo de foco de doble capa). Sin valores sueltos en los componentes.
- [x] T006 [P] Ampliar `src/content/ui-text.ts` con textos `Localized` en ambos idiomas: `panelTitle` ("PORTFOLIO" / "PORTFOLIO"), `soundToggleLabel` ("Sonido" / "Sound"), `soundOn` ("Activado" / "On"), `soundOff` ("Desactivado" / "Off"), `soundHint` (nota breve: el audio se descarga solo al activarlo). La descripción de Oguri vive solo en `CharacterAsset.alt` (`src/content/character.ts`), sin duplicarla aquí.
- [x] T007 [P] Escribir primero `tests/unit/character-content.test.ts` y `tests/unit/audio.test.ts`: las rutas del póster y del video "deben existir en `public/`"; el póster mide 540×960; `alt` tiene español e inglés; hay exactamente seis efectos con los seis `SoundId`, sin repetirse; cada `src` existe en `public/audio/`; el peso total de los MP3 no supera 100 KiB; el mensaje de cada aserción en español.
- [x] T008 [P] Ampliar `tests/unit/tokens.test.ts` con los pares de contraste nuevos y su umbral AA (4.5:1 texto pequeño, 3:1 texto grande): texto claro (`--color-text`) sobre `--color-navy`, texto `--color-cyan` sobre `--color-navy`, `--color-on-panel` sobre `--color-panel`, texto claro sobre `--color-red-fill`, el borde rojo sobre `--color-panel` (3:1) y el anillo de foco (3:1): `--color-focus-inner` sobre `--color-panel` y `--color-sky`, y `--color-focus-outer` sobre `--color-navy` y `--color-deep` (en cada superficie se ve al menos una de las dos capas). Debe fallar si algún valor de T005 no cumple; ajustar los valores en T005 hasta que pase.
- [x] T009 Crear `src/content/character.ts` (póster `/img/oguri/idle-poster.webp` 540×960, video `/img/oguri/idle.webm` con tipo `video/webm; codecs="vp9"`, `alt` bilingüe) y `src/content/audio.ts` (los seis efectos `/audio/<id>.mp3`); exportar ambos desde `src/content/index.ts`. Debe pasar T007.
- [x] T010 [P] Crear `src/lib/motion/use-motion-state.ts`: hook con `useSyncExternalStore` y un `MutationObserver` sobre los atributos de `<html>` que devuelve si `data-motion` es `reduced` y si `data-scene-busy` está presente; con valores seguros en el servidor (`false`).
- [x] T011 Modificar `src/components/scene/transition.ts`: en `setPhase`, fijar `data-scene-busy="true"` en `<html>` cuando la fase no sea `idle` y quitarlo al volver a `idle` (también en `releaseLayer` y en `skip`); sin cambiar tiempos ni la secuencia.
- [x] T012 Modificar `src/components/scene/SceneShell.tsx`: derivar `view: ViewKind` (`menu` si `sceneId === null`, `screen` en caso contrario), publicarlo como `data-view` en el contenedor raíz y exponerlo en el contexto (`useScene`).

**Punto de control**: base lista. Las historias pueden empezar.

---

## Fase 3: Historia de usuario 1 — Ver un menú con el estilo de P3R (Prioridad: P1) 🎯 MVP

**Meta**: el menú muestra el degradado de cian a azul profundo, el panel blanco inclinado con el título vertical y las cinco opciones inclinadas, con la activa blanca y con borde rojo, y los controles del encabezado y el pie siguen siendo legibles.

**Prueba independiente**: abrir `/es` y `/en`, ver el aspecto y mover la opción activa con el teclado.

### Pruebas de la historia (escribirlas primero y comprobar que fallan)

- [x] T013 [P] [US1] Crear `tests/e2e/visual-menu.spec.ts`: el panel muestra el texto de `panelTitle` en vertical (`writing-mode`), las cinco opciones tienen una transformación de inclinación distinta de la identidad, la opción activa tiene fondo claro y borde rojo (estilos calculados) y la inactiva fondo marino, el resaltado sigue al teclado, el título cambia con el idioma (`/en`), y no hay desplazamiento horizontal en 390, 768 y 1280 px; el foco visible (estilos calculados de `:focus-visible`) usa el anillo doble de `--color-focus-inner` y `--color-focus-outer`, también sobre la opción activa blanca.

### Implementación de la historia

- [x] T014 [P] [US1] Crear `src/components/scene/SceneBackdrop.tsx` (servidor, `aria-hidden`): capa `fixed` con el degradado (`--color-sky` a `--color-deep`), el panel blanco inclinado (`--color-panel`, `--angle-skew`) y el título vertical desde `panelTitle`; sin animaciones.
- [x] T015 [US1] Agregar a `src/app/globals.css` las clases de las capas (degradado, panel y título vertical) y las reglas por `data-view` del panel (grande en el menú, banda estrecha en las pantallas, según `contracts/scene-layout.md`); sin `background-attachment: fixed`. Sustituir además el foco global `:focus-visible` (hoy un contorno cian de 2 px) por un anillo de doble capa (contorno de `--color-focus-inner` y halo de `--color-focus-outer`) que se vea sobre superficies blancas, cian y marinas.
- [x] T016 [US1] Modificar `src/app/[lang]/layout.tsx`: renderizar `<SceneBackdrop>` dentro de `SceneShell` antes del encabezado, y poner el contenido por encima de las capas (`relative`, `z-index` según el contrato).
- [x] T017 [US1] Modificar `src/components/menu/MainMenu.tsx` y `src/app/[lang]/page.tsx`: opciones como fichas inclinadas (`--angle-skew`) en azul marino con texto cian, la activa blanca con borde rojo y texto `--color-on-panel`, composición de dos columnas desde 768 px; quitar el título de fondo anterior (`data-title`) que choca con el título vertical; conservar `data-stagger`, `aria-current` y el foco.
- [x] T018 [P] [US1] Dar fichas marino legibles a `src/components/LanguageSwitcher.tsx`, `src/components/MotionToggle.tsx` y `src/components/Footer.tsx` (no cian sobre cian), con el aviso de no afiliación visible y contrastes que cumplan T008.
- [x] T019 [US1] Ajustar `tests/e2e/menu.spec.ts` y `tests/e2e/layout.spec.ts` a la nueva geometría; deben pasar junto con T013.
- [x] T020 [US1] Capturar `/es` a 1280 px y 390 px con Playwright (o Claude in Chrome si está conectada), compararlas con la referencia visual (`specs/003-identidad-visual-p3r/research.md`, D12) y ajustar espaciados, tamaño del título vertical y la inclinación; mostrar las capturas a Edward.

**Punto de control**: el menú tiene el aspecto de P3R y es funcional. Commit: `feat(menu): aplicar el estilo visual p3r al menú`.

---

## Fase 4: Historia de usuario 2 — Tener a Oguri como protagonista (Prioridad: P1)

**Meta**: Oguri aparece grande en el menú con entrada animada y, cuando el navegador queda en reposo y el movimiento lo permite, con el idle; con movimiento reducido, ahorro de datos o un fallo, queda la imagen fija.

**Prueba independiente**: abrir el menú, comprobar la entrada, que el idle aparece tras el reposo y que con movimiento reducido no se descarga el video.

### Pruebas de la historia (escribirlas primero y comprobar que fallan)

- [x] T021 [P] [US2] Crear `tests/unit/idle.test.ts` con la tabla de `shouldLoadIdle`: `true` solo sin movimiento reducido, sin ahorro de datos, con soporte de WebM VP9 y fuera de WebKit; cada una de las cuatro condiciones por separado da `false`. La función `isWebkit(userAgent)` se prueba con cadenas reales: Safari de escritorio, Safari y navegadores de iOS (`iPhone`, `iPad`, `CriOS`, `FxiOS`) dan WebKit; Chrome, Edge, Firefox y Chrome en Android no.
- [x] T022 [P] [US2] Crear `tests/e2e/character.spec.ts`: el `<img>` del póster existe con `width` y `height`, `aria-hidden` y `fetchpriority="low"`; en el menú no se pide `idle.webm` en los primeros 500 ms, y se pide después del reposo (Chromium y Firefox) llegando `data-idle` a `playing` o `loading`; con movimiento reducido (sistema y sitio) y con `navigator.connection.saveData` simulado con `addInitScript` nunca se pide (`data-idle="off"`); si la petición de `idle.webm` se bloquea con `route.abort`, queda el póster y no hay errores en consola; ninguna petición a `/audio/`. Además: las opciones del menú responden a Enter y al clic mientras `data-idle` sigue en `pending` (el menú no espera al idle); existe la animación CSS de entrada del personaje y no existe con movimiento reducido; si se aborta la petición del póster (`route.abort`) el menú sigue utilizable y sin errores en consola; y cambiar de idioma (`/es` → `/en`) deja el personaje visible (puede reentrar si el layout se remonta), sin errores y con `sound` conservada en `localStorage`.

### Implementación de la historia

- [x] T023 [US2] Crear `src/lib/motion/idle.ts` con `shouldLoadIdle({ reducedMotion, saveData, canPlayWebm, isWebkit })` y `isWebkit(userAgent)` (funciones puras; WebKit se detecta por agente de usuario: contiene `Safari` sin `Chrome`, `Chromium`, `Android` ni `Firefox`, o es un dispositivo iOS (`iPhone`, `iPad`, `iPod`) con cualquier navegador); debe pasar T021.
- [x] T024 [US2] Crear `src/components/scene/Character.tsx` (cliente, según `contracts/character-media.md`): contenedor con posición propia y, dentro, `[data-character]` con el `<img>` del póster y un `<video muted playsinline loop>` que se crea solo si `shouldLoadIdle` lo permite y tras `requestIdleCallback` con `timeout` de 2000 ms (respaldo `setTimeout`); fundido de `opacity` con `playing`; en `error` o `play()` rechazado se quita el video; pausas con `data-scene-busy`, con la pestaña oculta y con movimiento reducido (T010); atributo `data-idle` (`pending`, `loading`, `playing`, `failed`, `off`); `pointer-events: none` y `aria-hidden`; el texto de `alt` solo en datos. Aplicar `vercel-react-best-practices`.
- [x] T025 [US2] Agregar a `src/app/globals.css` la posición del personaje en la vista de menú (a la izquierda y grande desde 768 px, sin ocupar espacio del diseño) y su entrada inicial en CSS con `--duration-character-in` y `--ease-out` (solo `transform` y `opacity`, con retraso igual a `--duration-splash` cuando el splash se muestra, y sin animación con `data-motion="reduced"` ni con `prefers-reduced-motion`).
- [x] T026 [US2] Modificar `src/app/[lang]/layout.tsx` para renderizar `<Character>` dentro de `SceneShell` y `src/app/[lang]/page.tsx` para quitar `CharacterSlot`; eliminar `src/components/menu/CharacterSlot.tsx` y las referencias que queden (`grep -r CharacterSlot src tests`); quitar también `characterLabel` de `src/content/ui-text.ts` y de la lista de claves de `tests/unit/menu.test.ts`, que quedan sin uso.
- [x] T027 [US2] Comprobar el póster sobre el panel blanco a 1280 px: si el halo verdoso del recorte se nota, limpiar el alfa con `ffmpeg` (extraer el canal alfa, erosionar un píxel y volver a componer) y reemplazar `public/img/oguri/idle-poster.webp` conservando 540×960 y un peso similar; si no se usa en ninguna tarea, retirar `public/img/oguri/portrait.webp` con `git rm`; anotar lo decidido en `research.md` (D3).
- [x] T028 [US2] Ajustar las pruebas heredadas que dependían del marcador (`tests/e2e/transition.spec.ts`, `tests/e2e/menu.spec.ts`) para usar `[data-character]` del personaje real; deben pasar junto con T022.
- [x] T029 [US2] Aplicar las skills `animate` y `animation-performance` a la entrada y al fundido del idle: solo `transform` y `opacity`, sin `transition: all`, curvas de los tokens; documentar en `research.md` cualquier ajuste.

**Punto de control**: Oguri es el protagonista del menú con carga diferida. Commit: `feat(character): agregar a oguri con entrada e idle diferido`.

---

## Fase 5: Historia de usuario 5 — Marco común de las pantallas internas (Prioridad: P2)

**Meta**: las cinco pantallas comparten el fondo, una cabecera con el nombre, un panel de contenido y a Oguri en su posición de pantalla, sin dificultar la lectura.

**Prueba independiente**: abrir cada pantalla en 390, 768 y 1280 px y comprobar el marco.

### Pruebas de la historia (escribirlas primero y comprobar que fallan)

- [x] T030 [P] [US5] Crear `tests/e2e/screen-frame.spec.ts`: en las cinco pantallas hay un `<h1>` con el nombre y un panel de contenido visible; desde 1024 px Oguri queda a la derecha y fuera del panel (cajas delimitadoras sin solaparse); por debajo de 1024 px Oguri queda detrás del panel (`elementFromPoint` en el `<h1>` devuelve el `<h1>`); con L/R el marco se conserva y solo cambia el nombre; con mucho contenido (Proyectos) el personaje no se superpone al texto.

### Implementación de la historia

- [x] T031 [US5] Modificar `src/components/scene/ScreenFrame.tsx`: cabecera con el `<h1>` (foco y anuncio de ruta intactos) y un panel de contenido de azul marino con opacidad alta, manteniendo `data-stagger` en el `<h1>` y en cada bloque.
- [x] T032 [US5] Agregar a `src/app/globals.css` las reglas de la vista `screen`: panel en banda estrecha, Oguri a la derecha y grande desde 1024 px, y detrás del panel, recortado y atenuado, por debajo de 1024 px; margen del panel para no solapar al personaje (según `contracts/scene-layout.md`).
- [x] T033 [US5] Ajustar `tests/e2e/layout.spec.ts` y las pruebas de foco de `tests/e2e/navigation.spec.ts` si dependen del marco anterior; deben pasar junto con T030.
- [x] T034 [US5] Pasar axe-core (reglas WCAG 2.2 AA y buenas prácticas, instalado fuera del repositorio) sobre el marco de las pantallas (una vez en cada idioma, a 390 y 1280 px) para detectar problemas pronto; resolver cualquier violación de contraste, foco o regiones. El barrido completo de 12 casos queda en T054.

**Punto de control**: las cinco pantallas tienen marco propio de P3R. Commit: `feat(screens): agregar el marco común de las pantallas`.

---

## Fase 6: Historia de usuario 3 — Barrido entre pantallas con el personaje (Prioridad: P1)

**Meta**: durante la transición, Oguri entra desde la derecha, rotado, como en el video; el cambio de vista ocurre bajo la cobertura del barrido y todo sigue siendo interrumpible y de 500 a 800 ms.

**Prueba independiente**: abrir una pantalla desde el menú, grabar la transición y comprobar la entrada del personaje, la duración y la interrupción.

### Pruebas de la historia (escribirlas primero y comprobar que fallan)

- [x] T035 [P] [US3] Crear `tests/e2e/character-transition.spec.ts`: durante la transición menú → pantalla `[data-character]` tiene una animación (`getAnimations()`) que anima solo `transform` y `opacity`, y `data-scene-busy` está presente y desaparece al terminar; la duración total sigue entre 500 y 800 ms; al terminar, el personaje está en su posición de pantalla; con Esc vuelve a la posición del menú con la opción anterior resaltada; una interrupción (tecla o clic) deja el personaje en su posición final sin estado intermedio; el cambio de vista no es visible antes de que el barrido cubra la pantalla (la posición medida durante `exiting` es la anterior).
- [x] T036 [P] [US3] Ampliar `tests/e2e/reduced-motion.spec.ts`: con movimiento reducido el personaje no se desplaza (sin animaciones de `transform` sobre `[data-character]`), solo cambia la opacidad, y no se pide `idle.webm`.
- [x] T037 [P] [US3] Ampliar `tests/e2e/character.spec.ts` (Chromium): con el idle reproduciéndose, durante la transición el `<video>` queda pausado (`paused === true`) y se reanuda al terminar.

### Implementación de la historia

- [x] T038 [US3] Ajustar en `src/components/scene/transition.ts` los valores de la entrada de `[data-character]` (hoy `translateX(40%) rotate(8deg)`) para que el personaje real entre desde la derecha, rotado, con el mismo tramo y tokens de la fase 2; asegurar que la entrada se anima sobre el elemento interior, no sobre el contenedor posicionado (D1), y que el cambio de vista se aplica durante `exiting` y `navigating`.
- [x] T039 [US3] Comprobar en `src/components/scene/Character.tsx` que la pausa del idle responde a `data-scene-busy` (T010) y que al volver a `idle` se reanuda solo si sigue siendo elegible; cubrir el caso de interrupción.
- [x] T040 [US3] Comparar la transición con el video de referencia: grabar el menú → pantalla (Playwright o Claude in Chrome), extraer cuadros con `ffmpeg` fuera del repositorio, armar una hoja de contactos junto a los cuadros de la referencia y anotar las diferencias en `research.md` (nueva sección R) con ajustes de tokens si hace falta; mostrar el resultado a Edward.

**Punto de control**: el barrido incluye al personaje y pasa las pruebas de tiempo. Commit: `feat(transition): agregar al personaje al barrido de pantallas`.

---

## Fase 7: Historia de usuario 6 — Usar el menú en el móvil (Prioridad: P1)

**Meta**: en móvil, Oguri va detrás de las opciones, recortado por el borde derecho y atenuado; las opciones se ven completas, encima y a todo el ancho; nada genera desplazamiento horizontal.

**Prueba independiente**: abrir el menú y las pantallas a 390 px (y en horizontal) y comprobar que las opciones no quedan tapadas.

### Pruebas de la historia (escribirlas primero y comprobar que fallan)

- [x] T041 [P] [US6] Crear `tests/e2e/mobile-layout.spec.ts`: a 390 px, `elementFromPoint` en el centro de cada una de las cinco opciones devuelve su enlace (nunca el personaje); cada opción mide al menos 44 px de alto y casi todo el ancho; sin desplazamiento horizontal en el menú y en las cinco pantallas a 390, 768 y 1280 px; en horizontal (844×390) las cinco opciones siguen alcanzables y sin recortes; con zoom del texto al 200 % el menú sigue siendo utilizable; la opacidad calculada del personaje en móvil no supera `0.5` (token `--opacity-character-dim`).

### Implementación de la historia

- [x] T042 [US6] Ajustar `src/app/globals.css` y `src/components/scene/Character.tsx` para la vista móvil: recorte con `overflow: clip` en el contenedor del personaje (no en la página), opacidad de `--opacity-character-dim`, sin ocupar espacio y por debajo del contenido; en horizontal reducir el tamaño del personaje.
- [x] T043 [US6] Ajustar `src/components/menu/MainMenu.tsx` y el panel/título vertical para móvil: fichas a todo el ancho con al menos 44 px de alto, banda estrecha del panel sin tapar texto y sin desplazamiento horizontal.
- [x] T044 [US6] Revisar en 390 px y en horizontal con capturas (y en un móvil real si es posible), y corregir lo que quede mal.

**Punto de control**: el menú es utilizable en móvil. Commit: `feat(menu): adaptar el menú y el personaje al móvil`.

---

## Fase 8: Historia de usuario 4 — Sonido opcional (Prioridad: P2)

**Meta**: el sitio arranca en silencio sin descargar audio; el visitante lo activa en System y oye un sonido por acción; la preferencia se recuerda.

**Prueba independiente**: cargar el sitio sin peticiones de audio, activar el sonido en System y comprobar cada sonido y la persistencia.

### Pruebas de la historia (escribirlas primero y comprobar que fallan)

- [x] T045 [P] [US4] Crear `tests/unit/sound-preference.test.ts` (valor por defecto `off`; lectura y escritura; valores inválidos y almacenamiento bloqueado dan `off`; la escritura devuelve `false` si falla) y `tests/unit/sound-events.test.ts` (el mapa de `contracts/sound.md` acción → sonido; el limitador deja pasar `cursor` como máximo una vez cada 80 ms).
- [x] T046 [P] [US4] Crear `tests/e2e/sound.spec.ts`: al cargar el menú y las cinco pantallas hay cero peticiones a `/audio/`; en System el botón tiene `aria-pressed="false"`; al activarlo se piden los seis MP3, `aria-pressed="true"` y suena `levelup` una vez; con `HTMLMediaElement.prototype.play` espiado (`addInitScript`), mover la opción, abrir una pantalla, volver y cambiar con L/R reproducen `cursor`, `confirm` más `open`, `cancel` más `close` y `cursor`; la preferencia persiste tras recargar y, con `on` guardado, no se pide audio hasta la primera interacción; al desactivar no hay más reproducciones; con movimiento reducido sigue sonando; un `play()` rechazado no produce errores en consola; el botón se opera con Enter y Espacio; `open` y `close` suenan exactamente una vez por cambio de pantalla, también cuando la transición se interrumpe y con movimiento reducido; con `on` guardado no hay errores de hidratación en consola.

### Implementación de la historia

- [x] T047 [P] [US4] Crear `src/lib/audio/preference.ts` (lectura y escritura de la clave `sound` con almacenamiento inyectable) y `src/lib/audio/events.ts` (mapa acción → `SoundId` y limitador de 80 ms, funciones puras); deben pasar T045.
- [x] T048 [US4] Crear `src/components/audio/SoundProvider.tsx` (cliente): contexto con `enabled`, `setEnabled` y `play(id)`; crea los `Audio` solo al activar (o tras la primera interacción si ya estaba activado), reinicia `currentTime` o clona el nodo para sonidos solapados, e ignora los rechazos de `play()`; sin dependencias.
- [x] T049 [US4] Crear `src/components/audio/SoundToggle.tsx` (botón con `aria-pressed`, nombre accesible y texto de estado visibles, al menos 44 px de alto, operable con teclado; el estado se lee con `useSyncExternalStore`, con valor de servidor `off` y respaldo en memoria si `localStorage` está bloqueado, como `MotionToggle`, para evitar discrepancias de hidratación) y añadirlo a `src/app/[lang]/system/page.tsx` como un bloque más de `ScreenFrame`; al activarlo reproduce `levelup` una vez; textos desde `ui-text.ts`.
- [x] T050 [US4] Envolver la escena con `SoundProvider` en `src/components/scene/SceneShell.tsx` e integrar los eventos de `contracts/sound.md`: `cursor` al cambiar la opción activa (`src/components/menu/MainMenu.tsx`) y al pasar de pantalla con L/R; `confirm` al pedir abrir una opción; `cancel` al pedir volver; `open` y `close` desde el efecto de llegada de ruta de `SceneShell` (`pathname`), una sola vez por cambio y por cualquiera de los caminos (transición completa, interrupción, movimiento reducido o botón Atrás del navegador). Deben pasar T046.
- [x] T051 [US4] Aplicar `vercel-react-best-practices` al proveedor (sin renders por cada reproducción) y comprobar que el JavaScript añadido es mínimo.

**Punto de control**: el sonido es opcional, bajo demanda y está probado. Commit: `feat(audio): agregar sonido opcional con carga bajo demanda`.

---

## Fase 9: Historia de usuario 7 — Cambiar arte y textos sin tocar componentes (Prioridad: P3)

**Meta**: cambiar el título del panel, una ruta de imagen, un sonido, un color o una duración solo exige editar datos o tokens.

**Prueba independiente**: hacer cada cambio, comprobar el resultado y revertirlo.

- [ ] T052 [US7] Verificar que cambiar `panelTitle` en `src/content/ui-text.ts`, la ruta del póster en `src/content/character.ts`, un archivo en `src/content/audio.ts` y un color y una duración en `src/app/globals.css` se refleja sin editar componentes (`git status` muestra solo esos archivos); revertir los cambios y anotar el resultado en `research.md`.
- [ ] T053 [US7] Verificar que no hay valores de color, ángulo ni duración sueltos en los componentes nuevos (`grep` de `#` y `ms` en `src/components`) y que la prueba de tokens los cubre.

**Punto de control**: contenido en datos y tokens. Commit: `test(content): comprobar los cambios solo en datos y tokens`.

---

## Fase 10: Pulido y cierre (transversal)

**Propósito**: accesibilidad, rendimiento, movimiento, documentación y fusión.

- [ ] T054 [P] Pasar axe-core sobre 12 casos (menú con y sin splash, en español e inglés, con movimiento reducido, en móvil, y las cinco pantallas) y recorrer el orden de tabulación del menú y de System; debe dar 0 violaciones.
- [ ] T055 Medir Lighthouse móvil sobre la compilación de producción local en `/es` (con splash) y en `/es/stack` (sin splash), y la carga inicial sin audio ni video (≤ 350 KiB); anotar los resultados en la tabla de `quickstart.md`. Si supera 350 KiB, reducir el póster o dividirlo por ancho y volver a medir.
- [ ] T056 Ejecutar la skill `review-animations` sobre la entrada, el fundido del idle y el barrido con el personaje, y corregir los hallazgos. **Acción de Edward**: esa skill solo la puede invocar el usuario; confirmar además la comparación con la referencia visual y el video (SC-008).
- [ ] T057 [P] **Acción de Edward**: revisión manual con lector de pantalla (por ejemplo NVDA) del menú, de las pantallas y del interruptor de sonido (su estado y el cambio de vista).
- [ ] T058 [P] **Acción de Edward (móvil real)**: comprobar la fluidez (60 fps) de la transición con el idle activo, que el idle no entrecorte el barrido en un móvil de gama media y que el deslizamiento no choque con el gesto "atrás" del sistema; anotar el modelo.
- [ ] T059 Actualizar `README.md`: el aspecto, el personaje y su idle diferido, el sonido y su preferencia, la estructura nueva (`SceneBackdrop`, `Character`, `src/lib/audio/`), los tokens nuevos y cómo cambiar el arte, los sonidos y el título del panel.
- [ ] T060 Ejecutar `npm run verify` desde una instalación limpia (`npm ci`), por etapas y con `--workers=2` si la memoria es limitada (lint, unitarias, compilación, E2E de cada proyecto y `npm audit --omit=dev`); registrar el resultado en `research.md`.
- [ ] T061 Subir la rama, revisar la vista previa de Vercel (protegida con inicio de sesión) y recorrer la sección 2 de `quickstart.md`.
- [ ] T062 **Acción de Edward**: revisar y fusionar el pull request `003-identidad-visual-p3r` → `main`; luego medir PageSpeed en la dirección pública y anotar los resultados (rendimiento ≥ 90, accesibilidad 100, ≤ 350 KiB).
- [ ] T063 Marcar CA-1 a CA-9 en `docs/sprints/fase-3-identidad-visual-p3r.md` con su evidencia, registrar los cambios finales y las lecciones en `research.md`, actualizar el estado en `docs/project-context.md` y confirmar el cierre con Edward.

---

## Dependencias y orden de ejecución

- **Fase 1** → **Fase 2** (bloquea todo) → **Fase 3 (US1)** → **Fase 4 (US2)** → **Fase 5 (US5)** → **Fase 6 (US3)** → **Fase 7 (US6)**; la **Fase 8 (US4)** y la **Fase 9 (US7)** dependen solo de la Fase 2 y pueden ir en paralelo a las anteriores si hay capacidad, pero se recomiendan después del MVP; la **Fase 10** va al final.
- Dentro de cada historia: las pruebas se escriben primero y fallan; luego tipos y datos, lógica pura, componentes y, por último, integración y ajustes.
- Los archivos compartidos (`globals.css`, `layout.tsx`, `SceneShell.tsx`, `ScreenFrame.tsx`, `Character.tsx`) se tocan en varias historias: las tareas que los modifican van en secuencia, no en paralelo.

### Oportunidades de paralelismo

- Fase 2: T004, T005, T006, T007, T008 y T010 son independientes entre sí; T009 espera a T004 y T007; T011 y T012 son secuenciales sobre sus archivos.
- Cada historia: sus pruebas marcadas [P] (por ejemplo T013 con T014 y T018) se pueden escribir a la vez.
- Fase 10: T054, T057 y T058 son independientes.

## Estrategia de implementación

- **MVP**: Fases 1 a 4 (US1 y US2): el menú con el estilo de P3R y a Oguri como protagonista. Es lo que Edward quiere ver primero; se demuestra y se revisa antes de continuar.
- **Entrega incremental**: cada fase de historia termina con un punto de control, las pruebas en verde y un commit; la rama se sube después de cada punto de control.
- **Riesgos a vigilar**: el peso inicial (≈ 295 KiB, límite 350), el halo del póster (T027), el idle en gama baja (T058) y las pruebas de tiempo bajo carga (usar `--workers=2`).
