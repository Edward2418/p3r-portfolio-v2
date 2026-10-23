# Insumo de especificación - Fase 4: Quién soy y Stack

> **Referencias obligatorias para el agente:**
> - Contexto maestro: `docs/project-context.md` (secciones 6, 7, 8, 9, 10 y 14)
> - Constitución: `.specify/memory/constitution.md` (versión 1.0.1)
> - Fases anteriores: `docs/sprints/fase-2-escena-y-menu.md`, `docs/sprints/fase-3-identidad-visual-p3r.md` y `specs/002-escena-y-menu/`, `specs/003-identidad-visual-p3r/` (en especial `research.md` y `contracts/scene-layout.md`)
> - Este documento describe únicamente el alcance de esta fase.

## 1. Contexto de la fase

Es la cuarta de siete fases. Las fases 2 y 3 dejaron el motor (menú, transiciones, accesibilidad), el aspecto de P3R, a Oguri como personaje persistente y un marco común para las cinco pantallas, pero las pantallas siguen mostrando el contenido provisional de la fase 1 (listas de texto). Esta fase construye las dos primeras pantallas con su diseño propio: **Quién soy** (la ficha del personaje) y **Stack** (los círculos de tecnologías). Son dos de las tres secciones que un reclutador debe alcanzar en tres interacciones o menos (Principio I).

## 2. Objetivo

Que un visitante entienda en menos de un minuto quién es Edward y con qué tecnologías trabaja, a través de dos pantallas con el lenguaje visual de las pantallas Stats y Social Stats de P3R, con contenido real confirmado por Edward, accesibles y con las transiciones y el personaje de las fases anteriores.

## 3. Historias de usuario de la fase

> Formato: "Como [rol], quiero [acción] para [beneficio]".

- **US1** - Como reclutador, quiero ver en "Quién soy" una ficha con el nombre de Edward, su perfil y una presentación breve, para saber quién es sin leer largos textos.
- **US2** - Como reclutador, quiero ver su formación y trayectoria breve (lo que antes era el Timeline) dentro de "Quién soy", para entender su recorrido y en qué punto está.
- **US3** - Como reclutador, quiero ver en "Stack" las tecnologías agrupadas en tres círculos solapados (frontend, backend, bases de datos y herramientas) con su nivel, para saber con qué trabaja y qué tan a fondo.
- **US4** - Como visitante con lector de pantalla o con un teléfono pequeño, quiero acceder a la misma información de ambas pantallas sin depender de lo visual, para no perderme nada.
- **US5** - Como visitante, quiero que Oguri acompañe estas pantallas con una posición y entrada propias, para que sigan sintiéndose parte del mismo recorrido.
- **US6** - Como Edward, quiero que mi perfil, mi formación, mi trayectoria y mis tecnologías vivan en datos bilingües y que lo no confirmado se vea marcado como provisional, para publicar solo lo que es cierto y cambiarlo sin tocar componentes.

## 4. Flujo demostrable al cierre de la fase

    Abrir el menú -> elegir "Quién soy"
    -> Transición de la fase 3; llega la pantalla con la ficha: nombre, perfil, presentación y trayectoria
    -> Oguri entra desde la derecha y queda a un lado sin tapar el contenido
    -> Pasar a "Stack" con R o con el deslizamiento
    -> Tres círculos solapados con las tecnologías de cada categoría y su nivel
    -> Lo no confirmado se ve marcado como provisional
    -> Recorrer ambas pantallas con teclado y con lector de pantalla: la misma información en orden lógico
    -> En 390 px todo sigue legible, sin desplazamiento horizontal

## 5. Contenido y datos que cubre esta fase

> Lo que Edward no haya confirmado no se publica como cierto: se muestra como provisional (Principio V).

| Dato | Estado |
| --- | --- |
| Nombre y titular (`profile.ts`) | Existe: "Edward Negrete" y "Estudiante de Ingeniería en Sistemas Computacionales" |
| Presentación (resumen) | **Por redactar o confirmar por Edward**; hoy es un texto de ejemplo provisional |
| Formación y trayectoria | **Candidato de la v1, por confirmar:** inicio de carrera en 2023, materias de 3.º y 4.º semestre en 2024, 5.º y 6.º en 2025, semestre actual y titulación prevista; con institución (TecNM, ITSH, Huauchinango) y especialidad "Full-Stack y Videojuegos" |
| Datos personales extra (apellido completo, semestre exacto, institución, año de titulación) | **Por decidir por Edward** qué se publica |
| Tecnologías y niveles (`stack.ts`) | Existe una lista de ejemplo provisional (Next.js, React, TypeScript, Tailwind CSS, Node.js, Git, Playwright y Vercel); **candidatos de la v1:** Java, SQL y bases de datos, HTML/CSS y JavaScript. Edward confirma tecnologías y niveles |
| Escala de nivel | Existe 1 a 5; la v1 usaba porcentajes. Se mantiene 1 a 5 salvo decisión contraria |
| Textos de interfaz nuevos (etiquetas de la ficha, de los círculos, de la trayectoria) | Se amplía `src/content/ui-text.ts` en ambos idiomas |
| Traducciones al inglés | Las propone Claude; Edward las confirma |
| Arte | Solo Oguri existente (póster e idle de la fase 3); sin arte nuevo |

## 6. Reglas aplicables (de la constitución)

- Principio I: "Quién soy", "Stack" y "Proyectos" a 3 interacciones o menos; contenido esencial visible a los 5 s; ninguna animación retrasa el acceso a la información.
- Principio II: movimiento fiel a la referencia, interrumpible y accesible; solo `transform` y `opacity`; movimiento reducido. Si los círculos o las fichas se animan al entrar, se usan las skills `animate` y `animation-performance`, y antes de cerrar la fase `review-animations`.
- Principio III: teclado, toque y lector de pantalla; contraste AA; foco visible; sin desplazamiento horizontal en 390, 768 y 1280 px. Una representación visual de niveles necesita equivalente textual.
- Principio IV: contenido en datos tipados bilingües; los componentes no contienen textos; agregar una tecnología o un hito solo requiere datos.
- Principio V: solo contenido confirmado por Edward; sin empleos, certificaciones ni datos personales inventados; aviso de no afiliación visible; identidad propia (no una copia de las pantallas del juego).
- Principio VI: trazabilidad y cierre de fase con pruebas, rendimiento y accesibilidad verificados.
- Rendimiento: carga inicial ≤ 350 KiB; Lighthouse móvil ≥ 90 (referencia local 82 a 88) y accesibilidad 100.

## 7. Criterios de aceptación

- [ ] CA-1 "Quién soy" muestra el nombre, el perfil y la presentación, con los datos confirmados por Edward y lo demás marcado como provisional.
- [ ] CA-2 "Quién soy" muestra la formación y la trayectoria en orden cronológico, sin referencias no confirmadas.
- [ ] CA-3 "Stack" muestra las tecnologías en tres círculos solapados con su nivel, y la misma información está disponible como texto para lectores de pantalla.
- [ ] CA-4 Ambas pantallas son legibles y operables en 390, 768 y 1280 px, sin desplazamiento horizontal y con Oguri sin tapar el contenido.
- [ ] CA-5 Con movimiento reducido no hay animaciones de desplazamiento y con movimiento completo la entrada respeta los tiempos y la interrupción de las fases anteriores.
- [ ] CA-6 Agregar una tecnología o un hito de la trayectoria no requiere tocar componentes.
- [ ] CA-7 Textos en español e inglés completos; el cambio de idioma conserva la pantalla.
- [ ] CA-8 axe-core sin violaciones, contraste AA y carga inicial ≤ 350 KiB.
- [ ] CA-9 Lint, compilación, pruebas unitarias y E2E (390, 768 y 1280 px) pasan; `review-animations` sin hallazgos abiertos; Edward confirma el contenido.

## 8. Fuera de alcance de esta fase

- Proyectos (fase 5), Social Link y personajes (fase 6) y System, contacto y cierre (fase 7).
- Arte nuevo, más poses de Oguri y uso de Higgsfield.
- CV descargable, correo y LinkedIn (pendientes de Edward para la fase 7).
- Música de fondo y efectos de sonido nuevos (los de la fase 3 ya existen).
- Un Timeline como sección propia (descartado: su contenido va en "Quién soy").
- Gráficos de habilidades dependientes de bibliotecas nuevas (sin dependencias nuevas sin justificar).

## 9. Decisiones pendientes que deben resolverse en /speckit.clarify

> No deben asumirse sin confirmación.

- Qué datos personales se publican (apellido completo, semestre actual, institución y año de titulación previsto) y cuáles quedan fuera.
- Texto definitivo de la presentación (o aprobar un borrador de Claude en español e inglés).
- Qué hitos tiene la trayectoria (los de la v1 incluyen 2023, 2024, 2025, el semestre actual y la titulación) y cuáles se confirman; si se muestra el hito futuro de titulación.
- Lista definitiva de tecnologías, su agrupación en las tres categorías y su nivel de 1 a 5 (si se añaden Java, SQL, HTML/CSS y JavaScript de la v1).
- Cómo se representa el solapamiento de los tres círculos (qué significan las intersecciones) y cómo se lee el nivel (puntos, estrellas o número).
- Si los círculos y las fichas se animan al entrar (y cómo) o aparecen quietos con la entrada general de la escena.
- Posición, escala y rotación de Oguri en cada una de las dos pantallas, dado que solo hay una pose.
- Si "Quién soy" muestra "estadísticas" de la ficha (por ejemplo, atributos) o solo perfil, formación y trayectoria.

## 10. Restricciones técnicas heredadas

- Las de las fases 2 y 3 (`docs/sprints/fase-2-escena-y-menu.md` y `fase-3-identidad-visual-p3r.md`, sección 10): Next.js 16.4.2, React 19, TypeScript 5.9 y Tailwind 4; leer la guía en `node_modules/next/dist/docs/` antes de escribir código de Next; rutas `app/[lang]`; tokens solo en `src/app/globals.css`; contenido en datos tipados con `Localized`; importaciones relativas con extensión `.ts` en `src/lib` y `src/content`.
- Reutilizar el marco de pantallas (`ScreenFrame`), `SceneBackdrop`, `Character` y los contratos de `specs/003-identidad-visual-p3r/contracts/`; no romper el anuncio de ruta, el foco en el `<h1>`, la transición ni el sonido.
- Animación con WAAPI y CSS, sin dependencias nuevas; solo `transform` y `opacity`; respetar movimiento reducido (sistema y sitio).
- Pruebas: unitarias con `node --test` y E2E con Playwright (390, 768 y 1280 px en Chromium y 1280 px en Firefox); con memoria limitada usar `--workers=2` y un proyecto a la vez; WebKit/Safari y un dispositivo real siguen pendientes.
- Sin secretos en el repositorio y sin dependencias nuevas sin justificarlas; `npm audit --omit=dev` antes de desplegar.
- Documentar cada decisión técnica en `research.md`, con su razón.
- Trabajar en la rama de la fase y fusionar con un pull request; commits convencionales (tipo y alcance en inglés, descripción en español).
- Idioma: español en documentos, comentarios y pruebas; identificadores de código en inglés.
