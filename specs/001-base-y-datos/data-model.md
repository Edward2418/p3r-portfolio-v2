# Modelo de datos: Fase 1 — Base y datos

**Fecha**: 2026-10-22 | **Especificación**: [spec.md](./spec.md) | **Investigación**: [research.md](./research.md)

Todo el contenido vive en archivos TypeScript tipados en `src/content/`. No hay base de datos.
Los identificadores van en inglés; los textos visibles, en español e inglés por campo.

## Tipos base

| Tipo | Forma | Reglas |
|---|---|---|
| `Lang` | `'es' \| 'en'` | Idiomas soportados. El resto de idiomas del navegador cae en `'en'`. |
| `Localized` | `{ es: string; en: string }` | Ambos idiomas obligatorios y no vacíos tras recortar espacios (FR-011). |
| `Provisional` | `provisional?: boolean` | Si es `true`, se muestra la etiqueta "Provisional" junto al bloque (FR-012). Se elimina al confirmar el dato. |

`localize(valor, lang)` devuelve el texto en el idioma pedido. Es la única forma de leer un `Localized`.

## Entidades

### Profile (perfil, "Quién soy")

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `name` | `string` | Sí | Nombre completo de Edward (no se traduce). |
| `headline` | `Localized` | Sí | Frase corta de presentación. |
| `summary` | `Localized` | Sí | Texto de presentación. |
| `provisional` | `boolean` | No | `true` en esta fase hasta que Edward confirme el texto. |

Edward redacta o confirma el texto real; los datos de ejemplo se marcan provisionales (regla 10 del contexto maestro).

### StackCategory (categoría de stack)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | `'frontend' \| 'backend' \| 'data-tools'` | Sí | Exactamente tres categorías; únicas. |
| `name` | `Localized` | Sí | |
| `technologies` | `Technology[]` | Sí | Al menos una. |

### Technology (tecnología)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | `string` | Sí | Único en todo el stack. |
| `name` | `string` | Sí | Nombre propio de la tecnología (no se traduce). |
| `level` | `1 \| 2 \| 3 \| 4 \| 5` | Sí | Escala de nivel; valor de ejemplo mientras sea provisional. |
| `provisional` | `boolean` | No | Los niveles de ejemplo se marcan `true`. |

Relación: una `StackCategory` contiene una o más `Technology`.

### Project (proyecto)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | `string` | Sí | Único; en minúsculas con guiones. |
| `title` | `Localized` | Sí | |
| `summary` | `Localized` | Sí | |
| `description` | `Localized` | Sí | |
| `technologies` | `string[]` | Sí | IDs de `Technology` existentes. |
| `status` | `'planning' \| 'in-progress' \| 'completed'` | Sí | Etiqueta visible traducida desde los textos de interfaz. |
| `links` | `{ repository?: string; demo?: string }` | No | Un enlace ausente no se renderiza (FR-009). Las direcciones deben ser URL `https`. |
| `screenshots` | `Screenshot[]` | No | Vacío en esta fase. |

`Screenshot` = `{ src: string; alt: Localized }` (el texto alternativo es obligatorio por accesibilidad).
Hoy contiene un solo proyecto: este portafolio. Agregar otro es añadir un objeto a la lista (FR-010, SC-004).

### Character (personaje de Social Link)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `id` | `string` | Sí | Único. |
| `name` | `string` | Sí | |
| `arcana` | `Localized` | Sí | Arcano. |
| `rank` | `number` (1–10) | Sí | Rango. |
| `shortText` | `Localized` | Sí | Texto corto. |
| `provisional` | `boolean` | No | `true` mientras Edward no confirme el texto. |

Sin imagen en esta fase (el arte llega en la fase 5). Personajes iniciales según el contexto maestro: Leon S. Kennedy, Resident Evil, Persona 3 Reload y Super Mario Galaxy; Oguri Cap es el hilo conductor, no un Social Link.

### Contact (contacto)

| Campo | Tipo | Obligatorio | Notas |
|---|---|---|---|
| `github` | `string` | Sí | `https://github.com/Edward2418`. |
| `email` | `string` | No | Vacío en esta fase. |
| `linkedin` | `string` | No | Vacío en esta fase. |
| `cv` | `string` | No | Vacío en esta fase. |

Los campos opcionales ausentes no generan elemento, espacio ni error (FR-009, SC-005).

### UiText (textos de interfaz)

Mapa tipado de claves a `Localized` para todo texto que no es contenido de portafolio: etiquetas de secciones, "Provisional", estados de proyecto, nombre accesible del selector de idioma, título y descripción del documento. Los componentes solo leen claves de aquí (FR-008).

### LanguagePreference (preferencia de idioma)

No es una entidad persistente en servidor. Es la cookie `lang` con valor `es` o `en`, escrita por el selector. Prioridad al resolver el idioma: ruta explícita > cookie > `Accept-Language` > `en` (ver [contracts/routing-i18n.md](./contracts/routing-i18n.md)).

### DesignToken (token de diseño)

Variables CSS definidas una sola vez en `src/app/globals.css` (ver [research.md](./research.md), D8). Categorías: color, tipografía, duración y curva de movimiento.

## Reglas de validación (pruebas unitarias)

1. Todo `Localized` tiene `es` y `en` no vacíos.
2. Los `id` son únicos dentro de su colección; las categorías de stack son exactamente tres.
3. Cada tecnología referenciada por un proyecto existe en el stack.
4. Los enlaces definidos son URL `https` válidas; los ausentes no se exigen.
5. `level` está entre 1 y 5 y `rank` entre 1 y 10.
6. Todo `Screenshot` tiene `alt` en ambos idiomas.
7. Los pares de color de texto de los tokens cumplen AA (contraste calculado).

## Transiciones de estado

- **Provisional → confirmado**: Edward valida el dato y elimina `provisional: true`; la etiqueta desaparece sin tocar componentes.
- **Enlace ausente → presente**: al añadir la dirección, el enlace aparece sin tocar componentes.
