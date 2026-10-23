# Guía de validación rápida: Fase 2 — Escena y menú

**Especificación**: [spec.md](./spec.md) | **Contratos**: [contracts/](./contracts/) | **Modelo**: [data-model.md](./data-model.md)

Guía para comprobar de extremo a extremo que la fase funciona. No contiene código de implementación.

## Requisitos previos

- Node.js `>=22.18` y npm; dependencias instaladas con `npm ci`.
- Navegadores de Playwright instalados (`npx playwright install`).
- Para la calibración con el video de referencia: la ruta del video (fuera del repositorio) y `ffmpeg` instalado, o los cuadros de 70.3 a 71.7 s ya extraídos.
- Trabajar en la rama `002-escena-y-menu`; cada push genera una vista previa de Vercel.

## 1. Verificaciones automáticas

| Comando | Resultado esperado |
|---|---|
| `npm run lint` | Sin errores. |
| `npm run test:unit` | Pasan datos del menú, tokens (suma de tramos de 500 a 800 ms), `nextIndex`, `detectSwipe` y preferencia de movimiento. |
| `npm run test:e2e` | Compila y pasa en 390, 768 y 1280 px (Chromium) y 1280 px (Firefox): navegación, splash, movimiento reducido, interrupciones y desplazamiento horizontal. |
| `npm audit --omit=dev` | Sin vulnerabilidades altas o críticas en producción. |
| `npm run verify` | Todo lo anterior en orden. |

## 2. Recorrido manual (flujo demostrable)

Ejecuta `npm run build` y `npm run start`, o abre la vista previa de Vercel, con una pestaña nueva.

1. Abre `/`: llega a `/es` o `/en` y ves el splash; cualquier tecla, clic o toque lo cierra. Sin tocar nada, se cierra solo a los 1.5 s (SC-001).
2. Recarga: el splash no vuelve en la misma sesión. Abre una pestaña nueva: vuelve a verse.
3. Abre un enlace directo, por ejemplo `/es/projects`: ves la pantalla sin splash. Pulsa Esc para volver al menú: el splash tampoco aparece en esa sesión, y el menú resalta la opción Proyectos.
4. En el menú comprueba las cinco opciones en orden, la activa resaltada, el título de fondo, el marcador del personaje a la izquierda y la guía y los botones abajo a la derecha.
5. Con el teclado: ↑ ↓, Inicio y Fin cambian la opción activa; Enter abre la pantalla con la transición (contrato [scene-transition.md](./contracts/scene-transition.md)).
6. En la pantalla: ← → (o RePág y AvPág) pasan a la anterior o siguiente; Esc vuelve al menú.
7. Interrupción: abre una pantalla y pulsa una tecla o haz clic a mitad de la transición: el destino aparece de inmediato y nada queda a medias. Repite varias veces seguidas.
8. En un móvil (o con emulación táctil): toca las opciones, desliza horizontalmente para pasar de pantalla, desliza en vertical para leer (no debe cambiar de pantalla) y usa las pestañas L y R.
9. Movimiento reducido: activa el interruptor del encabezado (o la preferencia del sistema) y repite 5 a 7: sin barridos ni desplazamientos, solo fundidos cortos. Recarga y comprueba que se recuerda.
10. Cambia de idioma con el selector: la pantalla actual pasa al otro idioma (`/es/stack` ↔ `/en/stack`) y todos los textos cambian.
11. Con lector de pantalla: el cambio de pantalla se anuncia y el foco queda en el encabezado de la pantalla.

## 3. Calibración con el video de referencia (SC-008)

1. Extrae los cuadros de 70.3 a 71.7 s del video (por tramos: salida, entrada, pausa, cierre, menú).
2. Mide cuánto dura cada tramo y su proporción respecto al total.
3. Ajusta los tokens de `src/app/globals.css` (`--duration-*`, `--stagger-step`) manteniendo la suma entre 500 y 800 ms.
4. Reproduce la transición a velocidad reducida (por ejemplo con el inspector de animaciones de las herramientas del navegador) y compárala tramo a tramo con los cuadros.
5. Ejecuta la skill `review-animations`; Edward confirma que cada tramo está presente y en orden. Anota las diferencias aceptadas en `research.md`.

| Tramo | Referencia (ms) | Implementado (ms) | Observaciones |
|---|---|---|---|
| Salida con barrido (incluye cubrimiento) | ~480 (320 + 160) | 170 | Comprimida al ~35 % |
| Entrada escalonada | ~270 | 260 | Casi a escala real |
| Pausa | ~630 | 70 | Comprimida al ~11 % a propósito |
| Cierre con círculo | ~170 | 200 | Ligeramente más largo para que se aprecie |

## 4. Contenido y datos sin tocar componentes (SC-010)

1. En `src/content/menu.ts` cambia el nombre de una opción o su orden: el menú y las pestañas lo reflejan sin tocar componentes.
2. Quita un idioma de un texto: `npm run test:unit` o la compilación fallan.
3. Cambia `--duration-hold` en `globals.css`: la transición lo refleja sin otros cambios (y la prueba de la suma de tramos sigue pasando mientras esté entre 500 y 800 ms).
4. Revierte los cambios.

## 5. Rendimiento y accesibilidad (SC-006 y SC-012)

1. Con la compilación de producción, ejecuta Lighthouse móvil sobre `/es` en dos condiciones: con el splash visible (pestaña nueva) y después de cerrarlo (recarga en la misma sesión).
   `npx lighthouse http://localhost:3000/es --form-factor=mobile --only-categories=performance,accessibility`
2. Esperado: rendimiento ≥ 90 y accesibilidad 100; carga inicial ≤ 350 KiB.
3. Fluidez: en un móvil de gama media, graba el rendimiento durante la transición con las herramientas de depuración remota y comprueba 60 fotogramas por segundo sin tareas largas. La prueba automática de muestreo con CPU limitada es solo un indicador: SC-006 se verifica de forma manual en el dispositivo.
4. Repite sobre la dirección pública de Vercel.
5. Anota los resultados en la tabla.

| Fecha | Dirección | Condición | Rendimiento | Accesibilidad | KiB |
|---|---|---|---|---|---|
| (pendiente) | | Splash visible | | | |
| (pendiente) | | Splash cerrado | | | |

## 6. Despliegue

1. Haz push a la rama `002-escena-y-menu`: Vercel genera una vista previa y ejecuta `npm run test:unit && npm run build`.
2. Con `npm run verify` pasando y el recorrido de la sección 2 hecho en la vista previa, abre un pull request hacia `main`.
3. Tras fusionar, repite el recorrido sobre `https://p3r-portfolio-v2.vercel.app`.
