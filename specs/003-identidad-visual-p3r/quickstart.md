# Guía de validación (quickstart): Fase 3 — Identidad visual P3R

**Especificación**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

Escenarios para comprobar de extremo a extremo que la fase funciona. Los comandos se ejecutan desde la raíz del repositorio.

## 1. Preparación

```bash
npm ci
npx playwright install           # una sola vez
npm run build && npm run start   # http://localhost:3000
```

Para medir rendimiento y accesibilidad se usan `lighthouse` y `axe-core`, instalados fuera del repositorio (como en la fase 2).

## 2. Recorrido manual (escritorio, 1280 px)

1. Abrir `/es` en una sesión nueva: splash corto y luego el menú con el degradado, el panel blanco inclinado con el título vertical, Oguri grande a la izquierda y cinco opciones inclinadas, con la activa blanca y con borde rojo.
2. Oguri entra con una animación breve; a los pocos segundos pasa de imagen a idle sin saltos.
3. Flechas, L/R o toque cambian la opción activa; Enter abre la pantalla con el barrido y Oguri entra desde la derecha, rotado. La pantalla muestra el marco: cabecera con el nombre, panel de contenido y Oguri a la derecha.
4. Esc o Atrás vuelve al menú con Oguri a la izquierda y la opción anterior resaltada.
5. Un clic durante la transición lleva al destino de inmediato.
6. En System, activar el sonido: suena `levelup`; navegar y comprobar `cursor`, `confirm`, `open`, `cancel` y `close`. Recargar: el interruptor conserva el estado.
7. Activar el movimiento reducido (interruptor del encabezado o del sistema): sin barridos, sin idle, solo la imagen fija.

## 3. Móvil (390 px) y tableta (768 px)

1. En 390 px: Oguri detrás de las opciones, recortado por el borde derecho y atenuado; las cinco opciones completas, encima, a todo el ancho; sin desplazamiento horizontal.
2. Pantallas internas en 390 px: el panel de contenido a todo el ancho, con Oguri detrás.
3. En 768 px: el menú en dos columnas; en las pantallas, Oguri detrás del panel (el lateral aparece desde 1024 px).

## 4. Pruebas automáticas

```bash
npm run test:unit
npx playwright test --workers=2     # un navegador a la vez si la memoria es limitada
npm run verify                      # lint, unitarias, compilación, E2E y auditoría
```

Comprueban, entre otras cosas: ninguna petición de `idle.webm` ni de `/audio/` en la carga; el idle solo tras el reposo y sin movimiento reducido; sin desplazamiento horizontal en 390, 768 y 1280 px; las opciones no quedan tapadas por el personaje; el interruptor de sonido (`aria-pressed`) y su persistencia; la duración de la transición entre 500 y 800 ms y su interrupción.

## 5. Rendimiento y accesibilidad

| Fecha | Ruta | Escenario | Rendimiento | Accesibilidad | KiB |
|---|---|---|---|---|---|
| 2026-10-23 | `/es` (producción local) | Splash visible, idle bajo demanda | 85, 82 y 84 | 100 | 281.3 |
| 2026-10-23 | `/es/stack` (producción local) | Entrada directa, sin splash | 82, 83 y 84 | 100 | 267.8 |
| 2026-10-23 | `https://p3r-portfolio-v2.vercel.app/es` (producción) | Splash visible, idle bajo demanda | 84, 87 y 87 | 100 | 285.2 |
| 2026-10-23 | `https://p3r-portfolio-v2.vercel.app/es/stack` (producción) | Entrada directa, sin splash | 87, 88 y 85 | 100 | 272.2 |
| (pendiente) | PageSpeed Insights (web de Google) | Lo ejecuta Edward | | | |

Metas: carga inicial ≤ 350 KiB, accesibilidad 100 y rendimiento ≥ 90 en la dirección pública (en local, al nivel de la fase 2: 85 a 86). axe-core debe dar 0 violaciones en el menú y las cinco pantallas, en español e inglés, a 390 y 1280 px.

## 6. Revisión final

- Comparar el menú con la referencia visual (captura de la v1) y el barrido con el video de referencia, por tramos de tiempo.
- Ejecutar `/review-animations` (lo lanza Edward) y resolver los hallazgos.
- Probar en un móvil real: fluidez del barrido con el idle, y que el gesto "atrás" del sistema no choque con el deslizamiento.
