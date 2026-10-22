# Guía de validación rápida: Fase 1 — Base y datos

**Especificación**: [spec.md](./spec.md) | **Contrato**: [contracts/routing-i18n.md](./contracts/routing-i18n.md) | **Modelo**: [data-model.md](./data-model.md)

Guía para comprobar de extremo a extremo que la fase funciona. No contiene código de implementación.

## Requisitos previos

- Node.js `>=22.18` y npm (`node -v`, `npm -v`).
- Repositorio clonado y dependencias instaladas con `npm ci`.
- Para el paso de despliegue: cuenta de Vercel con el repositorio de GitHub conectado.

## 1. Verificaciones automáticas (CA-8)

| Comando | Resultado esperado |
|---|---|
| `npm run lint` | Sin errores. |
| `npm run build` | Compilación de producción correcta; rutas `/es` y `/en` generadas. |
| `npm run test:unit` | Todas las pruebas unitarias pasan (idioma, datos, contraste de tokens). |
| `npm run test:e2e` | Pruebas de extremo a extremo pasan en 390, 768 y 1280 px (Chromium) y 1280 px (Firefox). |
| `npm audit --omit=dev` | Sin vulnerabilidades altas o críticas en producción. |

## 2. Recorrido manual (flujo demostrable)

Ejecuta `npm run build` y `npm run start`, o abre la dirección pública de Vercel.

1. Con el navegador en español, abre `/`: te lleva a `/es` y los textos están en español (US1, CA-2).
2. Con el navegador en inglés, o en otro idioma como francés, abre `/`: te lleva a `/en` (FR-003).
3. En `/es`, usa el selector de idioma: la página pasa a `/en`, todos los textos cambian y `<html lang>` es `en` (US2, CA-3).
4. Recarga la página: sigue en `/en`. Abre `/` de nuevo: te lleva a `/en` por la cookie `lang`.
5. Abre `/es` directamente con la cookie en `en`: se queda en `/es` (la ruta explícita manda).
6. Con el teclado: tabula hasta el selector, comprueba el foco visible y actívalo con Enter.
7. Comprueba que se ven el nombre, el enlace a GitHub, la ficha del proyecto y la etiqueta "Provisional" en perfil, niveles del stack y personajes (FR-002, FR-012).
8. Con el correo, LinkedIn, CV y la demo sin dirección: no hay enlaces rotos, botones vacíos ni huecos (CA-5).

## 3. Contenido sin tocar componentes (CA-4, CA-6)

1. Agrega un segundo proyecto de prueba solo en `src/content/projects.ts`.
2. Comprueba que aparece en `/es` y `/en` sin cambiar ningún archivo de `src/components/`.
3. Quita un texto de un idioma: `npm run build` o `npm run test:unit` debe fallar.
4. Revierte el proyecto de prueba.

## 4. Tokens de diseño (CA-7)

1. Cambia `--color-cyan` en `src/app/globals.css`.
2. Comprueba que la página inicial usa el nuevo color sin otros cambios.
3. Revierte el cambio y ejecuta `npm run test:unit` para confirmar que el contraste AA se mantiene.

## 5. Rendimiento y accesibilidad (CA-9, CA-10)

1. Con la compilación de producción en marcha, ejecuta Lighthouse móvil sobre `/es` y `/en`:
   `npx lighthouse http://localhost:3000/es --form-factor=mobile --only-categories=performance,accessibility`
2. Esperado: rendimiento ≥ 90 y accesibilidad 100.
3. Esperado: carga inicial ≤ 350 KiB transferidos (pestaña Red de las herramientas del navegador).
4. Repite sobre la dirección pública de Vercel.
5. Anota los resultados en este archivo.

| Fecha | Dirección | Rendimiento | Accesibilidad | KiB transferidos |
|---|---|---|---|---|
| (pendiente) | | | | |

## 6. Despliegue (CA-1)

1. Haz push a `main`: Vercel despliega a producción.
2. Abre la dirección pública `*.vercel.app` y repite el recorrido manual del punto 2.
3. Confirma que un push en otra rama genera una vista previa y que `main` no cambia.
