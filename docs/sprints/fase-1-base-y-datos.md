# Insumo de especificación - Fase 1: Base y datos

> **Referencias obligatorias para el agente:**
> - Contexto maestro: `docs/project-context.md`
> - Constitución: `.specify/memory/constitution.md`
> - Este documento describe únicamente el alcance de esta fase.

## 1. Contexto de la fase

Es la primera de seis fases. Deja listo el terreno técnico y el contenido en datos para que las siguientes fases (menú, transiciones, secciones) se construyan sobre una base probada. No incluye pantallas con diseño P3R ni animaciones: esas llegan desde la fase 2.

## 2. Objetivo

Tener un proyecto Next.js desplegado en Vercel, con contenido bilingüe en datos tipados, selector de idioma funcional, tokens de diseño centralizados y pruebas automáticas, de modo que agregar contenido no requiera tocar componentes.

## 3. Historias de usuario de la fase

> Formato: "Como [rol], quiero [acción] para [beneficio]".

- **US1** - Como visitante, quiero abrir la dirección pública del sitio y ver una página inicial en mi idioma, para comprobar que el sitio está en línea y carga rápido.
- **US2** - Como visitante, quiero cambiar entre español e inglés en cualquier momento y que el sitio recuerde mi elección, para leer el contenido en el idioma que prefiero.
- **US3** - Como Edward, quiero que todo el contenido (perfil, stack, proyectos, personajes y contacto) viva en datos tipados con español e inglés por campo, para agregar o corregir información sin tocar componentes.
- **US4** - Como Edward, quiero tokens de diseño centralizados (colores, tipografías, duraciones y curvas de movimiento), para que las fases siguientes mantengan coherencia visual y de movimiento.
- **US5** - Como Edward, quiero pruebas automáticas y un despliegue repetible, para detectar errores antes de publicar.

## 4. Flujo demostrable al cierre de la fase

    Abrir la URL pública en Vercel
    -> Se ve una página inicial con datos reales de ejemplo (nombre, GitHub, un proyecto)
    -> El idioma inicial coincide con el del navegador
    -> Cambiar de idioma con el selector actualiza todos los textos
    -> Recargar conserva el idioma elegido
    -> Dejar un dato opcional vacío (por ejemplo, el correo) no rompe la página
    -> Las pruebas automáticas pasan

## 5. Contenido y datos que cubre esta fase

| Dato | Estado |
| --- | --- |
| Perfil ("Quién soy") | Estructura definida; texto de ejemplo marcado como provisional |
| Stack (3 categorías) | Estructura definida con nivel por tecnología; valores de ejemplo |
| Proyectos | Un proyecto: este portafolio |
| Personajes de Social Link | Estructura definida (arcano, rango, texto corto); sin arte |
| Contacto | GitHub: https://github.com/Edward2418. Correo, LinkedIn y CV quedan vacíos y opcionales |

## 6. Reglas aplicables (de la constitución)

- Principio IV: contenido en datos tipados, bilingüe, sin textos en componentes.
- Principio III: accesibilidad básica desde la base (idioma del documento, foco visible, contraste AA).
- Principio V: no inventar datos; el contenido provisional debe indicarse como tal.
- Principio VI: pruebas y trazabilidad.
- Rendimiento: la página inicial respeta el presupuesto (≤ 350 KiB, Lighthouse móvil ≥ 90).

## 7. Criterios de aceptación

- [ ] CA-1 El sitio está desplegado en Vercel y accesible públicamente.
- [ ] CA-2 El idioma inicial sigue al navegador y la elección del visitante se conserva entre visitas.
- [ ] CA-3 Cambiar de idioma actualiza todos los textos visibles y el atributo de idioma del documento.
- [ ] CA-4 Ningún componente contiene texto de contenido; todo proviene de los datos.
- [ ] CA-5 Los datos opcionales ausentes no rompen la página ni dejan huecos visibles.
- [ ] CA-6 Agregar un segundo proyecto de prueba solo requiere añadir datos.
- [ ] CA-7 Los tokens de diseño existen en un único lugar y la página inicial los usa.
- [ ] CA-8 Lint, compilación de producción, pruebas unitarias y E2E (390, 768 y 1280 px) pasan.
- [ ] CA-9 Lighthouse móvil ≥ 90 en rendimiento y 100 en accesibilidad sobre la página inicial.
- [ ] CA-10 No hay desplazamiento horizontal en los tres anchos.

## 8. Fuera de alcance de esta fase

- Splash, menú principal, transiciones, motor de escenas y navegación L/R.
- Las pantallas Quién soy, Stack, Proyectos, Social Link y System con diseño P3R.
- Audio, video de Oguri, arte nuevo y uso de Higgsfield.
- Cursor personalizado (descartado) y Timeline como sección (descartado).
- SEO avanzado e imagen social (fase 6).

## 9. Decisiones pendientes que deben resolverse en /speckit.clarify

> No deben asumirse sin confirmación.

- Cómo se implementa el idioma: rutas por idioma (`/es`, `/en`) o estado en el cliente, y su efecto en SEO.
- Si se usa una librería de internacionalización o una solución propia sencilla.
- Formato exacto del contenido: archivos TypeScript tipados o algo más; cómo se valida.
- Paleta base, tipografías y escala de los tokens de diseño (derivados de P3R, con identidad propia).
- Dirección pública: dominio propio o la de Vercel.
- Versión de Node soportada y gestor de paquetes (npm, como en la v1).

## 10. Restricciones técnicas heredadas

- Next.js 16, React 19, TypeScript y Tailwind CSS 4; antes de escribir código de Next, leer la guía en `node_modules/next/dist/docs/`.
- Aplicar la skill `vercel-react-best-practices`.
- Pruebas E2E con Playwright y unitarias con el ejecutor nativo de Node.
- Sin secretos en el repositorio; incluir `.env.example` si se usan variables.
- Sin dependencias nuevas sin justificarlas; auditar las de producción antes de desplegar.
- Documentar cada decisión técnica relevante en `research.md`, con su razón.
- Idioma: español en documentos, comentarios y pruebas; identificadores de código en inglés.
- Commits convencionales (tipo y alcance en inglés, descripción en español).
- No poner reglas propias en `AGENTS.md` (lo regenera `next dev`).
