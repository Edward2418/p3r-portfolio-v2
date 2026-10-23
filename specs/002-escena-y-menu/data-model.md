# Modelo de datos: Fase 2 — Escena y menú

**Fecha**: 2026-10-22 | **Especificación**: [spec.md](./spec.md) | **Investigación**: [research.md](./research.md)

El contenido sigue en archivos TypeScript tipados en `src/content/`. Esta fase añade el menú y su lógica de estado en el cliente. No hay base de datos. Los identificadores van en inglés; los textos visibles, en español e inglés por campo. Los tipos de la fase 1 (`Lang`, `Localized`, `Provisionable`) se reutilizan: ver [../001-base-y-datos/data-model.md](../001-base-y-datos/data-model.md).

## Tipos nuevos

| Tipo | Forma | Reglas |
|---|---|---|
| `SceneId` | `'profile' \| 'stack' \| 'projects' \| 'social-link' \| 'system'` | Identificador de pantalla; también es su dirección bajo `/es` y `/en`. |
| `MotionMode` | `'full' \| 'reduced'` | Modo efectivo de movimiento. |

## Entidades

### MenuOption (opción de menú)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | `SceneId` | Sí | Único; coincide con la dirección de la pantalla (`profile`, `stack`, `projects`, `social-link`, `system`). |
| `name` | `Localized` | Sí | Nombre visible: Quién soy / About me, Stack / Stack, Proyectos / Projects, Social Link / Social Link, System / System. |
| `description` | `Localized` | Sí | Texto de la guía contextual cuando la opción está activa. |

- La lista `menu: MenuOption[]` está en `src/content/menu.ts`. **El orden del arreglo es el orden del menú y de las pestañas L/R.**
- Debe haber exactamente cinco opciones y sus `id` deben ser exactamente los cinco de `SceneId`, sin repetirse.
- Agregar, quitar o reordenar una opción se hace solo en este archivo (SC-010).

### Textos de interfaz nuevos (`UiText`)

Se amplía `src/content/ui-text.ts` (mismo patrón `Localized` de la fase 1) con: nombre y descripción del menú (`menuLabel`), botones `confirm`, `back`, pestañas `tabPrevious` y `tabNext`, título del splash, anuncio de cambio de pantalla, interruptor de movimiento reducido (`motionToggleLabel`, `motionOn`, `motionOff`, `motionLockedBySystem`) y el nombre accesible del marcador del personaje. Todos con ambos idiomas.

### MotionPreference (preferencia de movimiento)

Estado en el cliente, sin servidor:

| Elemento | Dónde vive | Valores |
|---|---|---|
| Preferencia del sistema | Media query `prefers-reduced-motion` | `reduce` / `no-preference` |
| Preferencia del sitio | `localStorage`, clave `motion` | `reduced` / `full` (ausente = `full`) |
| Modo efectivo | Atributo `data-motion` en `<html>` | `reduced` si el sistema **o** el sitio piden reducido; si no, `full` |

- Un script en línea del `<head>` calcula el modo efectivo antes de pintar.
- Si el sistema pide reducido, el interruptor aparece activado y deshabilitado.

### SplashState (estado del splash)

| Elemento | Dónde vive | Valores |
|---|---|---|
| Visto en esta sesión | `sessionStorage`, clave `splash-seen` | `1` (ausente = no visto) |
| Atributo derivado | `data-splash` en `<html>` | `seen` si ya se vio; la capa del splash se oculta con CSS |

- El splash solo existe en la página del menú y solo se muestra en una carga completa de la raíz, nunca en una navegación interna.
- Cualquier primera carga de documento de la sesión cuenta como visita: el script en línea marca `splash-seen` y `data-splash="seen"` también cuando la ruta cargada no es la raíz (por ejemplo `/es/projects`).
- Con `sessionStorage` bloqueado, puede repetirse; nada se rompe.

### Transition (transición) y tokens

Tokens en `src/app/globals.css` (única fuente; el controlador los lee de los estilos calculados):

| Token | Valor | Uso |
|---|---|---|
| `--duration-wipe-out` | 170 ms | Salida con barrido |
| `--duration-stagger-in` | 260 ms | Entrada escalonada |
| `--stagger-step` | 35 ms | Retraso entre fichas |
| `--duration-hold` | 70 ms | Pausa |
| `--duration-circle` | 200 ms | Cierre con círculo |
| `--duration-reduced` | 120 ms | Fundido de la variante reducida |
| `--duration-splash` | 1500 ms | Cierre automático del splash |
| `--duration-nav-timeout` | 1500 ms | Espera máxima del destino antes de mostrarlo sin entrada escalonada |
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | Existente (fase 1) |
| `--ease-in-out` | `cubic-bezier(0.77, 0, 0.175, 1)` | Nuevo: barrido |

Reglas: la suma `wipe-out + stagger-in + hold + circle` DEBE estar entre 500 y 800 ms. Estos valores están calibrados con el video de referencia (ver [research.md](./research.md), D4); T044 los compara con lo implementado y los afina.

### SceneController (estado de la transición, en memoria)

| Campo | Descripción |
|---|---|
| `phase` | `idle` · `exiting` · `navigating` · `entering` · `closing` |
| `running` | Lista de animaciones activas (para `finish()` al interrumpir) |
| `pendingHref` | Destino de una navegación en curso, si lo hay |

Transiciones de estado: `idle → exiting → navigating → entering → closing → idle`. Cualquier acción del visitante en una fase distinta de `idle` ejecuta `skip()`: termina las animaciones, ejecuta la navegación pendiente y vuelve a `idle` con el destino visible.

### SwipeConfig (configuración del deslizamiento)

| Parámetro | Valor |
|---|---|
| Distancia mínima horizontal | 56 px |
| Relación horizontal/vertical | `|dx| ≥ 1.5 · |dy|` |
| Punteros | Uno solo |
| Margen de borde ignorado | 24 px |

## Reglas de validación (pruebas unitarias)

1. El menú tiene exactamente cinco opciones y sus `id` son los cinco de `SceneId`, únicos.
2. Todo `Localized` del menú y de los textos nuevos tiene `es` y `en` no vacíos.
3. La suma de los tramos de la transición está entre 500 y 800 ms y cada tramo es positivo.
4. `nextIndex` respeta los extremos: Home y End, y los límites sin dar la vuelta.
5. `detectSwipe` rechaza movimientos verticales, cortos, de varios punteros y desde el borde; acepta los horizontales claros.
6. La preferencia efectiva de movimiento es `reduced` si el sistema **o** el sitio la piden.

## Relaciones

- `MenuOption.id` → ruta de la pantalla (`/{lang}/{id}`) → página que reutiliza las secciones de la fase 1 (perfil, stack, proyectos, personajes, contacto y aviso).
- `menu` (orden) → orden de las pestañas L/R y de la navegación por teclado.
- Los tokens de movimiento → `SceneController` (duraciones y curvas) y la variante reducida.
