---

description: "Lista de tareas de la Fase 2 — Escena y menú"
---

# Tareas: Fase 2 — Escena y menú

**Entrada**: documentos de diseño en `specs/002-escena-y-menu/`

**Requisitos previos**: plan.md, spec.md, research.md, data-model.md, contracts/ (`routes-scenes.md`, `input-navigation.md`, `scene-transition.md`), quickstart.md

**Pruebas**: se incluyen porque la especificación las exige (SC-013). Las pruebas de cada historia se escriben primero y deben fallar antes de implementar.

**Organización**: las tareas se agrupan por historia de usuario. Prioridades: US2, US3, US4, US5 y US6 son P1; US1 y US7, P2; US8, P3.

## Formato: `[ID] [P?] [Historia] Descripción con ruta`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[US#]**: historia de usuario a la que pertenece la tarea
- Reglas del proyecto: comentarios, pruebas y textos visibles en español; identificadores en inglés; antes de escribir código de Next.js, leer `node_modules/next/dist/docs/` (T002); aplicar `vercel-react-best-practices` a los componentes de React y Next.js; aplicar las skills `animate`, `animation-performance`, `emil-design-eng` y `animation-vocabulary` al construir movimiento y `review-animations` antes de cerrar la fase; importaciones relativas con extensión `.ts` en `src/lib` y `src/content` (para las pruebas nativas de Node); ningún color, duración ni curva suelta en los componentes (todo sale de los tokens de `src/app/globals.css`); solo `transform` y `opacity` en las animaciones.
- Trabajar en la rama `002-escena-y-menu` (nunca directamente en `main`).

## Convenciones de rutas

Proyecto único en la raíz del repositorio: `src/`, `tests/` (ver plan.md, "Código fuente").

---

## Fase 1: Preparación (infraestructura compartida)

**Propósito**: rama de trabajo lista, guías de Next leídas y dependencias externas identificadas.

- [x] T001 Confirmar con `git branch --show-current` que estás en `002-escena-y-menu`, hacer commit de `specs/002-escena-y-menu/` (`docs(spec): especificar, aclarar y planificar la fase 2`) y subir la rama para generar la vista previa de Vercel
- [x] T002 Leer en `node_modules/next/dist/docs/` las guías de `useRouter` y `router.push`/`router.prefetch`, `Link`, `usePathname`, `useTransition`, el anunciador de rutas, `generateMetadata` y `suppressHydrationWarning`, y anotar en `specs/002-escena-y-menu/research.md` (sección "Registro de implementación") cualquier diferencia respecto a lo planeado; confirmar que el layout de `app/[lang]` se conserva entre las rutas hijas y cómo se maneja el foco tras una navegación
- [x] T003 **Acción de Edward (hecha el 2026-10-22)**: el video de referencia está en la raíz del repositorio y queda excluido con `.gitignore` (`/Pause Menu - Persona 3 Reload*`, material de terceros que no se sube); los cuadros de 70.0 a 71.7 s se extrajeron con `ffmpeg-static` instalado fuera del proyecto y los tiempos medidos están en `research.md` (D4)

**Punto de control**: rama publicada. No requiere commit de código.

---

## Fase 2: Fundamentos (requisitos bloqueantes)

**Propósito**: tipos, tokens, textos y datos del menú que necesitan todas las historias.

**⚠️ CRÍTICO**: ninguna historia puede empezar hasta terminar esta fase.

- [x] T004 [P] Ampliar `src/content/types.ts` con `SceneId` (`'profile' | 'stack' | 'projects' | 'social-link' | 'system'`) y `MenuOption` (`id: SceneId` "Único; coincide con la dirección de la pantalla (`profile`, `stack`, `projects`, `social-link`, `system`)", `name: Localized`, `description: Localized` "Texto de la guía contextual cuando la opción está activa"); agregar `MotionMode` (`'full' | 'reduced'`)
- [x] T005 [P] Agregar a `src/app/globals.css` (bloque `@theme`) los tokens de movimiento con estos valores, calibrados con el video de referencia (`research.md`, D4): `--duration-wipe-out: 150ms`, `--duration-stagger-in: 240ms`, `--stagger-step: 35ms`, `--duration-hold: 50ms`, `--duration-circle: 170ms`, `--duration-reduced: 120ms`, `--duration-splash: 1500ms`, `--duration-nav-timeout: 1500ms`, `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`; la suma `wipe-out + stagger-in + hold + circle` "DEBE estar entre 500 y 800 ms"; mantener `--ease-out` existente
- [x] T006 [P] Ampliar `src/content/ui-text.ts` con textos `Localized` nuevos (ambos idiomas): `menuLabel`, `confirm`, `back`, `tabPrevious`, `tabNext`, `splashTitle`, `motionToggleLabel`, `motionOn`, `motionOff`, `motionLockedBySystem`, `characterLabel`, `guideMenuHint` (ayuda general del menú) y `guideScreenHint` (ayuda general de una pantalla)
- [x] T007 [P] Escribir primero `tests/unit/menu.test.ts` con las reglas de `data-model.md`: el menú tiene exactamente cinco opciones y sus `id` son los cinco de `SceneId`, sin repetirse; todo `Localized` del menú y de los textos nuevos de `ui-text.ts` tiene `es` y `en` no vacíos; el orden es Quién soy, Stack, Proyectos, Social Link, System; comprobar que falla
- [x] T008 Crear `src/content/menu.ts` con la lista `menu: MenuOption[]` (el orden del arreglo es el orden del menú y de las pestañas): `profile` (Quién soy / About me), `stack` (Stack / Stack), `projects` (Proyectos / Projects), `social-link` (Social Link / Social Link), `system` (System / System), cada una con `description` bilingüe breve; reexportar `menu` desde `src/content/index.ts` y hacer pasar T007 (depende de T004, T006)

**Punto de control**: base lista. Las historias pueden empezar.

---

## Fase 3: Historia de usuario 2 — Ver el menú principal (Prioridad: P1) 🎯 MVP

**Meta**: `/es` y `/en` muestran el menú con las cinco opciones; cada opción lleva a una pantalla con dirección propia que muestra el contenido de la página de verificación de la fase 1; la página de verificación desaparece.

**Prueba independiente**: abrir `/es` y `/en` y comprobar las cinco opciones en orden, la activa resaltada, el marcador del personaje y los textos en el idioma; abrir cada una de las cinco direcciones y ver su contenido.

### Pruebas de la historia 2

> Escribirlas o migrarlas primero y comprobar que fallan.

- [x] T009 [P] [US2] Migrar `tests/e2e/home.spec.ts` a `tests/e2e/menu.spec.ts` (y borrar el original): el menú de `/es` y `/en` muestra cinco enlaces en el orden de `menu` con la primera en `aria-current="true"` y los nombres en el idioma activo; cada enlace apunta a `/{lang}/{id}`; existe el marcador del personaje; cada ruta de pantalla (`/es/profile`, `/es/stack`, `/es/projects`, `/es/social-link`, `/es/system` y sus equivalentes en `/en`) responde 200, tiene un único `<h1>` con el nombre de la opción y muestra su contenido (nombre y GitHub, stack, proyecto, personajes, contacto); la suma de etiquetas "Provisional" entre pantallas coincide con los datos `provisional: true`; el pie con el aviso de no afiliación aparece en el menú y en todas las pantallas; sin correo, LinkedIn, CV ni demo no hay enlaces ni huecos; `/es/otra-cosa` y `/fr` dan 404; `/` redirige según el idioma como en la fase 1; cada pantalla tiene su propio `<title>` traducido (`{nombre de la opción} — {título del sitio}`) en ambos idiomas, que es lo que anuncia el anunciador de rutas (FR-020); ninguna página hace peticiones de audio ni de video (FR-023)
- [x] T010 [P] [US2] Actualizar `tests/e2e/layout.spec.ts`: sin desplazamiento horizontal en el menú y en las cinco pantallas, en `/es` y `/en`, en 390, 768 y 1280 px; el selector de idioma sigue visible y con área de toque de al menos 44 px de alto
- [x] T011 [P] [US2] Actualizar `tests/e2e/language.spec.ts`: el selector cambia entre idiomas conservando la pantalla (`/es/stack` ↔ `/en/stack`) y desde el menú (`/es` ↔ `/en`); todos los textos cambian; los demás casos (cookie, ruta explícita, teclado, cookies bloqueadas, cambios repetidos) siguen vigentes

### Implementación de la historia 2

- [x] T012 [P] [US2] Crear `src/components/menu/CharacterSlot.tsx`: silueta provisional en SVG en línea, sin imágenes (FR-023), decorativa (`aria-hidden`), con `data-character` para la animación posterior; colores solo de tokens
- [x] T013 [P] [US2] Crear `src/components/menu/MainMenu.tsx` (componente de cliente): recibe por props las opciones ya localizadas (`id`, `name`, `description`) y el idioma; renderiza `<nav aria-label>` con una lista de enlaces `next/link` a `/{lang}/{id}`, opciones inclinadas con CSS estático, la activa en rojo y blanco (`--color-red-fill` con `--color-text`, contraste 5.63:1) y un título de fondo recortado y decorativo; estado `activeIndex` cuyo valor inicial es la opción de la pantalla de la que se vuelve por navegación interna (la expone `useScene()` como `previousSceneId`, T029) y la primera en una carga directa; también cambia al pasar el puntero o enfocar; sin teclado todavía (lo añade T030)
- [x] T014 [P] [US2] Crear `src/components/scene/ScreenFrame.tsx`: marco de pantalla con `<main id="content">`, un único `<h1 tabIndex={-1}>` con el nombre de la opción, y cada bloque hijo envuelto con `data-stagger` y su índice (para el escalonado de US4); espacio inferior para la guía de US7; sin textos escritos en el componente
- [x] T015 [P] [US2] Crear `src/app/[lang]/profile/page.tsx`: valida el idioma con `isLang`/`notFound()`, `generateMetadata` con el título `{nombre de la opción} — {título del sitio}` traducido, y renderiza `ScreenFrame` con `ProfileSection`
- [x] T016 [P] [US2] Crear `src/app/[lang]/stack/page.tsx` con la misma estructura y `StackSection`
- [x] T017 [P] [US2] Crear `src/app/[lang]/projects/page.tsx` con la misma estructura y `ProjectsSection`
- [x] T018 [P] [US2] Crear `src/app/[lang]/social-link/page.tsx` con la misma estructura y `CharactersSection`
- [x] T019 [P] [US2] Crear `src/app/[lang]/system/page.tsx` con la misma estructura y `ContactSection`
- [x] T020 [US2] Reescribir `src/app/[lang]/page.tsx` como página del menú: lee `menu`, localiza los textos con `localize` y renderiza `MainMenu` y `CharacterSlot`; elimina el contenido de la página de verificación
- [x] T021 [US2] Modificar `src/app/[lang]/layout.tsx` para renderizar `Footer` (aviso de no afiliación) debajo de `children`, de modo que aparezca en el menú y en todas las pantallas, y quitar `Footer` de las páginas (depende de T015–T019, T020)
- [x] T022 [US2] Ajustar `src/components/sections/ProfileSection.tsx` para que el nombre del perfil sea un `<h2>` (la pantalla ya tiene su único `<h1>` en `ScreenFrame`) y revisar que ninguna otra sección declare un `<h1>`
- [x] T023 [US2] Ejecutar `npm run build`, `npm run test:unit` y `npm run test:e2e` hasta que T007, T009, T010 y T011 pasen; comprobar que `tests/unit/tokens.test.ts` (sin colores ni duraciones sueltos) sigue pasando

**Punto de control**: el menú y las cinco pantallas funcionan con clic y toque, sin movimiento (MVP navegable; no se pierde contenido). Hacer commit (`feat(menu): agregar menú principal y pantallas con dirección propia`).

---

## Fase 4: Historia de usuario 3 — Navegar con teclado, L/R y toque (Prioridad: P1)

**Meta**: el menú y las pantallas se operan por completo con teclado, pestañas L/R, toque y deslizamiento horizontal.

**Prueba independiente**: recorrer las cinco opciones solo con teclado, solo con clic y solo con toques, entrar a una pantalla y volver al menú.

### Pruebas de la historia 3

- [x] T024 [P] [US3] Escribir primero `tests/unit/navigation.test.ts`: `nextIndex(current, key, length)` con ↓ y → (+1, se detiene en el último), ↑ y ← (−1, se detiene en el primero), Home (primero) y End (último); `resolveScreenKey(key)` con ← y RePág → anterior, → y AvPág → siguiente, Esc → menú, otras teclas → `null`; `shouldIgnoreKey` ignora Ctrl, Alt, Meta, campos de texto, `select` y `contentEditable`; `neighbors(menu, id)` devuelve la pantalla anterior y siguiente según el orden del arreglo (reordenar el arreglo cambia el resultado); comprobar que falla
- [x] T025 [P] [US3] Escribir primero `tests/unit/swipe.test.ts` para `detectSwipe`: acepta un movimiento horizontal de al menos 56 px con `|dx| ≥ 1.5 · |dy|` y devuelve `'next'` (hacia la izquierda) o `'prev'` (hacia la derecha); rechaza movimientos cortos, verticales o diagonales, con más de un puntero y los que empiezan a menos de 24 px del borde horizontal de la pantalla; comprobar que falla
- [x] T026 [P] [US3] Escribir `tests/e2e/navigation.spec.ts`: en el menú, ↓ ↑ Inicio y Fin cambian la opción activa (`aria-current` y foco) y Enter abre su pantalla; en una pantalla, ← y → (y RePág y AvPág) pasan a la anterior o siguiente según el orden del menú, Esc y el botón Atrás vuelven al menú, y las pestañas L y R hacen lo mismo con clic; una tecla mantenida (`repeat`) no encadena transiciones; el orden de tabulación es: saltar al contenido, selector de idioma, interruptor de movimiento, contenido, pestañas L/R y botones; en emulación táctil (Chromium, `hasTouch`) un toque abre una opción, un deslizamiento horizontal de más de 56 px pasa de pantalla, uno vertical no la cambia y uno que empieza en el borde se ignora; el deslizamiento se omite en Firefox; desde `/` un visitante nuevo llega a Quién soy, Stack y Proyectos con un solo clic cada una, es decir en 3 interacciones o menos (FR-022, SC-002); al volver con Esc desde `/es/stack` el menú resalta la opción Stack
- [x] T027 [P] [US3] Crear `src/lib/motion/navigation.ts` con `nextIndex`, `resolveScreenKey`, `shouldIgnoreKey` y `neighbors` (funciones puras, importaciones relativas con `.ts`) y hacer pasar T024
- [x] T028 [P] [US3] Crear `src/lib/motion/swipe.ts` con `detectSwipe` y la configuración "Distancia horizontal mínima 56 px", "Relación `|dx| ≥ 1.5 · |dy|`", "Punteros: uno solo" y "Margen de borde ignorado 24 px" (función pura) y hacer pasar T025

### Implementación de la historia 3

- [x] T029 [US3] Crear `src/components/scene/SceneShell.tsx` (cliente): contexto `useScene()` con `navigate(href)` (por ahora `router.push` directo, sustituible por el orquestador en US4), `go('prev' | 'next' | 'menu')` basado en `neighbors`, la pantalla actual derivada de `usePathname` y `previousSceneId` (la pantalla de la que se viene, para resaltarla al volver al menú); escucha `keydown` del documento con `resolveScreenKey` y `shouldIgnoreKey` (ignora `event.repeat`); detecta deslizamientos con eventos de puntero y `detectSwipe` en un contenedor con `touch-action: pan-y`
- [x] T030 [US3] Completar `src/components/menu/MainMenu.tsx`: teclado con `nextIndex` (↑ ↓ ← → Inicio Fin), Enter abre la opción activa, la activa recibe el foco y `aria-current="true"` (al volver al menú arranca resaltada la opción de la pantalla anterior); las repeticiones de tecla mueven solo la opción activa sin abrir pantalla; el resaltado cambia en ≤ 100 ms
- [x] T031 [US3] Crear `src/components/scene/GuideBar.tsx` (cliente): pestañas L y R (anterior y siguiente según `neighbors`, deshabilitadas en los extremos), botón Atrás y botón Confirmar conectados a `useScene()`; textos de `ui-text.ts`; posición abajo a la derecha (los textos y estados contextuales se completan en US7)
- [x] T032 [US3] Modificar `src/app/[lang]/layout.tsx` para envolver el contenido con `SceneShell` y montar `GuideBar`; conservar el orden de tabulación del contrato `input-navigation.md`
- [x] T033 [US3] En `SceneShell`, colocar el foco tras cada cambio de ruta: en el `<h1>` (`tabIndex = -1`) de la pantalla destino, o en la opción activa del menú; sin robar el foco en la carga inicial
- [x] T034 [US3] Ejecutar `npm run test:unit` y `npm run test:e2e` hasta que T024, T025 y T026 pasen

**Punto de control**: navegación completa por teclado, toque y deslizamiento. Hacer commit (`feat(nav): agregar navegación por teclado, toque y deslizamiento`).

---

## Fase 5: Historia de usuario 4 — Transiciones fieles al juego (Prioridad: P1)

**Meta**: cambiar de pantalla reproduce salida con barrido, entrada escalonada, pausa y cierre con círculo en 500 a 800 ms, solo con `transform` y `opacity`.

**Prueba independiente**: abrir una pantalla desde el menú, medir la duración total y comparar la secuencia con el video por tramos.

### Pruebas de la historia 4

- [x] T035 [P] [US4] Escribir primero `tests/unit/timeline.test.ts`: `parseCssTime` acepta `150ms` y `0.15s`; `buildTimeline(tokens)` devuelve los tramos en orden (salida, entrada, pausa, cierre) con sus inicios y la duración total; `staggerDelays(count, step)` devuelve `0, step, 2·step…`; ningún tramo es negativo; comprobar que falla
- [x] T036 [P] [US4] Escribir `tests/e2e/transition.spec.ts`: al abrir una pantalla desde el menú aparece la capa decorativa (`[data-transition-layer]`, `aria-hidden`), `performance.getEntriesByName('scene-transition')` dura entre 500 y 800 ms con el destino precargado (esperando a que `router.prefetch` termine) y solo en transiciones completas, sin interrupción ni marca `scene-transition-waited`; con la respuesta del destino retrasada más de 1.5 s (`page.route`) la pantalla permanece cubierta hasta ese máximo y luego muestra el destino sin entrada escalonada, con la marca `scene-transition-waited` y las marcas de los tramos (`scene-transition:wipe-out`, `:enter`, `:hold`, `:circle`) están en ese orden; al terminar, `document.getAnimations().length === 0`, la capa queda oculta y el contenido visible; lo mismo con L/R y con Esc; el botón Atrás del navegador reproduce solo la entrada (sin marca `wipe-out`); las animaciones de la transición solo animan `transform` y `opacity` (`getKeyframes()`); con CPU limitada 4× (CDP, Chromium) se cuentan los fotogramas largos durante la transición como indicador (anotar el resultado, sin umbral estricto)
- [x] T037 [P] [US4] Crear `src/lib/motion/timeline.ts` con `parseCssTime`, `buildTimeline` y `staggerDelays` (funciones puras) y hacer pasar T035
- [x] T038 [P] [US4] Crear `src/components/scene/TransitionLayer.tsx`: capa fija decorativa (`aria-hidden`, `pointer-events: none`, `data-transition-layer`, `data-phase`) con el panel de barrido inclinado y el disco del cierre (colores de tokens, nunca `scale(0)`: el disco empieza en `scale(0.1)`); oculta por defecto sin afectar el diseño
- [x] T039 [US4] Crear `src/components/scene/transition.ts`: controlador de transición con WAAPI según `contracts/scene-transition.md`: `playExit` (panel con `translate` y `skew`, `--duration-wipe-out`, `--ease-in-out`), `playEnter` (cada elemento `[data-stagger]` con `translateY` y `opacity`, retraso `índice × --stagger-step`, `--duration-stagger-in`, `--ease-out`, relleno hacia atrás para que nada parpadee; el `[data-character]` entra con `translateX` y `rotate`), pausa de `--duration-hold` y `playClose` (disco con `scale` y `opacity`, `--duration-circle`); lee los valores de los tokens con `getComputedStyle`; registra `performance.mark`/`measure` (`scene-transition` y una marca por tramo); `will-change: transform` solo mientras anima; los retrasos se pasan a cada animación, nunca por una variable CSS heredada
- [x] T040 [US4] Integrar el controlador en `SceneShell`: `navigate(href)` hace salida → `router.push` (con `router.prefetch` previo del destino) → espera el cambio de ruta (si el destino no llega, la pantalla permanece cubierta hasta `--duration-nav-timeout` y luego se muestra sin entrada escalonada, con la marca `scene-transition-waited`; ver `contracts/scene-transition.md`, sección "Destino no listo") → entrada, pausa y cierre; un cambio de ruta que no pasa por `navigate` (botón Atrás o Adelante del navegador) solo reproduce una entrada corta; la carga inicial no anima
- [x] T041 [US4] Marcar los objetivos de la entrada: `ScreenFrame` ya pone `data-stagger` en cada bloque (T014) y `CharacterSlot` lleva `data-character` (T012); en el menú, las opciones también llevan `data-stagger`
- [x] T042 [US4] Ejecutar `npm run test:unit` y `npm run test:e2e` hasta que T035 y T036 pasen
- [x] T043 [US4] Revisar el movimiento con la skill `animation-performance` (solo `transform` y `opacity`, sin variables heredadas, sin `transition: all`, `will-change` acotado) y `emil-design-eng`; usar `animation-vocabulary` para nombrar los efectos en los comentarios; anotar hallazgos y correcciones en `specs/002-escena-y-menu/research.md`
- [x] T044 [US4] Comparar la transición implementada con el video de referencia (la medición base ya está en `research.md`, D4: salida ~480 ms, entrada ~270 ms, pausa ~630 ms, cierre ~170 ms, total ~1.55 s): reproducir la transición a velocidad reducida con el inspector de animaciones, compararla tramo a tramo con los cuadros (barrido con contorno hexagonal que se contrae, fichas de abajo hacia arriba, personaje desde la derecha y rotado, arco circular), afinar los tokens de `src/app/globals.css` manteniendo la suma entre 500 y 800 ms, completar la tabla "Calibración" de `specs/002-escena-y-menu/quickstart.md` y anotar las diferencias aceptadas en `research.md`

**Punto de control**: transición completa, calibrada con el video (o con los tiempos provisionales de 700 ms si T044 se aplazó al cierre). Hacer commit (`feat(motion): agregar transición de escena con barrido, escalonado y círculo`).

---

## Fase 6: Historia de usuario 5 — Saltarse la transición (Prioridad: P1)

**Meta**: un clic, toque o tecla durante la transición lleva al destino de inmediato, sin estados intermedios.

**Prueba independiente**: iniciar una transición y pulsar una tecla a mitad; comprobar que aparece el destino en menos de 100 ms y nada queda a medias.

### Pruebas de la historia 5

- [x] T045 [P] [US5] Escribir `tests/e2e/interruption.spec.ts`: al interrumpir con una tecla, un clic o un toque durante la transición, el destino es visible en menos de 100 ms (marca `scene-transition-skipped`); cinco cambios de pantalla seguidos con L/R terminan siempre en la última pantalla pedida; después, `document.getAnimations().length === 0`, la capa oculta (`data-phase="idle"`) y el foco en el `<h1>` del destino; cambiar de idioma con el selector en mitad de la transición termina en `/en/...` con el contenido legible; recargar en mitad de la transición deja una página utilizable; comprobar que falla
- [x] T046 [US5] Añadir `skip()` al controlador de `src/components/scene/transition.ts` (`finish()` sobre todas las animaciones activas, estado final de reposo, ejecución inmediata de la navegación pendiente, marca `scene-transition-skipped`) y escuchar `keydown`, `pointerdown` y clic en fase de captura desde `SceneShell` mientras la fase no sea `idle`; una nueva `navigate()` durante una transición hace `skip()` y luego navega
- [x] T047 [US5] Manejar los casos límite en `SceneShell`: teclas repetidas (`event.repeat`) ignoradas, doble toque rápido y mezcla de teclado y toque (la última acción manda), y colocar el foco en el destino también cuando se interrumpe
- [x] T048 [US5] Ejecutar `npm run test:e2e` hasta que T045 pase

**Punto de control**: la transición es interrumpible. Hacer commit (`feat(motion): permitir interrumpir la transición`).

---

## Fase 7: Historia de usuario 6 — Respetar el movimiento reducido (Prioridad: P1)

**Meta**: el sitio respeta `prefers-reduced-motion` y un interruptor propio, aplicados antes de pintar y recordados entre visitas.

**Prueba independiente**: activar la preferencia en el sistema y, por separado, en el sitio; navegar y comprobar que no hay barridos ni desplazamientos.

### Pruebas de la historia 6

- [x] T049 [P] [US6] Escribir primero `tests/unit/preference.test.ts`: el modo efectivo es `reduced` si el sistema **o** el sitio la piden, y `full` si ninguno; `readSitePreference(storage)` devuelve `full` con valores inválidos o ausentes y no lanza si el almacenamiento lanza; `writeSitePreference` no lanza con almacenamiento bloqueado; comprobar que falla
- [x] T050 [P] [US6] Escribir primero `tests/unit/init-script.test.ts`: el script en línea (evaluado con globales simulados) pone `data-motion="reduced"` cuando el sistema o `localStorage.motion` lo piden y `data-splash="seen"` cuando `sessionStorage['splash-seen']` existe o cuando la ruta cargada no es la raíz (en ese caso también guarda `splash-seen`); no lanza si el almacenamiento lanza; comprobar que falla
- [x] T051 [P] [US6] Escribir `tests/e2e/reduced-motion.spec.ts`: con `page.emulateMedia({ reducedMotion: 'reduce' })` el cambio de pantalla no usa barrido ni disco ni desplazamientos (las animaciones solo cambian `opacity` y duran como máximo `--duration-reduced`) y mantiene contenido y acciones; el interruptor del encabezado pone `html[data-motion="reduced"]`, anuncia su estado con `aria-pressed`, se recuerda tras recargar y se opera con teclado; con la preferencia del sistema activa el interruptor aparece activado y deshabilitado con su nota; con `localStorage` bloqueado (`addInitScript`) nada se rompe; con `Element.prototype.animate` eliminado (`addInitScript`) la navegación funciona con un fundido de opacidad y conserva contenido y acciones (FR-025); activar o desactivar con la página abierta afecta a la siguiente transición; comprobar que falla
- [x] T052 [P] [US6] Crear `src/lib/motion/preference.ts` con `effectiveMotion`, `readSitePreference` y `writeSitePreference` (funciones puras con almacenamiento inyectable, claves "`motion`" con valores `reduced` o `full`) y hacer pasar T049
- [x] T053 [P] [US6] Crear `src/lib/motion/init-script.ts` que exporta como cadena el script en línea (aplica `data-motion` y `data-splash` en `<html>` antes de pintar, marca `splash-seen` en `sessionStorage` cuando la ruta cargada no es la raíz, con `try/catch` en cada acceso a almacenamiento) y hacer pasar T050

### Implementación de la historia 6

- [x] T054 [US6] Crear `src/components/MotionToggle.tsx` (cliente): botón con `aria-pressed`, nombre accesible traducido (`motionToggleLabel`) y estado anunciado (`motionOn`/`motionOff`), escribe `localStorage.motion` con `writeSitePreference`, actualiza `document.documentElement.dataset.motion`, escucha cambios de la media query y, si el sistema pide movimiento reducido, aparece activado y deshabilitado con `aria-describedby` a `motionLockedBySystem`
- [x] T055 [US6] Modificar `src/app/[lang]/layout.tsx`: insertar en el `<head>` el script en línea de `init-script.ts`, añadir `suppressHydrationWarning` a `<html>` y montar `MotionToggle` en la cabecera junto al selector de idioma, en el orden de tabulación del contrato
- [x] T056 [US6] Añadir a `src/app/globals.css` las reglas del modo reducido: con `html[data-motion="reduced"]` y con `@media (prefers-reduced-motion: reduce)` se ocultan las capas decorativas y se anulan las animaciones de desplazamiento, dejando solo fundidos de `--duration-reduced`
- [x] T057 [US6] Añadir la variante reducida al controlador de `src/components/scene/transition.ts`: lee `data-motion` en cada transición; reducido (o sin `Element.prototype.animate`) hace un fundido de opacidad de `--duration-reduced` o cambia al instante, sin barrido ni disco (FR-025)
- [x] T058 [US6] Ejecutar `npm run test:unit` y `npm run test:e2e` hasta que T049, T050 y T051 pasen

**Punto de control**: movimiento reducido por sistema y por sitio. Hacer commit (`feat(a11y): agregar movimiento reducido con interruptor del sitio`).

---

## Fase 8: Historia de usuario 1 — Ver un splash corto que no estorba (Prioridad: P2)

**Meta**: un splash de como máximo 1.5 s, omitible con cualquier entrada, que no se repite en la sesión y no existe en enlaces directos.

**Prueba independiente**: abrir el sitio como visitante nuevo, omitir el splash, recargar y comprobar que no reaparece.

### Pruebas de la historia 1

- [ ] T059 [P] [US1] Escribir `tests/e2e/splash.spec.ts` (contexto nuevo por prueba): en la primera visita a `/es` el splash (`[data-splash-layer]`) está visible y se cierra solo en un máximo de 1.5 s (con margen de la prueba); cualquier tecla, clic o toque lo cierra en menos de 100 ms; tras omitirlo, recargar no lo muestra (`sessionStorage`); una pestaña nueva (contexto nuevo) lo muestra de nuevo; `/` y `/en` también; un enlace directo a `/es/projects` no incluye el splash y, al volver al menú con Esc en esa sesión, tampoco aparece (cualquier primera carga cuenta como visita); una navegación interna al menú nunca lo muestra; con movimiento reducido no aparece; el HTML del menú (los cinco enlaces) está en el documento desde el principio y es operable al cerrarse; con JavaScript desactivado (`javaScriptEnabled: false`) el splash desaparece solo y el menú es usable; con `sessionStorage` bloqueado el splash se repite pero nada se rompe; comprobar que falla

### Implementación de la historia 1

- [ ] T060 [US1] Crear `src/components/Splash.tsx`: capa a pantalla completa renderizada en el servidor (`data-splash-layer`, `aria-hidden`, sin atrapar el foco) con el título de `splashTitle`; un componente de cliente mínimo registra una sola vez `keydown`, `pointerdown` y clic para cerrarla, y al cerrarse (por entrada o al terminar la animación CSS) guarda `splash-seen = 1` en `sessionStorage` con `try/catch`
- [ ] T061 [US1] Montar `Splash` solo en `src/app/[lang]/page.tsx` (la página del menú) debajo de `MainMenu`; nunca en las pantallas
- [ ] T062 [US1] Añadir a `src/app/globals.css` los estilos del splash: se cierra solo con una animación CSS de `--duration-splash` (relleno hacia adelante, sin necesitar JavaScript); `html[data-splash="seen"]` y el modo reducido lo ocultan; solo `transform` y `opacity`; colores y curvas de tokens
- [ ] T063 [US1] Ejecutar `npm run test:unit` y `npm run test:e2e` hasta que T059 pase

**Punto de control**: splash completo. Hacer commit (`feat(splash): agregar splash corto omitible`).

---

## Fase 9: Historia de usuario 7 — Ver la guía y los botones contextuales (Prioridad: P2)

**Meta**: la guía y los botones Confirmar y Atrás están siempre visibles abajo a la derecha y reflejan la acción disponible.

**Prueba independiente**: recorrer el menú y las pantallas comprobando que la guía y los botones siguen visibles y cambian según la acción.

### Pruebas de la historia 7

- [ ] T064 [P] [US7] Escribir `tests/e2e/guide.spec.ts`: en 390, 768 y 1280 px la guía y los botones están dentro de la ventana y en el cuadrante inferior derecho, en el menú y en las cinco pantallas, en ambos idiomas; en el menú la guía muestra la descripción de la opción activa y cambia con ↓; Atrás aparece deshabilitado en el menú y habilitado en las pantallas; Confirmar abre la activa en el menú y aparece deshabilitado en las pantallas; las pestañas L y R están en las pantallas; sin desplazamiento horizontal; comprobar que falla

### Implementación de la historia 7

- [ ] T065 [US7] Completar `src/components/scene/GuideBar.tsx`: texto de guía (descripción de la opción activa en el menú, ayuda general en las pantallas), posición fija abajo a la derecha con margen seguro y por debajo de la capa de transición, y espacio inferior en `ScreenFrame` y en el menú para no tapar contenido
- [ ] T066 [US7] Definir los estados de los botones en `GuideBar` con `aria-disabled` coherente (Atrás deshabilitado en el menú; Confirmar deshabilitado en las pantallas; L y R deshabilitadas en los extremos) y asegurar contraste AA y foco visible
- [ ] T067 [US7] Ejecutar `npm run test:unit` y `npm run test:e2e` hasta que T064 pase

**Punto de control**: guía y botones contextuales. Hacer commit (`feat(guide): agregar guía contextual y botones`).

---

## Fase 10: Historia de usuario 8 — Cambiar opciones y tiempos sin tocar componentes (Prioridad: P3)

**Meta**: opciones del menú y tiempos de la transición se cambian solo en datos y tokens.

**Prueba independiente**: reordenar o renombrar una opción solo en `menu.ts` y cambiar una duración solo en `globals.css`; comprobar que el sitio lo refleja.

- [ ] T068 [P] [US8] Escribir `tests/unit/motion-tokens.test.ts`: lee los tokens de `src/app/globals.css`; cada duración es positiva; `--duration-wipe-out + --duration-stagger-in + --duration-hold + --duration-circle` está entre 500 y 800 ms; `--duration-reduced` ≤ 200 ms; `--duration-splash` ≤ 1500 ms; existen `--ease-out` y `--ease-in-out`; además comprobar que `tests/unit/tokens.test.ts` recorre `src/components/scene` y `src/components/menu` sin encontrar colores, duraciones ni curvas sueltas
- [ ] T069 [US8] Verificar manualmente (guía `quickstart.md`, sección 4): cambiar el nombre y el orden de una opción en `src/content/menu.ts` y comprobar menú, pestañas y teclado; cambiar `--duration-hold` en `globals.css` y comprobar la transición; revertir todo y confirmar con `git status` que no hay cambios en `src/components/`

**Punto de control**: opciones y tiempos desacoplados de los componentes. Hacer commit (`test(motion): proteger los tokens de movimiento`).

---

## Fase 11: Pulido y asuntos transversales

**Propósito**: calibración, revisión de movimiento, rendimiento y cierre de la fase según la constitución.

- [ ] T070 Ejecutar la skill `review-animations` sobre la transición, el splash y el interruptor; corregir todos los hallazgos; Edward compara el movimiento con el video por tramos y confirma que están todos y en orden (SC-008)
- [ ] T071 [P] Revisar accesibilidad manualmente: orden de tabulación, foco visible, anuncio del cambio de pantalla y foco en el `<h1>` con un lector de pantalla (acción de Edward), contraste AA y teclado completo
- [ ] T072 [P] Medir Lighthouse móvil sobre `/es` con el splash visible (pestaña nueva) y con el splash cerrado, y la carga inicial en KiB (meta: rendimiento ≥ 90, accesibilidad 100, ≤ 350 KiB); anotar los resultados en la tabla de `quickstart.md`; si el rendimiento baja respecto a la fase 1 (82–88 local), investigar hidratación y JavaScript de cliente y documentarlo en `research.md`
- [ ] T073 [P] Comprobar la fluidez (60 fotogramas por segundo) en un móvil de gama media con depuración remota y anotar el resultado (SC-006 se verifica de forma manual; la prueba automática de T036 es solo un indicador) y los umbrales de deslizamiento afinados (acción de Edward si hace falta el dispositivo)
- [ ] T074 [P] Revisar los componentes nuevos con la skill `vercel-react-best-practices` (solo `SceneShell`, `Splash`, `MotionToggle`, `LanguageSwitcher` y `MainMenu` son de cliente; sin importaciones de archivos barril en componentes; ternarios en lugar de `&&`; datos elevados a nivel de módulo) y corregir lo que corresponda
- [ ] T075 [P] Actualizar `README.md` en español: nueva estructura (menú, pantallas, `src/lib/motion/`), tokens de movimiento y cómo agregar o reordenar una opción del menú sin tocar componentes
- [ ] T076 Ejecutar `npm run verify` desde una instalación limpia (`npm ci`), subir la rama, revisar la vista previa de Vercel y repetir el recorrido manual de `quickstart.md` (sección 2)
- [ ] T077 **Acción de Edward**: abrir el pull request de `002-escena-y-menu` hacia `main` y fusionarlo; después medir de nuevo Lighthouse sobre `https://p3r-portfolio-v2.vercel.app` y anotar los resultados
- [ ] T078 Marcar los criterios CA-1 a CA-14 en `docs/sprints/fase-2-escena-y-menu.md` con su evidencia, registrar en `specs/002-escena-y-menu/research.md` las decisiones que cambiaron durante la implementación, actualizar el estado y las decisiones resueltas (técnica de animación y nombres de las opciones) en `docs/project-context.md`, y confirmar con Edward el cierre de la fase

---

## Dependencias y orden de ejecución

### Dependencias entre fases

- **Preparación (Fase 1)**: sin dependencias. T003 es una acción de Edward que debe resolverse antes de empezar la Fase 5 (US4) y solo bloquea la calibración T044; si no está disponible, T044 se aplaza al cierre.
- **Fundamentos (Fase 2)**: depende de la Fase 1 y bloquea todas las historias.
- **Historias (Fases 3 a 10)**: dependen de la Fase 2. Orden recomendado: US2 → US3 → US4 → US5 → US6 → US1 → US7 → US8.
- **Pulido (Fase 11)**: depende de las historias deseadas.

### Dependencias entre historias

- **US2 (menú y pantallas)**: empieza tras los fundamentos; no depende de otras historias.
- **US3 (navegación)**: necesita el menú y las pantallas de US2 (T013, T014, T020).
- **US4 (transiciones)**: necesita `SceneShell` y `GuideBar` de US3 (T029, T031) y los objetivos de US2 (T012, T014).
- **US5 (interrupción)**: necesita el controlador de US4 (T039, T040).
- **US6 (movimiento reducido)**: necesita el controlador de US4 (T039) para la variante reducida (T057); sus pruebas de tokens y script son independientes.
- **US1 (splash)**: necesita el menú (US2) y el script en línea de US6 (T053, T055) para `data-splash` y el modo reducido.
- **US7 (guía)**: completa `GuideBar` de US3 (T031).
- **US8 (datos y tokens)**: los datos y tokens existen desde los fundamentos (T005, T008); esta fase los protege con pruebas.

### Dentro de cada historia

- Pruebas primero y comprobar que fallan.
- Funciones puras (`src/lib/motion/`) antes de los componentes; componentes antes de la integración en el layout; integración antes de la ejecución completa de pruebas.
- Las tareas que modifican `src/app/[lang]/layout.tsx` (T021, T032, T055) y `src/app/globals.css` (T005, T056, T062) no son paralelas entre sí.
- Commit al cerrar cada punto de control, en la rama `002-escena-y-menu`.

### Oportunidades de paralelismo

- Fundamentos: T004, T005, T006 y T007 en paralelo (T008 espera a T004, T006 y T007).
- US2: T009, T010 y T011 en paralelo; T012 a T019 en paralelo.
- US3: T024, T025 y T026 en paralelo; T027 y T028 en paralelo.
- US4: T035 y T036 en paralelo; T037 y T038 en paralelo.
- US6: T049, T050 y T051 en paralelo; T052 y T053 en paralelo.
- Pulido: T071 a T075 en paralelo.

---

## Ejemplo de paralelismo: historia 2

```text
# Pantallas (archivos distintos):
Tarea: "Crear src/app/[lang]/profile/page.tsx"
Tarea: "Crear src/app/[lang]/stack/page.tsx"
Tarea: "Crear src/app/[lang]/projects/page.tsx"
Tarea: "Crear src/app/[lang]/social-link/page.tsx"
Tarea: "Crear src/app/[lang]/system/page.tsx"
```

## Ejemplo de paralelismo: historia 3

```text
# Pruebas de la historia 3 (archivos distintos):
Tarea: "Escribir tests/unit/navigation.test.ts"
Tarea: "Escribir tests/unit/swipe.test.ts"
Tarea: "Escribir tests/e2e/navigation.spec.ts"
```

---

## Estrategia de implementación

### Primero el MVP (US2 + US3)

1. Completar la Fase 1 (preparación) y la Fase 2 (fundamentos).
2. Completar US2 (menú y pantallas) y US3 (navegación).
3. **Detenerse y validar**: el sitio tiene menú, cinco pantallas con direcciones y navegación completa por teclado, toque y deslizamiento, sin perder contenido.
4. Desplegar la vista previa y mostrarla a Edward.

### Entrega incremental

1. Preparación + fundamentos → base lista.
2. US2 + US3 → menú navegable (MVP, sin movimiento).
3. US4 → transición completa con tiempos provisionales.
4. US5 → interrupción.
5. US6 → movimiento reducido (obligatorio antes de publicar el movimiento).
6. US1 → splash.
7. US7 → guía contextual completa.
8. US8 → protección de datos y tokens.
9. Pulido → calibración con el video, revisión de movimiento, medición y cierre de la fase.

**Nota de publicación**: no fusionar a `main` el movimiento (US4 y US5) sin US6, porque el movimiento reducido es un requisito de accesibilidad de la constitución (Principio II).

---

## Trazabilidad

| Historia | Requisitos | Criterios de éxito | Tareas |
|---|---|---|---|
| US1 | FR-001, FR-002, FR-003, FR-023 | SC-001, SC-003 | T059–T063 |
| US2 | FR-004, FR-005, FR-009, FR-010, FR-022, FR-024 | SC-002, SC-011 | T009–T023 |
| US3 | FR-006, FR-007, FR-008, FR-020, FR-021 | SC-009 | T024–T034 |
| US4 | FR-011, FR-012, FR-019 | SC-004, SC-006, SC-008 | T035–T044 |
| US5 | FR-013, FR-020 | SC-005 | T045–T048 |
| US6 | FR-014, FR-015, FR-025 | SC-007 | T049–T058 |
| US7 | FR-016 | SC-011 | T064–T067 |
| US8 | FR-017, FR-018, FR-019 | SC-010 | T004–T008, T068–T069 |
| Transversal | FR-011, FR-021, FR-024 | SC-008, SC-012, SC-013 | T044, T070–T078 |

## Notas

- [P] = archivos distintos, sin dependencias pendientes.
- La etiqueta [US#] enlaza cada tarea con su historia para la trazabilidad.
- Verificar que las pruebas fallen antes de implementar.
- Hacer commit en cada punto de control, en la rama `002-escena-y-menu` (nunca directamente en `main`), con Conventional Commits (tipo y alcance en inglés, descripción en español).
- No escribir reglas propias en `AGENTS.md`; lo regenera `next dev`.
- Evitar tareas vagas, conflictos en un mismo archivo y dependencias entre historias que rompan su independencia.
