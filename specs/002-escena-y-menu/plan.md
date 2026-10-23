# Plan de implementación: Fase 2 — Escena y menú

**Rama**: `002-escena-y-menu` | **Fecha**: 2026-10-22 | **Especificación**: [spec.md](./spec.md)

**Entrada**: Especificación de la funcionalidad en `specs/002-escena-y-menu/spec.md`

## Resumen

Construir la escena del sitio: un splash corto y omitible, un menú principal con la estética del menú de pausa de Persona 3 Reload, cinco pantallas con dirección propia (`/es/stack`, `/en/projects`, etc.) y un motor de transiciones que se reutilizará en todas las fases siguientes. Las pantallas muestran por ahora el contenido de la página de verificación de la fase 1, repartido por pantalla.

Enfoque técnico (resuelto en [research.md](./research.md)): **Web Animations API y CSS, sin dependencias nuevas**; un componente de cliente persistente (`SceneShell`) en el layout de `[lang]` orquesta el flujo salida → navegación → entrada → pausa → cierre; solo `transform` y `opacity`; tiempos y curvas como tokens; interrupción con `finish()`; movimiento reducido por sistema o interruptor del sitio aplicado antes de pintar; splash servido en el HTML solo en el menú.

## Contexto técnico

**Lenguaje/Versión**: TypeScript 5.9 sobre Node.js `>=22.18`

**Dependencias principales**: Next.js 16.4.2, React 19.3, Tailwind CSS 4.3; **sin dependencias nuevas** (animación con WAAPI)

**Almacenamiento**: datos en `src/content/`; `localStorage` (`motion`) y `sessionStorage` (`splash-seen`) en el cliente; cookie `lang` de la fase 1

**Pruebas**: `node --test` (unitarias) y `@playwright/test` (E2E con emulación táctil y de movimiento reducido); Lighthouse bajo demanda

**Plataforma de destino**: navegadores de escritorio y móvil (Chromium y Firefox; WebKit y un dispositivo real pendientes); Vercel

**Tipo de proyecto**: aplicación web de un solo proyecto, con renderizado estático y componentes de cliente acotados

**Objetivos de rendimiento**: transición de 500 a 800 ms a 60 fps en un móvil de gama media; interrupción en menos de 100 ms; Lighthouse móvil rendimiento ≥ 90 y accesibilidad 100 (antes y después de cerrar el splash); carga inicial ≤ 350 KiB

**Restricciones**: solo `transform` y `opacity`; contenido visible a los 5 s; sin desplazamiento horizontal en 390, 768 y 1280 px; contraste AA; sin dependencias sin justificar; sin audio, video ni arte nuevo

**Escala/Alcance**: 1 menú, 5 pantallas, 1 motor de transición, 1 splash, 1 interruptor de movimiento; 2 idiomas

## Verificación de la constitución

*Puerta: debe pasar antes de la Fase 0 y revisarse tras el diseño de la Fase 1.*

| Principio / regla | Evaluación inicial | Evaluación tras el diseño |
|---|---|---|
| I. Contenido primero | En riesgo por el splash y las transiciones; se mitiga con las reglas de la especificación. | Cumple: el HTML del menú y de cada pantalla ya está en el documento (rutas estáticas); el splash es una capa que se cierra sola a los 1.5 s o con cualquier entrada, y no existe en enlaces directos (D7); la transición se puede saltar (D5); Quién soy, Stack y Proyectos quedan a 2 interacciones del menú (SC-002). |
| II. Movimiento fiel, interrumpible y accesible | Aplica de lleno. | Cumple con un riesgo declarado: la secuencia se traduce solo a `transform` y `opacity` (D3); 500 a 800 ms con prueba de la suma de tramos (D4); interrupción con `finish()` (D5); movimiento reducido por sistema o sitio (D6). **Riesgo**: el recorte de las fichas por el borde del círculo no se reproduce literalmente; la revisión contra el video (SC-008) lo valida. Tiempos calibrados con el video; la comparación visual final se hace en T044 y T070. |
| III. Accesibilidad | Aplica. | Cumple: teclado completo (D9), foco en el `<h1>` del destino y anuncio por título (D11), gestos con alternativa de un toque (D10), contraste AA y foco visible heredados. Revisión con lector de pantalla pendiente de Edward. |
| IV. Contenido en datos tipados y bilingüe | Aplica. | Cumple: `menu.ts` y textos nuevos en `ui-text.ts`; tokens de movimiento en `globals.css`; pruebas de validación (D12, [data-model.md](./data-model.md)). |
| V. Honestidad y derechos | Aplica. | Cumple: el aviso de no afiliación se mantiene en el pie de todas las pantallas; el marcador del personaje es una silueta propia, sin arte copiado (D13). |
| VI. Fases y trazabilidad | Aplica. | Cumple: solo el alcance de la fase 2; trazabilidad en `tasks.md` (se genera con `/speckit-tasks`). |
| Stack | Aplica. | Cumple: sin cambiar Next 16, React 19, TypeScript, Tailwind 4 ni Vercel. |
| Rendimiento y carga bajo demanda | Aplica. | Cumple por diseño: cero KiB de librería nueva; componentes de cliente acotados; sin audio ni video (D15). Se mide antes y después del splash. |
| Seguridad y privacidad | Aplica. | Cumple: solo `localStorage` y `sessionStorage` con preferencias de presentación, sin datos personales ni analítica. |
| Dependencias | Aplica. | Cumple: ninguna nueva; se justifica el descarte de Motion y de View Transitions (D1). |

**Resultado de la puerta**: sin violaciones. El riesgo del Principio II (recorte por el círculo) se acepta como aproximación documentada; si Edward lo considera esencial, se propone una enmienda explícita de la constitución, no una excepción silenciosa.

## Estructura del proyecto

### Documentación (esta funcionalidad)

```text
specs/002-escena-y-menu/
├── plan.md                    # Este archivo (salida de /speckit-plan)
├── research.md                # Fase 0 (salida de /speckit-plan)
├── data-model.md              # Fase 1 (salida de /speckit-plan)
├── quickstart.md              # Fase 1 (salida de /speckit-plan)
├── contracts/
│   ├── routes-scenes.md       # Rutas, pantallas, splash y cabecera
│   ├── input-navigation.md    # Teclado, toque, deslizamiento e interrupción
│   └── scene-transition.md    # Secuencia, tokens, variante reducida y medición
├── checklists/
│   └── requirements.md        # Calidad de la especificación
└── tasks.md                   # Fase 2 (salida de /speckit-tasks; no lo crea /speckit-plan)
```

### Código fuente (raíz del repositorio)

```text
src/
├── app/
│   ├── globals.css                    # Tokens de movimiento nuevos y estilos del menú
│   └── [lang]/
│       ├── layout.tsx                 # + script en línea (data-motion, data-splash), cabecera, SceneShell
│       ├── page.tsx                   # Ahora: menú principal con splash
│       ├── profile/page.tsx           # Pantalla Quién soy
│       ├── stack/page.tsx             # Pantalla Stack
│       ├── projects/page.tsx          # Pantalla Proyectos
│       ├── social-link/page.tsx       # Pantalla Social Link
│       └── system/page.tsx            # Pantalla System
├── components/
│   ├── scene/
│   │   ├── SceneShell.tsx             # Cliente: contexto, navigate(), teclado, gestos, foco
│   │   ├── transition.ts              # Orquestador WAAPI (tramos, skip, medición)
│   │   ├── TransitionLayer.tsx        # Paneles y disco decorativos (aria-hidden)
│   │   ├── ScreenFrame.tsx            # Marco de pantalla: h1, fichas escalonadas, guía
│   │   └── GuideBar.tsx               # Guía contextual y botones Confirmar y Atrás, pestañas L y R
│   ├── menu/
│   │   ├── MainMenu.tsx               # Lista de opciones (enlaces), título de fondo
│   │   └── CharacterSlot.tsx          # Marcador del personaje (silueta)
│   ├── Splash.tsx                     # Capa del splash (cliente mínimo para omitir)
│   ├── MotionToggle.tsx               # Interruptor de movimiento reducido
│   ├── LanguageSwitcher.tsx           # Existente (fase 1)
│   ├── Footer.tsx                     # Existente (fase 1)
│   └── sections/                      # Existentes (fase 1): se reutilizan en las pantallas
├── content/
│   ├── menu.ts                        # Opciones del menú (nuevo)
│   ├── types.ts                       # + SceneId, MenuOption
│   └── ui-text.ts                     # + textos nuevos
└── lib/
    └── motion/
        ├── navigation.ts              # nextIndex, resolveScreenKey, shouldIgnoreKey y neighbors (puras)
        ├── swipe.ts                   # detectSwipe (pura)
        ├── timeline.ts                # parseCssTime, buildTimeline y staggerDelays (puras)
        ├── preference.ts              # Preferencia efectiva de movimiento (pura)
        └── init-script.ts             # Script en línea del <head> (data-motion y data-splash)

tests/
├── unit/                              # menu.test.ts, motion-tokens.test.ts, navigation.test.ts, swipe.test.ts, timeline.test.ts, preference.test.ts, init-script.test.ts
└── e2e/                               # menu.spec.ts (reemplaza a home.spec.ts), navigation.spec.ts, transition.spec.ts, interruption.spec.ts, reduced-motion.spec.ts, splash.spec.ts, guide.spec.ts (+ ajustes a layout y language)
```

**Decisión de estructura**: se mantiene el proyecto único. La lógica sin DOM va en funciones puras (`src/lib/motion/`) para probarla con `node --test`; el orquestador y los componentes de cliente son finos y se prueban con Playwright. Las rutas de pantalla son páginas de servidor que reutilizan las secciones de la fase 1 dentro de `ScreenFrame`. Se elimina el contenido actual de `src/app/[lang]/page.tsx` (la página de verificación), que se reparte por las pantallas.

## Seguimiento de complejidad

Sin violaciones de la constitución; no aplica.

## Riesgos y puntos a verificar al implementar

- **Calibración de tiempos con el video**: hecha el 2026-10-22 midiendo los cuadros de 70.0 a 71.7 s (`research.md`, D4); los tokens salen de esa medición (suma 700 ms). Al implementar, T044 compara lo construido con los cuadros y afina los valores. El video está en la raíz del repositorio y excluido con `.gitignore` (material de terceros).
- **Destino que tarda en llegar**: la pantalla permanece cubierta hasta 1.5 s (`--duration-nav-timeout`) y luego se muestra sin entrada escalonada; los 500 a 800 ms se exigen solo en transiciones completas con el destino precargado (contrato `scene-transition.md`).
- **Primera carga y splash**: cualquier primera carga de documento cuenta como visita; el splash solo se muestra en una carga completa de la raíz y nunca en navegaciones internas.
- **Fidelidad del cierre con círculo**: el recorte de las fichas por el borde no se reproduce literalmente (ver riesgo del Principio II).
- **Rendimiento**: la fase 1 ya mostró un rendimiento de 82 a 88 en Lighthouse móvil local por el entorno de React y Next; el JavaScript nuevo debe ser mínimo. Medir antes y después del splash.
- **Navegación de Next.js**: confirmar en `node_modules/next/dist/docs/` el comportamiento de `router.push`, `router.prefetch`, `useTransition` y el anunciador de rutas antes de escribir `SceneShell`; confirmar que el layout de `[lang]` se conserva entre las rutas hijas.
- **Foco tras la navegación**: verificar que el foco manual en el `<h1>` no choca con el manejo de foco del App Router.
- **Script en línea del `<head>`**: validar que React no avisa de diferencias de hidratación al cambiar atributos de `<html>`, y usar la supresión esperada solo donde corresponda (`suppressHydrationWarning` en `<html>`).
- **Gestos en dispositivos reales**: los umbrales son provisionales; probar en un móvil real (iOS y Android) por el gesto "atrás" del sistema.
- **Pruebas heredadas**: `home.spec.ts`, `layout.spec.ts` y `language.spec.ts` dependen de la página de verificación; se migran a menú y pantallas (D16).
- **WebKit/Safari y un dispositivo real**: siguen sin verificarse, según el contexto maestro.
