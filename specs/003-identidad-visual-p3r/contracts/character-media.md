# Contrato: medios del personaje (póster e idle)

**Especificación**: [../spec.md](../spec.md) | **Modelo de datos**: [../data-model.md](../data-model.md) | **Investigación**: [../research.md](../research.md) (D3 y D5)

## Imagen fija

- Archivo: `/img/oguri/idle-poster.webp` (540×960, con transparencia, 54 KiB). Es el primer cuadro del idle.
- Elemento: `<img>` con `width` y `height`, `decoding="async"`, `fetchpriority="low"`, `alt=""` y `aria-hidden` (decorativo). Aparece en el HTML inicial.

## Elegibilidad del idle

`shouldLoadIdle(entrada)` (función pura, `src/lib/motion/idle.ts`) devuelve `true` solo si:

| Condición | Valor requerido |
|---|---|
| Movimiento reducido (sistema o sitio) | No |
| Ahorro de datos (`navigator.connection.saveData`) | No |
| Soporte de `video/webm; codecs="vp9"` (`canPlayType`) | Sí |
| Motor WebKit (Safari) | No (el alfa de WebM no se dibuja) |

## Momento de carga

1. El menú es utilizable (el contenido está en el HTML; no se espera nada).
2. Se espera a `requestIdleCallback` con `timeout` de 2000 ms (respaldo: `setTimeout` de 2000 ms).
3. Si sigue siendo elegible, se asigna el `src` del `<video muted playsinline loop>` y se llama a `play()`.
4. Con el evento `playing`, el video aparece con un fundido de `opacity` sobre la imagen fija.
5. Con `error` o un `play()` rechazado, se quita el video y queda la imagen fija, sin mensajes.

## Pausas y cambios

- El video se pausa mientras `<html data-scene-busy>` esté presente (transición en curso), con la pestaña oculta (`visibilitychange`) y cuando aparece `data-motion="reduced"`; se reanuda al terminar la transición y al volver la pestaña, si sigue siendo elegible.
- Cuando el movimiento pasa a reducido, el video se oculta con un fundido corto y se pausa; queda la imagen fija.

## Observable (para las pruebas)

- Atributo `data-idle` en el contenedor del personaje: `pending`, `loading`, `playing`, `failed` u `off` (inelegible).
- Ninguna petición a `idle.webm` antes del reposo ni con movimiento reducido o ahorro de datos.
