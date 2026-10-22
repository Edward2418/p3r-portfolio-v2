# Investigación (Fase 0): Fase 1 — Base y datos

**Fecha**: 2026-10-22 | **Especificación**: [spec.md](./spec.md)

Cada decisión indica su razón y las alternativas evaluadas, para poder explicarla en una entrevista.
Las versiones se consultaron en el registro de npm el 2026-10-22.

## D1. Versión de Node y gestor de paquetes

- **Decisión**: Node.js `>=22.18` (la máquina de Edward usa 24.20) y **npm** (11.x). Se declara en `engines` de `package.json` y en `.nvmrc` (`22`).
- **Razón**: Next.js 16 exige `>=20.9`. Node 22 es LTS y Vercel lo soporta. Desde Node 22.18 el ejecutor de pruebas nativo ejecuta archivos `.ts` sin configuración (ver D6). npm es el gestor de la v1 y el que cursa Edward: nada nuevo que aprender.
- **Alternativas**: pnpm o bun (más rápidos, pero añaden una herramienta sin necesidad); Node 20 (llega a fin de vida antes y no ejecuta `.ts` de forma nativa).

## D2. Versiones del stack

- **Decisión**: Next.js `16.4.2`, React `19.3.1`, Tailwind CSS `4.3.3`, TypeScript `7.0.2`, `@playwright/test` `1.64.1`. Se fijan al crear el proyecto con `create-next-app` y se registran en `package-lock.json`.
- **Razón**: son las últimas estables y cumplen el stack heredado. El lockfile garantiza un despliegue repetible (FR-017).
- **Pendiente de verificar al implementar**: si TypeScript 7 funciona con las herramientas de Next 16 y de lint; si no, se usa la versión que traiga `create-next-app`. Se anotará en este archivo.
- **Regla heredada**: antes de escribir código de Next, leer `node_modules/next/dist/docs/` (aún no existe; se instala en la primera tarea).

## D3. Idioma: rutas por idioma, sin librería

- **Decisión**: segmento dinámico `app/[lang]/` con `lang` ∈ {`es`, `en`}; `generateStaticParams` genera ambas rutas estáticas; `proxy.ts` (reemplaza a `middleware` en Next 16) redirige `/` y cualquier ruta sin idioma al idioma correspondiente. Sin librería de i18n.
- **Razón**:
  - La guía oficial de Next 16 (`guides/internationalization`, actualizada 2026-06-10) usa exactamente este patrón: `[lang]`, `proxy`, `params` asíncrono y `hasLocale` + `notFound()`.
  - El contenido ya vive en datos con `{ es, en }` por campo (Principio IV); la librería resolvería un problema que no tenemos (diccionarios por archivo, plurales, formatos). Dos idiomas fijos no justifican una dependencia (restricción: "sin dependencias nuevas sin justificarlas").
  - Rutas por idioma dan enlaces compartibles en un idioma concreto y mejor SEO (decisión de Edward).
- **Alternativas**: `next-intl` (completa pero innecesaria aquí; se puede adoptar si en el futuro se agregan más idiomas); idioma solo en el cliente (descartado por Edward: peor SEO y enlaces).
- **Detalle**: el idioma del documento se fija en el `<html lang>` del layout raíz, que está dentro de `app/[lang]/` (CA-3).

## D4. Negociación y persistencia del idioma

- **Decisión**: orden de prioridad en `proxy.ts` para rutas sin idioma: (1) cookie `lang` si es válida, (2) cabecera `Accept-Language` analizada con una función propia pequeña, (3) inglés. Una ruta que ya trae `/es` o `/en` se respeta siempre. El selector de idioma es un enlace a la misma página en el otro idioma y, al pulsarlo, escribe la cookie `lang` (`SameSite=Lax`, 1 año, sin datos personales).
- **Razón**: `proxy.ts` solo puede leer cookies y cabeceras, no `localStorage`, por eso la preferencia va en una cookie. Un enlace real funciona sin JavaScript y con teclado. La URL explícita manda sobre la cookie para que un enlace compartido abra el idioma indicado (decisión de Edward). El inglés por defecto es decisión de Edward.
- **Alternativas**: `negotiator` + `@formatjs/intl-localematcher` (los usa la guía, pero son dos dependencias para analizar una cabecera con dos idiomas; la función propia son ~20 líneas con pruebas unitarias); `localStorage` (no lo lee el proxy y provoca un parpadeo).
- **Privacidad**: la cookie guarda solo `es` o `en`; no hay analítica ni datos personales. No requiere aviso de cookies por ser estrictamente funcional; se menciona en System en la fase 6.

## D5. Formato y validación del contenido

- **Decisión**: archivos TypeScript en `src/content/` con tipos propios. Todo texto traducible usa el tipo `Localized` (`{ es: string; en: string }`); los datos opcionales usan `?`; los bloques de ejemplo llevan `provisional: true`. Validación en dos capas: (1) el compilador (un idioma faltante no compila, FR-011); (2) pruebas unitarias que recorren los datos y fallan si hay textos vacíos, enlaces mal formados o IDs repetidos.
- **Razón**: es lo que define el contexto maestro (datos tipados). No añade dependencias. Una librería de esquemas (como zod) solo se justificaría con datos que vengan de fuera del código; aquí no hay.
- **Alternativas**: JSON/MDX + zod (más flexible, pero otra dependencia y se pierde el chequeo del compilador); CMS (fuera de alcance).

## D6. Pruebas unitarias

- **Decisión**: `node --test` con importación directa de archivos `.ts` (eliminación de tipos nativa de Node ≥ 22.18). Las importaciones entre archivos de `src/lib` y `src/content` usan extensión `.ts` explícita, con `allowImportingTsExtensions` en `tsconfig.json`.
- **Razón**: restricción heredada (ejecutor nativo de Node). Evita añadir `tsx` o `vitest`.
- **Riesgo**: la eliminación de tipos no admite `enum` ni `namespace`; se evitan. Si resultara incómodo, la alternativa justificada es `tsx` como dependencia de desarrollo.
- **Cobertura**: negociación de idioma, función `localize`, forma y completitud de los datos, contraste AA de los tokens.

## D7. Pruebas de extremo a extremo y rendimiento

- **Decisión**: Playwright con proyectos Chromium a 390, 768 y 1280 px y un proyecto Firefox a 1280 px (la constitución exige Chromium y Firefox). Las pruebas cubren: idioma inicial según navegador y según cookie, cambio y persistencia, `lang` del documento, dato opcional vacío, ausencia de desplazamiento horizontal (`scrollWidth <= clientWidth`) y foco visible del selector.
- **Lighthouse**: se ejecuta bajo demanda con `npx lighthouse` sobre la compilación de producción (sin instalarlo como dependencia) y el resultado se anota en `quickstart.md`. Meta: rendimiento ≥ 90, accesibilidad 100, y ≤ 350 KiB transferidos.
- **Razón**: Playwright es el stack acordado. Lighthouse no necesita estar en el proyecto para medir al cerrar la fase. WebKit queda pendiente según el contexto maestro.

## D8. Tokens de diseño

- **Decisión**: un único archivo, `src/app/globals.css`, con el bloque `@theme` de Tailwind 4. Los tokens se exponen como variables CSS (`--color-*`, `--font-*`, `--duration-*`, `--ease-*`) y los componentes los usan mediante clases de Tailwind o `var()`. Las duraciones y curvas se definen ya (aunque la fase 1 no anima) para que las fases siguientes las hereden (US4).
- **Valores (paleta "Medianoche y cian", decisión de Edward)**:

| Token | Valor | Uso |
|---|---|---|
| `--color-bg` | `#050B1F` | Fondo |
| `--color-text` | `#F2F7FF` | Texto principal |
| `--color-cyan` | `#3FD8FF` | Acento principal |
| `--color-red` | `#E8203A` | Marca para lo activo: relleno, bordes y texto grande |
| `--color-red-text` | `#F03A52` | Rojo para texto pequeño sobre el fondo |
| `--color-red-fill` | `#C4122B` | Relleno rojo con texto claro encima |
| `--duration-fast/base/slow` | `150ms / 250ms / 600ms` | Escala de movimiento (la transición completa de la fase 2 será de 500 a 800 ms) |
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Curva por defecto |

- **Hallazgo de contraste (calculado el 2026-10-22, fórmula WCAG)**:

| Par | Relación | AA texto normal (4.5) | AA texto grande y gráficos (3) |
|---|---|---|---|
| Texto `#F2F7FF` sobre fondo | 18.18 | Cumple | Cumple |
| Cian `#3FD8FF` sobre fondo | 11.62 | Cumple | Cumple |
| Rojo `#E8203A` sobre fondo | 4.37 | **No cumple** | Cumple |
| Texto claro sobre rojo `#E8203A` | 4.15 | **No cumple** | Cumple |
| Rojo `#F03A52` sobre fondo | 5.06 | Cumple | Cumple |
| Texto claro sobre `#C4122B` | 5.63 | Cumple | Cumple |

  El rojo propuesto originalmente no cumple AA para texto normal. Se conserva como color de marca para rellenos, bordes y texto grande, y se añaden `--color-red-text` y `--color-red-fill` para los usos con texto pequeño. Una prueba unitaria recalcula estos pares desde `globals.css` y falla si alguno baja del umbral.
- **Alternativas**: archivo TypeScript de tokens (duplicaría valores entre CSS y TS); variables sueltas por componente (rompe CA-7).

## D9. Tipografías

- **Decisión**: Anton (títulos) e Inter (texto) con `next/font/google`, que las descarga en la compilación y las sirve desde el propio dominio. Subconjunto `latin`, `display: swap`; solo los pesos usados (Anton 400; Inter variable).
- **Razón**: sin petición a Google en tiempo de ejecución (privacidad y rendimiento), tipografías ya elegidas por Edward. La carga se vigila contra el presupuesto de 350 KiB.
- **Alternativas**: fuentes del sistema (sin identidad); archivos de fuente propios (más mantenimiento).

## D10. Despliegue en Vercel

- **Decisión**: repositorio de GitHub conectado a un proyecto de Vercel; cada push a `main` despliega a producción y las demás ramas generan vistas previas. Nombre de proyecto limpio para obtener una dirección `*.vercel.app` legible (decisión de Edward: sin dominio propio por ahora). Sin variables de entorno en esta fase (no hace falta `.env.example`; si aparecen, se agrega).
- **Razón**: es lo más simple y repetible (FR-017). Antes de fusionar a `main` se ejecuta `npm run verify` (lint, compilación, pruebas unitarias, E2E y `npm audit --omit=dev`).
- **Puerta de publicación (añadido tras `/speckit-analyze`, hallazgo E1)**: `vercel.json` define `buildCommand` como `npm run test:unit && npm run build`. Así, un fallo de pruebas unitarias (por ejemplo un texto vacío en un idioma que el compilador no detecta) o de compilación impide el despliegue, en vistas previas y en producción. Las pruebas E2E necesitan navegadores y no corren en Vercel; se ejecutan en local con `npm run verify`. Alternativa descartada por ahora: un flujo de CI en GitHub Actions (más piezas que mantener para una sola persona).
- **Flujo de ramas (añadido tras `/speckit-analyze`, hallazgo I1)**: la fase se trabaja en la rama `001-base-y-datos`; cada push genera una vista previa sin tocar producción. Se fusiona a `main` mediante pull request solo cuando `npm run verify` pasa. Evita que commits intermedios (por ejemplo con el proyecto vacío) rompan producción.
- **Alternativas**: despliegue manual con la CLI (menos repetible); otro proveedor (fuera del stack).
- **Acción de Edward**: crear el proyecto en Vercel, conectarlo al repositorio `Edward2418/p3r-portfolio-v2` (ya es el `origin` local) y elegir el nombre. Falta confirmar que el repositorio existe en GitHub y tiene permisos para Vercel.

## D11. Estructura de la página inicial

- **Decisión**: una página de verificación, sin diseño P3R ni animaciones: encabezado con nombre y selector de idioma, y secciones sencillas de perfil, stack, proyecto, personajes y contacto, todas alimentadas por los datos. Los bloques con `provisional: true` muestran la etiqueta "Provisional" (FR-012). Los enlaces sin dirección no se renderizan (FR-009).
- **Razón**: la fase 1 debe probar el flujo completo de datos y de idioma (US1–US3) sin adelantar el diseño de la fase 2. Mostrar todas las colecciones permite detectar datos rotos cuanto antes.

## D12. Estructura del repositorio

- **Decisión**: proyecto único en la raíz del repositorio (`src/`, `tests/`), generado con `create-next-app` en una carpeta temporal y copiado a la raíz, porque la raíz ya contiene `docs/`, `specs/`, `.specify/` y `.claude/`. No se sobrescribe `CLAUDE.md`; las reglas propias no se ponen en `AGENTS.md` (lo regenera `next dev`).
- **Razón**: `create-next-app` sobre una carpeta no vacía puede pisar archivos. Un solo proyecto basta; no hay backend propio.

## Resumen de resolución

Todas las decisiones diferidas de `spec.md` y de la sección 9 del insumo de la fase quedan resueltas: idioma (D3, D4), librería de i18n (D3), formato de datos (D5), tokens (D8, D9), dirección pública (D10), Node y gestor (D1). No quedan marcadores `NEEDS CLARIFICATION`.

## Registro de implementación (cambios respecto al plan)

### R1. Versiones instaladas (T003)

| Paquete | Plan (D2) | Instalado | Nota |
|---|---|---|---|
| Next.js | 16.4.2 | 16.4.2 | Fijada por `create-next-app` |
| React / React DOM | 19.3.1 | 19.3.0 | Versión que fija la plantilla de Next 16.4.2 |
| Tailwind CSS | 4.3.3 | 4.3.3 | Se procesa con `@tailwindcss/turbopack` (cargador configurado en `next.config.ts`) |
| TypeScript | 7.0.2 | **5.9.3** | La plantilla y `typescript-eslint` usan la serie 5; no se forzó la 7 para no arriesgar la compatibilidad. Se puede reevaluar más adelante |
| `@types/node` | — | ^22 | La plantilla traía ^20; se sube a 22 para tipar `node:test` con el mismo Node mínimo (`>=22.18`) |
| `@playwright/test` | 1.64.1 | 1.64.1 | |

### R2. `cacheComponents` desactivado (T004)

La plantilla activa `cacheComponents: true` y `partialPrefetching: true`. Se quitaron de `next.config.ts` porque:

- El sitio es estático y no necesita caché por componente ni prerrenderizado parcial.
- Con Cache Components, `generateStaticParams` no puede devolver una lista vacía y el acceso a datos dinámicos se vuelve estricto: complejidad sin beneficio en esta fase.
- Si más adelante se necesita, se activa de forma explícita (la guía indica que será el comportamiento por defecto en la próxima versión mayor).

### R3. Guías leídas en `node_modules/next/dist/docs/` (T004)

- `01-app/02-guides/internationalization.md`: confirma `app/[lang]`, `proxy.ts` (la convención `middleware` está obsoleta), `params` asíncrono, `PageProps`/`LayoutProps` globales, `hasLocale` + `notFound()` y `generateStaticParams`. Coincide con D3.
- `01-app/03-api-reference/03-file-conventions/proxy.md`: `proxy.ts` va en la raíz o dentro de `src/`; sin `matcher` se ejecuta en todas las peticiones, incluidos los archivos estáticos, por lo que se usa un patrón de exclusión.
- `01-app/03-api-reference/04-functions/generate-static-params.md`: sin Cache Components se admite el flujo estándar.

### R4. Importaciones en el código probado por Node (T005)

Node no resuelve el alias `@/`. Los archivos de `src/lib` y `src/content` que cubren las pruebas unitarias usan **importaciones relativas con extensión `.ts`** (`allowImportingTsExtensions` está activo).

### R5. Scripts de npm (T005)

`test:e2e` compila antes mediante `pretest:e2e` (`npm run build`) y levanta `next start` con Playwright. Por eso `verify` no repite `build`: ejecuta `lint`, `test:unit`, `test:e2e` (que compila) y `npm audit --omit=dev`.

### R6. Rutas inexistentes (T036)

Las rutas que no existen (por ejemplo `/en/foo` o `/fr`) devuelven 404 con la página por defecto de Next.js, en inglés. La página `not-found.tsx` localizada solo se muestra cuando una página de `[lang]` llama a `notFound()`. Una página 404 global localizada exigiría `global-not-found.js`, que la documentación marca como experimental; se pospone a la fase 6.

### R7. Mediciones locales y ajustes de Lighthouse (T053)

Medición con Lighthouse 12 móvil sobre la compilación de producción local, el 2026-10-22:

| Categoría | Resultado | Meta |
|---|---|---|
| Rendimiento | 85–86 (tres corridas estables; la primera, antes de los ajustes, dio 80–85) | ≥ 90 |
| Accesibilidad | 100 | 100 |
| SEO | 100 (antes 90) | ≥ 95 |
| Prácticas recomendadas | 96 | — |
| Transferido | 204.6 KiB | ≤ 350 KiB |

Ajustes hechos a partir de la medición:

- **hreflang:** se quitaron las alternativas de idioma (`alternates`) de los metadatos porque Lighthouse exige URL absolutas y aún no hay dominio definitivo. Se retoman en la fase 6 (SEO) con `metadataBase`.
- **label-content-name-mismatch:** el nombre accesible del selector de idioma ahora empieza con el texto visible (`English — Switch to Spanish`).

**Rendimiento por debajo de la meta en local:** casi todo el bloqueo (TBT de 430–480 ms con CPU limitada 4×) es una sola tarea larga de unos 448 ms en el script de 70 KiB del entorno de ejecución de React y Next, no código del proyecto. El índice de rendimiento de la máquina (940) es comparable a la referencia de Lighthouse. La medición que cuenta para CA-9 es la de la dirección pública de Vercel (compresión, HTTP/2 y CDN); si allí queda por debajo de 90, se investiga en esta fase (hidratación, `browserslist`, CSS en línea).
