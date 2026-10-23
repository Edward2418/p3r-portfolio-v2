# Guía de validación (quickstart): Fase 4 — Quién soy y Stack

**Especificación**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Escenarios para comprobar de extremo a extremo que la fase funciona. Los comandos se ejecutan desde la raíz del repositorio.

## 1. Preparación

```bash
npm ci
npx playwright install           # una sola vez
npm run build && npm run start   # http://localhost:3000
```

Para medir rendimiento y accesibilidad se usan `lighthouse` y `axe-core`, instalados fuera del repositorio (como en las fases anteriores).

## 2. Recorrido manual (escritorio, 1280 px)

1. Abrir `/es`, elegir "Quién soy": transición de la fase 3 y llegada de la ficha: nombre, titular, especialidad, institución, semestre y presentación; Oguri a la derecha sin tapar nada.
2. Bajar a la trayectoria: cinco hitos en orden cronológico; el de "Hoy" con la etiqueta "Actual" y el último con la etiqueta "Meta" y contorno punteado, sin año; todos con la etiqueta "Provisional" mientras Edward no los confirme.
3. Pulsar R (o ir con el teclado) a "Stack": tres círculos solapados con las tecnologías de cada categoría, "Nivel: n/5" y los cinco puntos; la etiqueta "Full-Stack" en el centro; Oguri más pequeña e inclinada.
4. Cambiar el idioma estando en cada pantalla: se conserva la pantalla y todo el texto cambia.
5. Activar el movimiento reducido: sin barridos; al pasar de una pantalla a otra, Oguri se funde en lugar de saltar.
6. Un clic durante la transición lleva al destino de inmediato.

## 3. Móvil (390 px) y tableta (768 px)

1. En 390 px: "Quién soy" en una columna con la trayectoria legible; "Stack" con los tres círculos apilados con solapamiento vertical y la etiqueta "Full-Stack" como cabecera; sin desplazamiento horizontal ni texto cortado.
2. En 768 px: "Stack" con los círculos solapados al estilo de escritorio; Oguri detrás del panel (el lateral aparece desde 1024 px).

## 4. Lector de pantalla

Recorrer ambas pantallas con NVDA: se anuncia el título al llegar y luego, en "Stack", "Full-Stack", cada categoría como encabezado y cada tecnología con su nivel ("Nivel: 3/5"); en "Quién soy", la ficha como lista de definición y la trayectoria como lista ordenada con "Actual" y "Meta".

## 5. Pruebas automáticas

```bash
npm run test:unit
npx playwright test --workers=2     # un navegador a la vez si la memoria es limitada
npm run verify                      # lint, unitarias, compilación, E2E y auditoría
```

Comprueban, entre otras cosas: las reglas de los datos (niveles de 1 a 5, una sola meta y al final, sin apellido completo ni año de titulación), la ficha y la trayectoria, los tres grupos del stack con su nivel como texto, la etiqueta central, el orden de lectura, la ausencia de recortes y de desplazamiento horizontal en 390, 768 y 1280 px, y las posiciones de Oguri por pantalla.

## 6. Rendimiento y accesibilidad

| Fecha | Ruta | Escenario | Rendimiento | Accesibilidad | KiB |
|---|---|---|---|---|---|
| 2026-10-23 | `/es/profile` (producción local) | Entrada directa | 82, 80 y 82 | 100 | 265.8 |
| 2026-10-23 | `/es/stack` (producción local) | Entrada directa | 82, 82 y 81 | 100 | 270.3 |
| (pendiente) | Dirección pública de Vercel | `/es/profile` y `/es/stack` | | | |

Metas: carga inicial ≤ 350 KiB, accesibilidad 100 y rendimiento ≥ 90 en la dirección pública (en local, al nivel de la fase 3: 82 a 88). axe-core con 0 violaciones en ambas pantallas, en español e inglés, a 390 y 1280 px.

## 7. Revisión final

- Edward revisa y confirma el contenido (presentación, semestre, hitos, tecnologías y niveles) y quita las marcas de provisional de lo confirmado.
- Comparar las pantallas con las de referencia de P3R (Stats y Social Stats) y ejecutar `/review-animations` (lo lanza Edward).
- Probar en un móvil real la lectura de los círculos apilados y de la trayectoria.
