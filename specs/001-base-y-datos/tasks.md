---

description: "Lista de tareas de la Fase 1 — Base y datos"
---

# Tareas: Fase 1 — Base y datos

**Entrada**: documentos de diseño en `specs/001-base-y-datos/`

**Requisitos previos**: plan.md, spec.md, research.md, data-model.md, contracts/routing-i18n.md, quickstart.md

**Pruebas**: se incluyen porque la especificación las exige (FR-016, CA-8). Las pruebas de cada historia se escriben primero y deben fallar antes de implementar.

**Organización**: las tareas se agrupan por historia de usuario. Las historias US1, US2 y US3 tienen prioridad P1; US4 y US5, P2.

## Formato: `[ID] [P?] [Historia] Descripción con ruta`

- **[P]**: se puede ejecutar en paralelo (archivos distintos, sin dependencias pendientes)
- **[US#]**: historia de usuario a la que pertenece la tarea
- Reglas del proyecto: comentarios, pruebas y textos visibles en español; identificadores en inglés; antes de escribir código de Next.js, leer `node_modules/next/dist/docs/` (T004); aplicar la skill `vercel-react-best-practices` a los componentes de React y Next.js.

## Convenciones de rutas

Proyecto único en la raíz del repositorio: `src/`, `tests/`, `public/` (ver plan.md, "Código fuente").

---

## Fase 1: Preparación (infraestructura compartida)

**Propósito**: proyecto Next.js funcionando en la raíz, sin pisar `docs/`, `specs/`, `.specify/`, `.claude/` ni `CLAUDE.md`.

- [x] T001 Crear y cambiar a la rama de la fase con `git switch -c 001-base-y-datos` desde `main`, confirmar con `git branch --show-current` y hacer en esa rama todos los commits y pushes de la fase (cada push genera una vista previa de Vercel sin tocar producción)
- [x] T002 Verificar `node -v` (≥ 22.18) y `npm -v`, y crear `.nvmrc` con el contenido `22`
- [x] T003 Generar la aplicación base con `create-next-app` en una carpeta temporal fuera del repositorio (TypeScript, App Router, carpeta `src/`, ESLint, Tailwind CSS, npm) y copiarla a la raíz sin sobrescribir `CLAUDE.md`, `docs/`, `specs/`, `.specify/` ni `.claude/`; fusionar su `.gitignore` con el existente. Comparar las versiones instaladas con `research.md` (D2) y, si TypeScript 7 no es compatible, usar la que traiga la plantilla y anotarlo en `specs/001-base-y-datos/research.md`
- [x] T004 Leer en `node_modules/next/dist/docs/` las guías de internacionalización, `proxy`, `generateStaticParams`, `PageProps`/`LayoutProps` y `next/font`, y anotar en `specs/001-base-y-datos/research.md` cualquier diferencia respecto a lo planeado (nombres de archivo, helpers de tipos)
- [x] T005 Configurar `package.json` (campo `engines` con `"node": ">=22.18"`, scripts `lint`, `build`, `start`, `test:unit` con `node --test`, `test:e2e` con Playwright, `verify`) y `tsconfig.json` (`allowImportingTsExtensions`); confirmar que `.gitignore` cubre `node_modules`, `.next`, `playwright-report`, `test-results` y `.env*` (conservando `.env.example` si se crea)
- [x] T006 [P] Instalar `@playwright/test` como dependencia de desarrollo, descargar Chromium y Firefox, y crear `playwright.config.ts` con proyectos Chromium a 390, 768 y 1280 px de ancho y Firefox a 1280 px, usando el servidor de producción local (`npm run build && npm run start`)
- [x] T007 Eliminar el contenido de ejemplo de `create-next-app` (página inicial, imágenes y estilos de muestra en `src/app/` y `public/`) y comprobar que `npm run lint` y `npm run build` pasan

**Punto de control**: el proyecto compila vacío. Hacer commit (`chore(setup): crear proyecto next con pruebas configuradas`).

---

## Fase 2: Fundamentos (requisitos bloqueantes)

**Propósito**: tipos, utilidades de idioma y tokens que necesitan todas las historias.

**⚠️ CRÍTICO**: ninguna historia puede empezar hasta terminar esta fase.

- [x] T008 [P] Crear `src/content/types.ts` con `Lang` (`'es' | 'en'`), `Localized` (`{ es: string; en: string }`, ambos idiomas obligatorios y no vacíos tras recortar espacios) y los tipos de las entidades de `data-model.md`: `Profile`, `StackCategory` (`id`: `'frontend' | 'backend' | 'data-tools'`), `Technology` (`level`: `1 | 2 | 3 | 4 | 5`), `Project` (`status`: `'planning' | 'in-progress' | 'completed'`; `links` con `repository?` y `demo?`; `screenshots` con `alt: Localized` obligatorio; `provisional?: boolean`), `Character` (`rank` entre 1 y 10), `Contact` (solo `github` obligatorio; `email`, `linkedin`, `cv` opcionales) y `provisional?: boolean` donde aplique
- [x] T009 [P] Crear `src/lib/i18n/config.ts` con los idiomas soportados (`es`, `en`), el idioma por defecto (`en`), el nombre de la cookie (`lang`) y la función `isLang`
- [x] T010 [P] Escribir primero `tests/unit/localize.test.ts` (devuelve el texto del idioma pedido; falla de forma clara con un texto vacío) y comprobar que falla
- [x] T011 Implementar `src/lib/i18n/localize.ts` con `localize(valor, lang)` (depende de T008, T009) y hacer pasar T010
- [x] T012 [P] Definir los tokens en `src/app/globals.css` dentro de `@theme` de Tailwind 4 con los valores de `research.md` (D8): `--color-bg` `#050B1F`, `--color-text` `#F2F7FF`, `--color-cyan` `#3FD8FF`, `--color-red` `#E8203A`, `--color-red-text` `#F03A52`, `--color-red-fill` `#C4122B`, `--duration-fast/base/slow` (`150ms`/`250ms`/`600ms`), `--ease-out` `cubic-bezier(0.23, 1, 0.32, 1)`, y estilos base (fondo, texto, foco visible con contraste AA)
- [x] T013 [P] Configurar Anton (títulos) e Inter (texto) con `next/font/google` en `src/app/fonts.ts` (subconjunto `latin`, `display: swap`, solo los pesos usados) y exponerlas como `--font-display` y `--font-body` en los tokens

**Punto de control**: base lista. Las historias pueden empezar.

---

## Fase 3: Historia de usuario 3 — Mantener todo el contenido como datos (Prioridad: P1)

**Meta**: todo el contenido vive en datos tipados con español e inglés por campo, validados antes de publicar.

**Prueba independiente**: `npm run test:unit` valida los datos; quitar un idioma de un campo hace fallar la compilación o la prueba; una lista con un segundo proyecto de prueba también valida (CA-6, SC-004).

**Orden de ejecución**: esta historia va antes de US1 porque la página inicial necesita los datos.

### Pruebas de la historia 3

> Escribirlas primero y comprobar que fallan.

- [x] T014 [US3] Escribir `tests/unit/content.test.ts` con las reglas de `data-model.md`: todo `Localized` tiene `es` y `en` no vacíos; los `id` son únicos por colección; las categorías de stack son exactamente tres; cada tecnología de un proyecto existe en el stack; los enlaces definidos son URL `https` válidas; `level` entre 1 y 5 y `rank` entre 1 y 10; todo `Screenshot` tiene `alt` en ambos idiomas. Incluir un caso con una lista de dos proyectos de prueba que valide sin tocar código (CA-6)

### Implementación de la historia 3

- [x] T015 [P] [US3] Crear `src/content/profile.ts` con `name`, `headline`, `summary` (`Localized`) y `provisional: true` (texto de ejemplo; no inventar datos personales)
- [x] T016 [P] [US3] Crear `src/content/stack.ts` con exactamente tres categorías (`frontend`, `backend`, `data-tools`), nombres `Localized`, tecnologías con `id` único, `name` y `level` de 1 a 5, marcadas `provisional: true`
- [x] T017 [P] [US3] Crear `src/content/projects.ts` con un solo proyecto, este portafolio: `id`, `title`, `summary` y `description` `Localized`, `technologies` (ids existentes en el stack), `status` y `links` con `repository` (`https://github.com/Edward2418/p3r-portfolio-v2`) y sin `demo` hasta que exista; `screenshots` vacío; `provisional: true` (el texto lo redacta la IA y Edward debe confirmarlo antes de quitar la marca)
- [x] T018 [P] [US3] Crear `src/content/characters.ts` con los personajes de Social Link del contexto maestro (Leon S. Kennedy, Resident Evil, Persona 3 Reload, Super Mario Galaxy): `id`, `name`, `arcana` y `shortText` `Localized`, `rank` entre 1 y 10, `provisional: true`, sin imagen
- [x] T019 [P] [US3] Crear `src/content/contact.ts` con `github` (`https://github.com/Edward2418`) y sin `email`, `linkedin` ni `cv`
- [x] T020 [P] [US3] Crear `src/content/ui-text.ts` con los textos de interfaz como mapa tipado de claves a `Localized`: etiquetas de sección, "Provisional", aviso de no afiliación del pie (proyecto de aprendizaje sin fines comerciales, no afiliado a los propietarios de las franquicias que inspiran el sitio), estados de proyecto, nombre accesible del selector de idioma, enlace a GitHub, título y descripción del documento
- [x] T021 [US3] Crear `src/content/index.ts` que reexporte todas las colecciones y ejecutar `npm run test:unit` hasta que T014 pase

**Punto de control**: los datos validan y la historia 3 se prueba sola. Hacer commit (`feat(content): agregar datos tipados bilingües`).

---

## Fase 4: Historia de usuario 1 — Abrir el sitio público y ver una página inicial en mi idioma (Prioridad: P1) 🎯 MVP

**Meta**: `/` redirige al idioma correcto y `/es` y `/en` muestran la página inicial con todos los datos.

**Prueba independiente**: con el navegador en español, en inglés y en francés, abrir `/` lleva a `/es`, `/en` y `/en`; la página muestra nombre, enlace a GitHub y el proyecto (contrato `routing-i18n.md`).

### Pruebas de la historia 1

- [x] T022 [P] [US1] Escribir `tests/unit/negotiate.test.ts` con la prioridad cookie `lang` > `Accept-Language` > `en`: `es-MX` → `es`, `en-GB` → `en`, `fr` → `en`, cabecera vacía → `en`, cookie inválida ignorada, listas con pesos `q`
- [x] T023 [P] [US1] Escribir `tests/e2e/home.spec.ts` (Playwright, configurando el idioma del navegador): `/` redirige según el idioma del navegador; `/es` y `/en` muestran nombre, enlace a GitHub y la ficha del proyecto; `<html lang>` coincide con la ruta; un idioma no soportado en la ruta (`/fr`) da 404; sin correo, LinkedIn, CV ni demo no hay enlaces ni huecos; la cantidad de etiquetas "Provisional" visibles es igual a la cantidad de bloques con `provisional: true` en los datos (perfil, tecnologías, personajes y proyecto), de modo que quitar la marca de un dato la oculta (FR-012); el pie muestra el aviso de no afiliación en ambos idiomas (FR-019)

### Implementación de la historia 1

- [x] T024 [US1] Implementar `src/lib/i18n/negotiate.ts` con el análisis propio de `Accept-Language` y la resolución del idioma por prioridad; hacer pasar T022
- [x] T025 [US1] Implementar `src/proxy.ts` (según la guía leída en T004) para redirigir rutas sin idioma usando `negotiate.ts`, respetando las rutas con `/es` o `/en`, y excluyendo `/_next` y archivos estáticos
- [x] T026 [P] [US1] Crear `src/components/ProvisionalBadge.tsx`: etiqueta "Provisional" con el texto tomado de `ui-text.ts`; no se renderiza si el bloque no es provisional
- [x] T027 [P] [US1] Crear `src/components/sections/ProfileSection.tsx` (perfil, con `ProvisionalBadge`)
- [x] T028 [P] [US1] Crear `src/components/sections/StackSection.tsx` (categorías y tecnologías con nivel, con `ProvisionalBadge`)
- [x] T029 [P] [US1] Crear `src/components/sections/ProjectsSection.tsx` (proyectos, con `ProvisionalBadge`; los enlaces `repository` y `demo` solo se renderizan si tienen dirección, sin dejar huecos)
- [x] T030 [P] [US1] Crear `src/components/sections/CharactersSection.tsx` (personajes con arcano, rango y texto corto, con `ProvisionalBadge`)
- [x] T031 [P] [US1] Crear `src/components/sections/ContactSection.tsx` (GitHub siempre; correo, LinkedIn y CV solo si existen)
- [x] T032 [P] [US1] Crear `src/components/Footer.tsx` con el aviso de no afiliación a las franquicias que inspiran el sitio y de proyecto de aprendizaje sin fines comerciales (Principio V, FR-019), con el texto tomado de `ui-text.ts` y visible en ambos idiomas
- [x] T033 [US1] Crear `src/app/[lang]/layout.tsx` con `<html lang>` igual a la ruta, fuentes de `fonts.ts`, `generateStaticParams` para `es` y `en`, metadatos traducidos desde `ui-text.ts`, y `hasLocale`/`notFound()` para idiomas no soportados (depende de T004, T011, T013)
- [x] T034 [US1] Crear `src/app/[lang]/page.tsx` que componga las cinco secciones y el pie (T032) leyendo los datos de `src/content/index.ts` y `localize`, sin textos escritos en los componentes (depende de T021, T026–T031, T032, T033)
- [x] T035 [P] [US1] Crear `src/app/[lang]/not-found.tsx` con textos desde `ui-text.ts`
- [x] T036 [US1] Ejecutar `npm run build`, `npm run test:unit` y `npm run test:e2e` hasta que T022 y T023 pasen en 390, 768 y 1280 px

**Punto de control**: la historia 1 funciona sola (MVP local). Hacer commit (`feat(home): agregar página inicial con rutas por idioma`).

---

## Fase 5: Historia de usuario 2 — Cambiar de idioma y que se recuerde (Prioridad: P1)

**Meta**: un selector accesible cambia entre `/es` y `/en` y guarda la elección en la cookie `lang`.

**Prueba independiente**: cambiar el idioma con el selector actualiza todos los textos y `<html lang>`; abrir `/` después lleva al idioma elegido; una ruta explícita manda sobre la cookie.

### Pruebas de la historia 2

- [x] T037 [P] [US2] Escribir `tests/e2e/language.spec.ts`: el selector cambia de `/es` a `/en` y actualiza todos los textos y `<html lang>`; tras cambiar, `/` abre el idioma elegido aunque el navegador esté en otro; `/es` con cookie `en` se queda en `/es`; el selector se opera solo con teclado (tabulación y Enter) y tiene foco visible; con cookies bloqueadas el idioma sigue funcionando por la ruta; cambiar de idioma varias veces seguidas no rompe la página
- [x] T038 [P] [US2] Escribir `tests/unit/cookie.test.ts` para la función que arma la cookie `lang` (`path=/`, `max-age` de un año, `SameSite=Lax`, solo valores `es` o `en`)

### Implementación de la historia 2

- [x] T039 [US2] Crear `src/lib/i18n/cookie.ts` con la construcción de la cookie `lang` y hacer pasar T038
- [x] T040 [US2] Crear `src/components/LanguageSwitcher.tsx` como enlace (`<a>`) a la misma página en el otro idioma, con nombre accesible traducido, atributo `lang` propio, foco visible con contraste AA y escritura de la cookie al activarlo (componente de cliente solo para este comportamiento)
- [x] T041 [US2] Integrar el selector en el encabezado de `src/app/[lang]/layout.tsx` o `page.tsx`, con los textos desde `ui-text.ts`
- [x] T042 [US2] Ejecutar `npm run test:unit` y `npm run test:e2e` hasta que T037 y T038 pasen

**Punto de control**: las historias 1, 2 y 3 funcionan juntas. Hacer commit (`feat(i18n): agregar selector de idioma con cookie`).

---

## Fase 6: Historia de usuario 4 — Tokens de diseño centralizados (Prioridad: P2)

**Meta**: los tokens existen en un solo lugar, la página los usa y el contraste AA está garantizado por prueba.

**Prueba independiente**: cambiar `--color-cyan` en `globals.css` se refleja en la página sin otros cambios; la prueba de contraste pasa.

### Pruebas de la historia 4

- [x] T043 [P] [US4] Escribir `tests/unit/tokens.test.ts` que lea `src/app/globals.css`, calcule el contraste WCAG de los pares de `research.md` (D8) y falle si el texto normal baja de 4.5:1 (`--color-text`, `--color-cyan` y `--color-red-text` sobre `--color-bg`; `--color-text` sobre `--color-red-fill`) o el texto grande y los gráficos bajan de 3:1 (`--color-red` sobre `--color-bg`)
- [x] T044 [P] [US4] Escribir en el mismo `tests/unit/tokens.test.ts` una comprobación de que no hay colores `#hex` ni `rgb(` fuera de `src/app/globals.css` en `src/components/` ni `src/app/[lang]/`

### Implementación de la historia 4

- [x] T045 [US4] Revisar `src/components/` y `src/app/[lang]/` y reemplazar cualquier color, fuente, duración o curva suelta por tokens de `globals.css`; hacer pasar T043 y T044
- [x] T046 [US4] Verificar manualmente el cambio de un token (guía `quickstart.md`, sección 4) y revertirlo

**Punto de control**: CA-7 cumplido. Hacer commit (`feat(design): centralizar tokens de diseño con prueba de contraste`).

---

## Fase 7: Historia de usuario 5 — Pruebas automáticas y despliegue repetible (Prioridad: P2)

**Meta**: un solo comando ejecuta todas las verificaciones y el sitio se despliega de forma repetible en Vercel.

**Prueba independiente**: `npm run verify` pasa desde una instalación limpia y la fusión a `main` actualiza el sitio público.

### Pruebas de la historia 5

- [ ] T047 [P] [US5] Escribir `tests/e2e/layout.spec.ts`: en 390, 768 y 1280 px (`/es` y `/en`) no hay desplazamiento horizontal (`scrollWidth <= clientWidth`) y el selector de idioma es visible y accionable

### Implementación de la historia 5

- [ ] T048 [US5] Definir en `package.json` el script `verify` que ejecute en orden `lint`, `build`, `test:unit`, `test:e2e` y `npm audit --omit=dev`, y comprobar que pasa desde cero con `npm ci`
- [ ] T049 [US5] Crear `vercel.json` en la raíz con `buildCommand` igual a `npm run test:unit && npm run build`, para que Vercel no publique si fallan las pruebas unitarias o la compilación (FR-011, FR-016, SC-008); las pruebas E2E se ejecutan en local con `npm run verify` antes de fusionar a `main`; la decisión ya está documentada en `specs/001-base-y-datos/research.md` (D10)
- [x] T050 [US5] **Acción de Edward (hecha el 2026-10-22)**: crear el proyecto en Vercel conectado a `Edward2418/p3r-portfolio-v2`, elegir un nombre limpio para la dirección `*.vercel.app` y confirmar que no se necesitan variables de entorno (si aparecen, agregar `.env.example`). Los despliegues fallarán hasta que exista el proyecto Next (T003–T007); fijar Node 22.x en la configuración del proyecto de Vercel
- [ ] T051 [US5] Revisar la vista previa de Vercel de la rama `001-base-y-datos`, abrir un pull request hacia `main` con `npm run verify` pasando, fusionarlo, esperar el despliegue de producción y repetir el recorrido manual de `quickstart.md` (sección 2) sobre la dirección pública (CA-1)
- [ ] T052 [US5] Comprobar que los pushes de la rama `001-base-y-datos` generaron vistas previas y que producción no cambió hasta la fusión (`quickstart.md`, sección 6)

**Punto de control**: el sitio está público y las verificaciones pasan. Hacer commit (`chore(ci): agregar script de verificación y despliegue`).

---

## Fase 8: Pulido y asuntos transversales

**Propósito**: cierre de la fase según la constitución.

- [ ] T053 [P] Ejecutar Lighthouse móvil sobre `/es` y `/en` en producción local y en Vercel (`quickstart.md`, sección 5), medir los KiB transferidos y anotar los resultados en la tabla de `specs/001-base-y-datos/quickstart.md` (meta: rendimiento ≥ 90, accesibilidad 100, ≤ 350 KiB)
- [ ] T054 [P] Revisar accesibilidad manualmente: orden de tabulación, foco visible, lector de pantalla en el selector y en las etiquetas "Provisional", contraste AA
- [ ] T055 [P] Revisar los componentes y la página con la skill `vercel-react-best-practices` y corregir lo que corresponda
- [ ] T056 [P] Escribir `README.md` en español: qué es el proyecto, requisitos, cómo ejecutarlo, scripts, estructura y cómo agregar un proyecto o dato (sin tocar componentes)
- [ ] T057 Ejecutar la guía completa `specs/001-base-y-datos/quickstart.md` y marcar los criterios CA-1 a CA-10 en `docs/sprints/fase-1-base-y-datos.md`
- [ ] T058 Registrar en `specs/001-base-y-datos/research.md` las decisiones que cambiaron durante la implementación (versiones, TypeScript 7, pruebas `.ts` nativas) y confirmar con Edward el cierre de la fase

---

## Dependencias y orden de ejecución

### Dependencias entre fases

- **Preparación (Fase 1)**: sin dependencias.
- **Fundamentos (Fase 2)**: depende de la Fase 1 y bloquea todas las historias.
- **Historias (Fases 3 a 7)**: dependen de la Fase 2. Orden recomendado: US3 → US1 → US2 → US4 → US5.
- **Pulido (Fase 8)**: depende de las historias deseadas.

### Dependencias entre historias

- **US3 (datos)**: empieza tras los fundamentos; no depende de otras historias.
- **US1 (página inicial)**: empieza tras los fundamentos y necesita los datos de US3 (T021).
- **US2 (selector)**: necesita el layout y la página de US1 (T033, T034).
- **US4 (tokens)**: los tokens se crean en los fundamentos (T012); US4 los verifica y limpia el uso, así que va después de US1 y US2.
- **US5 (verificación y despliegue)**: necesita que las pruebas de US1 a US4 existan.

### Dentro de cada historia

- Pruebas primero y comprobar que fallan.
- Tipos y datos antes de componentes; componentes antes de la página; página antes de la integración.
- Commit al cerrar cada punto de control.

### Oportunidades de paralelismo

- Preparación: T006 en paralelo con T005.
- Fundamentos: T008, T009, T010, T012 y T013 en paralelo (T011 espera a T008 y T009).
- US3: T015 a T020 en paralelo.
- US1: T022 y T023 en paralelo; T026 a T031, T032 y T035 en paralelo.
- US2: T037 y T038 en paralelo.
- US4: T043 y T044 en paralelo.
- Pulido: T053 a T056 en paralelo.

---

## Ejemplo de paralelismo: historia 3

```text
# Datos de la historia 3 (archivos distintos):
Tarea: "Crear src/content/profile.ts"
Tarea: "Crear src/content/stack.ts"
Tarea: "Crear src/content/projects.ts"
Tarea: "Crear src/content/characters.ts"
Tarea: "Crear src/content/contact.ts"
Tarea: "Crear src/content/ui-text.ts"
```

## Ejemplo de paralelismo: historia 1

```text
# Secciones de la página inicial (archivos distintos):
Tarea: "Crear src/components/sections/ProfileSection.tsx"
Tarea: "Crear src/components/sections/StackSection.tsx"
Tarea: "Crear src/components/sections/ProjectsSection.tsx"
Tarea: "Crear src/components/sections/CharactersSection.tsx"
Tarea: "Crear src/components/sections/ContactSection.tsx"
```

---

## Estrategia de implementación

### Primero el MVP (US3 + US1)

1. Completar la Fase 1 (preparación) y la Fase 2 (fundamentos).
2. Completar US3 (datos) y US1 (página inicial con rutas por idioma).
3. **Detenerse y validar**: `/` redirige, `/es` y `/en` muestran los datos.
4. Desplegar o mostrar si está listo.

### Entrega incremental

1. Preparación + fundamentos → base lista.
2. US3 + US1 → página inicial local (MVP).
3. US2 → selector con memoria de idioma.
4. US4 → tokens verificados.
5. US5 → verificación completa y sitio público.
6. Pulido → medición y cierre de la fase.

---

## Trazabilidad

| Historia | Requisitos | Criterios de aceptación | Tareas |
|---|---|---|---|
| US1 | FR-002, FR-003, FR-014, FR-018, FR-019 | CA-1, CA-2 | T022–T036 |
| US2 | FR-004, FR-005, FR-006 | CA-2, CA-3 | T037–T042 |
| US3 | FR-007 a FR-012 | CA-4, CA-5, CA-6 | T008, T014–T021 |
| US4 | FR-013 | CA-7 | T012, T013, T043–T046 |
| US5 | FR-001, FR-011, FR-015, FR-016, FR-017 | CA-1, CA-8, CA-9, CA-10 | T047–T053 |

## Notas

- [P] = archivos distintos, sin dependencias pendientes.
- La etiqueta [US#] enlaza cada tarea con su historia para la trazabilidad.
- Verificar que las pruebas fallen antes de implementar.
- Hacer commit en cada punto de control, en la rama `001-base-y-datos` (nunca directamente en `main`), con Conventional Commits (tipo y alcance en inglés, descripción en español).
- No escribir reglas propias en `AGENTS.md`; lo regenera `next dev`.
- Evitar tareas vagas, conflictos en un mismo archivo y dependencias entre historias que rompan su independencia.
