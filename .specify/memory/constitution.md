<!--
Informe de impacto de sincronización (temporal; eliminar antes del commit)
- Cambio de versión: (plantilla sin ratificar) → 1.0.0
- Principios modificados: ninguno renombrado; los 5 marcadores de la plantilla se definieron por primera vez.
- Secciones agregadas: Restricciones técnicas y de calidad; Flujo de desarrollo y puertas de calidad.
- Secciones eliminadas: ninguna.
- Pendientes diferidos: ninguno en la constitución. Las decisiones [Pendiente] de
  docs/project-context.md (sección 15) se resuelven en cada fase y no bloquean la ratificación.
- Fuente: docs/project-context.md (contexto maestro del proyecto).
-->
# Constitución de Portafolio P3R v2

## Principios fundamentales

### I. El contenido va primero, la animación después (NO NEGOCIABLE)
Ninguna animación puede impedir ni retrasar el acceso a la información. Un visitante MUST llegar a
"Quién soy", "Stack" y "Proyectos" en 3 interacciones o menos desde la primera pantalla, y el
contenido esencial MUST ser visible a los 5 s de cargar el menú, sin esperar animaciones.
Todo splash o transición MUST poder omitirse con cualquier tecla o clic.
*Razón:* el portafolio sirve para conseguir prácticas o empleo; un reclutador revisa cada sitio
entre 30 s y 2 min.

### II. Movimiento fiel a la referencia, interrumpible y accesible
El movimiento se basa en el menú de pausa de Persona 3 Reload (transición de Social Stats al menú
principal) y se verifica contra el video de referencia por tramos de tiempo, no "a ojo".
Toda transición MUST durar entre 500 y 800 ms, MUST ser interrumpible (un clic o tecla lleva al
destino sin esperar) y MUST respetar `prefers-reduced-motion` y la opción de System, sustituyendo
el movimiento por cambios de opacidad cortos o instantáneos. Solo se animan `transform` y
`opacity`, a 60 fps en un móvil de gama media. Se MUST usar las skills `animate`,
`animation-performance` y `review-animations` según corresponda.
*Razón:* la limpieza del movimiento es el requisito central de la v2 y la deficiencia de la v1.

### III. Accesibilidad y legibilidad
El estilo MUST NOT ocultar el contenido ni volverlo ilegible. El sitio MUST ser operable con
teclado (flechas, Enter, Esc, Home/End, pestañas L/R), con gestos o toques y con lector de pantalla.
Contraste de texto AA, foco visible, orden de tabulación lógico y sin desplazamiento horizontal en
390, 768 y 1280 px de ancho.
*Razón:* un sitio inaccesible es un fracaso aunque "funcione".

### IV. Contenido en datos tipados y bilingüe
Todo el contenido vive en archivos de datos TypeScript tipados, con español e inglés por campo.
Los componentes MUST NOT contener textos. Agregar un proyecto, enlace de contacto o personaje MUST
requerir solo añadir datos, sin tocar componentes. El sitio MUST funcionar sin los datos aún
pendientes (correo, LinkedIn, CV). El idioma inicial sigue al navegador y se recuerda entre visitas.
*Razón:* mantenibilidad (CS-5) y cobertura en español e inglés (CS-6).

### V. Honestidad del contenido y respeto de derechos
Solo se publica contenido confirmado por Edward: MUST NOT inventarse empleos, certificaciones,
enlaces ni datos personales. El sitio MUST indicar, en el pie o en System, que no está afiliado a los
propietarios de las franquicias que lo inspiran, y es un proyecto de aprendizaje sin fines
comerciales. Debe tener identidad propia y no parecer una copia del juego.
*Razón:* credibilidad ante reclutadores y cumplimiento de derechos de terceros.

### VI. Desarrollo guiado por especificación, por fases y con trazabilidad
Se trabaja con Spec Kit en las seis fases de la sección 14 de `docs/project-context.md`, en orden y
sin implementar todo de una vez. Cada fase MUST terminar con algo demostrable y probado antes de
pasar a la siguiente, y su insumo MUST estar en `docs/sprints/fase-N-<nombre>.md` antes de
`/speckit.specify`. MUST mantenerse la trazabilidad objetivo → requisito → historia → fase →
implementación → prueba. No se agregan funcionalidades fuera del alcance (sección 13) sin indicarlo
y obtener aprobación.
*Razón:* la v1 sin especificación causó cerca de 25 commits de ajuste visual en un día.

## Restricciones técnicas y de calidad

- **Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4 (CSS Modules cuando convenga),
  desplegado en Vercel. Pruebas E2E con Playwright y pruebas unitarias nativas de Node.
- **Next.js:** antes de escribir código de Next MUST leerse la guía correspondiente en
  `node_modules/next/dist/docs/`. Se aplica la skill `vercel-react-best-practices`.
- **Rendimiento (Lighthouse móvil):** rendimiento ≥ 90, accesibilidad 100, SEO ≥ 95. Carga inicial
  del menú (sin audio ni video) ≤ 350 KiB transferidos. El video de Oguri y el audio se cargan solo
  bajo demanda, nunca en la carga inicial. Se mide también después de cerrar el splash.
- **Sonido:** silenciado por defecto, activable por el usuario, con carga bajo demanda.
- **Elementos descartados:** sin cursor personalizado; el Timeline no es sección (su contenido pasa
  a "Quién soy").
- **Navegadores:** Chromium y Firefox; verificación pendiente en WebKit/Safari y un dispositivo real.
  El video con transparencia se entrega en WebM y se verifica en Firefox.
- **Seguridad y privacidad:** sin secretos en el repositorio, sin analítica que recopile datos
  personales sin aviso, sin formularios que envíen datos a un servidor propio y sin dependencias
  nuevas sin justificarlas. Las dependencias de producción se auditan con
  `npm audit --omit=dev` antes de cada despliegue.
- **Arte con IA:** el servidor MCP de Higgsfield consume créditos y MUST NOT usarse hasta que la fase
  correspondiente defina exactamente qué poses y personajes hacen falta.
- **Documentación de decisiones:** toda decisión técnica relevante se documenta con su razón en
  `research.md` de la fase, para poder explicarla en una entrevista.

## Flujo de desarrollo y puertas de calidad

- Las skills indicadas en `CLAUDE.md` MUST usarse cuando la tarea coincida; antes de cerrar una fase
  con movimiento MUST ejecutarse `review-animations`.
- Si una decisión técnica no está definida en `docs/project-context.md`, MUST proponerse opciones
  antes de asumir una solución difícil de revertir. Si cambia arquitectura, datos o reglas de negocio,
  MUST actualizarse ese documento.
- Las decisiones marcadas **[Edward]** MUST NOT cambiarse sin consultarle antes.
- Una fase se cierra solo con pruebas pasando (E2E y unitarias), presupuesto de rendimiento y
  accesibilidad verificado, y movimiento comparado con la referencia.
- Los commits siguen Conventional Commits: tipo y alcance en inglés, descripción en español. Las
  reglas propias del proyecto no se colocan en `AGENTS.md`, que regenera `next dev`.

## Gobernanza

Esta constitución prevalece sobre otras prácticas del proyecto. `docs/project-context.md` es la
fuente de verdad del alcance y esta constitución resume sus reglas no negociables; si divergen, se
resuelve actualizando ambos con aprobación de Edward.

- **Enmiendas:** se proponen por escrito con su razón, requieren aprobación de Edward, y se
  registran con un commit `docs:` que indique la nueva versión. Los artefactos de Spec Kit
  afectados MUST revisarse para mantener la coherencia.
- **Versionado (semántico):** MAJOR para eliminar o redefinir principios de forma incompatible;
  MINOR para agregar un principio o sección, o ampliar materialmente su guía; PATCH para
  aclaraciones y correcciones de redacción.
- **Revisión de cumplimiento:** cada plan (`/speckit.plan`) MUST verificar la constitución antes
  y después del diseño, y cada revisión de fase MUST comprobar su cumplimiento. Toda complejidad o
  desviación MUST justificarse por escrito.

**Version**: 1.0.0 | **Ratified**: 2026-10-22 | **Last Amended**: 2026-10-22
