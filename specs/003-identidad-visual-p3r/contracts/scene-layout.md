# Contrato: capas, vistas y posiciones

**Especificación**: [../spec.md](../spec.md) | **Modelo de datos**: [../data-model.md](../data-model.md) | **Investigación**: [../research.md](../research.md)

Define cómo se apilan las capas de la escena, cómo cambian entre el menú y las pantallas y cómo se evita que el personaje tape el contenido.

## Capas (de atrás hacia delante)

| Orden | Capa | Componente | Notas |
|---|---|---|---|
| 0 | Degradado de cian a azul profundo | `SceneBackdrop` | `fixed`, `aria-hidden`, estático |
| 1 | Panel blanco inclinado y título vertical | `SceneBackdrop` | `aria-hidden`; el texto sale de `panelTitle` |
| 2 | Personaje | `Character` | `fixed`, `aria-hidden`; contenedor con posición y tamaño; `[data-character]` interior animado |
| 3 | Contenido, cabecera y pie | páginas, `ScreenFrame`, `Footer` | `relative`; siempre sobre el personaje |
| 4 | Guía y botones | `GuideBar` (fase 2) | Abajo a la derecha |
| 5 | Capa de la transición | `TransitionLayer` (fase 2) | Cubre todo durante el barrido |
| 6 | Splash | `Splash` (fase 2) | Solo en la primera carga de la raíz |

## Vistas y posición del personaje

`SceneShell` publica `data-view="menu" | "screen"`. El CSS aplica:

| Vista | Ancho | Personaje | Panel | Contenido |
|---|---|---|---|---|
| Menú | ≥ 768 px | A la izquierda, grande, sobre el panel blanco (como la referencia) | Grande, en la mitad izquierda | Opciones a la derecha |
| Menú | < 768 px | Detrás de las opciones, recortado por el borde derecho y atenuado | Banda estrecha a la izquierda | Opciones encima, a todo el ancho |
| Pantalla | ≥ 1024 px | A la derecha, grande, fuera del panel de contenido | Banda estrecha a la izquierda | Panel de contenido a la izquierda del personaje |
| Pantalla | < 1024 px | Detrás del panel, recortado por el borde derecho y atenuado | Banda estrecha | Panel de contenido a todo el ancho |

Reglas:

- El cambio de vista (posición y tamaño) se aplica sin animar, durante la cobertura del barrido (fases `exiting` y `navigating`). Las llegadas por el botón Atrás o Adelante del navegador usan la entrada corta de la fase 2.
- Cuando el personaje va detrás del contenido (móvil y pantallas estrechas) su opacidad es la del token `--opacity-character-dim` (máximo 0.5).
- El foco visible usa un anillo de doble capa (`--color-focus-inner` y `--color-focus-outer`) para verse sobre superficies blancas, cian y marinas.
- El personaje nunca recibe punteros (`pointer-events: none`) y nunca ocupa espacio del diseño.
- Sin desplazamiento horizontal en 390, 768 y 1280 px; el recorte por el borde derecho se hace con `overflow: clip` del contenedor del personaje, no con la página.
- Con movimiento reducido no hay barrido; el personaje cambia de lugar con el fundido corto de la fase 2.

## Animación del personaje

| Momento | Técnica | Propiedades | Token |
|---|---|---|---|
| Entrada inicial al abrir el menú | CSS (`animation` con relleno hacia atrás); retraso igual a la duración del splash si este se muestra | `transform`, `opacity` | `--duration-character-in`, `--ease-out` |
| Entrada al cambiar de pantalla | WAAPI de la fase 2 sobre `[data-character]` (desde la derecha, rotado) | `transform`, `opacity` | tokens de la transición |
| Fundido imagen a video | Transición CSS | `opacity` | `--duration-fast` |
| Movimiento reducido | Sin animación de entrada; solo la imagen fija | — | — |

## Marco de las pantallas (`ScreenFrame`)

- Cabecera con el `<h1>` (nombre de la pantalla), como hasta ahora: el foco y el anuncio de ruta no cambian.
- Panel de contenido de azul marino con opacidad alta; mantiene el contraste de los textos de la fase 1.
- Los bloques siguen marcados con `data-stagger` para la entrada escalonada.
