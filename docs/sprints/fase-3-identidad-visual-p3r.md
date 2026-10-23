# Insumo de especificación - Fase 3: Identidad visual P3R

> **Referencias obligatorias para el agente:**
> - Contexto maestro: `docs/project-context.md` (secciones 7, 8, 10, 11 y 14)
> - Constitución: `.specify/memory/constitution.md`
> - Fase anterior: `docs/sprints/fase-2-escena-y-menu.md` y `specs/002-escena-y-menu/` (en especial `research.md`, R5 a R12)
> - Este documento describe únicamente el alcance de esta fase.

## 1. Contexto de la fase

La fase 2 entregó el motor (splash, menú, pantallas con ruta propia, navegación por teclado, toque y deslizamiento, transición calibrada con el video de referencia, movimiento reducido y accesibilidad), pero sin identidad visual: el menú es texto sobre fondo oscuro y el personaje es un marcador de posición. Esta fase da al sitio el aspecto del menú de pausa de Persona 3 Reload y le pone al personaje: Oguri Cap como hilo conductor, con sonido opcional.

Esta fase se intercala antes de "Quién soy y Stack" (que pasa a ser la fase 4) por decisión de Edward, tomada al revisar el resultado de la fase 2: el aspecto y el personaje son el resultado esperado del proyecto y condicionan el diseño de todas las pantallas posteriores.

## 2. Objetivo

Que el menú principal y el cambio entre pantallas se vean y se sientan como el menú de P3R (fondo cian a azul, panel blanco inclinado con título vertical, opciones inclinadas, Oguri grande entrando con el barrido), con identidad propia, sin perder la rapidez, la accesibilidad ni el presupuesto de rendimiento de la fase 2.

## 3. Historias de usuario de la fase

> Formato: "Como [rol], quiero [acción] para [beneficio]".

- **US1** - Como visitante, quiero ver un menú principal con el estilo visual de P3R (degradado cian a azul profundo, panel blanco inclinado con título vertical, opciones inclinadas con la activa en blanco y borde rojo), para reconocer de inmediato la propuesta del portafolio.
- **US2** - Como visitante, quiero ver a Oguri como protagonista del menú, con una entrada animada y un idle suave, para que el sitio tenga personalidad y un hilo conductor.
- **US3** - Como visitante, quiero que el barrido entre pantallas incluya a Oguri entrando desde la derecha, rotada, como en el menú del juego, para sentir continuidad al navegar.
- **US4** - Como visitante, quiero oír sonidos de interfaz (cursor, confirmar, cancelar, abrir, cerrar y subida de nivel) solo si los activo, para disfrutar la experiencia sin molestar en una oficina o biblioteca.
- **US5** - Como visitante, quiero que las cinco pantallas internas compartan un marco con el mismo fondo, cabecera y personaje, para que el sitio se sienta coherente aunque su contenido llegue por fases.
- **US6** - Como visitante en móvil, quiero que Oguri y el panel no tapen las opciones ni obliguen a desplazarse de lado, para usar el menú con comodidad en una pantalla pequeña.
- **US7** - Como Edward, quiero que el arte, los sonidos, el título vertical y los textos nuevos salgan de datos y tokens, para cambiarlos sin tocar los componentes.

## 4. Flujo demostrable al cierre de la fase

    Abrir la URL pública (primera visita de la sesión)
    -> Splash corto (como en la fase 2)
    -> Menú con fondo cian a azul, panel blanco inclinado con título vertical, Oguri grande a la izquierda y cinco opciones inclinadas, la activa en blanco con borde rojo
    -> Oguri entra con una animación breve y luego muestra un idle suave (cargado después, sin bloquear el menú)
    -> Flechas, L/R o toque cambian la opción activa; con el sonido activado se oye el cursor
    -> Enter abre una pantalla con el barrido: Oguri entra desde la derecha, rotada, y el marco común de la pantalla queda con su cabecera y su fondo
    -> Esc vuelve al menú con la transición
    -> En System se activa o desactiva el sonido (desactivado por defecto)
    -> Con movimiento reducido, todo cambia por opacidad corta y el idle se queda en una imagen fija
    -> En móvil (390 px) las opciones siguen visibles y utilizables

## 5. Contenido y datos que cubre esta fase

| Dato | Estado |
| --- | --- |
| Retrato de Oguri (`public/img/oguri/portrait.webp`, 115 KB, con transparencia) | Ya en el repositorio (commit `f76a2e6`) |
| Idle de Oguri (`public/img/oguri/idle.webm`, 1.8 MB, con transparencia) y póster (`idle-poster.webp`, 54 KB) | Ya en el repositorio; se cargan después del menú |
| Seis sonidos (`public/audio/`: cursor, confirm, cancel, open, close, levelup; 76 KB en total) | Ya en el repositorio; se cargan solo al activar el sonido |
| Título vertical del panel, textos del interruptor de sonido y descripciones accesibles del personaje | Nuevos, en datos bilingües |
| Colores, degradado, ángulo de inclinación y duraciones nuevas | Tokens en `src/app/globals.css` |
| Contenido de las pantallas | Sin cambios: el de la fase 2 hasta las fases 4 a 7 |

## 6. Reglas aplicables (de la constitución)

- Principio I: el contenido va primero; el arte, el idle y el sonido no retrasan ni bloquean el acceso a la información, y el splash y las transiciones se omiten con cualquier tecla o clic.
- Principio II: solo `transform` y `opacity`, a 60 fps en un móvil de gama media; transición de 500 a 800 ms, interrumpible, con movimiento reducido (incluido el idle). Usar `animate`, `animation-performance`, `review-animations`, `emil-design-eng` y `animation-vocabulary`; `frontend-design` para las decisiones visuales.
- Principio III: contraste AA (el texto cian sobre azul marino y el texto sobre el panel blanco se verifican con la prueba de contraste), foco visible, sin desplazamiento horizontal en 390, 768 y 1280 px, lector de pantalla (el arte decorativo se oculta; el personaje tiene descripción cuando aporta).
- Principio IV: textos y recursos en datos tipados bilingües; los componentes no contienen textos.
- Principio V: identidad propia (inspirada en el juego, no una copia), aviso de no afiliación visible, y solo se publica el arte decidido por Edward.
- Principio VI: trazabilidad, pruebas y cierre de fase con el movimiento comparado con la referencia.
- Rendimiento: carga inicial del menú sin audio ni video ≤ 350 KiB (el retrato cuenta); Lighthouse móvil ≥ 90 en rendimiento (referencia local: 85–86, límite del framework) y 100 en accesibilidad; sonido silenciado por defecto y con carga bajo demanda.

## 7. Criterios de aceptación

- [x] CA-1 El menú muestra el fondo, el panel inclinado con título vertical y las opciones inclinadas con la activa en blanco y borde rojo, coherente con la referencia visual. Evidencia: `tests/e2e/visual-menu.spec.ts` y capturas a 1280 y 390 px comparadas con la referencia (`research.md`, R2 a R4).
- [x] CA-2 Oguri aparece con entrada animada y, después de que el menú sea utilizable, con idle; el idle no se carga con movimiento reducido ni con el ahorro de datos activado. Evidencia: `tests/e2e/character.spec.ts` y `tests/unit/idle.test.ts`; el video se pide bajo demanda (primera interacción o 8 s tras cargar, `research.md`, R8) y nunca con movimiento reducido ni ahorro de datos.
- [x] CA-3 La transición entre pantallas incluye a Oguri entrando desde la derecha, rotada, sin salir del rango de 500 a 800 ms ni de ser interrumpible. Evidencia: `tests/e2e/character-transition.spec.ts` (solo `transform` y `opacity`, 500–800 ms, interrupción) y la hoja de contactos de `research.md`, R6.
- [x] CA-4 El sonido está desactivado por defecto, se activa y desactiva desde System, se recuerda entre visitas y no descarga audio hasta activarse. Evidencia: `tests/e2e/sound.spec.ts`, `tests/unit/sound-preference.test.ts` y `tests/unit/sound-events.test.ts`.
- [x] CA-5 Las cinco pantallas comparten marco, fondo y cabecera. Evidencia: `tests/e2e/screen-frame.spec.ts`.
- [x] CA-6 En 390, 768 y 1280 px no hay desplazamiento horizontal ni opciones tapadas por el personaje. Evidencia: `tests/e2e/mobile-layout.spec.ts` y `tests/e2e/layout.spec.ts`.
- [x] CA-7 Con movimiento reducido no hay barridos ni idle en movimiento. Evidencia: `tests/e2e/reduced-motion.spec.ts`, `tests/e2e/character.spec.ts` y `tests/e2e/character-transition.spec.ts`.
- [x] CA-8 Carga inicial ≤ 350 KiB, Lighthouse accesibilidad 100, axe-core sin violaciones y contraste AA. Evidencia: axe-core con 0 violaciones en 12 casos, contrastes en `tests/unit/tokens.test.ts` y Lighthouse local de 281 KiB (`research.md`, R8).
- [ ] CA-9 Lint, compilación, pruebas unitarias y E2E pasan; `review-animations` sin hallazgos abiertos; Edward compara el resultado con la referencia visual y el video. Hecho: lint, compilación, 103 pruebas unitarias y E2E en 390, 768 y 1280 px (Chromium) y 1280 px (Firefox), desde instalación limpia (`research.md`, R9). Pendiente de Edward: `/review-animations` y la comparación con la referencia y el video (T056).

## 8. Fuera de alcance de esta fase

- Contenido real de Quién soy, Stack, Proyectos, Social Link y System (fases 4 a 7), salvo el interruptor de sonido.
- Arte nuevo y uso de Higgsfield; se usa solo el arte de la v1 ya en el repositorio.
- Más poses del personaje (la fase 6 define qué hace falta).
- Música de fondo y pistas largas (solo efectos de interfaz).
- Contacto, selector de idioma ampliado, SEO avanzado y 404 localizada.
- Cursor personalizado (descartado) y Timeline como sección (descartado).

## 9. Decisiones que se asumen (revisables en /speckit.clarify)

- El título vertical del panel es "PORTFOLIO" (como en la v1), en datos.
- Con una sola pose disponible, Oguri cambia de posición, escala y rotación por pantalla, no de pose.
- El sonido "levelup" suena una sola vez al activar el sonido, como confirmación.
- La preferencia de sonido se recuerda en el navegador y el idle respeta además el ahorro de datos.

## 10. Restricciones técnicas heredadas

- Las de la fase 2 (`docs/sprints/fase-2-escena-y-menu.md`, sección 10), más: WAAPI y CSS sin dependencias; `data-scene-ready` y `SceneShell` como orquestadores; no romper `/es`, `/en`, la cookie `lang`, el anuncio de ruta de Next ni los 475 E2E existentes.
- El video con transparencia se entrega en WebM (VP9 con alfa); verificar en Chromium y Firefox; WebKit/Safari sigue pendiente.
- Los MP4 de `resources/` no se suben; el video de referencia de P3R no sale de la máquina (`.gitignore`).
