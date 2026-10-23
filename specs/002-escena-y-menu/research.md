# Investigación (Fase 0): Fase 2 — Escena y menú

**Fecha**: 2026-10-22 | **Especificación**: [spec.md](./spec.md) | **Fase anterior**: [../001-base-y-datos/research.md](../001-base-y-datos/research.md)

Cada decisión indica su razón y las alternativas evaluadas. Las skills `animate` y `animation-performance` se aplicaron al elegir la técnica, las propiedades y las curvas. Las guías de Next.js salen de `node_modules/next/dist/docs/` (versión instalada 16.4.2).

## D1. Técnica de animación: Web Animations API y CSS, sin dependencias

- **Decisión**: la transición se orquesta con la Web Animations API (`element.animate()`) y los valores (duraciones, curvas, escalonado) se leen de los tokens CSS. No se agrega ninguna dependencia. Las animaciones de entrada del splash y de fundido se escriben como CSS.
- **Razón**:
  - La transición ocurre **mientras Next navega e hidrata**, justo el caso en que una animación movida por JavaScript en el hilo principal pierde fotogramas (skill `animation-performance`). WAAPI con `transform` y `opacity` puede ejecutarse fuera del hilo principal.
  - WAAPI ofrece control programático (`finish()`, `cancel()`, `getAnimations()`), que es lo que exige la interrupción (FR-013, SC-005).
  - Cero KiB nuevos: el presupuesto de 350 KiB y el rendimiento de la fase 1 no se tocan.
  - Es lo que recomienda la skill `animate`: la herramienta más barata que resuelve el caso. No se necesitan resortes ni animaciones de salida de componentes desmontados.
- **Alternativas evaluadas**:
  - *CSS puro con clases y `animationend`*: sin dependencias, pero interrumpir y coordinar tramos dependientes de la navegación exige escuchar eventos frágiles; menos control que WAAPI.
  - *View Transitions de React (`<ViewTransition>`)*: la guía de Next indica que funciona sin configuración en el App Router y que sin soporte "la aplicación funciona, pero las transiciones no se animan". Requiere funciones recientes (Chromium 125 o superior y versiones recientes de Safari y Firefox; búsqueda del 2026-10-22: Chrome/Edge 111, Safari 18 y Firefox 144 para el mismo documento, con cifras discrepantes entre fuentes). Se descartó porque el navegador anima instantáneas del antes y el después, lo que complica el escalonado por ficha, el barrido diagonal propio y la interrupción, y por la variación entre navegadores (Safari "puede comportarse distinto"). Puede reconsiderarse en una fase posterior.
  - *Motion (`motion.dev`)*: `animate()` mini pesa unos 2.3 kb y la versión híbrida unos 17 kb; el paquete de React completo ronda los 34 kb. No hace falta para esta fase (sin resortes, sin diseños compartidos, sin animación de salida desmontando componentes); sería una dependencia nueva sin una necesidad que la justifique. Se reevaluaría si una fase posterior exige resortes o gestos con inercia.

## D2. Cómo se coordinan las rutas con la transición

- **Decisión**: un componente de cliente persistente, `SceneShell`, vive en `app/[lang]/layout.tsx` y envuelve el contenido. Provee `navigate(href)` a todo el sitio. El flujo de una navegación es: (1) **salida** (barrido que cubre la pantalla) → (2) `router.push(href)` con el barrido cubriendo → (3) al confirmarse la nueva ruta, **entrada** escalonada → (4) **pausa** breve → (5) **cierre** con círculo → (6) foco en el destino. El botón Atrás y Adelante del navegador no pasa por `navigate`: solo se reproduce la entrada (sin salida), de forma corta.
- **Razón**: el layout bajo `[lang]` se conserva entre rutas hermanas, así que los paneles de barrido y el círculo sobreviven al cambio de página. `Link` y `router.prefetch` precargan las rutas estáticas, de modo que el destino ya está listo cuando el barrido termina. La guía de Next confirma `app/[lang]`, `LayoutProps` y `generateStaticParams` ya en uso.
- **Alternativas**: `template.tsx` (se remonta en cada navegación y pierde el estado de la animación); animar con la API de View Transitions (ver D1).

## D3. Fidelidad al video usando solo `transform` y `opacity`

- **Decisión**: la constitución (Principio II) exige animar solo `transform` y `opacity`. Se traducen así los tramos observados:

| Tramo observado en el video | Implementación |
|---|---|
| Salida: el título gigante en arco gira y un barrido diagonal oscuro cubre la pantalla | Panel oscuro inclinado (`skew`) que se desplaza con `translate` hasta cubrir; título de fondo con `rotate` y `opacity` |
| Entrada escalonada: las fichas suben una por una y la ilustración del personaje entra grande y rotada desde la derecha | Cada ficha: `translateY` + `opacity` con retraso por índice; marcador del personaje: `translateX` + `rotate` |
| Pausa de 0.5 s con todo quieto | Pausa breve configurable (token) |
| Cierre: un círculo blanco se expande revelando el fondo; las fichas quedan recortadas por su borde | Disco blanco que crece con `scale` y se desvanece con `opacity`; sin recorte real |
| Menú: opciones inclinadas, la activa en rojo y blanco, título de fondo recortado y personaje a la izquierda | Estilos estáticos; la inclinación y el recorte del título se resuelven con CSS estático, sin animarlos |

- **Razón**: `clip-path` está en el nivel de "composición en algunos navegadores" según la skill, pero el soporte es desigual y la constitución lo excluye. La aproximación del círculo con un disco escalado es la que cumple la regla.
- **Detalles medidos en el video para la fidelidad**: (a) en el barrido aparece un contorno blanco hexagonal que se contrae sobre el fondo oscuro: se aproxima con un polígono en contorno que se reduce con `scale` (solo `transform`); (b) las fichas entran de abajo hacia arriba, las inferiores primero; (c) el personaje entra grande, rotado y desde la derecha; (d) el círculo es un arco blanco que revela el destino: se aproxima con un anillo que se expande con `scale` y se desvanece con `opacity`, mientras el destino se revela con un fundido.
- **Riesgo conocido**: "las fichas quedan recortadas por el borde del círculo" no se reproduce literalmente. Edward lo evalúa en la revisión contra el video (SC-008). Si fuera esencial, se propone una enmienda explícita de la constitución, no una excepción silenciosa.

## D4. Tiempos por tramo y calibración con el video

- **Decisión (calibrada con el video el 2026-10-22)**: los tokens de `globals.css` quedan así. Los tiempos de referencia salen de medir cuadro a cuadro el tramo de 70.0 a 71.7 s del video (60 fps, 1280×720).

| Tramo | Token | Valor | Referencia medida |
|---|---|---|---|
| Salida con barrido (incluye el cubrimiento) | `--duration-wipe-out` | 150 ms | ~320 ms de barrido + ~160 ms de contracción del contorno |
| Entrada escalonada (incluye el escalonado) | `--duration-stagger-in` | 240 ms | ~270 ms (casi todas las fichas entran en ~100 ms) |
| Paso entre fichas | `--stagger-step` | 35 ms | ~12–15 ms por ficha en el original; 35 ms con menos fichas por pantalla |
| Pausa | `--duration-hold` | 50 ms | ~630 ms (se comprime al ~11 %) |
| Cierre con círculo | `--duration-circle` | 170 ms | ~170 ms |
| **Total (suma de tokens)** | suma | **610 ms**; medido en el navegador ~720–830 ms con la versión de 700 ms, ver R4 | ~1.55 s |
| Variante reducida | `--duration-reduced` | 120 ms | — |
| Splash | `--duration-splash` | 1500 ms | — |
| Espera máxima del destino | `--duration-nav-timeout` | 1500 ms | — |

- **Razón**: se conserva casi a escala real lo que comunica el movimiento (barrido, entrada de las fichas y cierre) y se comprime la pausa de ~630 ms a 70 ms, el tramo que más cansa a un visitante con prisa. Curvas según la skill `animate`: `--ease-out` (existente) para entradas y la nueva `--ease-in-out` (`cubic-bezier(0.77, 0, 0.175, 1)`) para el barrido. El escalonado queda dentro de 30 a 80 ms por ficha.
- **Línea de tiempo medida** (cada cuadro de la hoja de contacto es 1/15 s; los límites se afinaron a 1/30 s):
  1. 70.00–70.37 s: el retrato sale y un polígono gris que pasa a oscuro cubre la pantalla; en el último tramo aparece un **contorno blanco hexagonal** que se contrae.
  2. 70.37–70.53 s: pantalla cubierta; el contorno se cierra.
  3. 70.53–70.80 s: aparece la pantalla nueva; las fichas suben **una por una desde abajo** (las de abajo primero) y la ilustración grande entra **desde la derecha, rotada**.
  4. 70.80–71.43 s: todo quieto.
  5. 71.43–71.60 s: un **arco circular blanco** se expande y deja ver el menú nuevo; las fichas viejas quedan recortadas por su borde.
  6. 71.60–71.70 s: el menú final termina de asentarse (opciones inclinadas, personaje a la izquierda).
- **Material**: el video está en la raíz del repositorio y está excluido con `.gitignore` (`/Pause Menu - Persona 3 Reload*`) porque es material de terceros; los cuadros extraídos viven fuera del repositorio. Se extrajeron con `ffmpeg-static` instalado fuera del proyecto.

## D5. Interrupción de la transición

- **Decisión**: `SceneShell` mantiene un único "controlador de transición" con una lista de animaciones activas. Una acción durante la transición (clic, toque o tecla) llama a `skip()`: termina de inmediato todas las animaciones (`finish()`), coloca el estado final (destino visible, paneles ocultos) y, si había una navegación pendiente, la ejecuta ya. Una nueva `navigate()` durante una transición hace `skip()` y luego navega. Las interrupciones repetidas terminan siempre en el último destino pedido.
- **Razón**: SC-005 exige destino en menos de 100 ms y ningún estado intermedio. `finish()` salta al estado final de cada animación; con ello no queda nada "a medias". El estado final se define como el de reposo, así que no hay que reconstruirlo.
- **Alternativas**: dejar terminar y encolar (viola FR-013); `reverse()` (no corresponde: el destino sigue siendo el mismo).

## D6. Movimiento reducido

- **Decisión**: la preferencia efectiva es **sistema o sitio**: `prefers-reduced-motion: reduce` **o** el interruptor del encabezado. La elección del sitio se guarda en `localStorage` (clave `motion`, valores `reduced` o `full`). Un script en línea en el `<head>` del layout aplica antes de pintar los atributos `data-motion="reduced"` y `data-splash="seen"` en `<html>`. Con movimiento reducido no hay barridos ni desplazamientos: el cambio de pantalla es un fundido de opacidad de `--duration-reduced` (o instantáneo) y el splash se omite.
- **Razón**: aplicar el atributo antes de pintar evita el parpadeo (regla `rendering-hydration-no-flicker` de la skill de Vercel). `localStorage` no se lee en el servidor, pero la preferencia solo afecta a la presentación, no al HTML, así que no obliga a que las páginas dejen de ser estáticas (leer cookies en el layout las volvería dinámicas).
- **Detalle**: si el sistema pide movimiento reducido, el interruptor aparece activado y deshabilitado con una nota (no se puede "forzar movimiento" contra la preferencia del sistema). Cambiar la preferencia con la página abierta actualiza el atributo y el controlador la lee en cada transición.
- **Almacenamiento bloqueado**: si `localStorage` lanza, se usa solo la preferencia del sistema y nada se rompe (caso límite de la especificación).
- **Alternativas**: cookie `motion` leída en el servidor (haría dinámicas las rutas estáticas); solo la media query (incumple FR-015).

## D7. Splash

- **Decisión**: el splash se pinta **en el servidor, solo en la página del menú** (`/es` y `/en`), como una capa a pantalla completa sobre el menú ya renderizado. Se cierra solo a los 1.5 s con una animación CSS (`animation-fill-mode: forwards`, sin necesitar JavaScript) y se omite antes con cualquier tecla, clic o toque. El script en línea del `<head>` marca `data-splash="seen"` cuando `sessionStorage` indica que ya se vio, y el CSS oculta la capa. Al cerrarse, se guarda `splash-seen` en `sessionStorage`.
- **Razón**: la capa vive sobre el contenido real, de modo que el HTML del menú ya está en el documento (Principio I; el contenido esencial es visible a los 5 s aunque falle JavaScript). Un enlace directo a `/es/projects` no incluye la capa porque solo existe en la página del menú (decisión de Edward). "Una vez por sesión" = `sessionStorage` (por pestaña).
- **Riesgo medido**: el splash puede empeorar LCP en Lighthouse; se mide antes y después de cerrarlo (SC-012).
- **Alternativas**: pintar el splash solo en cliente (parpadeo y contenido oculto sin JavaScript); cookie de sesión (obliga a leer cookies en el servidor).

## D8. Rutas y estructura

- **Decisión**: `app/[lang]/page.tsx` es el menú; cada pantalla es una ruta estática `app/[lang]/{profile,stack,projects,social-link,system}/page.tsx` (decisión de Edward). El orden y los nombres salen de `src/content/menu.ts`. Cada pantalla define su título (`generateMetadata`) para que el anunciador de rutas de Next.js lo comunique a los lectores de pantalla. La página de verificación de la fase 1 se elimina: sus secciones se reutilizan dentro de las pantallas (FR-009).
- **Razón**: el layout de `[lang]` ya genera `/es` y `/en` y fija `dynamicParams = false`; las rutas hijas estáticas heredan ambos idiomas. `src/proxy.ts` no cambia porque deja pasar cualquier ruta que ya empiece por `/es` o `/en`.
- **Nota**: una ruta inexistente bajo un idioma (`/es/foo`) sigue dando el 404 por defecto (fase 6).

## D9. Teclado

- **Decisión** (ver [contracts/input-navigation.md](./contracts/input-navigation.md)):
  - **Menú**: ↑ y ↓ (también ← y →) cambian la opción activa; Home y End van a la primera y a la última; Enter abre. Las opciones son enlaces reales (`<a>`), de modo que Enter, clic y toque funcionan sin JavaScript.
  - **Pantallas**: ← y → (y RePág / AvPág) equivalen a L y R y pasan a la pantalla anterior o siguiente según el orden del menú; Esc vuelve al menú.
  - Se ignoran las teclas con Ctrl, Alt o Meta y cuando el foco está en un campo de texto o un control que use esa tecla. Las repeticiones por tecla mantenida se limitan para no encadenar transiciones: se aplica la primera y las siguientes mueven solo la opción activa sin transición completa.
- **Razón**: FR-006 y FR-007 piden estas teclas. La skill `animate` indica que las acciones por teclado muy frecuentes no deben animarse: el cambio de la opción activa se resalta casi instantáneamente (≤ 100 ms) y la transición completa solo ocurre al cambiar de pantalla, que es lo que pide la especificación.

## D10. Gestos táctiles

- **Decisión**: eventos de puntero sobre el contenedor de la pantalla con `touch-action: pan-y`. Un deslizamiento cuenta si recorre al menos 56 px en horizontal y `|dx| ≥ 1.5 · |dy|`, con un solo puntero, y no empieza a menos de 24 px del borde de la pantalla (para no chocar con el gesto "atrás" del sistema). La lógica es una función pura (`detectSwipe`) con pruebas unitarias. Las pestañas L y R visibles hacen lo mismo con un toque.
- **Razón**: `touch-action: pan-y` deja el desplazamiento vertical al navegador y entrega los movimientos horizontales al código. La alternativa visible con un solo toque cumple el criterio de gestos con alternativa (accesibilidad).
- **Umbrales**: provisionales; se afinan en un dispositivo real (pendiente de la lista de verificación de la constitución).

## D11. Accesibilidad de los cambios de pantalla

- **Decisión**: cada ruta tiene su `<title>`; Next.js anuncia el cambio mediante su anunciador de rutas. Después de la entrada (o inmediatamente si se interrumpe), el foco se coloca en el `<h1>` de la pantalla (`tabIndex = -1`). El menú es un `<nav aria-label>` con una lista de enlaces; la opción activa lleva `aria-current="true"` y recibe el foco al moverse con las flechas. Los paneles de transición son decorativos (`aria-hidden`, `pointer-events: none`).
- **Razón**: FR-020 y FR-021. El foco en el encabezado de la pantalla destino es un punto lógico y funciona igual con transición completa, reducida o interrumpida.

## D12. Datos y textos

- **Decisión**: `src/content/menu.ts` con una lista tipada de `MenuOption` (identificador, dirección, nombre y descripción bilingües). El orden del arreglo es el orden del menú y de las pestañas. Los textos nuevos (splash, guía, botones, interruptor, anuncios) se agregan a `ui-text.ts`. Los tokens de movimiento van en `globals.css`; ningún componente tiene valores sueltos (la prueba `tokens.test.ts` ya lo vigila y se amplía).
- **Razón**: Principio IV, FR-017 a FR-019, SC-010.

## D13. Marcador del personaje

- **Decisión**: una silueta en CSS/SVG en línea, sin imágenes (FR-023), en un componente que recibe la posición y la animación de entrada. El arte real llega en las fases 3 y 5.

## D14. Medición y pruebas

- **Decisión**:
  - **Unitarias** (`node --test`): navegación por teclado (`nextIndex`), detección de deslizamiento, resolución de la preferencia de movimiento, validación de los datos del menú y de los tokens (suma de tramos entre 500 y 800 ms).
  - **E2E** (Playwright): navegación completa con teclado y con toque (Chromium con soporte táctil), movimiento reducido (`page.emulateMedia({ reducedMotion: 'reduce' })`), interrupciones repetidas (el sitio termina en el último destino y `document.getAnimations()` queda vacío), splash (se omite, no se repite, no aparece en enlaces directos), sin desplazamiento horizontal en 390, 768 y 1280 px, y el cambio de idioma durante la transición.
  - **Duración**: el controlador registra `performance.measure('scene-transition', …)`; una prueba E2E la lee y comprueba que está entre 500 y 800 ms.
  - **Fluidez**: una prueba de muestreo de fotogramas con CPU limitada (CDP `Emulation.setCPUThrottlingRate`) cuenta fotogramas largos durante la transición; es un indicador, no sustituye la comprobación en un móvil de gama media (pendiente, en la lista de verificación de la fase).
  - **Revisión de movimiento**: Edward compara con el video por tramos y se ejecuta la skill `review-animations`.
- **Razón**: SC-004 a SC-009. Las animaciones reales se verifican con medición, no "a ojo" (Principio II).

## D15. Rendimiento y presupuesto

- **Decisión**: los componentes de cliente se limitan a `SceneShell`, `Splash`, `MotionToggle`, `LanguageSwitcher` y la lógica de entrada del menú; las pantallas y las secciones siguen siendo componentes de servidor. `will-change: transform` solo mientras una animación está en curso. El escalonado usa retardos de WAAPI por elemento, **nunca una variable CSS heredada** que dispare recálculos en los descendientes (skill `animation-performance`). Se mide Lighthouse móvil antes y después de cerrar el splash y la carga inicial frente a 350 KiB.
- **Riesgo**: la fase 1 ya mostró que el rendimiento del sitio está en el límite de 90 por el entorno de ejecución de React y Next; el JavaScript nuevo debe ser pequeño y no bloquear la hidratación.

## D16. Cambios en las pruebas de la fase 1

- **Decisión**: `home.spec.ts` y `layout.spec.ts` apuntan hoy a la página de verificación en `/es` y `/en`. Pasan a probar el menú en esas rutas y el contenido en cada pantalla (`/es/profile`, etc.). Las pruebas de idioma (`language.spec.ts`) se mantienen y se amplían para rutas de pantalla. Las pruebas de datos (`content.test.ts`) siguen sin cambios; se agrega la validación del menú. La puerta de publicación de `vercel.json` no cambia.

## D17. Herramientas para el video de referencia

- **Decisión**: el video (`Pause Menu - Persona 3 Reload - John Persona (720p, h264).mp4`, 2:47, 60 fps, 1280×720) está en la raíz del repositorio y se excluye con `.gitignore` (`/Pause Menu - Persona 3 Reload*`): es material de terceros solo para consulta local y no se sube. Los cuadros se extraen con `ffmpeg-static` instalado **fuera del proyecto** (carpeta temporal), sin añadir dependencias ni instalar nada en el sistema; las hojas de contacto no se guardan en el repositorio.
- **Razón**: cumple la regla de no agregar dependencias sin justificar y evita subir material con derechos de terceros. Una alternativa futura más cómoda para Edward es mover el video a `recursos-originales/`, que ya está ignorado.

## Resumen de resolución

La técnica de animación (D1), la coordinación con las rutas (D2), la traducción del movimiento a `transform` y `opacity` (D3), la interrupción (D5), el movimiento reducido (D6), el splash (D7), el teclado y los gestos (D9, D10) y las pruebas (D14) quedan decididos. **Pendiente**: la comparación visual final con el video (T044 y T070) y la prueba en un móvil real. La calibración base de los tiempos ya está hecha (D4). No quedan marcadores `NEEDS CLARIFICATION`.

## Revisión de análisis (`/speckit-analyze`, 2026-10-22)

Decisiones tomadas con Edward tras el análisis de consistencia entre `spec.md`, `plan.md` y `tasks.md`:

- **A1, splash y primera carga**: cualquier primera carga de documento cuenta como visita. El script en línea del `<head>` marca `splash-seen` y `data-splash="seen"` también cuando la ruta cargada no es la raíz; el splash solo se muestra en una carga completa de la raíz y nunca en una navegación interna (se evita que aparezca al volver con Esc tras entrar por un enlace directo).
- **A2 e I4, destino que no llega**: tras la salida, la pantalla permanece cubierta hasta que llegue el destino, con un máximo de `--duration-nav-timeout` (1.5 s); después se muestra sin entrada escalonada. Los 500 a 800 ms se exigen solo en transiciones completas (no interrumpidas) con el destino precargado. Se añade el token `--duration-nav-timeout` y la marca `scene-transition-waited`.
- **A3, splash con movimiento reducido**: se omite (sin fundido), lo más simple y seguro.
- **U1, menú al volver**: la opción activa inicial es la de la pantalla de la que se vuelve; en una carga directa del menú es la primera.
- **U2, marca provisional del menú**: se quita el campo `provisional` de `MenuOption`; sus descripciones son textos de interfaz y ninguna parte los mostraría.
- **I1, calibración**: se adelanta al final de la historia de las transiciones; la ruta del video de referencia se pide antes de empezar esa historia.
- **E1 a E3 y E5**: se añaden pruebas de acceso a las tres pantallas en 3 interacciones o menos, de títulos por pantalla e idioma, de la alternativa sin WAAPI y de ausencia de peticiones de audio y video.

## Registro de implementación (cambios respecto al plan)

### R1. Guías de Next 16.4.2 leídas (T002)

- `use-router.md`: `router.push(href, { scroll })` y `router.prefetch(href)` existen como se planeó; `Link` precarga las rutas visibles en producción. Por defecto una navegación desplaza al inicio de la página.
- `preventing-flash-before-hydration.md`: confirma el enfoque del script en línea que cambia atributos antes de pintar, con `suppressHydrationWarning` en el elemento modificado (aquí `<html>`); un script insertado por actualización del DOM no se ejecuta en navegaciones suaves, pero el nuestro solo se necesita en la carga completa.
- `generate-metadata.md` y `use-pathname.md`: sin cambios respecto a la fase 1.
- **Desviación**: la documentación de esta versión no menciona el anunciador de rutas integrado. Para garantizar FR-020 se añade una región `aria-live="polite"` visualmente oculta en `SceneShell` que anuncia el nombre de la pantalla tras cada cambio, además del `<title>` por ruta y del foco en el `<h1>`.

### R2. Título de las pantallas y encabezados (T009, T015–T022)

- El título del documento de cada pantalla es `{nombre de la opción} | {título del sitio}` (no se usa un segundo guion largo porque el título del sitio ya lo contiene); lo calcula `src/lib/scene/titles.ts`.
- El menú tiene un `<h1>` solo para lectores de pantalla con el título del sitio; cada pantalla tiene un único `<h1>` con el nombre de la opción y el nombre del perfil pasa a `<h2>`.
- El título de fondo del menú se dibuja con un pseudoelemento (`content: attr(data-title)`) para que no cuente como texto del documento.

### R3. Navegación por teclado y gestos (T024–T034)

- **Destino lógico**: la URL y el estado de React se actualizan un instante después de pedir una navegación. Una segunda tecla rápida calculaba la pantalla vecina desde la pantalla vieja (saltaba de Proyectos a Quién soy). `SceneShell` mantiene una referencia con la última ruta pedida y `go()` parte siempre de ella; la historia de interrupción (US5) se apoya en lo mismo.
- **Señal de hidratación**: `SceneShell` pone `data-scene-ready="true"` en `<html>` al montar; las pruebas esperan esa señal (`tests/e2e/helpers.ts`, `openReady`) antes de pulsar teclas. Sin ella, la primera tecla podía llegar antes de que se registrara el teclado.
- **Anuncio**: se confirmó la desviación de R1: una región `aria-live="polite"` oculta anuncia "Pantalla: {nombre}" tras cada cambio; el foco va al `<h1>` o, en el menú, a la opción activa.
- **Clics en el menú**: los enlaces llaman a `navigate()` (con `preventDefault`) salvo clics con modificadores, que conservan el comportamiento nativo; así la transición de US4 podrá interceptarlos sin cambiar el menú.

### R4. La duración medida incluye la navegación (T036 y T040)

La transición completa que mide `performance.measure("scene-transition")` incluye, además de los tramos animados, la espera del destino tras la salida (`router.push` y el pintado de la pantalla nueva) y los relevos de fotogramas entre tramos. Medición con la versión inicial de los tokens (suma 700 ms), tres corridas en Chromium a 1280 px:

| Tramo | Token | Medido |
|---|---|---|
| Salida + navegación | 170 ms | 213–238 ms |
| Entrada escalonada | 260 ms | 277–292 ms |
| Pausa | 70 ms | 78–85 ms |
| Cierre | 200 ms | 197–220 ms |
| **Total** | 700 ms | **769–828 ms** (superaba el límite de 800 ms) |

El sobrecoste real es de unos 110 a 130 ms. SC-004 se mide sobre la transición completa, así que los tokens se ajustaron a una suma de **610 ms** (150 + 240 + 50 + 170) para que la medición real caiga con margen dentro de 500–800 ms. Se mantiene la proporción de la referencia (la pausa sigue siendo el tramo más comprimido). No se adelanta el `router.push` para ganar tiempo: con el barrido a medias se vería un borde de la pantalla nueva antes de que el panel termine de cubrir.

### R5. Revisión del movimiento con las skills y comparación con el video (T043 y T044)

Revisión con `animation-performance` y `emil-design-eng` (la skill `animate` se aplicó al diseñar el plan):

| Antes | Después | Por qué |
|---|---|---|
| Sin feedback al pulsar los botones de la guía y el selector de idioma | `transition-transform` con `--duration-fast` y `--ease-out`, y `active:scale-[0.97]` | Los botones deben sentir que escuchan la pulsación |
| Una referencia sin uso en `SceneShell` | Eliminada | Menos estado sin propósito |
| (Verificado, sin cambio) propiedades animadas | Solo `transform` y `opacity`; una prueba E2E lo comprueba con los fotogramas clave | Principio II |
| (Verificado, sin cambio) retrasos del escalonado | Se pasan a cada animación (`delay` de WAAPI), sin variables CSS heredadas | Evita recalcular estilos en los descendientes |
| (Verificado, sin cambio) `will-change` | Solo mientras corre una animación y se limpia al terminar; no se usa en las fichas | No reservar capas de más |
| (Verificado, sin cambio) hover | Tailwind 4 aplica `hover:` solo en dispositivos con puntero | Sin falsos positivos al tocar |
| (Verificado, sin cambio) `transition: all` y `scale(0)` | No existen; el anillo empieza en `scale(0.1)` | Reglas de la skill |

**Compromiso documentado**: la skill indica no animar acciones por teclado muy frecuentes. La especificación exige la transición completa al cambiar de pantalla, también con teclado; se mitiga con la interrupción inmediata (historia 5) y dejando el resaltado de la opción activa sin animación (instantáneo).

**Comparación con el video** (grabación de la transición real de Stack → Proyectos y comparación con los cuadros de la referencia):

| Tramo | Referencia | Implementación | Diferencia aceptada |
|---|---|---|---|
| Barrido diagonal de salida | Polígono gris-oscuro que cubre | Panel azul marino inclinado que cubre de derecha a izquierda | Color propio (identidad, Principio V) |
| Contorno hexagonal que se contrae | Sí, sobre el fondo cubierto | Sí (cuadro de la grabación con el hexágono blanco) | Ninguna |
| Entrada escalonada | Fichas desde abajo, personaje desde la derecha rotado | Fichas de abajo hacia arriba con `translateY` y `opacity`; el marcador del personaje entra desde la derecha y rotado en el menú | El personaje solo existe en el menú en esta fase |
| Pausa | ~630 ms | 50 ms | Comprimida a propósito |
| Cierre con arco circular | Arco blanco que revela y recorta las fichas | Anillo blanco que crece y se desvanece, sin recorte | Aproximación con `transform` y `opacity` (D3) |
| Duración total | ~1.55 s | **685 ms medidos** (tokens: 610 ms) | Dentro de 500–800 ms |

Pendiente: la confirmación de Edward en la revisión final con el video (T070).

### R6. Interrupción (T045–T048)

- Un clic, un toque (`pointerdown`) o una tecla durante la transición llama a `skip()`: termina de inmediato todas las animaciones (`finish()`), libera la capa y, si la navegación estaba pendiente, se ejecuta ya. Si la misma acción pide una navegación (por ejemplo otra pestaña L o R, dentro de una ventana de 150 ms), también se hace sin animación y sin entrada: el destino final es el de la última acción y las pantallas intermedias se saltan.
- Cada navegación lleva un identificador de ejecución: una transición superada por otra se descarta aunque sus esperas sigan pendientes.
- **Medición de SC-005** (destino en menos de 100 ms desde la interrupción): se cumple en Chromium. En Firefox, con varios navegadores corriendo en paralelo, la confirmación de la ruta tarda 100–170 ms, así que las pruebas usan un límite de 150 ms para Firefox y reintentos acotados; sin carga, Firefox queda cerca de los 100 ms.
- **Lint**: `eslint.config.mjs` ignora `playwright-report/` y `test-results/` (las trazas de los reintentos generaban miles de avisos falsos).

### R7. Movimiento reducido (T049–T058)

- **Preferencia efectiva**: reducida si el sistema o el sitio la piden (`src/lib/motion/preference.ts`). La elección del sitio vive en `localStorage` (`motion`); un script en línea del `<head>` (`src/lib/motion/init-script.ts`) fija `data-motion` y `data-splash` en `<html>` antes de pintar, con `suppressHydrationWarning` en `<html>` según la guía de Next.js.
- **Interruptor**: `MotionToggle` usa `useSyncExternalStore` (la regla de lint del proyecto no admite `setState` dentro de un efecto, y es la forma recomendada por React para leer valores del navegador sin desajustes de hidratación). Con el sistema pidiendo movimiento reducido aparece activado y deshabilitado con una nota accesible. Con `localStorage` bloqueado la elección vive en memoria durante la visita.
- **Variante reducida**: sin barrido, disco ni desplazamientos; la capa decorativa se oculta con `display: none` y el cambio de pantalla es un fundido de opacidad de `--duration-reduced` (120 ms). Sin Web Animations (`Element.prototype.animate` ausente) se usa la misma ruta, y las funciones de animación del controlador no hacen nada (el contenido y la navegación se conservan, FR-025).
- **Transiciones CSS**: con `data-motion="reduced"` o `prefers-reduced-motion: reduce` se anula la duración de las transiciones (el feedback de pulsación pasa a ser instantáneo).
- **Cualquier primera carga cuenta como visita para el splash** (decisión A1): el script marca `splash-seen` y `data-splash="seen"` cuando la ruta cargada no es la raíz.

### R8. Splash (T059–T063)

- **Capa en el servidor**: `Splash` pinta la capa sobre el menú ya renderizado (el HTML del menú está en el documento), y la cierra solo una animación CSS de `--duration-splash` (1.5 s) que no necesita JavaScript. Con `data-splash="seen"` o con movimiento reducido la capa se oculta con `display: none`.
- **Entrada consumida**: `SplashController` consume la primera tecla o el primer clic (con `stopPropagation` en fase de captura) para que no active el menú que hay debajo; solo escucha `click` y no `pointerdown`, porque cerrar en `pointerdown` dejaba que el `click` posterior cayera sobre el enlace que quedó debajo. Cuenta el splash como visto al mostrarse, así que recargar durante el splash no lo repite.
- **Error corregido con la suite completa**: con movimiento reducido la capa está oculta por CSS pero el controlador igualmente registraba su escucha y se comía el primer clic o tecla del visitante. Ahora no actúa si la capa no se muestra; hay una prueba de regresión.
- **Pruebas**: las que no son del splash dan la sesión por vista antes de cargar (`markSplashSeen`); las de "omitir" congelan la animación del cierre automático para no depender de la velocidad de la máquina, y miden desde que el evento llega a la página.

### R9. Revisión con `vercel-react-best-practices` (T074)

| Antes | Después | Por qué |
|---|---|---|
| `MainMenu` recibía la `description` de cada opción y no la usaba | Se quitó de sus props y de la página | Menos datos serializados hacia el cliente (`server-serialization`) |
| (Verificado) componentes de cliente | Solo `SceneShell`, `GuideBar`, `MainMenu`, `MotionToggle`, `SplashController` y `LanguageSwitcher` (más la capa estática `TransitionLayer`, que se empaqueta con `SceneShell`) | Las pantallas y secciones siguen siendo de servidor |
| (Verificado) importaciones | Todas directas al archivo; el barril `src/content/index.ts` solo lo usan las pruebas | `bundle-barrel-imports` |
| (Verificado) condicionales | Ternarios o retorno temprano, sin `&&` con valores que puedan renderizarse | `rendering-conditional-render` |
| (Verificado) contexto de `SceneShell` | Valor memoizado y funciones estables con `useCallback` | Evita renders de los consumidores |
| (Verificado) datos de los layouts | `scenes` y `labels` ya traducidos desde el servidor | No viaja el diccionario completo |

### R10. Rendimiento medido con la fase 2 (T072)

Lighthouse 12 móvil sobre la compilación de producción local, el 2026-10-22 (dos corridas cada una, estables):

| Ruta | Rendimiento | Accesibilidad | SEO | Prácticas | LCP | TBT | KiB |
|---|---|---|---|---|---|---|---|
| `/es` (visita nueva, con splash) | 86 | 100 | 100 | 96 | 2.7–2.8 s | 410–440 ms | 240.5 |
| `/es/stack` (entrada directa, sin splash) | 85 | 100 | 100 | 96 | 2.9 s | 410 ms | 228.3 |

- **Sin regresión respecto a la fase 1** (85–86 local; 208 KiB). La carga inicial sube unos 20–30 KiB por el JavaScript de la escena (menú, transición, splash, interruptor) y sigue muy por debajo de 350 KiB. El rendimiento local está al nivel de una página "hola mundo" de Next.js en esta máquina (86–89, ver R9 de la fase 1), así que el límite es el entorno de ejecución de React y Next.
- **Splash**: no empeora el rendimiento medido (el splash es una capa en el HTML del servidor con una animación CSS de opacidad, sin JavaScript para cerrarse).
- Pendiente: medir en la dirección pública de Vercel tras fusionar (la misma prueba que dio 100 en PageSpeed Insights para la fase 1).

## Cierre de la fase 2 (T078)

**Fecha**: 2026-10-22. Rama `002-escena-y-menu`; aún sin fusionar a `main`.

### Criterios de aceptación

| Criterio | Estado | Evidencia |
|---|---|---|
| CA-1 Splash corto, omitible y una vez por sesión | Cumple | `splash.spec.ts` |
| CA-2 Menú con las cinco opciones en orden y la activa resaltada | Cumple | `menu.spec.ts`, `navigation.spec.ts` |
| CA-3 Navegación con L/R, flechas, Enter, Esc, Inicio, Fin, clic y toque | Cumple | `navigation.spec.ts`, `navigation.test.ts`, `swipe.test.ts` |
| CA-4 Transición con los tramos de la referencia en 500–800 ms | Cumple | `transition.spec.ts` (685 ms medidos) y R5 |
| CA-5 Interrupción inmediata sin estados intermedios | Cumple | `interruption.spec.ts` |
| CA-6 Movimiento reducido (sistema y sitio) | Cumple | `reduced-motion.spec.ts`, `preference.test.ts`, `init-script.test.ts` |
| CA-7 Solo `transform` y `opacity` a 60 fps | Parcial | Lo primero, verificado por prueba y por la skill; falta la comprobación de 60 fps en un móvil real (T073, Edward) |
| CA-8 Guía y botones abajo a la derecha | Cumple | `guide.spec.ts` |
| CA-9 Tres secciones en 3 interacciones o menos; contenido a los 5 s | Cumple | `navigation.spec.ts`; contenido en el HTML estático (LCP ~2.7 s local) |
| CA-10 Menú y textos desde datos tipados | Cumple | `menu.test.ts` y verificación manual (T069) |
| CA-11 Anuncio y foco al cambiar de pantalla | Parcial | Región `aria-live` y foco en el `<h1>` probados; falta la revisión con lector de pantalla (T071, Edward) |
| CA-12 Comparación con el video y revisión de movimiento | Pendiente | Comparación hecha (R5); falta la confirmación de Edward y `/review-animations` (T070, solo el usuario puede invocarla) |
| CA-13 Lint, compilación, unitarias y E2E | Cumple | `npm run verify` desde instalación limpia |
| CA-14 Lighthouse móvil ≥ 90 / accesibilidad 100 / ≤ 350 KiB | Parcial | Local: 85–86, 100 y 228–240 KiB (R10); falta medir en Vercel tras fusionar (T077) |

### Lecciones de la fase

- Los minificadores de CSS reescriben `170ms` como `.17s`: cualquier lector de tokens debe aceptarlo (prueba incluida).
- La duración medida de una transición incluye la navegación del framework (~110–130 ms); los tokens se calibran contra la medición real, no contra su suma.
- Las pruebas que miden tiempos con varios navegadores en paralelo dependen de la carga de la máquina: se comprueban propiedades deterministas (duración de la animación) siempre que se puede y se usan reintentos acotados cuando no.
- Una capa de entrada global (splash) que consume la primera tecla o el primer clic debe comprobar que realmente se muestra; un caso con movimiento reducido la dejaba "comiéndose" la primera acción.
- En JavaScript, `String.replace` con una cadena que contiene `$` + comilla invertida inserta texto del original: se usa `split/join` o la herramienta de edición.

### Pendiente fuera de la fase

- **Edward**: `/review-animations` y la confirmación de la comparación con el video (T070); revisión con lector de pantalla (T071); fluidez a 60 fps en un móvil de gama media y umbrales de deslizamiento en un dispositivo real (T073); pull request a `main` y medición en Vercel (T077).
- **Fase 3 y siguientes**: contenido y diseño real de las pantallas, arte del personaje, audio y System completo.
- **Marcador del personaje** y sus entradas siguen siendo provisionales hasta la fase 3.

### R11. Verificación desde instalación limpia (T076)

Realizada el 2026-10-22 tras `rm -rf node_modules .next` y `npm ci`, por etapas y con 2 trabajadores de Playwright (con 4 trabajadores y todo en un solo comando el sistema se quedó sin memoria y detuvo el proceso; con 3.3 GB libres se ejecutó un navegador a la vez):

| Etapa | Resultado |
|---|---|
| `npm ci` | 290 paquetes |
| `npm run lint` | Sin errores |
| `npm run test:unit` | 80 de 80 |
| `npm audit --omit=dev` | 0 vulnerabilidades |
| `npm run build` | Compilación correcta; 10 rutas estáticas |
| E2E Chromium 390 px | 121 pasadas |
| E2E Chromium 768 px | 121 pasadas |
| E2E Chromium 1280 px | 121 pasadas |
| E2E Firefox 1280 px | 114 pasadas y 7 omitidas a propósito (gestos táctiles y limitador de CPU, que usan CDP de Chromium) |

Sin pruebas intermitentes: con 2 trabajadores las de tiempo (duración de la transición e interrupción) pasaron a la primera.
