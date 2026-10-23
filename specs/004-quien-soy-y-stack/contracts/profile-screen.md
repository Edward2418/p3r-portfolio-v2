# Contrato: pantalla "Quién soy"

**Especificación**: [../spec.md](../spec.md) | **Modelo de datos**: [../data-model.md](../data-model.md) | **Investigación**: [../research.md](../research.md) (D5, D6 y D9)

Define la estructura, el orden de lectura y los estados de la ficha y de la trayectoria.

## Estructura (orden en el DOM y de lectura)

| Orden | Elemento | Contenido |
|---|---|---|
| 1 | `<h1>` (de `ScreenFrame`) | "Quién soy" / "About me"; recibe el foco al llegar |
| 2 | Ficha (`<section>` con `<h2>`) | Nombre en tipografía de display, titular, especialidad |
| 3 | Lista de definición (`<dl>`) dentro de la ficha | Institución y semestre (término y valor) |
| 4 | Presentación (`<p>`) | Texto del perfil, en el idioma activo |
| 5 | Trayectoria (`<section>` con `<h2>` "Trayectoria") | Lista ordenada (`<ol>`) con un `<li>` por hito |

## Cada hito (`<li>`)

- Periodo (texto visible), título y descripción breve (si existe).
- Estado: el hito `current` lleva la etiqueta visible "Actual" y el `goal` la etiqueta visible "Meta"; el `goal` se dibuja además con contorno punteado y, al estar al final, queda distinguido de los hechos ya ocurridos. El estado nunca depende solo del estilo.
- Si `provisional` es `true`, muestra la etiqueta "Provisional" (`ProvisionalBadge`).

## Estados y reglas

- La etiqueta "Provisional" de la ficha aparece junto al titular mientras `profile.provisional` sea `true`; al quitarla desaparece.
- No se publican el apellido completo ni el año de titulación (FR-004); el hito de la meta no muestra año.
- Sin descripción en un hito, no queda hueco ni texto vacío; sin hitos, la sección de trayectoria no se muestra.
- Los campos de la ficha ausentes (por ejemplo, sin institución) simplemente no se muestran.
- Cada bloque (ficha, presentación y trayectoria) es un bloque de `ScreenFrame` con `data-stagger`, de modo que entra con la entrada escalonada de la fase 2; no hay movimiento nuevo.

## Adaptación

- Desde 1024 px: la ficha y la trayectoria ocupan el panel de contenido a la izquierda de Oguri (ancho `min(46rem, 100vw - 54vw)`, como en la fase 3).
- Por debajo de 1024 px: todo en una columna dentro del panel, sin desplazamiento horizontal; Oguri detrás y atenuada.
- La trayectoria usa una línea vertical con marcadores a la izquierda; en 390 px los textos largos se ajustan a la línea (`overflow-wrap`), sin recortes.

## Accesibilidad

- Jerarquía: `h1` > `h2` (ficha y trayectoria); sin saltos de nivel.
- El orden de lectura es el visual; no hay controles interactivos en la pantalla (el orden de tabulación no cambia).
- Los textos de estado (Actual, Meta, Provisional) son visibles y se leen en el idioma de la página.
