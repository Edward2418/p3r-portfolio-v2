# Plan de implementación: Fase 4 — Quién soy y Stack

**Rama**: `004-quien-soy-y-stack` | **Fecha**: 2026-10-23 | **Especificación**: [spec.md](./spec.md)

**Entrada**: Especificación de la funcionalidad en `specs/004-quien-soy-y-stack/spec.md`

## Resumen

Construir las dos primeras pantallas con diseño propio sobre el marco, el personaje y la transición de las fases 2 y 3: **Quién soy** (una ficha con el perfil, la presentación y la trayectoria en orden cronológico) y **Stack** (tres círculos solapados con las tecnologías de cada categoría, su nivel de 1 a 5 y la etiqueta central "Full-Stack"). El contenido sale de datos bilingües y todo lo no confirmado por Edward se muestra como provisional.

Enfoque técnico (resuelto en [research.md](./research.md)): **sin dependencias nuevas y sin JavaScript de cliente nuevo**. Ambas pantallas son componentes de servidor con HTML semántico (listas, listas de definición y encabezados) y CSS; los círculos son decoración (bordes y un tinte tras el texto) sobre el mismo DOM que leen los lectores de pantalla, así que el equivalente textual no es una copia sino la propia estructura. Oguri cambia de posición, escala e inclinación por pantalla con atributos `data-scene` y propiedades CSS, bajo la cobertura del barrido existente.

## Contexto técnico

**Lenguaje/Versión**: TypeScript 5.9 sobre Node.js `>=22.18`

**Dependencias principales**: Next.js 16.4.2, React 19.3, Tailwind CSS 4.3; **sin dependencias nuevas**

**Almacenamiento**: datos tipados en `src/content/` (`profile.ts`, `stack.ts` y `timeline.ts` nuevo); sin almacenamiento nuevo en el cliente

**Pruebas**: `node --test` (unitarias) y `@playwright/test` (E2E en 390, 768 y 1280 px en Chromium y 1280 px en Firefox); axe-core y Lighthouse bajo demanda, fuera del repositorio

**Plataforma de destino**: navegadores de escritorio y móvil (Chromium y Firefox; WebKit/Safari y un dispositivo real siguen pendientes); Vercel

**Tipo de proyecto**: aplicación web de un solo proyecto, con renderizado estático

**Objetivos de rendimiento**: carga inicial ≤ 350 KiB (hoy 272 a 285 KiB; esta fase solo añade HTML y CSS); Lighthouse móvil rendimiento al nivel de la fase 3 (82 a 88 en local, ≥ 90 en la dirección pública) y accesibilidad 100; contenido esencial visible a los 5 s

**Restricciones**: solo `transform` y `opacity` en el movimiento; movimiento reducido; sin desplazamiento horizontal en 390, 768 y 1280 px; contraste AA verificable; contenido solo confirmado por Edward; sin apellido completo ni año de titulación publicados

**Escala/Alcance**: 2 pantallas, 3 categorías, hasta unas 6 tecnologías por categoría, 5 hitos de trayectoria; 2 idiomas

## Verificación de la constitución

*Puerta: debe pasar antes de la Fase 0 y revisarse tras el diseño de la Fase 1.*

| Principio / regla | Evaluación inicial | Evaluación tras el diseño |
|---|---|---|
| I. Contenido primero | Aplica: son dos de las tres secciones que un reclutador debe alcanzar. | Cumple: todo el contenido está en el HTML estático de la ruta (sin JavaScript nuevo) y ninguna animación nueva retrasa su lectura (D8). |
| II. Movimiento fiel, interrumpible y accesible | Aplica poco: no se añade movimiento nuevo. | Cumple: se reutilizan la transición y la entrada escalonada de las fases 2 y 3; solo cambia la posición de Oguri por pantalla bajo el barrido, y con movimiento reducido se funde (D7). |
| III. Accesibilidad | Aplica de lleno: los círculos son un recurso visual. | Cumple: el equivalente textual es la propia estructura (encabezados, listas y niveles como texto), el gráfico es decorativo, hay contraste verificable y no hay controles interactivos nuevos (D3, D9, D10). |
| IV. Contenido en datos tipados y bilingüe | Aplica. | Cumple: perfil, trayectoria, tecnologías y la etiqueta central en `src/content/`; validaciones nuevas en las pruebas de datos (D6, D11). |
| V. Honestidad y derechos | Aplica de lleno: datos personales y trayectoria. | Cumple: todo dato sin confirmar lleva la etiqueta provisional y una prueba impide publicar el apellido completo y el año de titulación (D6). |
| VI. Fases y trazabilidad | Aplica. | Cumple: solo el alcance de la fase 4; el insumo existe antes de la especificación; trazabilidad en `tasks.md`. |
| Stack | Aplica. | Cumple: sin cambiar Next 16, React 19, TypeScript, Tailwind 4 ni Vercel. |
| Rendimiento y carga bajo demanda | Aplica. | Cumple por diseño: componentes de servidor y CSS; cero KiB de JavaScript de cliente nuevo. |
| Seguridad y privacidad | Aplica: datos personales. | Cumple: solo los datos decididos por Edward; sin formularios ni almacenamiento nuevos. |
| Dependencias | Aplica. | Cumple: ninguna nueva; se descarta una biblioteca de gráficos (D1). |

**Resultado de la puerta**: sin violaciones. Riesgos aceptados con medición: la legibilidad del texto dentro de los círculos con muchas tecnologías y la adaptación a 390 px (D2).

## Estructura del proyecto

### Documentación (esta funcionalidad)

```text
specs/004-quien-soy-y-stack/
├── plan.md                    # Este archivo (salida de /speckit-plan)
├── research.md                # Fase 0 (salida de /speckit-plan)
├── data-model.md              # Fase 1 (salida de /speckit-plan)
├── quickstart.md              # Fase 1 (salida de /speckit-plan)
├── contracts/
│   ├── profile-screen.md      # Ficha, presentación y trayectoria
│   ├── stack-circles.md       # Círculos, niveles, etiqueta central, equivalente textual y adaptación
│   └── character-per-scene.md # Posición, escala e inclinación de Oguri por pantalla
├── checklists/
│   └── requirements.md        # Calidad de la especificación
└── tasks.md                   # Fase 2 (salida de /speckit-tasks; no lo crea /speckit-plan)
```

### Código fuente (raíz del repositorio)

```text
src/
├── app/
│   ├── globals.css                    # Estilos de la ficha, la trayectoria, los círculos y la posición de Oguri por pantalla; tokens nuevos
│   └── [lang]/
│       ├── profile/page.tsx           # Renderiza la ficha y la trayectoria dentro de ScreenFrame
│       └── stack/page.tsx             # Renderiza los círculos dentro de ScreenFrame
├── components/
│   ├── profile/
│   │   ├── ProfileSheet.tsx           # Servidor: nombre, titular, datos de la ficha y presentación
│   │   └── Timeline.tsx               # Servidor: trayectoria en orden cronológico
│   ├── stack/
│   │   └── StackCircles.tsx           # Servidor: tres círculos, niveles y etiqueta central
│   ├── scene/
│   │   └── SceneShell.tsx             # + data-scene; fundido del personaje también al cambiar de pantalla
│   └── sections/                      # ProfileSection y StackSection se reemplazan por los anteriores
├── content/
│   ├── types.ts                       # Profile ampliado, TimelineEntry y etiqueta central
│   ├── profile.ts                     # + especialidad, institución y semestre
│   ├── timeline.ts                    # Cinco hitos (nuevo)
│   ├── stack.ts                       # + etiqueta central "Full-Stack" y tecnologías candidatas
│   └── ui-text.ts                     # + etiquetas de la ficha, de la trayectoria y de los niveles
└── lib/
    └── scene/                         # (sin cambios)

tests/
├── unit/                              # content.test.ts (reglas nuevas), tokens.test.ts (+ tinte de los círculos)
└── e2e/                               # profile.spec.ts, stack.spec.ts, character-per-scene.spec.ts (+ ajustes a language, layout y screen-frame)
```

**Decisión de estructura**: se mantiene el proyecto único. Las dos pantallas son componentes de servidor sin estado; la única pieza de cliente que cambia es `SceneShell`, que publica `data-scene` y amplía el fundido del personaje con movimiento reducido. No hay lógica pura nueva salvo las validaciones de datos, que se prueban con `node --test`.

## Seguimiento de complejidad

Sin violaciones de la constitución; no aplica.

## Riesgos y puntos a verificar al implementar

- **Texto dentro de los círculos**: con muchas tecnologías en una categoría el círculo puede crecer o el texto salirse del trazo. Se fija un máximo recomendado y se prueba con la lista más larga (D2).
- **Adaptación a 390 px**: tres círculos solapados no caben a tamaño de escritorio; el diseño apilado debe conservar la lectura y el solapamiento visual (D2). Se revisa con capturas.
- **Contraste con el tinte**: el tinte de cada círculo debe mantener AA con el texto; se verifica con una prueba que mezcla los colores (D10).
- **Posición de Oguri**: con una sola pose, la posición, la escala y la inclinación por pantalla deben notarse sin tapar el contenido; se afinan con capturas a 1024, 1280 y 1920 px (D7).
- **Datos sin confirmar**: la presentación, el semestre y los hitos son borradores provisionales hasta que Edward los confirme; la fase no se cierra sin su confirmación (SC-009).
- **Pruebas heredadas**: `language.spec.ts` espera un encabezado de nivel 2 "Stack"; se conserva. Las pruebas de `screen-frame` y de diseño se ajustan donde dependan de las secciones anteriores (D12).
- **Traducciones**: las propone el asistente y Edward las confirma.
- **WebKit/Safari y un dispositivo real**: siguen sin verificarse, según el contexto maestro.
