# Investigación (Fase 0): Fase 3 — Identidad visual P3R

**Fecha**: 2026-10-23 | **Especificación**: [spec.md](./spec.md) | **Fase anterior**: [../002-escena-y-menu/research.md](../002-escena-y-menu/research.md)

Cada decisión indica su razón y las alternativas evaluadas. Las skills `animate`, `animation-performance`, `emil-design-eng` y `vercel-react-best-practices` se aplicaron al elegir la técnica y las propiedades. No quedaba ningún punto `NEEDS CLARIFICATION` tras las tres aclaraciones de la especificación.

## D1. Un personaje persistente en el layout

- **Decisión**: `Character` (componente de cliente) vive dentro de `SceneShell`, en el layout de `[lang]`, y no se remonta entre rutas. `SceneShell` expone `data-view="menu"` o `"screen"` en su contenedor; el CSS coloca al personaje según la vista y el ancho. Al cambiar de vista, el cambio de posición ocurre mientras el barrido de la fase 2 cubre la pantalla; después `[data-character]` entra con la animación que ya existe (desde la derecha y rotado).
- **Razón**:
  - El idle (video) se carga una sola vez y no se reinicia en cada navegación.
  - Evita duplicar el personaje en seis páginas y mantiene una sola fuente de verdad (Principio IV).
  - La posición se aplica con CSS estático sobre un contenedor; la animación va en un elemento interior (`[data-character]`), así no compiten dos transformaciones sobre el mismo nodo.
- **Cambio de idioma**: `[lang]` es un segmento dinámico, así que el layout probablemente se remonta al pasar de `/es` a `/en` y el personaje y el proveedor de sonido se reinician; se comprueba en T002 y se acepta (el personaje puede volver a entrar, sin errores, y la preferencia de sonido persiste en `localStorage`).
- **Alternativas evaluadas**:
  - *Personaje dentro de cada página (como `CharacterSlot`)*: se remonta en cada ruta, recarga el video y repite la decodificación; y la posición depende del flujo de cada página.
  - *Animar la posición entre vistas con `transform` visible*: exigiría calcular desplazamientos entre diseños distintos; con el barrido cubriendo la pantalla es innecesario y no es fiel al video (donde el personaje reaparece).

## D2. Fondo y panel: capas estáticas

- **Decisión**: `SceneBackdrop` (componente de servidor) pinta, en una capa `fixed` detrás del contenido, el degradado de cian a azul profundo y un panel blanco inclinado (`skewX`) con el título vertical (`writing-mode: vertical-rl`, Anton). Todo es `aria-hidden` y estático. El panel cambia de tamaño según la vista (grande en el menú, banda estrecha en las pantallas) mediante CSS sobre `data-view`, sin animarse.
- **Razón**: son decoración que no se mueve; una capa fija evita `background-attachment: fixed`, costoso en móviles. El título vertical sale de datos (D9). El resultado se parece a la referencia visual (captura de la v1) sin copiar el diseño del juego: la paleta y la composición son propias (Principio V).
- **Alternativas**: imágenes de fondo (peso y rigidez), SVG con degradado (sin ventaja frente a CSS), animar el panel (no aporta y añade trabajo de composición).

## D3. Imagen fija: el póster del idle

- **Decisión**: la imagen fija del menú y de las pantallas es `idle-poster.webp` (540×960, 54 KiB), que es el primer cuadro del video con el mismo encuadre. `portrait.webp` (720×1066, otro encuadre) no se usa y se retira si ninguna tarea lo necesita.
- **Razón**: con el mismo encuadre, el cambio de imagen a video no produce saltos visibles. Pesa la mitad que el retrato (54 frente a 115 KiB), lo que protege el presupuesto de 350 KiB. Se muestra con `<img>` con ancho y alto fijos (sin salto de diseño), `decoding="async"` y `fetchpriority="low"` para no competir con la fuente y el JavaScript.
- **Riesgo**: el póster conserva un halo verdoso en el borde del recorte. Se comprueba en el navegador sobre el panel blanco; si molesta, se limpia el alfa con `ffmpeg` (`alphaextract` y erosión de un píxel) antes de cerrar la tarea.
- **Alternativas**: `next/image` (con `unoptimized` no aporta y añade JavaScript), usar `portrait.webp` y alinear encuadres con transformaciones (frágil).

## D4. Sonido: preferencia, carga bajo demanda y mapa de eventos

- **Decisión**:
  - **Preferencia**: `localStorage` clave `sound` (`on`/`off`, por defecto `off`), con respaldo en memoria si está bloqueado; funciones puras con almacenamiento inyectable, como `preference.ts` de la fase 2.
  - **Carga**: `SoundProvider` crea los `Audio` solo al activar el sonido (en una interacción del visitante) y, si ya estaba activado en una visita anterior, tras la primera interacción. Antes de eso no se pide ningún archivo.
  - **Reproducción**: se reinicia `currentTime` (o se clona el nodo para sonidos solapados) y se llama a `play()`; los rechazos se ignoran sin mensajes.
  - **Mapa**: mover la opción → `cursor`; Enter, clic o Confirmar sobre una opción → `confirm` y, al empezar la entrada, `open`; Esc o Atrás → `cancel` y, al empezar la entrada del menú, `close`; cambiar con L/R → `cursor`; activar el sonido → `levelup` una sola vez.
  - **Interruptor**: `SoundToggle` en System, botón con `aria-pressed`, operable con teclado.
- **Razón**: cumple la constitución (silenciado por defecto, carga bajo demanda). `HTMLAudioElement` basta para efectos cortos (76 KiB en total), sin dependencias. Activar desde un clic cumple la política de reproducción automática de los navegadores.
- **Alternativas evaluadas**:
  - *Web Audio API (`decodeAudioData`)*: mejor latencia y solapamiento, pero más código y decodificación de todo al activar; innecesario para seis sonidos cortos.
  - *Howler.js*: dependencia nueva (≈10 KiB) sin necesidad real.
  - *Precargar el audio en segundo plano*: viola "nunca en la carga inicial".

## D5. Idle de Oguri: cuándo y si se carga

- **Decisión**: `shouldLoadIdle` (pura) decide con cuatro datos: movimiento reducido (sistema o sitio), ahorro de datos (`navigator.connection.saveData`), soporte de WebM VP9 (`canPlayType`) y motor WebKit (excluido). Si es elegible, `Character` espera a `requestIdleCallback` con `timeout` de 2000 ms (con `setTimeout` de respaldo donde no exista) y entonces asigna el `src` del `<video muted playsinline loop>`. Cuando el video empieza a reproducirse (`playing`), aparece con un fundido de `opacity` sobre el póster; si falla (`error`), se quita sin avisos.
- **Pausas**: el video se pausa mientras `data-scene-busy` esté activo en `<html>` (durante la transición, para liberar el hilo y la decodificación), con la pestaña oculta y si el movimiento pasa a reducido; se reanuda al terminar.
- **Detección de WebKit**: por agente de usuario (`Safari` sin `Chrome`, `Chromium`, `Android` ni `Firefox`, o cualquier navegador en iOS, que usa WebKit), con prueba unitaria sobre cadenas reales.
- **Razón**: el WebM con alfa pesa 1.8 MB y decodificarlo en un móvil modesto puede quitar fotogramas a la transición. WebKit/Safari no dibuja el alfa de WebM, y mostraría un recuadro negro: la exclusión es preferible a ese defecto (verificación en Safari pendiente).
- **Ajuste tras medir (R8)**: pedir el video en cuanto el navegador queda en reposo hacía que Lighthouse lo descargara dentro de su ventana de medición; ahora se pide en la primera interacción o 8 s después de cargar.
- **Alternativas**: `<video>` en el HTML con `preload="none"` (el navegador puede igualmente pedirlo antes del reposo), hoja de sprites animada (3.7 MB, peor), WebP animado (más pesado), precargar tras el evento `load` (no espera al reposo).

## D6. Barrido con el personaje: reutilizar el motor

- **Decisión**: no se modifica la secuencia de la fase 2. `[data-character]` ya entra con `translateX(40%) rotate(8deg)` a su lugar durante la entrada escalonada; ahora ese elemento es el personaje real. Se añade, en `transition.ts`, la señal `data-scene-busy` en `<html>` mientras la fase no sea `idle` (para D5). La entrada inicial del personaje al abrir el menú es una animación CSS (tokens), con retraso igual a la duración del splash si este se muestra, y desactivada con movimiento reducido.
- **Razón**: los tiempos y la interrupción ya están calibrados y probados; cambiar `skip()` o el controlador arriesga 80 pruebas. CSS para la entrada inicial evita depender de la hidratación y sigue el principio de la skill `animate` (la herramienta más barata que resuelve el caso).
- **Alternativas**: reescribir la transición con el personaje como tramo propio (reabre la calibración sin beneficio); animar el personaje con JavaScript (compite con la hidratación).

## D7. Tokens nuevos

- **Decisión**: en `src/app/globals.css` (`@theme`): `--color-sky` (cian del degradado, arriba), `--color-deep` (azul profundo, abajo), `--color-panel` (blanco del panel), `--color-navy` (azul marino de las opciones y el panel de contenido), `--color-on-panel` (texto sobre el panel blanco), `--angle-skew` (inclinación del panel y las opciones) y `--duration-character-in` (entrada inicial del personaje). Los tamaños del personaje por vista van como clases de Tailwind, no como tokens, porque son de composición.
- **Razón**: Principio IV y una prueba que ya impide valores sueltos. La paleta sigue siendo "Medianoche y cian" (D8) con el degradado como evolución del azul medianoche.
- **Alternativas**: valores literales en los componentes (viola la regla de tokens).

## D8. Contraste y legibilidad

- **Decisión**: el contenido de las pantallas va en un panel de azul marino (`--color-navy`, con ~92 % de opacidad) que conserva los colores de texto de la fase 1 (claro sobre oscuro), de modo que los contrastes ya medidos siguen valiendo. Las opciones del menú son fichas azul marino con texto cian; la activa es blanca con borde rojo y texto marino. Los controles del encabezado (idioma y movimiento reducido) y el aviso del pie llevan una ficha marino propia para no quedar cian sobre cian. La prueba `tokens.test.ts` añade los pares nuevos con un umbral AA (4.5:1 para texto pequeño, 3:1 para grande) y calcula el peor caso del degradado.
- **Razón**: no se puede garantizar contraste de texto directamente sobre un degradado que va de cian claro a azul oscuro; las fichas lo resuelven con valores fijos y comprobables.
- **Foco visible**: el contorno cian global (`:focus-visible`) casi no se ve sobre la ficha blanca, el panel blanco ni el degradado cian (≈ 1.5:1, por debajo del 3:1). Se sustituye por un anillo de doble capa (contorno `--color-focus-inner` y halo `--color-focus-outer`), que se ve sobre cualquiera de esas superficies; la prueba de tokens añade esos pares (hallazgo C1 de `/speckit-analyze`).
- **Alternativas**: texto directo sobre el degradado con sombra (no verificable), oscurecer todo el degradado (pierde la identidad cian).

## D9. Contenido en datos

- **Decisión**: `src/content/character.ts` (rutas del póster y del video, tamaños y descripción accesible `Localized`), `src/content/audio.ts` (los seis `SoundId` con su archivo) y textos nuevos en `ui-text.ts` (título vertical "PORTFOLIO", etiqueta del interruptor de sonido y estados). Pruebas unitarias comprueban que cada ruta existe en `public/`, que los seis sonidos están definidos y que los textos tienen ambos idiomas.
- **Razón**: Principio IV y criterio SC-010; cambiar arte o textos no toca componentes.

## D10. Presupuesto de peso y cómo se mide

- **Decisión**: la carga inicial medida en la fase 2 es 228 a 240 KiB (Lighthouse, `total-byte-weight`); el póster añade 54 KiB, de modo que el esperado es ≈ 295 KiB. Se mide con Lighthouse móvil sobre la compilación de producción en `/es` (con splash) y en `/es/stack` (sin splash), y se comprueba con una prueba E2E que no se solicita `idle.webm` ni `audio/` en la carga. Las capas de CSS no suman peso relevante.
- **Razón**: Principio de rendimiento; una prueba de red evita regresiones silenciosas.

## D11. Pruebas heredadas y nuevas

- **Decisión**: se ajustan `menu.spec.ts`, `layout.spec.ts`, `transition.spec.ts` y `guide.spec.ts` donde dependan del marcador o de la geometría anterior, en la misma tarea que el cambio. Se añaden pruebas de: aspecto base (panel, título, opciones inclinadas, sin desplazamiento horizontal), personaje (visible, no tapa las opciones en 390 px con `elementFromPoint`, entra desde la derecha), idle (no se pide con movimiento reducido ni antes del reposo; se pide después en Chromium y Firefox), sonido (cero peticiones de audio al cargar, solicitudes tras activar, persistencia), y marco de pantallas.
- **Razón**: Principio VI y la lección de la fase 2: las pruebas de tiempo dependen de la carga, así que se prefieren comprobaciones deterministas.

## D12. Verificación visual

- **Decisión**: además de las pruebas, se compara el resultado con la referencia visual (captura de la v1) y con el video de referencia con capturas de Playwright (o con Claude in Chrome si está conectada) en 390, 768 y 1280 px, y se ejecuta `review-animations` (la lanza Edward) antes de cerrar la fase.
- **Razón**: Principio II y la constitución: el movimiento se compara con la referencia, no "a ojo".

## Notas de implementación (Fase 3)

### R1. Póster e idle limpios (T027, D3)

- El póster salía del video con fondo verde recortado y dejaba un halo verdoso sobre el panel blanco. Se probaron tres limpiezas con ffmpeg: `despill` (quita el verde pero vira el amarillo a naranja), doble erosión del alfa (come hebras finas del cabello) y **una erosión de un píxel** (sin halo y sin alterar colores ni detalles). Se eligió la última.
- La misma limpieza se aplicó al video (decodificado con `libvpx-vp9` para leer el alfa y vuelto a codificar con `yuva420p`, `crf 33`): **de 1.8 MB a 1.2 MB** y con `alpha_mode` presente. El póster pasó de 54 KB a 37 KB.
- `portrait.webp` (115 KB) no se usa en ninguna parte y se retiró del repositorio.

### R2. La inclinación va en el enlace, no en el li (US1)

La entrada escalonada de la fase 2 anima el `transform` del `<li data-stagger>` con WAAPI; si el `<li>` llevara también la inclinación, la animación la pisaría y la ficha "saltaría". La inclinación (`skewX(var(--angle-skew))`) se aplica al enlace interior (`[data-menu-item]`).

### R3. Capas sin contexto de apilamiento (US1)

El fondo es una capa `fixed` con `z-index: -1` y el contenido va en `relative z-10`; el personaje es una capa `fixed` de `z-index: 0`. La capa del personaje cubre la ventana con `overflow: clip` y su caja interior `[data-character]` es la que anima la transición, de modo que la entrada "desde la derecha" no se recorta y la atenuación (opacidad de la capa) no compite con la animación de opacidad.

### R4. Contraste verificable (US1)

axe no puede calcular el contraste de texto sobre un panel translúcido encima de un degradado; el panel de contenido es opaco (`--color-navy`) y los controles del encabezado, la guía y el pie llevan ficha marino. Quedan solo avisos de solapamiento geométrico (la guía fija sobre el contenido al hacer scroll).

### R5. Animación del personaje (T029, skills animate y animation-performance)

Solo `transform` y `opacity`; la entrada inicial es CSS (`character-in`, 300 ms, `--ease-out`) con retraso igual al 80 % del splash, el fundido imagen a video es una transición de `opacity` de 150 ms y el video se pausa durante las transiciones (`data-scene-busy`) y con la pestaña oculta. No hay `transition: all` ni `will-change` permanente.

### R6. Barrido con el personaje y comparación con el video (US3, T038 y T040)

- La secuencia de la fase 2 no cambió: `[data-character]` ya se animaba en la entrada escalonada. Con el personaje real se aumentó el desplazamiento de entrada de `translateX(40%)` (de su propio ancho, unos 160 px) a `translateX(30vw)` (unos 380 px a 1280 px) con la misma rotación de 8°, para que se note que entra "desde la derecha" también en el menú, donde su lugar es la izquierda.
- Se grabó el menú → Stack a 1280×720 (video de Playwright, 25 fps) y se armó una hoja de contactos: se ven en orden el barrido que cubre, el contorno hexagonal que se contrae, la entrada de las fichas junto con Oguri desde la derecha y el anillo de cierre, como en la referencia (R5 de la fase 2).
- Señal `data-scene-busy` en `<html>` durante la transición: el idle se pausa (comprobado en Chromium) y se reanuda al terminar. Las pruebas de tiempo de la fase 2 (500–800 ms) y de interrupción siguen pasando en Chromium y Firefox.
- Diferencias aceptadas respecto al video: se mantienen las de R5 (el anillo no recorta las fichas) y, nueva, el cambio de lugar de Oguri entre el menú (izquierda) y las pantallas (derecha) ocurre bajo la cobertura, sin que se vea el desplazamiento.

### R7. Verificación de datos y tokens (US7, T052 y T053)

Se cambiaron a propósito `panelTitle` (`src/content/ui-text.ts`), `--color-sky` y `--duration-character-in` (`src/app/globals.css`): `git status` mostró solo esos dos archivos y la compilación reflejó el título nuevo en el HTML de `/es` y `/en`, y el color y la duración nuevos en el CSS. Se revirtió y el árbol quedó limpio. Los componentes nuevos (`Character`, `SceneBackdrop`, `SoundProvider`, `SoundToggle` y `MainMenu`) no contienen colores ni duraciones en milisegundos; el tope de espera del idle (2000 ms) es una constante del contrato de medios. La prueba de tokens sigue impidiendo colores sueltos fuera de `globals.css`.

### R8. El idle bajo demanda de verdad (T055, medición de rendimiento)

Primera medición con el idle pedido en cuanto el navegador quedaba en reposo (tope de 2 s), Lighthouse 12 móvil sobre la compilación de producción local:

| Ruta | Rendimiento | KiB | Nota |
|---|---|---|---|
| `/es` | 79 y 63 | 1483 | El video (1.2 MB) entra en la ventana de medición |
| `/es/stack` | 83 y 83 | 1469 | Igual |

Sin el video la carga inicial es de unos 282 KiB (dentro de los 350 KiB), pero el video descargándose durante la medición bajaba el rendimiento (TBT de hasta 1.5 s). Por eso el video se pide ahora **en la primera interacción o 8 s después de cargar la página**, siempre con el navegador en reposo (tope de 2 s). Con ese cambio:

| Ruta | Rendimiento (3 corridas) | Accesibilidad | KiB | Video / audio en la medición |
|---|---|---|---|---|
| `/es` (con splash) | 85, 82 y 84 | 100 | 281.3 | no / no |
| `/es/stack` (entrada directa) | 82, 83 y 84 | 100 | 267.8 | no / no |

El rendimiento queda al nivel de la fase 2 (85–86 local, el límite del framework). El usuario real que interactúa tiene el idle en pocos segundos y quien no interactúa lo tiene a los 8 s.
