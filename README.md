# Portafolio P3R v2

Portafolio personal de Edward Negrete, con la estética del menú de Persona 3 Reload. Esta versión se rehace desde cero con desarrollo guiado por especificación (Spec Kit) y se construye por fases. El alcance completo está en [`docs/project-context.md`](docs/project-context.md) y las reglas no negociables, en [`.specify/memory/constitution.md`](.specify/memory/constitution.md).

**Estado:** fase 1 (Base y datos). La página inicial es de verificación: muestra todos los datos en español e inglés, sin diseño P3R ni animaciones. El menú, las transiciones y las pantallas llegan desde la fase 2.

## Requisitos

- Node.js `>=22.18` (ver `.nvmrc`)
- npm

## Primeros pasos

```bash
npm ci                       # instala las dependencias
npx playwright install       # descarga los navegadores de las pruebas E2E (una sola vez)
npm run dev                  # servidor de desarrollo en http://localhost:3000
```

Al abrir `/` el sitio te lleva a `/es` o `/en` según la cookie `lang` y, si no existe, según el idioma del navegador (inglés si no es español ni inglés).

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Sirve la compilación de producción |
| `npm run lint` | Revisión de estilo de código con ESLint |
| `npm run test:unit` | Pruebas unitarias con el ejecutor nativo de Node (`node --test`) |
| `npm run test:e2e` | Compila y ejecuta las pruebas E2E con Playwright (390, 768 y 1280 px en Chromium, y 1280 px en Firefox) |
| `npm run verify` | Lo anterior en orden, más `npm audit --omit=dev`; ejecútalo antes de fusionar a `main` |

## Estructura

```text
src/
├── app/
│   ├── globals.css        # Tokens de diseño (colores, tipografías, duraciones y curvas)
│   ├── fonts.ts           # Anton (títulos) e Inter (texto)
│   └── [lang]/            # Rutas /es y /en: layout, página inicial y 404
├── components/            # Solo presentación; sin textos de contenido
├── content/               # Todo el contenido, en datos tipados y bilingües
├── lib/i18n/              # Idiomas, negociación, cookie y localize()
└── proxy.ts               # Redirección de idioma para rutas sin /es o /en
tests/
├── unit/                  # Idioma, datos, cookie y contraste de los tokens
└── e2e/                   # Idioma, persistencia, datos opcionales y anchos
specs/001-base-y-datos/    # Especificación, plan, tareas y contratos de la fase
docs/                      # Contexto maestro y insumos de cada fase
```

## Cómo agregar contenido sin tocar componentes

Todo el contenido vive en `src/content/`. Cada texto traducible lleva ambos idiomas (`{ es: "...", en: "..." }`); si falta uno, el compilador falla.

- **Un proyecto nuevo:** agrega un objeto a la lista de `src/content/projects.ts`. Las tecnologías deben existir en `src/content/stack.ts`.
- **Correo, LinkedIn o CV:** agrega el campo en `src/content/contact.ts`. Mientras no exista, no se muestra ningún enlace ni hueco.
- **Confirmar un dato de ejemplo:** quita `provisional: true` del bloque y desaparece su etiqueta "Provisional".
- **Un texto de interfaz:** edita `src/content/ui-text.ts`.

`npm run test:unit` valida los datos: idiomas completos, identificadores únicos, tecnologías existentes y enlaces `https`.

## Diseño

Los tokens están en un único lugar, `src/app/globals.css` (bloque `@theme`). La paleta es "Medianoche y cian". El rojo `#E8203A` no cumple contraste AA para texto normal, así que se reserva para rellenos, bordes y texto grande; para texto pequeño se usan `--color-red-text` y `--color-red-fill`. Una prueba unitaria recalcula los contrastes y falla si alguno baja del umbral.

## Despliegue

El sitio se publica en Vercel. Cada push a una rama genera una vista previa y `main` despliega a producción. `vercel.json` ejecuta `npm run test:unit && npm run build` en cada despliegue, de modo que un fallo impide publicar. Las pruebas E2E necesitan navegadores y se ejecutan en local con `npm run verify`.

Flujo recomendado: trabajar en la rama de la fase, revisar la vista previa, ejecutar `npm run verify` y abrir un pull request hacia `main`.

## Aviso

Proyecto de aprendizaje sin fines comerciales. No está afiliado a los propietarios de las franquicias que inspiran su estilo y sus personajes.
