# Insumo de especificación - Fase 2: Escena y menú

> **Referencias obligatorias para el agente:**
> - Contexto maestro: `docs/project-context.md` (secciones 6, 7, 10, 11 y 14)
> - Constitución: `.specify/memory/constitution.md`
> - Fase anterior: `docs/sprints/fase-1-base-y-datos.md` y `specs/001-base-y-datos/` (en especial `research.md`, R1 a R9)
> - Este documento describe únicamente el alcance de esta fase.

## 1. Contexto de la fase

Es la segunda de seis fases y la primera con movimiento: el requisito central del proyecto. La fase 1 dejó el sitio publicado, con contenido bilingüe en datos, rutas `/es` y `/en`, tokens de diseño y pruebas, pero con una página de verificación sin diseño P3R. Esta fase construye la escena: el splash, el menú principal y el motor de transiciones que usarán todas las pantallas posteriores. Las pantallas con contenido real (Quién soy, Stack, Proyectos, Social Link y System) llegan en las fases 3 a 6.

## 2. Objetivo

Que un visitante entre al sitio, llegue rápido a un menú principal con la estética del menú de pausa de Persona 3 Reload y navegue entre pantallas con transiciones fieles al video de referencia, interrumpibles, de 500 a 800 ms y accesibles (teclado, toque y movimiento reducido).

## 3. Historias de usuario de la fase

> Formato: "Como [rol], quiero [acción] para [beneficio]".

- **US1** - Como visitante, quiero ver un splash corto que pueda omitir con cualquier tecla o clic, y que no se repita en la misma sesión, para entrar al sitio sin esperas ni repeticiones.
- **US2** - Como visitante, quiero ver el menú principal con las cinco opciones (Quién soy, Stack, Proyectos, Social Link y System), con la opción activa resaltada, para saber dónde estoy y qué puedo explorar.
- **US3** - Como visitante, quiero moverme por el menú y entre pantallas con las pestañas L/R, el teclado (flechas, Enter, Esc, Home y End) y el toque o el clic, con la misma fluidez en escritorio y móvil, para navegar sin depender de un dispositivo.
- **US4** - Como visitante, quiero que el cambio entre menú y pantallas use las transiciones del juego (barrido diagonal, entrada escalonada y cierre con círculo) en 500 a 800 ms, para sentir continuidad sin cansarme.
- **US5** - Como visitante con prisa, quiero que un clic o una tecla durante una transición me lleve de inmediato al destino, para no esperar a que termine el movimiento.
- **US6** - Como visitante sensible al movimiento, quiero que el sitio respete mi preferencia de movimiento reducido y me deje activarla también desde el propio sitio, para navegar sin animaciones que me molesten.
- **US7** - Como visitante, quiero ver siempre la guía contextual y los botones Confirmar y Atrás abajo a la derecha, como en el juego, para saber qué acción está disponible.
- **US8** - Como Edward, quiero que las opciones del menú, sus textos y su orden vivan en datos tipados bilingües y que los tiempos y curvas salgan de los tokens, para cambiarlos sin tocar los componentes.

## 4. Flujo demostrable al cierre de la fase

    Abrir la URL pública (primera visita de la sesión)
    -> Aparece un splash corto; cualquier tecla o clic lo omite
    -> Se ve el menú principal: cinco opciones inclinadas, la activa en rojo y blanco, título de fondo recortado y un marcador del personaje a la izquierda
    -> Flechas, L/R o toque cambian la opción activa
    -> Enter, clic o toque abre la pantalla elegida con la transición (salida con barrido, entrada escalonada, pausa, cierre con círculo) en 500 a 800 ms
    -> Un clic o una tecla durante la transición salta al destino sin esperar
    -> Esc o el botón Atrás vuelve al menú
    -> Con movimiento reducido (sistema o sitio), el cambio es por opacidad corta o instantáneo
    -> Recargar la página en la misma sesión no repite el splash
    -> Las pruebas automáticas pasan y Edward compara el movimiento con el video por tramos

## 5. Contenido y datos que cubre esta fase

| Dato | Estado |
| --- | --- |
| Opciones del menú (id, nombre, descripción para la guía contextual, orden) | Nuevo: datos tipados bilingües; nombres provisionales hasta que Edward los confirme |
| Textos de interfaz (splash, guía, botones Confirmar y Atrás, ajuste de movimiento reducido, pantallas en construcción) | Se amplía `src/content/ui-text.ts` |
| Tokens de movimiento (duraciones por tramo y curvas) | Se amplían en `src/app/globals.css` a partir de los valores medidos en el video |
| Perfil, stack, proyectos, personajes y contacto | Sin cambios; la forma de mostrarlos hasta la fase 3 se decide en `/speckit.clarify` |
| Personaje (hilo conductor) | Solo un marcador de posición; el arte real llega en las fases 3 y 5 |

## 6. Reglas aplicables (de la constitución)

- Principio I: el contenido va primero; ninguna animación impide ni retrasa llegar a la información. Quién soy, Stack y Proyectos a 3 interacciones o menos desde la primera pantalla; contenido esencial visible a los 5 s; el splash se omite con cualquier tecla o clic.
- Principio II: movimiento fiel a la referencia y verificado por tramos de tiempo; transición de 500 a 800 ms, interrumpible, con movimiento reducido, solo `transform` y `opacity`, a 60 fps en un móvil de gama media. Usar las skills `animate`, `animation-performance`, `review-animations`, `emil-design-eng` y `animation-vocabulary`.
- Principio III: teclado, toque y lector de pantalla; contraste AA; foco visible; sin desplazamiento horizontal en 390, 768 y 1280 px; el cambio de pantalla debe anunciarse y manejar el foco.
- Principio IV: opciones y textos en datos tipados bilingües; los componentes no contienen textos.
- Principio V: no inventar datos; el estilo es inspiración y no una copia (identidad propia); mantener el aviso de no afiliación.
- Principio VI: trazabilidad, pruebas y cierre de fase con el movimiento comparado con la referencia.
- Rendimiento: carga inicial del menú sin audio ni video ≤ 350 KiB; Lighthouse móvil ≥ 90 en rendimiento y 100 en accesibilidad; medir también después de cerrar el splash.

## 7. Criterios de aceptación

- [ ] CA-1 El splash dura poco, se omite con cualquier tecla o clic y no se repite en la misma sesión.
- [ ] CA-2 El menú muestra las cinco opciones en el orden definido, con la activa resaltada y los textos en el idioma activo.
- [ ] CA-3 La navegación funciona con L/R, flechas, Enter, Esc, Home y End, y con clic o toque, en escritorio y móvil.
- [ ] CA-4 La transición contiene los tramos del video de referencia (salida con barrido, entrada escalonada, pausa, cierre con círculo y menú) y dura entre 500 y 800 ms en total.
- [ ] CA-5 Un clic o una tecla durante una transición lleva al destino sin esperar y sin quedar en un estado intermedio.
- [ ] CA-6 Con `prefers-reduced-motion` y con la opción del sitio, no hay barridos ni desplazamientos: solo cambios de opacidad cortos o instantáneos.
- [ ] CA-7 Solo se animan `transform` y `opacity`, a 60 fps en un móvil de gama media, comprobado con la skill `animation-performance`.
- [ ] CA-8 La guía contextual y los botones Confirmar y Atrás están siempre visibles abajo a la derecha y reflejan la acción disponible.
- [ ] CA-9 Un visitante nuevo llega a Quién soy, Stack y Proyectos en 3 interacciones o menos y ve el contenido esencial a los 5 s, sin esperar animaciones.
- [ ] CA-10 Las opciones del menú y sus textos salen de datos tipados; agregar o reordenar una opción no requiere tocar componentes.
- [ ] CA-11 Cambiar de pantalla se anuncia a los lectores de pantalla y el foco se coloca en un punto lógico de la pantalla destino.
- [ ] CA-12 Edward compara el movimiento con el video por tramos de tiempo, y la skill `review-animations` no deja hallazgos abiertos.
- [ ] CA-13 Lint, compilación, pruebas unitarias y E2E (390, 768 y 1280 px) pasan, y las rutas `/es` y `/en` siguen funcionando.
- [ ] CA-14 Lighthouse móvil ≥ 90 en rendimiento y 100 en accesibilidad, medido antes y después de cerrar el splash, y carga inicial ≤ 350 KiB.

## 8. Fuera de alcance de esta fase

- El contenido y diseño final de las pantallas Quién soy, Stack, Proyectos, Social Link y System (fases 3 a 6).
- Arte nuevo, video de Oguri y uso de Higgsfield; el personaje es solo un marcador de posición.
- Audio y sonido (fase 6; no se carga nada de audio en esta fase).
- Contacto, selector de sonido y ajustes completos de System (fase 6); en esta fase solo existe la opción de movimiento reducido necesaria para US6, y dónde vive se decide en `/speckit.clarify`.
- SEO avanzado, imagen social, página 404 localizada y `hreflang` absoluto (fase 6).
- Cursor personalizado (descartado) y Timeline como sección (descartado).
- Dominio propio.

## 9. Decisiones pendientes que deben resolverse en /speckit.clarify

> No deben asumirse sin confirmación.

- Estructura de direcciones: una dirección por pantalla (por ejemplo `/es/stack`) o una sola dirección con estado en el cliente, y su efecto en el botón Atrás del navegador, los enlaces compartidos y el idioma.
- Qué muestra cada opción del menú en esta fase: pantallas provisionales con título y aviso de "en construcción", o el contenido de la página de verificación de la fase 1 repartido por pantalla.
- Qué ocurre con la página de verificación de la fase 1: se reemplaza, se conserva en una ruta aparte o se reutilizan sus secciones.
- Nombres definitivos de las cinco opciones del menú, en español e inglés (pendiente en el contexto maestro).
- Duración y contenido del splash, y qué cuenta como "una vez por sesión".
- Gesto táctil: solo toque sobre las opciones y los botones, o también deslizar para pasar de pantalla.
- Marcador del personaje: forma o silueta provisional, o una ilustración ya existente de la v1.
- Dónde vive la opción de movimiento reducido del sitio antes de que exista System.
- Ubicación del video de referencia y método para extraer los cuadros de los tramos de 70.3 a 71.7 s (herramienta y carpeta fuera del repositorio).
- Reparto del tiempo de 500 a 800 ms entre los tramos de la transición.
- Técnica de animación (CSS puro, View Transitions o una librería como Motion): se decide en `/speckit.plan` y no en `/speckit.clarify`, tras comprobar la compatibilidad en Chromium, Firefox y WebKit y justificar cualquier dependencia nueva (peso y rendimiento dentro del presupuesto).

## 10. Restricciones técnicas heredadas

- Next.js 16.4.2, React 19, TypeScript 5.9 y Tailwind CSS 4; antes de escribir código de Next, leer la guía en `node_modules/next/dist/docs/`.
- `cacheComponents` desactivado y rutas por idioma con `app/[lang]` y `src/proxy.ts` (ver `specs/001-base-y-datos/research.md`, R2 y R3); no romper `/es`, `/en` ni la cookie `lang`.
- Tokens únicos en `src/app/globals.css` (colores, tipografías Anton e Inter, duraciones y curvas); no escribir valores sueltos en los componentes (hay una prueba que lo verifica).
- El rojo `#E8203A` solo para rellenos, bordes y texto grande; para texto pequeño, `--color-red-text` y `--color-red-fill`.
- Contenido en datos tipados bilingües con `Localized`; los componentes no tienen textos; importaciones relativas con extensión `.ts` en `src/lib` y `src/content` (para las pruebas nativas de Node).
- Aplicar las skills `animate`, `animation-performance`, `review-animations`, `emil-design-eng`, `animation-vocabulary` y `vercel-react-best-practices`; usar `frontend-design` para decisiones visuales.
- Pruebas: unitarias con `node --test` y E2E con Playwright (390, 768 y 1280 px en Chromium y 1280 px en Firefox), incluida la emulación de movimiento reducido; WebKit/Safari y un dispositivo real siguen pendientes.
- Sin secretos en el repositorio y sin dependencias nuevas sin justificarlas; auditar las de producción (`npm audit --omit=dev`) antes de desplegar.
- Documentar cada decisión técnica relevante en `research.md`, con su razón.
- `vercel.json` ejecuta `npm run test:unit && npm run build` en cada despliegue; trabajar en la rama de la fase, revisar la vista previa, ejecutar `npm run verify` y fusionar a `main` con un pull request.
- Idioma: español en documentos, comentarios y pruebas; identificadores de código en inglés.
- Commits convencionales (tipo y alcance en inglés, descripción en español).
- No poner reglas propias en `AGENTS.md` (lo regenera `next dev`).
