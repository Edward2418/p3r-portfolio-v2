# Contrato: teclado, toque y deslizamiento

**Especificación**: [../spec.md](../spec.md) | **Rutas**: [routes-scenes.md](./routes-scenes.md)

Define cómo se opera el menú y las pantallas. Las pruebas E2E y unitarias se escriben contra este contrato.

## Menú principal

| Entrada | Efecto |
|---|---|
| ↓ o → | Opción activa siguiente (se detiene en la última) |
| ↑ o ← | Opción activa anterior (se detiene en la primera) |
| Inicio (Home) | Primera opción |
| Fin (End) | Última opción |
| Enter | Abre la opción activa (transición completa) |
| Clic o toque sobre una opción | La activa y la abre |

- Las opciones son enlaces reales (`<a>`): Enter, clic y toque funcionan aunque JavaScript no esté disponible.
- La opción activa recibe el foco y lleva `aria-current="true"`.
- Al volver al menú desde una pantalla (Esc, botón Atrás o el botón del navegador), la opción activa inicial es la de esa pantalla; en una carga directa del menú es la primera.
- Cambiar la opción activa no anima el menú completo: solo el resaltado, de forma casi inmediata (≤ 100 ms).

## Pantallas

| Entrada | Efecto |
|---|---|
| ← o RePág (PageUp) | Pantalla anterior según el orden del menú (equivale a L); en la primera, sin efecto |
| → o AvPág (PageDown) | Pantalla siguiente (equivale a R); en la última, sin efecto |
| Esc | Vuelve al menú |
| Pestaña L / R (toque o clic) | Igual que ← y → |
| Botón Atrás | Igual que Esc |
| Deslizamiento horizontal | Hacia la izquierda: pantalla siguiente; hacia la derecha: anterior |

## Reglas generales de teclado

- Se ignoran las teclas con Ctrl, Alt o Meta, y las que se pulsan con el foco en un campo de texto, un `select` o un control que use esa tecla.
- La tecla mantenida (`event.repeat`) no encadena transiciones: solo actúa la primera pulsación; las repeticiones siguientes en el menú mueven la opción activa sin transición completa y en las pantallas se ignoran.
- Orden de tabulación lógico: enlace "Saltar al contenido", selector de idioma, interruptor de movimiento reducido, contenido (opciones del menú o de la pantalla), pestañas L/R, botones Atrás y Confirmar.
- Foco visible con contraste AA (token existente) en todos los elementos.

## Deslizamiento (tacto)

| Parámetro | Valor |
|---|---|
| Distancia horizontal mínima | 56 px |
| Relación | `|dx| ≥ 1.5 · |dy|` |
| Punteros | Solo uno |
| Zona ignorada | Los primeros y los últimos 24 px del borde horizontal de la pantalla |
| Desplazamiento vertical | Siempre del navegador (`touch-action: pan-y`) |

- Un deslizamiento que no cumple las reglas se ignora y no interfiere con la lectura.
- Toda acción de deslizamiento tiene la alternativa de un solo toque (pestañas L/R y botones).

## Interrupción

Un clic, toque o tecla (cualquiera de las anteriores) durante una transición:

1. Termina de inmediato todas las animaciones de la transición.
2. Ejecuta la navegación pendiente, si la hay, y muestra el destino en menos de 100 ms.
3. Coloca el foco en el `<h1>` de la pantalla destino (o en la opción activa si el destino es el menú).
4. Si la acción interruptora era una nueva navegación, el destino final es el de esa última acción.

## Anuncio a lectores de pantalla

- Cada ruta define su `<title>` traducido; el anunciador de rutas de Next.js lo comunica al cambiar de pantalla.
- El foco en el `<h1>` del destino refuerza el anuncio, también cuando la transición se interrumpe o se reduce.
- Los paneles y el disco de la transición son decorativos: `aria-hidden="true"` y `pointer-events: none`.
