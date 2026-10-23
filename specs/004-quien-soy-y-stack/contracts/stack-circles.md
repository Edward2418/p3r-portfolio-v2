# Contrato: pantalla "Stack" (círculos)

**Especificación**: [../spec.md](../spec.md) | **Modelo de datos**: [../data-model.md](../data-model.md) | **Investigación**: [../research.md](../research.md) (D1 a D4, D9 y D10)

Define los círculos, los niveles, la etiqueta central, el equivalente textual y la adaptación por ancho.

## Estructura (orden en el DOM y de lectura)

| Orden | Elemento | Contenido |
|---|---|---|
| 1 | `<h1>` (de `ScreenFrame`) | "Stack"; recibe el foco al llegar |
| 2 | `<section>` con `<h2>` "Stack" | Contiene el conjunto de círculos |
| 3 | Etiqueta central (`<p>`) | "Full-Stack"; solo si las tres categorías tienen tecnologías; en el DOM va antes de las categorías |
| 4 | Una `<section>` por categoría, con `<h3>` y `<ul>` | Frontend, Backend y Bases de datos y herramientas, en ese orden |
| 5 | `<li>` por tecnología | Nombre, "Nivel: n/5" como texto, cinco puntos decorativos y, si es provisional, la etiqueta "Provisional" |

## Los círculos

- Cada `<section>` de categoría se dibuja como un círculo: borde de color (cian para frontend, rojo de marca para backend, blanco azulado para bases de datos y herramientas) y un tinte translúcido en un pseudoelemento decorativo situado detrás del texto.
- El tinte usa `--opacity-circle-tint`; el trazo cumple 3:1 contra el panel y el texto, 4.5:1 sobre el tinte (verificado en `tokens.test.ts`).
- Cada tecnología pertenece a un solo círculo; las zonas donde se solapan los trazos son decorativas y no contienen información. La excepción es la zona central de los tres, que lleva la etiqueta "Full-Stack".
- Los círculos no son interactivos: no hay enfoque, ni hover con significado, ni enlaces.

## Nivel

- Texto visible "Nivel: n/5" (`level` + valor) en cada tecnología.
- Cinco puntos `aria-hidden`: rellenos hasta el nivel, de contorno el resto. La forma (relleno o contorno) los distingue; no dependen del color.
- Un nivel fuera de 1 a 5 se rechaza en la validación de datos y nunca llega a la pantalla.

## Adaptación por ancho

| Ancho | Disposición |
|---|---|
| ≥ 768 px | Contenedor con `aspect-ratio`; tres círculos de ~58 % del ancho: dos arriba (izquierda y derecha) y uno abajo al centro, solapados; etiqueta en la zona central. Desde 1024 px el contenedor ocupa el ancho del panel de contenido, junto a Oguri |
| < 768 px (390 px incluido) | Una columna: los tres círculos apilados con solapamiento vertical parcial; la etiqueta "Full-Stack" como cabecera de la pila; cada categoría a todo el ancho |

Reglas:

- Sin desplazamiento horizontal ni texto recortado en 390, 768 y 1280 px, en español e inglés.
- Con más tecnologías de las que caben, el bloque crece hacia abajo (`min-height`) y el círculo pasa a elipse suave; nunca se recorta el texto.
- Una categoría vacía no se muestra y la etiqueta central tampoco.

## Movimiento

- Sin movimiento nuevo: la pantalla entra con la entrada escalonada de `ScreenFrame` y los círculos y puntos son estáticos.
- Con movimiento reducido no hay diferencia de contenido; solo el fundido corto de la fase 2.

## Equivalente textual (FR-009)

El orden de lectura "Full-Stack, Frontend: tecnología, nivel…, Backend: …, Bases de datos y herramientas: …" es la propia estructura del DOM; no hay una lista aparte ni texto oculto duplicado.
