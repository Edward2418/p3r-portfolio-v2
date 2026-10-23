# Contrato: Oguri por pantalla

**Especificación**: [../spec.md](../spec.md) | **Investigación**: [../research.md](../research.md) (D7) | **Fase anterior**: [../../003-identidad-visual-p3r/contracts/scene-layout.md](../../003-identidad-visual-p3r/contracts/scene-layout.md)

Define cómo cambian la posición, la escala y la inclinación de Oguri entre "Quién soy" y "Stack" sin romper las reglas de la fase 3.

## Atributos

`SceneShell` publica en su contenedor raíz:

| Atributo | Valores |
|---|---|
| `data-view` (existente) | `menu` o `screen` |
| `data-scene` (nuevo) | Identificador de la pantalla (`profile`, `stack`, `projects`, `social-link`, `system`); vacío en el menú |

## Valores por pantalla (desde 1024 px; se afinan con capturas)

| Pantalla | Lado | Altura | Inclinación | Notas |
|---|---|---|---|---|
| Quién soy (`profile`) | Derecha, `right: 3vw` | `min(90vh, 60vw)` | 0° | Como la vista de pantalla de la fase 3 |
| Stack (`stack`) | Derecha, `right: 2vw` | `min(78vh, 52vw)` | 3° | Más pequeña y ligeramente inclinada, para no competir con los círculos |
| Resto de pantallas | Como la vista de pantalla de la fase 3 | | 0° | Sin cambios hasta sus fases |

Por debajo de 1024 px se mantiene la regla de la fase 3: detrás del panel, recortada por el borde derecho y atenuada (`--opacity-character-dim`, máximo 0.5), sin importar la pantalla.

## Reglas

- Las propiedades personalizadas (`--character-right`, `--character-height`, `--character-tilt`) se definen por `data-scene`; la inclinación se aplica a la imagen y al video interiores de `[data-character]`, **no** a `[data-character]`, porque este lo anima WAAPI en la transición (un solo elemento animado por JavaScript).
- El cambio de valores ocurre al cambiar la ruta, bajo la cobertura del barrido (fases `exiting` y `navigating`): no se ve moverse.
- Oguri no tapa el contenido: a partir de 1024 px queda a la derecha y fuera del panel (el ancho del panel ya reserva el lado derecho); por debajo va detrás.
- **Movimiento reducido**: sin barrido; al cambiar de pantalla (no solo de vista) el personaje se funde con `fadeIn(includeCharacter)`. `SceneShell` compara la pantalla anterior y la actual, no solo la vista.
- El idle sigue reproduciéndose solo en el menú (fase 3): en estas pantallas Oguri es la imagen fija.

## Observable (para las pruebas)

- Las cajas de `[data-character]` de "Quién soy" y de "Stack" difieren en altura y en posición.
- La inclinación calculada de la imagen difiere entre "Quién soy" y "Stack" (valores iniciales 0° y 3°, que se afinan con capturas sin romper la prueba).
- En 1280 px, la caja de Oguri empieza a la derecha del panel en ambas pantallas.
