# Modelo de datos: Fase 3 — Identidad visual P3R

**Fecha**: 2026-10-23 | **Especificación**: [spec.md](./spec.md) | **Investigación**: [research.md](./research.md)

El contenido sigue en archivos TypeScript tipados en `src/content/`. Esta fase añade los recursos del personaje, los efectos de sonido y la preferencia de sonido. No hay base de datos. Los identificadores de código están en inglés y los textos visibles son `Localized`.

## Tipos nuevos

| Tipo | Forma | Reglas |
|---|---|---|
| `SoundId` | `'cursor' \| 'confirm' \| 'cancel' \| 'open' \| 'close' \| 'levelup'` | Identificador de efecto de sonido. |
| `SoundPreference` | `'on' \| 'off'` | Preferencia del visitante; por defecto `off`. |
| `ViewKind` | `'menu' \| 'screen'` | Vista actual de la escena; fija la posición del personaje y el tamaño del panel. |

## Entidades

### CharacterAsset (recurso del personaje) — `src/content/character.ts`

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `poster` | objeto `{ src, width, height }` | Sí | Imagen fija y primer cuadro del video: `/img/oguri/idle-poster.webp`, 540×960. |
| `idle` | objeto `{ src, type }` | Sí | Video con transparencia: `/img/oguri/idle.webm`, `video/webm; codecs="vp9"`. |
| `alt` | `Localized` | Sí | Descripción accesible del personaje; el arte es decorativo y se oculta a los lectores de pantalla (FR-016), pero la descripción se conserva para cuando el personaje aporte información (por ejemplo, en Social Link). |

- Hay un único personaje en esta fase. La fase 6 puede añadir más poses y personajes agregando datos.
- Las rutas deben existir en `public/` (la prueba de datos lo comprueba).

### SoundEffect (efecto de sonido) — `src/content/audio.ts`

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | `SoundId` | Sí | Único; los seis valores de `SoundId` deben estar. |
| `src` | `string` | Sí | `/audio/<id>.mp3`; el archivo existe en `public/audio/`. |

- La lista `sounds: SoundEffect[]` define los seis efectos. El mapa de acción a sonido está en `src/lib/audio/events.ts` (ver [contracts/sound.md](./contracts/sound.md)), no en los datos, porque es lógica de interacción.

### Textos de interfaz nuevos (`UiText`)

Se amplía `src/content/ui-text.ts` con: `panelTitle` (título vertical del panel, "PORTFOLIO"), `soundToggleLabel`, `soundOn`, `soundOff`, `soundHint` (nota breve sobre el audio) y `characterAlt`. Todos con español e inglés.

### Preferencia de sonido (cliente)

- Clave `sound` en `localStorage`: `on` u `off`; cualquier valor ausente, inválido o un almacenamiento bloqueado dan `off`.
- Solo la modifica el visitante desde el interruptor de System. Nunca se activa por sí sola.

## Tokens nuevos (`src/app/globals.css`)

| Token | Valor inicial | Uso |
|---|---|---|
| `--color-sky` | cian claro del degradado | Extremo superior del degradado |
| `--color-deep` | azul profundo | Extremo inferior del degradado |
| `--color-panel` | blanco azulado | Panel inclinado del menú |
| `--color-navy` | azul marino | Fichas de las opciones, panel de contenido, controles del encabezado |
| `--color-on-panel` | azul marino oscuro | Texto del título vertical y de la opción activa |
| `--angle-skew` | `-10deg` | Inclinación del panel y de las opciones |
| `--duration-character-in` | `300ms` | Entrada inicial del personaje al abrir el menú |

Los valores finales se fijan al implementar y los pares de texto se verifican con `tokens.test.ts` (AA).

## Estado en el cliente

| Estado | Dónde | Descripción |
|---|---|---|
| `view` (`ViewKind`) | `SceneShell` | Derivado de la ruta (`sceneId === null` ⇒ `menu`); se publica como `data-view` |
| `data-scene-busy` | `<html>`, lo fija `transition.ts` | Presente mientras la transición no esté en reposo; el idle se pausa |
| `data-motion` | `<html>` (fase 2) | `reduced` si el sistema o el sitio piden movimiento reducido; el idle y las animaciones del personaje lo respetan |
| `idleState` | `Character` | `idle-pending` → `loading` → `playing` / `failed`; con `failed` o `ineligible` se queda el póster |
| `soundEnabled` | `SoundProvider` | Valor de la preferencia; el audio se crea solo al activarse |
