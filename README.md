# Portafolio P3R v2

Portafolio personal de Edward Negrete, con la estética del menú de Persona 3 Reload. Esta versión se rehace desde cero con desarrollo guiado por especificación (Spec Kit) y se construye por fases. El alcance completo está en [`docs/project-context.md`](docs/project-context.md) y las reglas no negociables, en [`.specify/memory/constitution.md`](.specify/memory/constitution.md).

**Estado:** fase 4 (Quién soy y Stack). "Quién soy" muestra la ficha de Edward y su trayectoria, y "Stack" muestra las tecnologías en tres círculos solapados con su nivel (la fase 3 dejó el aspecto P3R, Oguri y el sonido opcional). El sitio tiene un splash corto, un menú con el aspecto del menú de pausa de Persona 3 Reload (degradado de cian a azul, panel blanco inclinado con título vertical y opciones inclinadas), a Oguri como protagonista (entrada animada, idle diferido y barrido con el personaje), cinco pantallas con un marco común y dirección propia (`/es/stack`, `/en/projects`…) y sonido opcional. Las demás pantallas (Proyectos, Social Link y System) muestran por ahora el contenido provisional de la fase 1; su contenido real llega en las fases 5 a 7.

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

## Cómo se usa el sitio

| Entrada | Menú | Pantallas |
|---|---|---|
| Teclado | ↑ ↓ ← → cambian la opción; Inicio y Fin van a los extremos; Enter abre | ← → (o RePág y AvPág) pasan a la pantalla anterior o siguiente; Esc vuelve al menú |
| Ratón o toque | Clic o toque abre la opción | Pestañas L y R, y botones Atrás y Confirmar, abajo a la derecha |
| Tacto | — | Deslizamiento horizontal para pasar de pantalla |

- Un clic, un toque o una tecla durante una transición la termina de inmediato.
- Oguri aparece a la izquierda en el menú y a la derecha en las pantallas (desde 1024 px), con una altura e inclinación propias en Quién soy y en Stack; en pantallas estrechas va detrás del contenido, recortada y atenuada, para no taparlo.
- El **sonido** está desactivado por defecto: se activa en System y su preferencia se recuerda. Sus seis efectos (cursor, confirmar, cancelar, abrir, cerrar y subida de nivel) se descargan solo al activarlo, o tras la primera interacción si ya estaba activado. Es independiente del movimiento reducido.
- El **idle** de Oguri (video con transparencia de 1.2 MB) se pide bajo demanda: en la primera interacción o 8 s después de cargar la página, con el navegador en reposo. Con movimiento reducido, con el ahorro de datos o en Safari se queda la imagen fija.
- El splash dura como máximo 1.5 s, se omite con cualquier tecla o clic, y solo aparece al entrar por la raíz en la primera visita de la sesión.
- El interruptor del encabezado (o la preferencia del sistema) activa el **movimiento reducido**: sin barridos ni desplazamientos, solo fundidos cortos.

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

Algunas pruebas E2E miden tiempos (duración de la transición, interrupción). Con varios navegadores en paralelo la máquina puede ir cargada y esas pruebas tienen reintentos acotados; si fallan de forma repetida, ejecútalas sin carga (`npx playwright test --workers=1`).

## Estructura

```text
src/
├── app/
│   ├── globals.css        # Tokens de diseño (colores, tipografías, duraciones y curvas) y estilos de la escena
│   ├── fonts.ts           # Anton (títulos) e Inter (texto)
│   └── [lang]/            # Rutas /es y /en: layout, menú (page.tsx) y las pantallas
│       ├── profile/ stack/ projects/ social-link/ system/
├── components/
│   ├── scene/             # SceneShell, transición (WAAPI), fondo (SceneBackdrop), personaje (Character), guía y botones
│   ├── menu/              # Menú principal (fichas inclinadas)
│   ├── audio/             # SoundProvider, SoundToggle y el almacén del sonido (carga bajo demanda)
│   ├── profile/           # ProfileSheet (ficha) y Trajectory (trayectoria) de Quién soy
│   ├── stack/             # StackCircles: los tres círculos de Stack
│   ├── sections/          # Secciones de contenido (se reutilizan en las pantallas)
│   └── …                  # Splash, interruptor de movimiento, selector de idioma, pie
├── content/               # Todo el contenido y el menú, en datos tipados y bilingües
├── lib/
│   ├── i18n/              # Idiomas, negociación, cookie y localize()
│   ├── audio/             # Lógica pura del sonido: preferencia, mapa de acciones y limitador
│   ├── profile/ stack/    # Lógica pura de presentación: trayectoria vacía, categorías visibles, etiqueta central y marca provisional
│   ├── motion/            # Lógica pura: teclado, deslizamiento, tiempos, preferencia de movimiento e idle
│   └── scene/             # Nombres y títulos de las pantallas
└── proxy.ts               # Redirección de idioma para rutas sin /es o /en
tests/
├── unit/                  # Idioma, datos, menú, teclado, deslizamiento, tiempos, tokens y contraste, sonido e idle
└── e2e/                   # Menú, aspecto, personaje, marco de pantallas, móvil, sonido, navegación, transición, interrupción, movimiento reducido, splash, guía, idioma y anchos
specs/                     # Especificación, plan, tareas y contratos de cada fase
docs/                      # Contexto maestro y insumos de cada fase
```

## Cómo agregar contenido sin tocar componentes

Todo el contenido vive en `src/content/`. Cada texto traducible lleva ambos idiomas (`{ es: "...", en: "..." }`); si falta uno, el compilador falla.

- **Una tecnología nueva en Stack:** agrégala a la categoría que corresponda en `src/content/stack.ts` (nivel de 1 a 5). Cada categoría con tecnologías se muestra en su círculo; la etiqueta central "Full-Stack" (`stackCenterLabel`) aparece solo si las tres categorías tienen tecnologías.
- **Un hito de la trayectoria:** agrégalo a `src/content/trajectory.ts` en orden cronológico; el último debe ser el hito `goal` (la meta futura, sin año) y solo puede haber un hito `current`.
- **Tu perfil:** edita `src/content/profile.ts` (presentación, especialidad, institución y semestre). No se publican el apellido completo ni el año de titulación: una prueba lo impide.
- **Un proyecto nuevo:** agrega un objeto a la lista de `src/content/projects.ts`. Las tecnologías deben existir en `src/content/stack.ts`.
- **Agregar, renombrar o reordenar una opción del menú:** edita `src/content/menu.ts`. El orden del arreglo es el orden del menú, de las pestañas L y R y de la navegación por teclado. (Una opción nueva también necesita su `SceneId` en `src/content/types.ts` y su página en `src/app/[lang]/<id>/page.tsx`.)
- **Correo, LinkedIn o CV:** agrega el campo en `src/content/contact.ts`. Mientras no exista, no se muestra ningún enlace ni hueco.
- **Confirmar un dato de ejemplo:** quita `provisional: true` del bloque y desaparece su etiqueta "Provisional". En Stack, si todas las tecnologías de una categoría son provisionales, la etiqueta aparece una sola vez en el encabezado de la categoría; si hay una mezcla, solo en las provisionales.
- **Un texto de interfaz:** edita `src/content/ui-text.ts` (incluye el título vertical del panel, `panelTitle`).
- **El arte de Oguri:** cambia las rutas y la descripción en `src/content/character.ts` y coloca los archivos en `public/img/oguri/` (imagen fija en WebP con transparencia, 540×960, y video en WebM con VP9 y transparencia). La imagen fija debe ser el primer cuadro del video, para que el cambio no dé un salto.
- **Los sonidos:** cambia los archivos en `src/content/audio.ts` y `public/audio/` (los seis identificadores deben existir).

`npm run test:unit` valida los datos: idiomas completos, identificadores únicos, tecnologías existentes, enlaces `https`, las cinco opciones del menú y que los archivos de arte y sonido existen en `public/`.

## Diseño y movimiento

Los tokens están en un único lugar, `src/app/globals.css` (bloque `@theme`). La paleta es "Medianoche y cian", con el degradado `--color-sky` a `--color-deep`, el panel `--color-panel`, las fichas `--color-navy`, la inclinación `--angle-skew` y la atenuación del personaje `--opacity-character-dim`. El foco visible es un anillo de doble capa (`--color-focus-inner` y `--color-focus-outer`) que se ve sobre superficies blancas, cian y marinas; una prueba unitaria verifica sus contrastes. El rojo `#E8203A` no cumple contraste AA para texto normal, así que se reserva para rellenos, bordes y texto grande; para texto pequeño se usan `--color-red-text` y `--color-red-fill`. Una prueba unitaria recalcula los contrastes y falla si alguno baja del umbral.

La transición de escena (salida con barrido, entrada escalonada, pausa y cierre con anillo) dura entre 500 y 800 ms medidos y está calibrada con el video de referencia del menú de pausa de Persona 3 Reload. Sus tiempos y curvas son tokens (`--duration-wipe-out`, `--duration-stagger-in`, `--stagger-step`, `--duration-hold`, `--duration-circle`, `--ease-out`, `--ease-in-out`): cambiarlos no requiere tocar componentes, y una prueba impide que la suma salga de 500 a 800 ms. Solo se animan `transform` y `opacity`, con la Web Animations API y sin librerías de animación.

## Despliegue

El sitio se publica en Vercel. Cada push a una rama genera una vista previa y `main` despliega a producción. `vercel.json` fija el framework Next.js y ejecuta `npm run test:unit && npm run build` en cada despliegue, de modo que un fallo impide publicar. Las pruebas E2E necesitan navegadores y se ejecutan en local con `npm run verify`.

Flujo recomendado: trabajar en la rama de la fase, revisar la vista previa, ejecutar `npm run verify` y abrir un pull request hacia `main`.

## Aviso

Proyecto de aprendizaje sin fines comerciales. No está afiliado a los propietarios de las franquicias que inspiran su estilo y sus personajes.
