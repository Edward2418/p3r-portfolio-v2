# Contrato: rutas e idioma

**Especificación**: [../spec.md](../spec.md) | **Modelo de datos**: [../data-model.md](../data-model.md)

Define la interfaz pública del sitio en esta fase: direcciones, redirecciones, cookie y atributos observables. Las pruebas E2E se escriben contra este contrato.

## Rutas

| Dirección | Respuesta |
|---|---|
| `/es` | Página inicial en español, `<html lang="es">`. |
| `/en` | Página inicial en inglés, `<html lang="en">`. |
| `/` | Redirección a `/es` o `/en` según la prioridad de abajo. |
| `/<ruta-sin-idioma>` (p. ej. `/proyectos`) | Redirección a `/<idioma><ruta>`; si la ruta no existe, 404 en el idioma resuelto. |
| `/<otro-idioma>` (p. ej. `/fr`) | 404. |
| Archivos internos (`/_next/*`) y estáticos | No pasan por la redirección de idioma. |

Las rutas son estáticas (generadas en la compilación para `es` y `en`).

## Prioridad para resolver el idioma de una ruta sin idioma

1. Cookie `lang` con valor `es` o `en`.
2. Cabecera `Accept-Language`: se toma el primer idioma de mayor prioridad cuyo código base sea `es` o `en` (`es-MX` → `es`, `en-GB` → `en`).
3. Inglés (`en`) si nada coincide (decisión de Edward).

Una ruta que ya incluye `/es` o `/en` **nunca** se redirige: la dirección explícita manda sobre la cookie.

## Cookie `lang`

| Atributo | Valor |
|---|---|
| Nombre | `lang` |
| Valores válidos | `es`, `en`. Cualquier otro valor se ignora. |
| Quién la escribe | El selector de idioma, al pulsarlo. |
| Duración | 1 año |
| Ruta | `/` |
| `SameSite` | `Lax` |
| Contenido | Solo el código de idioma; sin datos personales. |

## Selector de idioma

- Es un enlace (`<a>`) a la misma página en el otro idioma; funciona con teclado y sin JavaScript para navegar.
- Nombre accesible traducido; indica el idioma al que cambia (p. ej. "English" / "Español") con su atributo `lang` propio.
- Al activarlo, escribe la cookie `lang` con el idioma destino.
- Foco visible con contraste AA.

## Atributos observables en la página inicial

| Elemento | Contrato |
|---|---|
| `<html lang>` | Igual al idioma de la ruta. |
| `<title>` y descripción | Traducidos al idioma de la ruta. |
| Etiqueta "Provisional" | Aparece solo junto a bloques con `provisional: true`; texto traducido. |
| Enlaces opcionales (correo, LinkedIn, CV, repositorio, demo) | No se renderizan si no tienen dirección. |
| Enlace a GitHub | Siempre presente, apunta a `https://github.com/Edward2418`. |
| Pie de página | Siempre presente; muestra el aviso de proyecto de aprendizaje sin fines comerciales y sin afiliación a los propietarios de las franquicias, en el idioma de la ruta (FR-019). |
| Desplazamiento horizontal | Ninguno en 390, 768 y 1280 px de ancho. |
| Textos de contenido | Todos provienen de los datos; ninguno está escrito en componentes. |
