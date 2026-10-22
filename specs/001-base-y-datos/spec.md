# Especificación de la funcionalidad: Fase 1 — Base y datos

**Rama de la funcionalidad**: `001-base-y-datos`

**Creado**: 2026-10-22

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Usa la descripción de docs/sprints/fase-1-base-y-datos.md"

## Aclaraciones

### Sesión 2026-10-22

- Q: ¿Qué paleta y tipografías son la base visual? → A: Opción A "Medianoche y cian": fondo `#050B1F`, acento cian `#3FD8FF`, texto `#F2F7FF`, rojo `#E8203A` solo para lo activo; títulos en Anton y texto en Inter.
- Q: ¿Qué idioma ve quien tiene el navegador en un idioma distinto de español e inglés? → A: Inglés.
- Q: ¿Cómo se muestra que un texto es provisional? → A: Etiqueta "Provisional" (en el idioma activo) junto a cada bloque de ejemplo (perfil, niveles del stack, personajes), controlada por un campo en los datos.
- Q: ¿Qué se muestra cuando un enlace (por ejemplo la demo) no tiene dirección? → A: Nada: no se muestra el enlace, su botón ni su espacio hasta que el dato tenga dirección.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Abrir el sitio público y ver una página inicial en mi idioma (Prioridad: P1)

Como visitante, quiero abrir la dirección pública del sitio y ver una página inicial en mi idioma, para comprobar que el sitio está en línea y carga rápido.

**Por qué esta prioridad**: sin un sitio público que cargue con contenido real de ejemplo no hay nada que demostrar ni que las fases siguientes puedan ampliar. Es la base mínima viable.

**Prueba independiente**: abrir la dirección pública desde un navegador configurado en español y otro en inglés; se debe ver la página inicial con nombre, enlace a GitHub y un proyecto, en el idioma del navegador.

**Escenarios de aceptación**:

1. **Dado** que el sitio está publicado, **cuando** un visitante abre la dirección pública, **entonces** ve la página inicial con el nombre de Edward, su enlace a GitHub y la ficha del proyecto de este portafolio.
2. **Dado** un visitante cuyo navegador está en español (o en inglés) y que no ha elegido idioma, **cuando** abre el sitio, **entonces** todos los textos aparecen en ese idioma.
3. **Dado** un visitante cuyo navegador usa un idioma distinto de español e inglés, **cuando** abre el sitio, **entonces** ve el contenido en inglés.
4. **Dado** cualquier visitante en la página inicial, **cuando** llega al pie, **entonces** lee el aviso de proyecto de aprendizaje sin fines comerciales y sin afiliación a los propietarios de las franquicias, en el idioma activo.

---

### Historia de usuario 2 - Cambiar de idioma y que se recuerde (Prioridad: P1)

Como visitante, quiero cambiar entre español e inglés en cualquier momento y que el sitio recuerde mi elección, para leer el contenido en el idioma que prefiero.

**Por qué esta prioridad**: el sitio completo en español e inglés es un criterio de éxito del proyecto (CS-6) y debe funcionar desde la base.

**Prueba independiente**: cambiar el idioma con el selector, comprobar que todos los textos cambian, recargar y comprobar que se conserva la elección.

**Escenarios de aceptación**:

1. **Dado** que el visitante está en la página inicial, **cuando** usa el selector de idioma, **entonces** todos los textos visibles y el idioma declarado del documento cambian al idioma elegido.
2. **Dado** que el visitante eligió un idioma, **cuando** recarga la página o vuelve en otra visita, **entonces** el sitio se muestra en el idioma elegido, aunque el navegador esté en otro.
3. **Dado** que el selector está disponible, **cuando** el visitante lo opera solo con teclado, **entonces** puede cambiar el idioma y el foco es visible.

---

### Historia de usuario 3 - Mantener todo el contenido como datos (Prioridad: P1)

Como Edward, quiero que todo el contenido (perfil, stack, proyectos, personajes y contacto) viva en datos tipados con español e inglés por campo, para agregar o corregir información sin tocar componentes.

**Por qué esta prioridad**: es el requisito que habilita las fases siguientes y el criterio CS-5 (agregar un proyecto solo requiere añadir datos).

**Prueba independiente**: agregar un segundo proyecto de prueba únicamente añadiendo datos y comprobar que aparece en el sitio sin modificar ningún componente; vaciar el correo y comprobar que la página no se rompe.

**Escenarios de aceptación**:

1. **Dado** los datos de perfil, stack, proyectos, personajes y contacto, **cuando** se revisan los componentes, **entonces** ninguno contiene texto de contenido.
2. **Dado** un proyecto nuevo agregado solo en los datos, **cuando** se abre el sitio, **entonces** el proyecto aparece sin cambios en los componentes.
3. **Dado** un dato opcional ausente (correo, LinkedIn o CV), **cuando** se abre el sitio, **entonces** la página funciona y no deja huecos visibles.
4. **Dado** un campo sin traducción a uno de los dos idiomas, **cuando** se valida el contenido, **entonces** el problema se detecta antes de publicar.
5. **Dado** contenido de ejemplo o provisional, **cuando** se muestra, **entonces** se indica como provisional.

---

### Historia de usuario 4 - Tokens de diseño centralizados (Prioridad: P2)

Como Edward, quiero tokens de diseño centralizados (colores, tipografías, duraciones y curvas de movimiento), para que las fases siguientes mantengan coherencia visual y de movimiento.

**Por qué esta prioridad**: no cambia lo que ve el visitante hoy, pero evita retrabajo visual (el problema de la v1).

**Prueba independiente**: cambiar un valor de color en el único lugar de definición y comprobar que la página inicial lo refleja.

**Escenarios de aceptación**:

1. **Dado** los tokens definidos, **cuando** se cambia uno, **entonces** la página inicial lo refleja sin otros cambios.
2. **Dado** la página inicial, **cuando** se revisa su estilo, **entonces** colores, tipografías y espaciados provienen de los tokens y no de valores sueltos.

---

### Historia de usuario 5 - Pruebas automáticas y despliegue repetible (Prioridad: P2)

Como Edward, quiero pruebas automáticas y un despliegue repetible, para detectar errores antes de publicar.

**Por qué esta prioridad**: protege las fases siguientes y permite explicar la calidad técnica a docentes y reclutadores.

**Prueba independiente**: ejecutar todas las verificaciones desde cero y publicar de nuevo; el resultado debe ser el mismo.

**Escenarios de aceptación**:

1. **Dado** el proyecto, **cuando** se ejecutan las verificaciones de estilo de código, la compilación de producción, las pruebas unitarias y las pruebas de extremo a extremo, **entonces** todas pasan.
2. **Dado** las pruebas de extremo a extremo, **cuando** se ejecutan, **entonces** cubren los anchos de 390, 768 y 1280 px.
3. **Dado** un cambio aprobado, **cuando** se publica, **entonces** el sitio se actualiza sin pasos manuales no documentados.

---

### Casos límite

- El navegador del visitante usa un idioma que no es español ni inglés.
- El visitante bloquea el almacenamiento del navegador: el idioma debe seguir funcionando durante la visita, sin romper la página.
- Un dato opcional está vacío o ausente.
- Un campo de contenido existe en un idioma pero falta en el otro.
- Un texto es mucho más largo en uno de los idiomas (el diseño no debe desbordarse).
- Un enlace del contenido no tiene dirección definida: no se muestra (ni enlace, ni botón, ni espacio).
- Pantallas de 390, 768 y 1280 px: no debe haber desplazamiento horizontal.
- El visitante cambia de idioma varias veces seguidas sin recargar.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El sistema DEBE estar publicado y accesible públicamente en la dirección que asigna Vercel (`*.vercel.app`), con un nombre limpio; el dominio propio queda fuera de esta fase y podrá añadirse después.
- **FR-002**: El sistema DEBE mostrar una página inicial con el nombre de Edward, el enlace a GitHub (https://github.com/Edward2418) y la ficha del proyecto de este portafolio, tomados de los datos.
- **FR-003**: El sistema DEBE elegir el idioma inicial según el idioma del navegador (español o inglés) y usar inglés cuando el idioma del navegador no sea español ni inglés.
- **FR-004**: El sistema DEBE ofrecer un selector de idioma, operable con teclado y con foco visible, disponible en cualquier momento.
- **FR-005**: Al cambiar de idioma, el sistema DEBE actualizar todos los textos visibles y el idioma declarado del documento.
- **FR-006**: El sistema DEBE conservar la elección de idioma del visitante entre recargas y visitas. Cada idioma DEBE tener su propia dirección (`/es` y `/en`), de modo que un enlace compartido abra el sitio en el idioma indicado, y la raíz del sitio DEBE llevar al visitante a su idioma (el guardado o, si no hay, el del navegador).
- **FR-007**: El sistema DEBE mantener todo el contenido (perfil, stack de 3 categorías con nivel por tecnología, proyectos, personajes de Social Link y contacto) en datos tipados con español e inglés por campo.
- **FR-008**: Los componentes NO DEBEN contener textos de contenido.
- **FR-009**: El sistema DEBE tratar como opcionales el correo, LinkedIn, el CV y los enlaces de proyecto (repositorio, demo); un enlace sin dirección NO DEBE mostrarse (ni enlace, ni botón, ni espacio) hasta que el dato la tenga, y su ausencia NO DEBE romper la página ni dejar huecos visibles.
- **FR-010**: El sistema DEBE permitir agregar un proyecto nuevo solo añadiendo datos.
- **FR-011**: El sistema DEBE detectar antes de publicar los campos de contenido sin traducción en alguno de los dos idiomas.
- **FR-012**: El sistema DEBE mostrar una etiqueta "Provisional" (en el idioma activo) junto a cada bloque de contenido de ejemplo (perfil, niveles del stack, personajes y texto del proyecto mientras Edward no lo confirme), controlada por un indicador en los datos que, al confirmar el dato, deja de mostrarla. El sistema NO DEBE incluir datos personales no confirmados por Edward.
- **FR-013**: El sistema DEBE definir los tokens de diseño (colores, tipografías, duraciones y curvas de movimiento) en un único lugar, y la página inicial DEBE usarlos. La paleta base es "Medianoche y cian" (fondo `#050B1F`, acento cian `#3FD8FF`, texto `#F2F7FF`, rojo `#E8203A` reservado para el elemento activo) y las tipografías son Anton para títulos e Inter para texto; los pares de color de texto DEBEN cumplir contraste AA.
- **FR-014**: El sistema DEBE cumplir accesibilidad básica: idioma del documento declarado, foco visible, contraste de texto AA y orden de tabulación lógico.
- **FR-015**: El sistema NO DEBE presentar desplazamiento horizontal en 390, 768 y 1280 px de ancho.
- **FR-016**: El proyecto DEBE incluir verificaciones automáticas de estilo de código, compilación de producción, pruebas unitarias y pruebas de extremo a extremo en 390, 768 y 1280 px, y todas DEBEN pasar. Las pruebas unitarias y la compilación DEBEN ejecutarse automáticamente antes de cada despliegue, de modo que un fallo impida publicar.
- **FR-017**: El despliegue DEBE ser repetible, sin secretos en el repositorio y con las dependencias de producción auditadas antes de publicar.
- **FR-018**: La página inicial NO DEBE incluir splash, menú principal, transiciones, audio, video ni arte nuevo (fuera de alcance de esta fase).
- **FR-019**: El sistema DEBE mostrar en el pie de la página, en ambos idiomas, un aviso de que es un proyecto de aprendizaje sin fines comerciales y de que no está afiliado a los propietarios de las franquicias que inspiran su estilo y sus personajes.

### Entidades clave

- **Perfil**: presentación de Edward ("Quién soy"); texto bilingüe, marcado como provisional hasta que Edward lo confirme.
- **Categoría de stack**: una de tres agrupaciones (frontend, backend, bases de datos / herramientas) con su nombre bilingüe.
- **Tecnología**: elemento del stack con nombre y nivel; pertenece a una categoría.
- **Proyecto**: título, resumen, descripción, tecnologías, enlaces (repositorio, demo), capturas y estado, todo bilingüe donde aplique; hoy solo este portafolio, con texto provisional hasta que Edward lo confirme.
- **Personaje de Social Link**: nombre, arcano, rango y texto corto bilingüe; sin arte en esta fase.
- **Contacto**: GitHub (definido); correo, LinkedIn y CV opcionales y vacíos.
- **Preferencia de idioma**: idioma elegido por el visitante, que se conserva entre visitas.
- **Token de diseño**: valor centralizado de color, tipografía, duración o curva de movimiento.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: Cualquier persona puede abrir la dirección pública y ver la página inicial con contenido en menos de 5 segundos en un móvil de gama media.
- **SC-002**: En el 100 % de las pruebas, el idioma inicial coincide con el del navegador (español o inglés) y, tras elegir otro, la elección se conserva al recargar.
- **SC-003**: El 100 % de los textos visibles cambia al alternar el idioma, sin quedar textos en el idioma anterior.
- **SC-004**: Agregar un proyecto de prueba requiere cambiar únicamente archivos de datos (0 componentes modificados).
- **SC-005**: Dejar vacío cualquier dato opcional produce 0 errores visibles y 0 huecos en la página.
- **SC-006**: La página inicial pesa 350 KiB o menos al cargar y obtiene al menos 90 en rendimiento y 100 en accesibilidad en Lighthouse móvil.
- **SC-007**: Hay 0 desplazamientos horizontales en 390, 768 y 1280 px.
- **SC-008**: El 100 % de las verificaciones (estilo de código, compilación, pruebas unitarias y de extremo a extremo) pasa antes de publicar.
- **SC-009**: Cambiar un token de diseño en su único lugar de definición se refleja en la página inicial sin otros cambios.

## Supuestos

- El visitante usa un navegador moderno de escritorio o móvil; no hay cuentas ni inicio de sesión.
- La página inicial es una página de verificación de la base, sin diseño P3R ni animaciones; el diseño y movimiento llegan desde la fase 2.
- Los textos de perfil, los niveles del stack, los personajes y el texto del proyecto son de ejemplo y se marcan como provisionales hasta que Edward los confirme.
- El único proyecto cargado es este portafolio; el segundo proyecto de prueba (CA-6) es temporal y no se publica.
- Decisiones confirmadas por Edward el 2026-10-22: dirección de Vercel sin dominio propio por ahora, rutas por idioma (`/es` y `/en`) y paleta "Medianoche y cian" con tipografías Anton e Inter.
- Las decisiones técnicas (librería de internacionalización o solución propia, formato y validación de los datos, versión de Node y gestor de paquetes) se resuelven en `/speckit.clarify` y `/speckit.plan`, y se documentan en `research.md`.
- Se heredan las restricciones técnicas de `docs/sprints/fase-1-base-y-datos.md` (sección 10) y de la constitución v1.0.0.
- Quedan fuera de alcance: splash, menú, transiciones, pantallas con diseño P3R, audio, video, arte nuevo, cursor personalizado, Timeline y SEO avanzado.
