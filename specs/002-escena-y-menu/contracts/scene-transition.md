# Contrato: transición de escena

**Especificación**: [../spec.md](../spec.md) | **Modelo de datos**: [../data-model.md](../data-model.md) | **Investigación**: [../research.md](../research.md) (D1 a D5)

Define la secuencia de la transición, sus tokens, su variante reducida y cómo se mide.

## Secuencia (movimiento completo)

Total: **500 a 800 ms medidos** (suma de tokens: 610 ms, más ~110 a 130 ms de navegación y relevos de fotogramas). Los valores salen de los tokens de `src/app/globals.css`.

| # | Tramo | Qué se ve | Propiedades animadas | Token |
|---|---|---|---|---|
| 1 | Salida | Barrido diagonal oscuro que cubre la pantalla; el título de fondo gira | `transform`, `opacity` | `--duration-wipe-out` (150 ms), curva `--ease-in-out` |
| 2 | Navegación | La ruta cambia con el barrido cubriendo la pantalla | — | (se ejecuta entre 1 y 3) |
| 3 | Entrada escalonada | Las fichas del destino suben una a una; el marcador del personaje entra desde la derecha, rotado | `transform`, `opacity` | `--duration-stagger-in` (240 ms), `--stagger-step` (35 ms), curva `--ease-out` |
| 4 | Pausa | Todo quieto un instante | — | `--duration-hold` (50 ms) |
| 5 | Cierre | Un disco blanco se expande y se desvanece revelando la pantalla | `transform`, `opacity` | `--duration-circle` (170 ms), curva `--ease-out` |

Reglas:

- Solo `transform` y `opacity` (Principio II). Sin `clip-path`, `width`, `height`, `top`, `left`, `margin` ni `box-shadow` animados.
- Los retrasos del escalonado se pasan a cada animación (opción `delay` de WAAPI); no se usa una variable CSS heredada en un contenedor.
- Nada empieza visible de golpe: el estado inicial de la entrada se aplica antes de pintar (relleno hacia atrás de la animación).
- `will-change: transform` solo mientras la transición está en curso.
- Los paneles y el disco son elementos propios y decorativos, no modifican el contenido de las pantallas.

## Variante reducida

Con `data-motion="reduced"` (sistema o sitio):

- No hay barrido, disco, escalonado ni desplazamientos.
- El cambio de pantalla es un fundido de opacidad de `--duration-reduced` (120 ms) o instantáneo.
- Contenido y acciones son los mismos que con movimiento (FR-014).
- El splash se omite.

## Destino no listo

Si, terminada la salida, el destino aún no está disponible (red lenta o ruta sin precargar):

- La pantalla permanece cubierta por el panel hasta que llegue la ruta, con un máximo de `--duration-nav-timeout` (1.5 s).
- Cuando llega, o al agotarse la espera, se muestra el destino **sin entrada escalonada**, igual que tras una interrupción, y la transición se registra como no estándar (marca `scene-transition-waited`).
- La regla de 500 a 800 ms se aplica a las transiciones completas (no interrumpidas) con el destino precargado; las demás quedan fuera de esa medida.
- `router.prefetch` se llama antes de empezar la salida para que el caso normal sea el precargado.

## Navegación del navegador (Atrás y Adelante)

No hay tramo de salida: se reproduce la entrada de forma corta (o el fundido en la variante reducida). El foco se coloca en el `<h1>` del destino.

## Interrupción

Ver [input-navigation.md](./input-navigation.md), sección "Interrupción". El estado final tras una interrupción es el estado de reposo del destino: contenido visible, paneles ocultos, `getAnimations()` vacío y ninguna animación a medias.

## Instrumentación de medición

| Nombre | Dónde | Para qué |
|---|---|---|
| `performance.measure('scene-transition')` | Del inicio de la salida al fin del cierre | La prueba E2E comprueba que dura entre 500 y 800 ms |
| `performance.mark('scene-transition-skipped')` | Al interrumpir | La prueba comprueba que el destino aparece en menos de 100 ms |
| `performance.mark('scene-transition-waited')` | Cuando el destino tardó más de lo previsto | La medida de 500 a 800 ms excluye estas transiciones |
| `document.getAnimations().length` | Tras la transición | Debe ser 0 en reposo |

La instrumentación es ligera y está presente en producción.

## Compatibilidad

- WAAPI (`element.animate()`, `finish()`, `getAnimations()`) está disponible en los navegadores modernos. Si no existiera (`element.animate` indefinido), se usa la variante reducida: el contenido y la navegación se conservan (FR-025).
- No se usa la API de View Transitions en esta fase.
