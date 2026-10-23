# Portafolio P3R v2 — Contexto maestro del proyecto

> **Documento de contexto para desarrollo asistido por IA (Claude Code + Spec Kit)**
>
> **Nombre del proyecto:** Portafolio personal de Edward Negrete (v2)
> **Estado:** Fase 1 (Base y datos) completada el 2026-10-22; fase 2 (Escena y menú) fusionada a `main` el 2026-10-23; fase 3 (Identidad visual P3R, intercalada por decisión de Edward) fusionada a `main` el 2026-10-23; pendientes de Edward: lector de pantalla, móvil real y PageSpeed
> **Tipo:** Portafolio profesional y proyecto de aprendizaje
> **Fecha de redacción:** 22/10/2026

**Convención de autoría de las decisiones.** Cada decisión indica quién la tomó:
**[Edward]** la dijo la persona dueña del proyecto; **[Claude]** es una propuesta que Edward aprobó en la conversación de diseño pero que puede cambiar; **[Pendiente]** aún no se decide. Si cambia una decisión **[Edward]**, hay que preguntarle antes.

---

# 1. Propósito de este archivo

Fuente de verdad del alcance de la v2. Permite que un agente de IA entienda qué se construye, para quién y con qué límites antes de generar código. Alimenta `/speckit.constitution` y los insumos de cada fase (`docs/sprints/`).

## Reglas para el agente de IA

1. No agregar funcionalidades fuera del alcance sin indicarlo y obtener aprobación.
2. Construir por fases, en orden (sección 14). No implementar todo de una vez.
3. **El contenido va primero y la animación después.** Ninguna animación puede impedir llegar a la información.
4. Respetar el presupuesto de rendimiento y accesibilidad (sección 11).
5. Antes de cambiar arquitectura, datos o reglas de negocio, revisar este documento y actualizarlo si cambia.
6. Si una decisión técnica no está definida aquí, proponer opciones antes de asumir una solución difícil de revertir.
7. Mantener trazabilidad: objetivo → requisito → historia → fase → implementación → prueba.
8. Este Next.js tiene cambios respecto a lo que el agente conoce: leer la guía correspondiente en `node_modules/next/dist/docs/` antes de escribir código de Next.
9. Usar las skills indicadas en la sección 12 cuando la tarea las active.
10. No inventar datos personales (empleos, certificaciones, enlaces). Solo contenido confirmado por Edward.

---

# 2. Contexto

Edward cursa el séptimo semestre de Ingeniería en Sistemas Computacionales (ITSH). Construyó una primera versión del portafolio con la estética del menú de **Persona 3 Reload (P3R)** usando una IA sin metodología previa. El resultado funciona y tiene buena base técnica (pruebas E2E, mediciones, despliegue preparado), pero:

- No hubo especificación previa, por lo que hubo mucho retrabajo visual (cerca de 25 commits de ajuste en un día).
- Las transiciones no alcanzan la limpieza del menú original.

La v2 rehace el proyecto desde cero con Spec Kit (SDD) y con el movimiento del menú de P3R como referencia principal.

# 3. Objetivo y criterios de éxito

**Objetivo [Edward]:** conseguir prácticas o empleo y servir como carta de presentación de lo que Edward realiza. Quien entre debe ver **quién es, sus proyectos y su stack, rápido**.

**Criterios de éxito (propuestos [Claude]):**

- CS-1. Un visitante que no conoce el sitio llega a "Quién soy", "Stack" y "Proyectos" en **3 interacciones o menos** desde la primera pantalla.
- CS-2. El contenido esencial es visible a los **5 s** de cargar el menú, sin esperar animaciones.
- CS-3. Puntuación de Lighthouse móvil ≥ 90 en rendimiento y 100 en accesibilidad (referencia v1: 84 móvil).
- CS-4. Todas las animaciones principales corren a 60 fps en un móvil de gama media y se pueden omitir.
- CS-5. Agregar un proyecto nuevo solo requiere añadir datos, sin tocar componentes.
- CS-6. Sitio completo en español e inglés.

## Anti-objetivos (qué sería un fracaso aunque "funcione")

- Que un reclutador con prisa se desespere por animaciones lentas o repetidas.
- Que el estilo oculte el contenido o lo haga ilegible (contraste, tamaño de texto).
- Que parezca una copia del juego en lugar de un portafolio con identidad propia.
- Que el sitio sea inaccesible con teclado, lector de pantalla o movimiento reducido.

# 4. Audiencia y actores

| Actor | Descripción | Necesita |
| --- | --- | --- |
| Reclutador / líder técnico | Revisa muchos portafolios (se estiman 30 s a 2 min por sitio) **[Claude]** | Quién es, stack, proyectos, contacto, rápido |
| Docente / compañero | Evalúa o comparte el proyecto | Ver el proceso y la calidad técnica |
| Edward (administrador) | Mantiene el contenido | Agregar proyectos y textos sin tocar componentes |

Los visitantes usan escritorio y móvil. No hay cuentas ni login.

# 5. Requisitos de alto nivel

1. Como visitante, quiero entrar al sitio y llegar al menú principal rápidamente para empezar a explorar.
2. Como reclutador, quiero ver quién es Edward para valorar su perfil.
3. Como reclutador, quiero ver su stack agrupado y con nivel para valorar sus habilidades.
4. Como reclutador, quiero ver sus proyectos con capturas, tecnologías y enlaces para valorar su trabajo.
5. Como visitante, quiero conocer los intereses de Edward (Social Link) para tener una impresión personal.
6. Como visitante, quiero contactarlo y ajustar idioma, sonido y movimiento desde System.
7. Como visitante, quiero cambiar entre español e inglés en cualquier momento.
8. Como visitante, quiero navegar con teclado y con gestos/toques con la misma fluidez.
9. Como Edward, quiero agregar proyectos nuevos editando solo datos.

# 6. Estructura del sitio y mapeo con el menú de P3R

Menú principal **[Claude]**:

| Opción | Contenido | Pantalla de P3R de referencia |
| --- | --- | --- |
| **Quién soy** | Presentación, perfil, formación y trayectoria breve (absorbe el Timeline de la v1) | Stats / ficha del personaje |
| **Stack** | Tecnologías en 3 círculos solapados por categoría (frontend, backend, bases de datos / herramientas) con nivel | Social Stats |
| **Proyectos** | Lista de fichas y detalle con capturas, tecnologías y enlaces | Quests (lista con detalle) |
| **Social Link** | Personajes e intereses con arcano, rango, estrellas y texto corto | Social Link |
| **System** | Contacto, idioma, sonido, movimiento reducido, volver al inicio | System / Config |

- Navegación entre pantallas con pestañas **L / R**, teclado (flechas, Enter, Esc, Home/End) y toque/clic **[Claude]**.
- Guía contextual y botones Confirmar/Atrás siempre visibles abajo a la derecha, como en el juego **[Claude]**.
- El orden y los nombres exactos pueden ajustarse en la fase de especificación.

# 7. Experiencia de movimiento (requisito central)

**Referencia [Edward]:** el menú de pausa de P3R (video `Pause Menu - Persona 3 Reload - John Persona`), en particular la transición de **Social Stats al menú principal**. Lo que le gusta: las animaciones y el intercambio de menús con barridos diagonales y la aparición del protagonista en cada pantalla.

**Secuencia observada** (de 70.3 s a 71.7 s del video, cuadro a cuadro):

1. **Salida:** el título gigante en arco gira y un barrido diagonal oscuro cubre la pantalla.
2. **Entrada escalonada:** las fichas de la lista suben una por una (de abajo hacia arriba) mientras la ilustración del personaje entra grande desde la derecha, rotada.
3. **Pausa** de ~0.5 s con todo quieto.
4. **Cierre:** un círculo blanco se expande revelando el fondo; las fichas quedan recortadas por su borde.
5. **Menú:** las opciones aparecen inclinadas, la activa en rojo/blanco, con título de fondo recortado y el personaje en la izquierda.

**Principios de diseño [Claude]:**

- **El personaje es el hilo conductor:** cambia de pose o posición en cada pantalla, de modo que la navegación se siente continua y no como cambios de página.
- **Duración total de una transición: 500–800 ms** (el original dura ~1.4 s) para no cansar a quien navega con prisa.
- Toda animación es **interrumpible**: un clic o tecla durante una transición lleva al destino sin esperar.
- **Movimiento reducido** (`prefers-reduced-motion` y opción en System): se sustituye por cambios de opacidad cortos o instantáneos.
- Animar solo propiedades baratas (`transform`, `opacity`) y evitar trabajo en el hilo principal (skills `animate` y `animation-performance`).
- Las animaciones se verifican contra el video de referencia por tramos de tiempo, no "a ojo".

# 8. Personajes y arte

- **Oguri Cap [Edward]:** personaje favorito. Hilo conductor del sitio. Tiene ilustración, animación idle y video con transparencia (v1).
- **Social Link:** Leon S. Kennedy, Resident Evil, Persona 3 Reload y Super Mario Galaxy (v1). Edward podrá añadir más. Cada uno con arcano, rango y texto corto.
- **Arte nuevo [Edward]:** generado con IA. Herramienta propuesta **[Claude]:** servidor MCP de Higgsfield (`https://mcp.higgsfield.ai/mcp`), que genera imágenes y video, consume créditos y requiere cuenta. **No se usa hasta que las fases definan exactamente qué poses y personajes hacen falta**, para no gastar créditos en pruebas.
- Recursos existentes en la carpeta local de recursos de Edward, fuera del repositorio (5 imágenes de ChatGPT, 3 videos de Gemini, `Oguri_Idle.mp4` y el video de referencia). Las pistas de audio y arte de la v1 están en `public/` del repositorio anterior.
- **Aviso de derechos:** el estilo y los personajes provienen de franquicias de terceros. El sitio es un proyecto de aprendizaje sin fines comerciales; se debe indicar en el pie o en System que no está afiliado a sus propietarios. **[Claude]**

# 9. Contenido, datos e internacionalización

- **Idiomas [Edward]:** español e inglés con selector. Idioma inicial según el navegador **[Claude]**, recordado entre visitas.
- Todo el contenido vive en archivos de datos tipados (TypeScript), con ambos idiomas por campo. Los componentes no contienen textos.
- **Proyectos [Edward]:** por ahora solo este portafolio. Se prepara para agregar más. Cada proyecto: título, resumen, descripción, tecnologías, enlaces (repositorio, demo), capturas y estado.
- La ficha de este proyecto cuenta también el proceso: v1 sin metodología → v2 con SDD **[Claude]**.
- **Contacto y enlaces:** GitHub **[Edward]**: https://github.com/Edward2418. Los demás enlaces (correo, LinkedIn, otros) y el CV descargable quedan **[Pendiente]** para más adelante; la v1 los había retirado por alcance. El sitio debe funcionar sin ellos y permitir agregarlos como datos sin tocar componentes.
- Solo contenido confirmado por Edward; sin referencias no verificadas.

# 10. Decisiones sobre piezas de la v1

| Pieza | Decisión [Claude] | Razón |
| --- | --- | --- |
| Splash | **Mejorar:** corto, saltable con cualquier tecla o clic, una vez por sesión | Primera impresión sin bloquear |
| Cursor personalizado | **Quitar** | No aparece en la referencia; estorba en móvil |
| Sonido | **Mejorar:** silenciado por defecto, activable, carga bajo demanda | Entornos de oficina; ahorro medido en v1 |
| Oguri animado | **Mantener** | Hilo conductor |
| Barras de habilidades | **Cambiar** por círculos solapados (Social Stats) | Coherencia con la referencia |
| Timeline | **Quitar como sección;** su contenido pasa a "Quién soy" | Destino de poco valor |
| Social Link | **Mantener** | Sección personal con los personajes |
| System | **Cambiar** a contacto + configuración | Coherencia con el System del juego |

# 11. Stack, calidad y restricciones

**Stack [Edward]:** el mismo de la v1 y el que cursa en el semestre: **Next.js 16, React 19, TypeScript, Tailwind CSS 4**, CSS Modules cuando convenga, desplegado en **Vercel**. Pruebas con **Playwright** (E2E) y las pruebas unitarias nativas de Node.

**Nota de aprendizaje [Edward/Claude]:** Edward no domina aún este stack. Toda decisión técnica relevante se documenta con su razón (en `research.md` de cada fase) para poder explicarla en una entrevista.

**Pendiente de plan técnico [Claude]:** técnica de animación (CSS puro, View Transitions de React o una librería como Motion). Comprobar compatibilidad entre navegadores antes de decidir.

**Presupuesto propuesto [Claude]:**

- Lighthouse móvil: rendimiento ≥ 90, accesibilidad 100, SEO ≥ 95.
- Carga inicial del menú (sin audio ni video) ≤ 350 KiB transferidos.
- Video de Oguri y audio: bajo demanda, nunca en la carga inicial.
- Sin desplazamiento horizontal en 390, 768 y 1280 px de ancho.
- Contraste de texto AA, foco visible y orden de tabulación lógico.
- Navegadores: Chromium, Firefox y verificación pendiente en WebKit/Safari y un dispositivo real.

**Lecciones de la v1 que deben respetarse:**

- El video con transparencia funciona en WebM; verificar Firefox.
- La precarga global de audio perjudica la carga inicial; los sonidos se piden al usarlos.
- El splash condiciona las mediciones de Lighthouse; medir también después de cerrarlo.
- Las dependencias de producción se auditan (`npm audit --omit=dev`) antes de cada despliegue.
- `AGENTS.md` lo regenera `next dev`; no poner ahí las reglas propias.

**Restricciones generales:** sin secretos en el repositorio, sin analítica que recopile datos personales sin aviso, sin dependencias nuevas sin justificarlas.

# 12. Skills y herramientas para el agente

Instaladas a nivel de usuario en `~\.claude\skills\`. Se activan por su descripción, pero para no depender de eso `CLAUDE.md` indica cuándo usar cada una:

| Skill | Cuándo usarla |
| --- | --- |
| `animate` | Al construir una animación o transición nueva |
| `animation-performance` | Si una animación se entrecorta o al elegir propiedades a animar |
| `review-animations` | Antes de dar por terminada una fase con movimiento |
| `emil-design-eng` | Criterio de pulido en componentes e interacciones |
| `animation-vocabulary` | Para nombrar con precisión un efecto del video de referencia |
| `vercel-react-best-practices` | Al escribir o revisar componentes React y Next.js |

Otras: **Spec Kit** (`/speckit.*`) para el ciclo SDD y **Playwright** para las pruebas de navegador. **[Pendiente]** Higgsfield MCP para generar arte (sección 8).

# 13. Fuera de alcance (por ahora)

- Blog, CMS o panel de administración.
- Cuentas de usuario, comentarios, formularios que envíen datos a un servidor propio.
- Proyectos distintos a este portafolio (se añadirán después).
- Más idiomas además de español e inglés.
- Aplicación móvil nativa.
- Analítica avanzada.

# 14. Fases propuestas [Claude]

Cada fase termina con algo demostrable y probado antes de pasar a la siguiente.

| Fase | Nombre | Entrega demostrable |
| --- | --- | --- |
| 1 | Base y datos | Proyecto Next configurado, tokens de diseño, datos tipados bilingües, selector de idioma, despliegue vacío en Vercel con pruebas básicas |
| 2 | Escena y menú | Splash, menú principal, motor de transiciones (barrido, escalonado, círculo), navegación L/R y teclado, movimiento reducido |
| 3 | Identidad visual P3R | Menú con el aspecto de P3R, Oguri como protagonista (entrada e idle), barrido con el personaje, marco común de pantallas e interruptor de sonido |
| 4 | Quién soy y Stack | Ambas pantallas con sus transiciones y el personaje como hilo conductor |
| 5 | Proyectos | Lista y detalle basados en datos; ficha del portafolio con capturas |
| 6 | Social Link y personajes | Social Link con Oguri y los demás; arte nuevo generado con IA |
| 7 | System y cierre | Contacto, idioma, movimiento, SEO, medición de rendimiento y despliegue final |

Insumo por fase: copiar `docs/sprints/_plantilla.md` a `docs/sprints/fase-N-<nombre>.md` y completarlo antes de `/speckit.specify`.

# 15. Decisiones pendientes

- **[Pendiente]** Correo, LinkedIn, otros enlaces de contacto y si se incluye CV descargable (GitHub ya está definido en la sección 9).
- **[Pendiente]** Texto de presentación y datos de "Quién soy" (los redacta o confirma Edward).
- **[Resuelto en la fase 2]** Técnica de animación: Web Animations API y CSS, sin dependencias (`specs/002-escena-y-menu/research.md`, D1).
- **[Pendiente]** Uso de Higgsfield y presupuesto de créditos para el arte.
- **[Resuelto en la fase 2]** Nombres de las opciones: Quién soy / About me, Stack, Proyectos / Projects, Social Link y System.
- **[Resuelto en la fase 1]** Dirección de Vercel (`p3r-portfolio-v2.vercel.app`); el dominio propio queda para más adelante.
