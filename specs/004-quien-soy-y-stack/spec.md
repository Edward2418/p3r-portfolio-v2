# Especificación de la funcionalidad: Fase 4 — Quién soy y Stack

**Rama de la funcionalidad**: `004-quien-soy-y-stack`

**Creado**: 2026-10-23

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Fase 4: Quién soy y Stack" (insumo: `docs/sprints/fase-4-quien-soy-y-stack.md`)

## Aclaraciones

### Sesión 2026-10-23

- Q: ¿Qué datos personales se publican en "Quién soy"? → A: El nombre ("Edward Negrete"), el titular, la especialidad, la institución (TecNM, ITSH) y el semestre actual. No se publican el apellido completo ni el año de titulación previsto.
- Q: ¿Qué hitos de la trayectoria se confirman y se muestra el hito futuro? → A: Los cinco hitos de la versión anterior (inicio de carrera, 3.º y 4.º semestre, 5.º y 6.º, semestre actual y titulación), con la titulación distinguida como meta futura; todos provisionales hasta que Edward los revise. Como no se publica el año de titulación, el hito futuro se muestra sin año.
- Q: ¿Qué representan las intersecciones de los círculos? → A: Una etiqueta fija ("Full-Stack") en el centro de los tres círculos, sin tecnologías propias; cada tecnología va en un solo círculo y las demás zonas de solapamiento son decorativas.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Conocer quién es Edward (Prioridad: P1)

Como reclutador, quiero ver en "Quién soy" una ficha con el nombre de Edward, su perfil y una presentación breve, para saber quién es sin leer largos textos.

**Por qué esta prioridad**: es la primera pregunta de quien revisa un portafolio y una de las tres secciones que deben alcanzarse en tres interacciones o menos.

**Prueba independiente**: abrir "Quién soy" desde el menú y comprobar que se ven el nombre, el perfil y la presentación, con el contenido pendiente de confirmar marcado como provisional.

**Escenarios de aceptación**:

1. **Dado** que el visitante abre "Quién soy", **cuando** termina la transición, **entonces** ve el nombre de Edward, su titular de perfil y una presentación breve, dentro de una ficha con el aspecto de las pantallas del juego.
2. **Dado** que algún dato de la ficha no está confirmado por Edward, **cuando** se muestra, **entonces** aparece marcado como provisional y no se presenta como definitivo.
3. **Dado** que el visitante cambia el idioma, **cuando** se muestra la pantalla, **entonces** el perfil y la presentación aparecen en el idioma elegido y la pantalla se conserva.

---

### Historia de usuario 2 - Ver su formación y trayectoria (Prioridad: P1)

Como reclutador, quiero ver su formación y trayectoria breve (lo que antes era el Timeline) dentro de "Quién soy", para entender su recorrido y en qué punto está.

**Por qué esta prioridad**: da contexto a una persona que aún no tiene empleos previos que mostrar; es lo que sustituye al Timeline, que dejó de ser una sección propia.

**Prueba independiente**: abrir "Quién soy" y comprobar que la formación y la trayectoria aparecen en orden cronológico, cada hito con su periodo, su título y una descripción breve.

**Escenarios de aceptación**:

1. **Dado** que el visitante abre "Quién soy", **cuando** recorre la ficha, **entonces** ve la formación y la trayectoria en orden cronológico, cada hito con su periodo, su título y una descripción breve.
2. **Dado** que un hito no está confirmado por Edward, **cuando** se muestra, **entonces** aparece marcado como provisional o no se muestra.
3. **Dado** que la trayectoria incluye un hito futuro, **cuando** se muestra, **entonces** se distingue de los hechos ya ocurridos.

---

### Historia de usuario 3 - Ver las tecnologías en círculos solapados (Prioridad: P1)

Como reclutador, quiero ver en "Stack" las tecnologías agrupadas en tres círculos solapados (frontend, backend, bases de datos y herramientas) con su nivel, para saber con qué trabaja Edward y qué tan a fondo.

**Por qué esta prioridad**: es la otra sección que un reclutador debe poder revisar en segundos y el elemento más característico del estilo de la pantalla de referencia.

**Prueba independiente**: abrir "Stack" y comprobar que hay tres círculos solapados, que cada tecnología aparece en el círculo de su categoría y que cada una muestra su nivel de 1 a 5.

**Escenarios de aceptación**:

1. **Dado** que el visitante abre "Stack", **cuando** termina la transición, **entonces** ve tres círculos solapados, uno por categoría, con las tecnologías de cada una.
2. **Dado** que una tecnología tiene nivel, **cuando** se muestra, **entonces** su nivel de 1 a 5 se lee de forma explícita (no solo por color o tamaño).
3. **Dado** que una tecnología no está confirmada por Edward, **cuando** se muestra, **entonces** aparece marcada como provisional.
4. **Dado** que se muestra la zona central de los tres círculos, **cuando** el visitante la ve, **entonces** aparece la etiqueta "Full-Stack" sin tecnologías propias, y esa misma etiqueta está en el texto para lectores de pantalla.
5. **Dado** que el visitante pasa de "Quién soy" a "Stack" con la pestaña R, el teclado o el deslizamiento, **cuando** termina la transición, **entonces** ve "Stack" con la misma transición y el mismo personaje de las fases anteriores.

---

### Historia de usuario 4 - Acceder sin depender de lo visual (Prioridad: P1)

Como visitante con lector de pantalla o con un teléfono pequeño, quiero acceder a la misma información de ambas pantallas sin depender de lo visual, para no perderme nada.

**Por qué esta prioridad**: la constitución exige que el estilo no oculte el contenido ni lo vuelva ilegible, y los círculos solapados son un recurso visual que no se puede leer en voz alta.

**Prueba independiente**: recorrer ambas pantallas con un lector de pantalla y comprobar que anuncia las mismas categorías, tecnologías, niveles e hitos que se ven, en un orden lógico; abrirlas a 390 px y comprobar que todo se lee sin desplazarse de lado.

**Escenarios de aceptación**:

1. **Dado** que el visitante usa un lector de pantalla en "Stack", **cuando** recorre la pantalla, **entonces** oye cada categoría con sus tecnologías y el nivel de cada una, sin depender de la posición ni del color.
2. **Dado** que el visitante usa un teléfono de 390 px de ancho, **cuando** abre cualquiera de las dos pantallas, **entonces** todo el contenido se lee sin desplazamiento horizontal y los círculos se adaptan sin volverse ilegibles.
3. **Dado** que el visitante usa solo el teclado, **cuando** recorre las pantallas, **entonces** el orden de tabulación es lógico y el foco siempre es visible.

---

### Historia de usuario 5 - Que Oguri acompañe las pantallas (Prioridad: P2)

Como visitante, quiero que Oguri acompañe estas pantallas con una posición y entrada propias, para que sigan sintiéndose parte del mismo recorrido.

**Por qué esta prioridad**: da continuidad al recorrido, pero las pantallas funcionan sin ello.

**Prueba independiente**: abrir cada pantalla y comprobar que Oguri aparece con su entrada y en una posición propia de esa pantalla, sin tapar el contenido, y que con movimiento reducido no hay desplazamientos.

**Escenarios de aceptación**:

1. **Dado** que el visitante abre "Quién soy" o "Stack", **cuando** termina la transición, **entonces** Oguri queda en la posición propia de esa pantalla, sin tapar ningún texto.
2. **Dado** que el visitante pasa de una pantalla a la otra, **cuando** termina la transición, **entonces** el cambio de posición ocurre bajo la cobertura del barrido, sin saltos visibles.
3. **Dado** que el visitante tiene el movimiento reducido activado, **cuando** cambia de pantalla, **entonces** no hay desplazamientos: solo cambios de opacidad cortos.

---

### Historia de usuario 6 - Publicar solo lo confirmado y cambiarlo sin tocar componentes (Prioridad: P2)

Como Edward, quiero que mi perfil, mi formación, mi trayectoria y mis tecnologías vivan en datos bilingües y que lo no confirmado se vea marcado como provisional, para publicar solo lo que es cierto y cambiarlo sin tocar componentes.

**Por qué esta prioridad**: protege la honestidad del contenido ante reclutadores y permite completar la información cuando Edward la confirme.

**Prueba independiente**: agregar una tecnología y un hito a los datos y comprobar que aparecen en las pantallas en ambos idiomas, y quitar la marca de provisional de un dato para comprobar que desaparece la etiqueta.

**Escenarios de aceptación**:

1. **Dado** que Edward agrega una tecnología o un hito de trayectoria a los datos, **cuando** recompila el sitio, **entonces** aparece en la pantalla en español e inglés sin editar componentes.
2. **Dado** que Edward confirma un dato provisional, **cuando** quita su marca, **entonces** la etiqueta de provisional desaparece de la pantalla.
3. **Dado** que falta un dato opcional (por ejemplo, una descripción), **cuando** se muestra la pantalla, **entonces** no queda ningún hueco ni texto vacío.

---

### Casos límite

- Si la trayectoria no tiene ningún hito confirmado, "Quién soy" se muestra sin esa sección y sin huecos.
- Si una categoría de tecnologías queda vacía, su círculo no se muestra o se muestra sin elementos, sin romper el solapamiento de los otros; la etiqueta central solo se muestra si hay tecnologías en las tres categorías.
- Con muchas tecnologías en una categoría, el círculo y su lista siguen siendo legibles y no se cortan.
- Con textos largos o con el zoom del 200 %, las pantallas siguen siendo legibles y sin desplazamiento horizontal.
- En 390 px los tres círculos no caben solapados a su tamaño de escritorio: se adaptan (por ejemplo, apilados o más pequeños) sin perder la información.
- Si el visitante interrumpe la transición, ve la pantalla de destino completa y con Oguri en su lugar.
- Cambiar de idioma estando en "Stack" o en "Quién soy" conserva la pantalla y no deja textos a medias.
- Un nivel fuera de 1 a 5 en los datos se rechaza al validar los datos, no se muestra.
- Un dato provisional y uno confirmado conviven en la misma pantalla sin confundirse.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: "Quién soy" MUST mostrar el nombre de Edward, su titular de perfil y una presentación breve, dentro de una ficha con el aspecto de una pantalla del juego.
- **FR-002**: "Quién soy" MUST mostrar la formación y la trayectoria breve en orden cronológico, cada hito con su periodo, su título y una descripción breve, y distinguir los hitos futuros de los ya ocurridos.
- **FR-003**: El sistema MUST publicar solo contenido confirmado por Edward: todo dato pendiente de confirmar MUST mostrarse marcado como provisional y ninguna referencia no verificada MUST presentarse como cierta.
- **FR-004**: El sistema MUST publicar como datos personales visibles solo el nombre ("Edward Negrete"), el titular, la especialidad, la institución (TecNM, ITSH) y el semestre actual, y MUST NOT publicar el apellido completo ni el año de titulación previsto.
- **FR-005**: La trayectoria MUST incluir los cinco hitos de la versión anterior (inicio de carrera, 3.º y 4.º semestre, 5.º y 6.º semestre, semestre actual y titulación), con la titulación distinguida como meta futura y sin año, y todos MUST aparecer como provisionales hasta que Edward los confirme.
- **FR-006**: "Stack" MUST mostrar las tecnologías agrupadas en tres círculos solapados, uno por categoría (frontend, backend, bases de datos y herramientas), con cada tecnología en el círculo de su categoría.
- **FR-007**: Cada tecnología MUST mostrar su nivel de 1 a 5 de forma explícita (valor legible), no solo mediante color, tamaño o posición.
- **FR-008**: Cada tecnología MUST pertenecer a un solo círculo; la zona central de los tres círculos MUST mostrar la etiqueta fija "Full-Stack" (en datos, en ambos idiomas) sin tecnologías propias, y las demás zonas de solapamiento son decorativas y MUST NOT contener información.
- **FR-009**: Toda la información de "Stack" (categorías, tecnologías y niveles) MUST estar disponible como texto en un orden lógico para lectores de pantalla, sin depender del gráfico de círculos.
- **FR-010**: Ambas pantallas MUST ser legibles y operables en 390, 768 y 1280 px de ancho, sin desplazamiento horizontal y con los círculos adaptados a cada ancho sin perder información.
- **FR-011**: Oguri MUST acompañar ambas pantallas con una posición, una escala y una rotación propias de cada una, sin tapar ningún contenido y cambiando de lugar bajo la cobertura del barrido.
- **FR-012**: La navegación y las transiciones de las fases 2 y 3 MUST seguir funcionando sin cambios: abrir desde el menú, pasar entre pantallas con L/R, teclado y deslizamiento, interrumpir con un clic o una tecla, y anunciar la pantalla con el foco en su título.
- **FR-013**: Con el movimiento reducido (del sistema o del sitio) las pantallas MUST mostrar el mismo contenido sin animaciones de desplazamiento, solo con cambios de opacidad cortos.
- **FR-014**: Todo el contenido de ambas pantallas MUST salir de datos tipados con español e inglés por campo; agregar una tecnología o un hito MUST requerir solo añadir datos, y los componentes MUST NOT contener textos.
- **FR-015**: El contenido esencial de ambas pantallas MUST ser visible a los 5 s de cargar y alcanzable en 3 interacciones o menos desde la primera pantalla.
- **FR-016**: Ambas pantallas MUST mantener contraste AA, foco visible y orden de tabulación lógico, y la pantalla MUST conservarse al cambiar de idioma.
- **FR-017**: Los datos MUST validarse: nivel entre 1 y 5, identificadores únicos, ambos idiomas completos y cada tecnología en una categoría existente.
- **FR-018**: El aviso de no afiliación MUST seguir visible y las pantallas MUST mantener su identidad propia (sin copiar el diseño del juego).

### Entidades clave *(incluir si la funcionalidad involucra datos)*

- **Perfil**: nombre, titular, especialidad, presentación, institución y semestre actual (sin apellido completo ni año de titulación); cada campo en español e inglés y con marca de provisional cuando no está confirmado.
- **Hito de trayectoria**: periodo (o año), título, descripción breve, tipo (formación, avance o meta futura) y marca de provisional; pertenece a la trayectoria ordenada cronológicamente.
- **Tecnología**: nombre, nivel de 1 a 5 y marca de provisional; pertenece a una categoría.
- **Categoría de stack**: nombre en dos idiomas y lista de tecnologías; hay tres (frontend, backend, bases de datos y herramientas).
- **Etiqueta central del stack**: texto "Full-Stack" en dos idiomas para la zona donde se cruzan los tres círculos.
- **Posición de Oguri en una pantalla**: ubicación, escala y rotación propias de "Quién soy" y de "Stack".

## Criterios de éxito *(obligatorio)*

### Medibles

- **SC-001**: Un visitante nuevo encuentra el nombre, el perfil y la especialidad de Edward en menos de 10 segundos desde que abre "Quién soy".
- **SC-002**: Un visitante llega a "Quién soy" y a "Stack" desde la primera pantalla en 3 interacciones o menos, y ve el contenido esencial a los 5 s, sin esperar animaciones.
- **SC-003**: El 100 % de las tecnologías muestra su categoría y su nivel como texto legible, y el recorrido con un lector de pantalla entrega la misma información que la vista, en un orden lógico.
- **SC-004**: No hay desplazamiento horizontal ni texto cortado en 390, 768 y 1280 px, en español e inglés.
- **SC-005**: La puntuación de accesibilidad móvil es 100, no hay violaciones automáticas y todo el texto cumple contraste AA.
- **SC-006**: La carga inicial no supera 350 KiB y el rendimiento móvil se mantiene al nivel de la fase 3 (82 o más en local; 90 o más en la dirección pública).
- **SC-007**: Agregar un hito o una tecnología a los datos se refleja en ambas pantallas, en los dos idiomas, sin editar ningún componente.
- **SC-008**: El 100 % del contenido no confirmado aparece marcado como provisional y no hay afirmaciones sin confirmar presentadas como ciertas.
- **SC-009**: Edward revisa y confirma el contenido definitivo de ambas pantallas y compara el movimiento con la referencia, sin hallazgos abiertos de la revisión de animaciones.
- **SC-010**: Las pruebas automáticas existentes (unitarias y E2E en 390, 768 y 1280 px) y las nuevas de esta fase pasan sin regresiones.

## Supuestos

- Se mantiene la escala de nivel de 1 a 5 ya existente en los datos; los porcentajes de la versión anterior no se usan.
- La lista de tecnologías parte de la ya existente, marcada como provisional (Next.js, React, TypeScript, Tailwind CSS, Node.js, Git, Playwright y Vercel). Los candidatos de la versión anterior (Java, SQL y bases de datos, HTML y CSS, JavaScript) y su recorrido (desde 2023, institución y especialidad) se incorporan solo como provisionales hasta que Edward los confirme, y los niveles son de ejemplo; el semestre actual y la agrupación en categorías también son provisionales.
- La presentación es un texto de ejemplo marcado como provisional hasta que Edward la redacte o apruebe un borrador en español e inglés; las traducciones al inglés las propone el asistente y Edward las confirma.
- Los círculos de "Stack" son un recurso visual con un equivalente textual completo; no son interactivos.
- Los niveles y la etiqueta central se leen sin depender del color; la manera exacta de dibujar los círculos se decide en la planificación.
- Las animaciones de entrada de los bloques de las pantallas se mantienen discretas y por defecto no se añade movimiento nuevo más allá de la entrada de la escena, hasta que se decida otra cosa.
- Hay una sola pose de Oguri; su posición, escala y rotación cambian por pantalla, pero no su pose (más poses llegan en la fase 6).
- No hay arte nuevo ni dependencias nuevas; el contacto, el CV, los proyectos y Social Link quedan fuera de esta fase.
- Depende de las fases 2 y 3 fusionadas en `main` (motor de transición, marco de pantallas, personaje, tokens, pruebas y accesibilidad).
