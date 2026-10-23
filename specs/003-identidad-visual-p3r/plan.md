# Plan de implementación: Fase 3 — Identidad visual P3R

**Rama**: `003-identidad-visual-p3r` | **Fecha**: 2026-10-23 | **Especificación**: [spec.md](./spec.md)

**Entrada**: Especificación de la funcionalidad en `specs/003-identidad-visual-p3r/spec.md`

## Resumen

Dar al sitio el aspecto del menú de pausa de Persona 3 Reload sobre el motor de la fase 2: un fondo en degradado de cian a azul profundo, un panel blanco inclinado con título vertical, opciones inclinadas con la activa en blanco y borde rojo, a Oguri como protagonista (entrada animada, idle de carga diferida y barrido de transición con el personaje), un marco común para las cinco pantallas y sonido opcional.

Enfoque técnico (resuelto en [research.md](./research.md)): **sin dependencias nuevas**. Un único personaje persistente (`Character`) vive en el layout, dentro de `SceneShell`, y cambia de posición según la vista (menú o pantalla) bajo la cobertura del barrido de la fase 2; la imagen fija es el póster del idle (mismo encuadre que el video, así no hay salto) y el video con transparencia se carga cuando el navegador queda en reposo, solo si el movimiento no está reducido ni hay ahorro de datos. El fondo y el panel son capas estáticas (CSS), el sonido se carga bajo demanda con `Audio` tras activarlo en System, y los colores, ángulos y duraciones nuevos son tokens en `globals.css`.

## Contexto técnico

**Lenguaje/Versión**: TypeScript 5.9 sobre Node.js `>=22.18`

**Dependencias principales**: Next.js 16.4.2, React 19.3, Tailwind CSS 4.3; **sin dependencias nuevas** (WAAPI y `HTMLAudioElement`, ya nativos)

**Almacenamiento**: datos en `src/content/`; `localStorage` (`motion` de la fase 2 y `sound` nuevo) y `sessionStorage` (`splash-seen`); cookie `lang` de la fase 1

**Pruebas**: `node --test` (unitarias) y `@playwright/test` (E2E en 390, 768 y 1280 px en Chromium y 1280 px en Firefox, con emulación táctil y de movimiento reducido); axe-core y Lighthouse bajo demanda, fuera del repositorio

**Plataforma de destino**: navegadores de escritorio y móvil (Chromium y Firefox; WebKit/Safari y un dispositivo real siguen pendientes); Vercel

**Tipo de proyecto**: aplicación web de un solo proyecto, con renderizado estático y componentes de cliente acotados

**Objetivos de rendimiento**: carga inicial del menú sin audio ni video ≤ 350 KiB (hoy 228 a 240 KiB; el póster de Oguri suma 54 KiB); Lighthouse móvil rendimiento ≥ 90 en la dirección pública (85 a 86 en local) y accesibilidad 100; transición de 500 a 800 ms a 60 fps; interrupción en menos de 200 ms

**Restricciones**: solo `transform` y `opacity` en el movimiento; movimiento reducido incluye el idle; sin desplazamiento horizontal en 390, 768 y 1280 px; contraste AA; el idle (1.8 MB) y el audio (76 KB) nunca en la carga inicial; sin dependencias nuevas

**Escala/Alcance**: 1 menú, 5 pantallas con un marco común, 1 personaje persistente, 6 sonidos, 1 interruptor de sonido; 2 idiomas

## Verificación de la constitución

*Puerta: debe pasar antes de la Fase 0 y revisarse tras el diseño de la Fase 1.*

| Principio / regla | Evaluación inicial | Evaluación tras el diseño |
|---|---|---|
| I. Contenido primero | En riesgo por el peso del arte y del video. | Cumple: el póster (54 KiB) es la única imagen en la carga inicial, con `fetchpriority="low"` y dimensiones fijas; el video espera al reposo del navegador (tope de 2 s) y el audio a la activación del sonido (D4, D5). El HTML del contenido no depende del personaje. |
| II. Movimiento fiel, interrumpible y accesible | Aplica de lleno. | Cumple: se reutiliza la secuencia calibrada de la fase 2; el personaje solo añade `transform` y `opacity`; la entrada inicial es CSS y el idle se pausa durante las transiciones (D5, D6). Riesgo declarado: el idle en móviles de gama baja (se mide en T-dispositivo). |
| III. Accesibilidad | Aplica. | Cumple: el arte decorativo es `aria-hidden`, los contrastes de las superficies nuevas se verifican con prueba unitaria y axe (D8), el interruptor de sonido es un botón con `aria-pressed`, y el foco y el anuncio de ruta de la fase 2 no cambian. |
| IV. Contenido en datos tipados y bilingüe | Aplica. | Cumple: título del panel, rutas de imagen, descripción del personaje y archivos de sonido en `src/content/` (D9); colores y duraciones en tokens (D7). |
| V. Honestidad y derechos | Aplica. | Cumple: se publica solo el arte decidido por Edward, con el aviso de no afiliación en el pie de todas las pantallas; el diseño es propio (composición y paleta propias, no capturas del juego). |
| VI. Fases y trazabilidad | Aplica. | Cumple: solo el alcance de la fase 3; el insumo existe; la constitución se enmendó a 1.0.1 para reconocer las siete fases; trazabilidad en `tasks.md`. |
| Stack | Aplica. | Cumple: sin cambiar Next 16, React 19, TypeScript, Tailwind 4 ni Vercel. |
| Rendimiento y carga bajo demanda | Aplica. | Cumple por diseño: video y audio bajo demanda; se mide antes y después del splash y se compara con el presupuesto (D4, D10). |
| Sonido | Aplica. | Cumple: silenciado por defecto, activable en System, con carga bajo demanda (D4). |
| Seguridad y privacidad | Aplica. | Cumple: solo `localStorage` con preferencias de presentación; sin analítica ni datos personales. |
| Dependencias | Aplica. | Cumple: ninguna nueva; se descartan una librería de audio y una de animación (D4, D6). |
| Arte con IA | Aplica. | Cumple: no se usa Higgsfield; se reutiliza el arte de la v1. |

**Resultado de la puerta**: sin violaciones. Un riesgo se acepta con medición: el peso inicial queda en unos 295 KiB (límite 350 KiB) y el idle puede exigir mucho a móviles de gama baja.

## Estructura del proyecto

### Documentación (esta funcionalidad)

```text
specs/003-identidad-visual-p3r/
├── plan.md                    # Este archivo (salida de /speckit-plan)
├── research.md                # Fase 0 (salida de /speckit-plan)
├── data-model.md              # Fase 1 (salida de /speckit-plan)
├── quickstart.md              # Fase 1 (salida de /speckit-plan)
├── contracts/
│   ├── scene-layout.md        # Capas, vistas, posiciones del personaje y panel
│   ├── character-media.md     # Póster, idle, elegibilidad y recuperación de fallos
│   └── sound.md               # Preferencia, carga bajo demanda y mapa de eventos
├── checklists/
│   └── requirements.md        # Calidad de la especificación
└── tasks.md                   # Fase 2 (salida de /speckit-tasks; no lo crea /speckit-plan)
```

### Código fuente (raíz del repositorio)

```text
public/
├── img/oguri/                         # Ya subido: idle.webm, idle-poster.webp (y portrait.webp, se retira si no se usa)
└── audio/                             # Ya subido: seis MP3

src/
├── app/
│   ├── globals.css                    # Tokens nuevos (colores, degradado, ángulos, tamaños) y estilos de las capas y vistas
│   └── [lang]/
│       ├── layout.tsx                 # + SceneBackdrop y Character dentro de SceneShell
│       ├── page.tsx                   # Menú: sin CharacterSlot; título y opciones
│       └── system/page.tsx            # + interruptor de sonido
├── components/
│   ├── scene/
│   │   ├── SceneShell.tsx             # + data-view, SoundProvider y eventos de sonido en navigate/go
│   │   ├── SceneBackdrop.tsx          # Servidor: degradado, panel inclinado y título vertical (aria-hidden)
│   │   ├── Character.tsx              # Cliente: póster, idle diferido, [data-character]
│   │   ├── ScreenFrame.tsx            # Cabecera con el nombre y panel de contenido
│   │   ├── transition.ts              # + data-scene-busy durante la transición
│   │   └── …                          # GuideBar, TransitionLayer (sin cambios de comportamiento)
│   ├── menu/
│   │   ├── MainMenu.tsx               # Opciones con el estilo P3R; sonido de cursor
│   │   └── CharacterSlot.tsx          # Se elimina (lo reemplaza Character)
│   ├── audio/
│   │   ├── SoundProvider.tsx          # Cliente: contexto, carga bajo demanda y reproducción
│   │   └── SoundToggle.tsx            # Interruptor de System (aria-pressed)
│   └── …                              # Footer, LanguageSwitcher y MotionToggle con chips legibles sobre el degradado
├── content/
│   ├── character.ts                   # Rutas, tamaños y descripción accesible bilingüe del personaje (nuevo)
│   ├── audio.ts                       # Efectos de sonido: id → archivo (nuevo)
│   ├── types.ts                       # + SoundId, CharacterAsset, SoundEffect
│   └── ui-text.ts                     # + título del panel, interruptor de sonido, descripción del personaje
└── lib/
    ├── audio/
    │   ├── preference.ts              # Preferencia de sonido (pura, con almacenamiento inyectable)
    │   └── events.ts                  # Mapa acción → sonido (pura)
    └── motion/
        ├── idle.ts                    # shouldLoadIdle (pura)
        └── use-motion-state.ts        # Hook: data-motion y data-scene-busy de <html>

tests/
├── unit/                              # audio.test.ts, sound-preference.test.ts, sound-events.test.ts, idle.test.ts, character-content.test.ts, tokens.test.ts (+ contrastes nuevos)
└── e2e/                               # visual-menu.spec.ts, character.spec.ts, sound.spec.ts, screen-frame.spec.ts (+ ajustes a menu, layout y transition)
```

**Decisión de estructura**: se mantiene el proyecto único. La lógica sin DOM (elegibilidad del idle, preferencia y mapa de sonido) va en funciones puras para probarla con `node --test`; los componentes de cliente son finos. El personaje persistente reemplaza al marcador de la fase 2 sin tocar el motor de la transición salvo por dos señales (`data-scene-busy` y el desplazamiento del personaje).

## Seguimiento de complejidad

Sin violaciones de la constitución; no aplica.

## Riesgos y puntos a verificar al implementar

- **Peso inicial**: el póster suma 54 KiB a los 228–240 KiB medidos; esperado ≈ 295 KiB (límite 350). Medir con Lighthouse antes y después del splash (D10).
- **Halo verde en el borde del póster**: el póster sale del video con fondo verde recortado; sobre el panel blanco puede verse un borde verdoso. Verlo en el navegador y, si molesta, limpiar el alfa con `ffmpeg` (D3).
- **Idle en gama baja**: decodificar VP9 con alfa cuesta CPU; se pausa durante las transiciones y con la pestaña oculta, y se comprueba en un móvil real (D5).
- **WebKit/Safari**: el WebM con alfa no se dibuja bien; por eso el idle se excluye del motor WebKit y se muestra el póster (D5). Verificación manual pendiente.
- **Contraste sobre el degradado**: el cian del encabezado sobre el cian del degradado no cumple; los controles del encabezado y el pie llevan una superficie propia (D8).
- **Foco visible sobre superficies claras**: el contorno cian global no se ve sobre blanco ni sobre el cian del degradado; se sustituye por un anillo de doble capa con tokens y pares verificados (D8).
- **Cambio de idioma**: el layout de `[lang]` probablemente se remonta; el personaje y el sonido deben tolerarlo sin errores (D1).
- **Pruebas heredadas**: `menu.spec.ts`, `layout.spec.ts`, `transition.spec.ts` y `guide.spec.ts` dependen del marcador (`CharacterSlot`) y del aspecto anterior; se ajustan en la misma tarea que el cambio (D11).
- **Navegación de Next.js y hidratación**: el personaje persistente no debe remontarse entre rutas; confirmar en `node_modules/next/dist/docs/` el comportamiento de los layouts compartidos antes de escribirlo.
- **Audio bloqueado por el navegador**: la reproducción se intenta con `play()` y se ignoran los rechazos; la primera interacción desbloquea el audio (D4).
- **WebKit/Safari y un dispositivo real**: siguen sin verificarse, según el contexto maestro.
