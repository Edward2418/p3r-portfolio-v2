# Plan de implementación: Fase 1 — Base y datos

**Rama**: `001-base-y-datos` | **Fecha**: 2026-10-22 | **Especificación**: [spec.md](./spec.md)

**Entrada**: Especificación de la funcionalidad en `specs/001-base-y-datos/spec.md`

## Resumen

Dejar el terreno técnico listo para las fases siguientes: un proyecto Next.js desplegado en Vercel con rutas por idioma (`/es` y `/en`), contenido bilingüe en datos TypeScript tipados, un selector de idioma que conserva la elección, tokens de diseño centralizados (paleta "Medianoche y cian", Anton e Inter) y pruebas automáticas (unitarias y E2E). La página inicial es de verificación: muestra todos los datos sin diseño P3R ni animaciones. Enfoque técnico resuelto en [research.md](./research.md): `app/[lang]` + `proxy.ts`, sin librería de i18n, cookie `lang`, validación por tipos y pruebas, tokens en `@theme` de Tailwind 4.

## Contexto técnico

**Lenguaje/Versión**: TypeScript 7 sobre Node.js `>=22.18` (la máquina local usa 24.20)

**Dependencias principales**: Next.js 16.4.2, React 19.3.1, Tailwind CSS 4.3.3; sin librería de i18n ni de validación (ver D3 y D5)

**Almacenamiento**: archivos TypeScript en `src/content/`; la preferencia de idioma va en una cookie `lang`

**Pruebas**: `node --test` para unitarias; `@playwright/test` 1.64.1 para E2E; Lighthouse bajo demanda con `npx`

**Plataforma de destino**: navegadores de escritorio y móvil (Chromium y Firefox; WebKit pendiente); despliegue en Vercel

**Tipo de proyecto**: aplicación web de un solo proyecto (frontend con renderizado estático, sin backend propio)

**Objetivos de rendimiento**: Lighthouse móvil rendimiento ≥ 90 y accesibilidad 100; carga inicial ≤ 350 KiB; contenido visible en menos de 5 s

**Restricciones**: sin desplazamiento horizontal en 390, 768 y 1280 px; contraste AA; sin secretos en el repositorio; sin dependencias nuevas sin justificar; no escribir reglas propias en `AGENTS.md`

**Escala/Alcance**: 2 rutas estáticas, 1 página, 5 colecciones de datos, 1 proyecto; sin cuentas ni servidor propio

## Verificación de la constitución

*Puerta: debe pasar antes de la Fase 0 y revisarse tras el diseño de la Fase 1.*

| Principio / regla | Evaluación inicial | Evaluación tras el diseño |
|---|---|---|
| I. Contenido primero | Cumple: sin splash ni animaciones; el contenido se ve de inmediato. | Cumple: página estática con todo el contenido en el HTML. |
| II. Movimiento fiel a la referencia | No aplica: sin movimiento en esta fase. Se definen duraciones y curvas como tokens. | Cumple: tokens `--duration-*` y `--ease-*` listos; sin animaciones que revisar. |
| III. Accesibilidad | Cumple por diseño: `lang`, foco visible, AA, teclado, sin desplazamiento horizontal. | Cumple, con ajuste: el rojo original no cumple AA para texto normal; se añaden `--color-red-text` y `--color-red-fill` y una prueba de contraste (D8). |
| IV. Contenido en datos tipados y bilingüe | Cumple: `Localized` obliga a ambos idiomas; componentes sin textos. | Cumple: [data-model.md](./data-model.md), textos de interfaz en `UiText`, validación por compilador y pruebas. |
| V. Honestidad y derechos | Cumple: bloques de ejemplo con `provisional`; no se inventan datos. | Cumple: etiqueta "Provisional"; aviso de no afiliación en el pie de la página inicial (FR-019); el texto del proyecto también se marca provisional hasta que Edward lo confirme. |
| VI. Fases y trazabilidad | Cumple: solo alcance de la fase 1. | Cumple: trazabilidad en [tasks.md](./tasks.md) (se genera con `/speckit-tasks`). |
| Stack | Cumple: Next 16, React 19, TypeScript, Tailwind 4, Vercel, Playwright, `node --test`. | Cumple. |
| Rendimiento y carga bajo demanda | Cumple: sin audio ni video; fuentes propias. | Cumple; se mide al cerrar la fase. |
| Seguridad y privacidad | Cumple: sin secretos ni analítica; la cookie solo guarda `es` o `en`. | Cumple; `npm audit --omit=dev` antes de desplegar. |
| Dependencias | Cumple: solo las del stack y Playwright. | Cumple: se evitan `negotiator`, `@formatjs/*`, zod y `tsx` (justificado en D3–D6). |

**Resultado de la puerta**: sin violaciones. No se requiere seguimiento de complejidad.

## Estructura del proyecto

### Documentación (esta funcionalidad)

```text
specs/001-base-y-datos/
├── plan.md              # Este archivo (salida de /speckit-plan)
├── research.md          # Fase 0 (salida de /speckit-plan)
├── data-model.md        # Fase 1 (salida de /speckit-plan)
├── quickstart.md        # Fase 1 (salida de /speckit-plan)
├── contracts/
│   └── routing-i18n.md  # Fase 1: rutas, cookie y atributos observables
├── checklists/
│   └── requirements.md  # Calidad de la especificación
└── tasks.md             # Fase 2 (salida de /speckit-tasks; no lo crea /speckit-plan)
```

### Código fuente (raíz del repositorio)

```text
src/
├── app/
│   ├── globals.css          # Tokens de diseño (@theme) y estilos base
│   └── [lang]/
│       ├── layout.tsx       # <html lang>, fuentes, metadatos, generateStaticParams
│       ├── page.tsx         # Página inicial de verificación
│       └── not-found.tsx    # 404 en el idioma resuelto
├── proxy.ts                 # Redirección de idioma (cookie > Accept-Language > en)
├── components/              # Solo presentación; sin textos de contenido
│   ├── LanguageSwitcher.tsx
│   ├── Footer.tsx           # Aviso de no afiliación (FR-019)
│   ├── ProvisionalBadge.tsx
│   └── sections/            # Perfil, stack, proyectos, personajes, contacto
├── content/                 # Datos tipados y bilingües
│   ├── types.ts             # Localized, Lang y tipos de las entidades
│   ├── profile.ts
│   ├── stack.ts
│   ├── projects.ts
│   ├── characters.ts
│   ├── contact.ts
│   └── ui-text.ts
└── lib/
    └── i18n/
        ├── config.ts        # Idiomas soportados, idioma por defecto, nombre de la cookie
        ├── localize.ts      # localize(valor, lang)
        └── negotiate.ts     # Análisis de Accept-Language y prioridad de idioma

tests/
├── unit/                    # node --test: idioma, datos, contraste de tokens
└── e2e/                     # Playwright: idioma, persistencia, datos opcionales, anchos

public/                      # Solo recursos estáticos mínimos
.nvmrc                       # Versión de Node
playwright.config.ts
```

**Decisión de estructura**: proyecto único en la raíz (sin separar frontend y backend, porque no hay backend propio). Se genera con `create-next-app` en una carpeta temporal y se copia a la raíz para no pisar `docs/`, `specs/`, `.specify/`, `.claude/` ni `CLAUDE.md` (D12).

## Seguimiento de complejidad

Sin violaciones de la constitución; no aplica.

## Riesgos y puntos a verificar al implementar

- **Next.js 16**: leer `node_modules/next/dist/docs/` tras instalar, en especial la guía de internacionalización y `proxy`, antes de escribir código de Next (regla del contexto maestro). Confirmar nombres exactos de archivo y de helpers de tipos.
- **TypeScript 7**: confirmar compatibilidad con Next 16 y el lint; si no, usar la versión que traiga `create-next-app` y anotarlo en `research.md`.
- **Pruebas `.ts` nativas**: si la eliminación de tipos de Node da problemas con las importaciones, evaluar `tsx` como dependencia de desarrollo con justificación.
- **Cookie y almacenamiento bloqueado**: si el visitante bloquea cookies, el idioma sigue funcionando por la ruta durante la visita (caso límite de la especificación); cubrirlo con una prueba E2E.
- **Rama y despliegue**: la fase se trabaja en la rama `001-base-y-datos`, cuyos pushes generan vistas previas de Vercel; solo se fusiona a `main` (producción) cuando `npm run verify` pasa.
- **Puerta de publicación**: `vercel.json` ejecuta `npm run test:unit && npm run build` en cada despliegue, de modo que un fallo impide publicar (FR-011, FR-016). Las pruebas E2E no corren en Vercel; se ejecutan en local con `npm run verify` antes de fusionar.
- **Repositorio remoto**: `origin` apunta a `Edward2418/p3r-portfolio-v2`; falta que Edward conecte ese repositorio a un proyecto de Vercel y confirme los permisos.
- **WebKit/Safari**: verificación pendiente, según el contexto maestro.
