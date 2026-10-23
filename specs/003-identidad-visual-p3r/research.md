# Investigación (Fase 0): Fase 3 — Identidad visual P3R

**Fecha**: 2026-10-23 | **Especificación**: [spec.md](./spec.md) | **Fase anterior**: [../002-escena-y-menu/research.md](../002-escena-y-menu/research.md)

Cada decisión indica su razón y las alternativas evaluadas. Las skills `animate`, `animation-performance`, `emil-design-eng` y `vercel-react-best-practices` se aplicaron al elegir la técnica y las propiedades. No quedaba ningún punto `NEEDS CLARIFICATION` tras las tres aclaraciones de la especificación.

## D1. Un personaje persistente en el layout

- **Decisión**: `Character` (componente de cliente) vive dentro de `SceneShell`, en el layout de `[lang]`, y no se remonta entre rutas. `SceneShell` expone `data-view="menu"` o `"screen"` en su contenedor; el CSS coloca al personaje según la vista y el ancho. Al cambiar de vista, el cambio de posición ocurre mientras el barrido de la fase 2 cubre la pantalla; después `[data-character]` entra con la animación que ya existe (desde la derecha y rotado).
- **Razón**:
  - El idle (video) se carga una sola vez y no se reinicia en cada navegación.
  - Evita duplicar el personaje en seis páginas y mantiene una sola fuente de verdad (Principio IV).
  - La posición se aplica con CSS estático sobre un contenedor; la animación va en un elemento interior (`[data-character]`), así no compiten dos transformaciones sobre el mismo nodo.
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
- **Razón**: el WebM con alfa pesa 1.8 MB y decodificarlo en un móvil modesto puede quitar fotogramas a la transición. WebKit/Safari no dibuja el alfa de WebM, y mostraría un recuadro negro: la exclusión es preferible a ese defecto (verificación en Safari pendiente).
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
