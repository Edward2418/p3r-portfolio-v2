# Contrato: rutas, pantallas y splash

**Especificación**: [../spec.md](../spec.md) | **Modelo de datos**: [../data-model.md](../data-model.md) | **Contrato de la fase 1**: [../../001-base-y-datos/contracts/routing-i18n.md](../../001-base-y-datos/contracts/routing-i18n.md)

Define la interfaz pública del sitio en esta fase. Las pruebas E2E se escriben contra este contrato. Lo no mencionado aquí se mantiene como en la fase 1.

## Rutas

| Dirección | Respuesta |
|---|---|
| `/es`, `/en` | Menú principal (con splash solo en una carga completa de la raíz en la primera visita de la sesión), `<html lang>` igual al idioma. |
| `/es/profile`, `/en/profile` | Pantalla Quién soy / About me: perfil. |
| `/es/stack`, `/en/stack` | Pantalla Stack: categorías y tecnologías. |
| `/es/projects`, `/en/projects` | Pantalla Proyectos / Projects: proyectos. |
| `/es/social-link`, `/en/social-link` | Pantalla Social Link: personajes. |
| `/es/system`, `/en/system` | Pantalla System: contacto y aviso de no afiliación. |
| `/` y rutas sin idioma | Redirección a `/es` o `/en` según el contrato de la fase 1 (cookie `lang` > `Accept-Language` > inglés). |
| `/es/otra-cosa`, `/en/otra-cosa` | 404 por defecto de Next.js (404 localizado en la fase 6). |

- Las direcciones son iguales en ambos idiomas y coinciden con el `id` de la opción de menú.
- Todas las rutas son estáticas (generadas en la compilación para `es` y `en`).
- El selector de idioma cambia el primer segmento y conserva el resto (`/es/stack` ↔ `/en/stack`).

## Contenido de las pantallas (FR-009)

| Pantalla | Contenido (componentes reutilizados de la fase 1) |
|---|---|
| `profile` | Sección de perfil |
| `stack` | Sección de stack |
| `projects` | Sección de proyectos |
| `social-link` | Sección de personajes |
| `system` | Sección de contacto y aviso de no afiliación (pie) |

Cada pantalla tiene un único `<h1>` con el nombre de la opción y un `<title>` propio traducido. El pie con el aviso de no afiliación (FR-019 de la fase 1) sigue visible en el menú y en todas las pantallas.

## Splash

| Regla | Contrato |
|---|---|
| Dónde existe | Solo en la página del menú (`/es` y `/en`); un enlace directo a una pantalla no lo incluye. |
| Cuándo se muestra | Solo en una carga completa de la raíz (`/`, `/es` o `/en`) en la primera visita de la sesión (`sessionStorage` sin `splash-seen`); nunca en una navegación interna. |
| Primera carga por otra ruta | Cualquier primera carga de documento cuenta como visita: si la primera página es una pantalla (por ejemplo `/es/projects`), se marca `splash-seen` y al volver al menú no aparece el splash. |
| Cierre automático | A los 1.5 s (`--duration-splash`), sin necesitar JavaScript. |
| Cierre manual | Cualquier tecla, clic o toque lo cierra de inmediato. |
| Persistencia | Al cerrarse se guarda `splash-seen = 1` en `sessionStorage`; recargar o volver al menú no lo muestra de nuevo. |
| Movimiento reducido | Se omite. |
| Contenido | El HTML del menú ya está en el documento debajo de la capa (visible sin JavaScript). |
| Accesibilidad | La capa es decorativa (`aria-hidden`) y no atrapa el foco; el contenido real es accesible desde el primer momento. |

## Atributos observables en `<html>`

| Atributo | Valores | Significado |
|---|---|---|
| `lang` | `es` · `en` | Idioma de la ruta. |
| `data-motion` | `reduced` (ausente = completo) | Modo efectivo de movimiento. |
| `data-splash` | `seen` (ausente = no visto) | Estado del splash. |

## Cabecera común (menú y pantallas)

- Selector de idioma (fase 1) y **interruptor de movimiento reducido**, juntos en el encabezado y operables con teclado.
- El interruptor tiene nombre accesible traducido y estado anunciado (`aria-pressed`). Si el sistema pide movimiento reducido, aparece activado y deshabilitado con una nota.
- La elección del sitio se guarda en `localStorage` (`motion`).

## Guía contextual y botones (abajo a la derecha, siempre visibles)

| Elemento | Contrato |
|---|---|
| Guía | En el menú, la descripción de la opción activa; en una pantalla, la acción disponible. |
| Confirmar | En el menú abre la opción activa; en una pantalla no tiene acción (aparece deshabilitado). |
| Atrás | En una pantalla vuelve al menú; en el menú aparece deshabilitado. |
| Pestañas L y R | En las pantallas, pasan a la anterior o siguiente según el orden del menú; siempre visibles y pulsables. |
