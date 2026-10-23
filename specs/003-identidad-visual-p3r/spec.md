# Especificación de la funcionalidad: Fase 3 — Identidad visual P3R

**Rama de la funcionalidad**: `003-identidad-visual-p3r`

**Creado**: 2026-10-23

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Fase 3: identidad visual P3R" (insumo: `docs/sprints/fase-3-identidad-visual-p3r.md`)

## Aclaraciones

### Sesión 2026-10-23

- Q: En el móvil (390 px), ¿dónde debe ir Oguri para no tapar las opciones del menú? → A: Como figura grande detrás de las opciones, recortada por el borde derecho y con menos opacidad, sin ocupar espacio; las opciones van encima y ocupan todo el ancho.
- Q: En las cinco pantallas internas, ¿dónde debe ir Oguri en escritorio y en móvil sin dificultar la lectura del contenido? → A: En escritorio, a la derecha, grande y fuera del área de contenido, que va en un panel; en móvil, detrás del panel, recortada y atenuada, como en el menú.
- Q: ¿En qué momento exacto debe empezar a cargarse el video de movimiento en reposo de Oguri? → A: Cuando el navegador queda en reposo tras cargar el menú, con un tope de unos 2 s, y solo si no hay movimiento reducido ni ahorro de datos.
- Ajuste tras medir en la implementación (T055, 2026-10-23): con Lighthouse el video de 1.2 MB se descargaba dentro de la ventana de medición (1483 KiB y rendimiento 63–79 frente a 82–85), así que "bajo demanda" se concreta así: el video empieza a cargarse en la primera interacción del visitante o, sin ella, 8 s después de cargar la página, y siempre con el navegador en reposo (tope de unos 2 s). Mantiene la decisión (reposo, tope de 2 s, sin movimiento reducido ni ahorro de datos) y cumple la constitución ("video y audio bajo demanda, nunca en la carga inicial").
- Revisión de animaciones (`/review-animations`, 2026-10-23), correcciones aprobadas por Edward: el idle solo se descarga y se reproduce en el menú (en las pantallas de lectura Oguri queda como imagen fija); el bucle del idle se funde a la imagen fija en lugar de saltar del último cuadro al primero; Oguri entra animada aunque se omita el splash; y con movimiento reducido el video se funde (no desaparece de golpe) y el personaje se funde al cambiar de vista en lugar de saltar de lado.
- Revisión de análisis (`/speckit-analyze`, 2026-10-23), correcciones aplicadas con aprobación de Edward: el indicador de foco debe verse con 3:1 sobre cualquier superficie (FR-015); el personaje atenuado tiene opacidad máxima 0.5 (FR-003 y FR-014); el cambio de idioma puede remontar la escena y el personaje volver a entrar (caso límite); descripción del personaje en un solo lugar; `open` y `close` se emiten desde la llegada de ruta, una vez por cambio.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Ver un menú con el estilo de P3R (Prioridad: P1)

Como visitante, quiero ver un menú principal con el estilo visual de Persona 3 Reload (degradado de cian a azul profundo, panel blanco inclinado con un título vertical y opciones inclinadas con la activa en blanco y con borde rojo), para reconocer de inmediato la propuesta del portafolio.

**Por qué esta prioridad**: es el resultado visible esperado del proyecto y la base sobre la que se apoyan el personaje, el barrido y las demás pantallas.

**Prueba independiente**: abrir el menú y comprobar que se ven el fondo, el panel con el título vertical y las cinco opciones inclinadas, con la activa resaltada; cambiar de opción con el teclado y comprobar que el resaltado la sigue.

**Escenarios de aceptación**:

1. **Dado** que el visitante abre el menú, **cuando** termina de cargar, **entonces** ve el fondo en degradado de cian a azul profundo, el panel blanco inclinado con el título vertical y las cinco opciones inclinadas con la activa resaltada en blanco y con borde rojo.
2. **Dado** que el menú está visible, **cuando** el visitante mueve la opción activa con el teclado, el ratón o el toque, **entonces** el resaltado se desplaza a la nueva opción sin que el texto de ninguna opción pierda legibilidad.
3. **Dado** que el visitante cambia el idioma, **cuando** se muestra el menú, **entonces** los nombres de las opciones y el título del panel aparecen en el idioma elegido.

---

### Historia de usuario 2 - Tener a Oguri como protagonista (Prioridad: P1)

Como visitante, quiero ver a Oguri como protagonista del menú, con una entrada animada y un movimiento suave en reposo, para que el sitio tenga personalidad y un hilo conductor.

**Por qué esta prioridad**: el personaje es lo que distingue al sitio de una plantilla y lo que el visitante recuerda.

**Prueba independiente**: abrir el menú y comprobar que Oguri aparece grande y completa con una animación de entrada breve, y que el menú es utilizable desde el primer momento aunque el movimiento en reposo tarde en llegar.

**Escenarios de aceptación**:

1. **Dado** que el menú se muestra, **cuando** termina la entrada del personaje, **entonces** Oguri se ve completa y sin recortes, sin tapar ninguna opción.
2. **Dado** que el menú ya es utilizable y el visitante interactuó (o pasaron 8 s sin interacción) con el navegador en reposo (tope de unos 2 s), **cuando** el movimiento en reposo está disponible, **entonces** Oguri pasa de una imagen fija a un movimiento suave sin saltos visibles.
3. **Dado** que el visitante tiene el movimiento reducido activado (sistema o sitio) o el ahorro de datos activado, **cuando** abre el menú, **entonces** Oguri aparece como imagen fija y no se descarga el video de movimiento en reposo.
4. **Dado** que el video de movimiento en reposo no llega o falla, **cuando** se muestra el menú, **entonces** Oguri sigue visible como imagen fija y no aparece ningún error.

---

### Historia de usuario 3 - Barrido entre pantallas con el personaje (Prioridad: P1)

Como visitante, quiero que el barrido entre pantallas incluya a Oguri entrando desde la derecha, rotada, como en el menú del juego, para sentir continuidad al navegar.

**Por qué esta prioridad**: es el movimiento que el propietario del sitio pidió replicar del juego; sin el personaje, la transición de la fase 2 se queda a medias.

**Prueba independiente**: abrir una pantalla desde el menú y comprobar, grabando el movimiento, que Oguri entra desde la derecha durante la fase de entrada, que la transición completa dura entre 500 y 800 ms y que un clic la interrumpe.

**Escenarios de aceptación**:

1. **Dado** que el visitante abre una pantalla desde el menú, **cuando** se ejecuta la transición, **entonces** el barrido cubre la pantalla, Oguri entra desde la derecha rotada durante la entrada escalonada y la pantalla destino queda visible con su marco.
2. **Dado** que una transición está en curso, **cuando** el visitante pulsa una tecla o hace clic, **entonces** llega al destino de inmediato con Oguri ya en su posición final.
3. **Dado** que el visitante vuelve al menú con Esc o con Atrás, **cuando** termina la transición, **entonces** Oguri queda en la posición que tiene en el menú y la opción de la pantalla anterior queda resaltada.
4. **Dado** que el movimiento reducido está activo, **cuando** el visitante cambia de pantalla, **entonces** no hay barrido ni desplazamiento de Oguri: solo un cambio de opacidad corto.

---

### Historia de usuario 4 - Sonido opcional (Prioridad: P2)

Como visitante, quiero oír sonidos de interfaz (cursor, confirmar, cancelar, abrir, cerrar y subida de nivel) solo si los activo, para disfrutar la experiencia sin molestar en una oficina o en una biblioteca.

**Por qué esta prioridad**: aporta ambiente, pero el sitio funciona completo sin él, y la constitución exige que arranque silenciado.

**Prueba independiente**: abrir el sitio y comprobar que no suena nada ni se descarga audio; activar el sonido en System y comprobar que cada acción tiene su sonido; desactivarlo y comprobar que vuelve el silencio.

**Escenarios de aceptación**:

1. **Dado** que el visitante entra por primera vez, **cuando** navega por el sitio, **entonces** no suena nada y no se descarga ningún archivo de audio.
2. **Dado** que el visitante activa el sonido en System, **cuando** mueve la opción activa, confirma, cancela o cambia de pantalla, **entonces** oye el sonido correspondiente a cada acción, y una sola vez oye el de subida de nivel al activarlo.
3. **Dado** que el visitante activó el sonido, **cuando** vuelve al sitio en otra visita, **entonces** el sonido conserva su estado.
4. **Dado** que el visitante tiene el movimiento reducido o usa un lector de pantalla, **cuando** activa el sonido, **entonces** el interruptor es operable con teclado, anuncia su estado y no depende del movimiento.
5. **Dado** que el navegador bloquea la reproducción hasta que haya una interacción, **cuando** el visitante activa el sonido, **entonces** los sonidos siguientes funcionan sin mensajes de error.

---

### Historia de usuario 5 - Marco común de las pantallas internas (Prioridad: P2)

Como visitante, quiero que las cinco pantallas internas compartan un marco con el mismo fondo, cabecera y personaje, para que el sitio se sienta coherente aunque su contenido llegue por fases.

**Por qué esta prioridad**: evita que cada fase posterior rehaga el aspecto y permite entregar las pantallas con su estilo desde el primer día.

**Prueba independiente**: abrir cada una de las cinco pantallas y comprobar que muestran el mismo fondo, una cabecera con el nombre de la pantalla y a Oguri en su posición de pantalla, con el contenido de la fase 2 legible dentro del marco.

**Escenarios de aceptación**:

1. **Dado** que el visitante abre cualquiera de las cinco pantallas, **cuando** se muestra, **entonces** ve el fondo común, la cabecera con el nombre de la pantalla, el contenido dentro de un panel y a Oguri en su posición de pantalla: en escritorio, a la derecha y fuera del panel; en móvil, detrás del panel, recortada y atenuada.
2. **Dado** que una pantalla tiene mucho contenido, **cuando** el visitante se desplaza, **entonces** el contenido se lee con contraste suficiente sobre el fondo y la cabecera y el personaje no lo tapan.
3. **Dado** que el visitante pasa de una pantalla a otra con L/R, **cuando** termina la transición, **entonces** el marco se mantiene y solo cambia el contenido y el nombre de la cabecera.

---

### Historia de usuario 6 - Usar el menú en el móvil (Prioridad: P1)

Como visitante en móvil, quiero que Oguri y el panel no tapen las opciones ni obliguen a desplazarse de lado, para usar el menú con comodidad en una pantalla pequeña.

**Por qué esta prioridad**: gran parte de los reclutadores abre el enlace desde el móvil; un menú ilegible sería un fracaso aunque se vea bien en escritorio.

**Prueba independiente**: abrir el menú a 390 px de ancho y comprobar que las cinco opciones se ven y se pulsan completas, que Oguri no las tapa y que no hay desplazamiento horizontal.

**Escenarios de aceptación**:

1. **Dado** que la pantalla mide 390 px de ancho, **cuando** se muestra el menú, **entonces** Oguri aparece como figura grande detrás de las opciones, recortada por el borde derecho y con menos opacidad, y las cinco opciones se ven completas, encima del personaje, ocupan todo el ancho y se pulsan con facilidad.
2. **Dado** que el visitante gira el móvil a horizontal, **cuando** se muestra el menú, **entonces** el diseño se adapta sin recortar opciones ni crear desplazamiento horizontal.
3. **Dado** que el visitante usa los anchos 390, 768 y 1280 px, **cuando** recorre el menú y las pantallas, **entonces** no aparece desplazamiento horizontal.

---

### Historia de usuario 7 - Cambiar el arte y los textos sin tocar componentes (Prioridad: P3)

Como Edward, quiero que el arte, los sonidos, el título vertical y los textos nuevos salgan de datos y tokens, para cambiarlos sin tocar los componentes.

**Por qué esta prioridad**: mantiene el cumplimiento del principio de contenido en datos y facilita añadir poses o personajes en fases posteriores.

**Prueba independiente**: cambiar el texto del título vertical, la ruta de la imagen del personaje o un color del degradado en los datos o tokens, y comprobar que el sitio lo refleja sin editar componentes.

**Escenarios de aceptación**:

1. **Dado** que Edward cambia el título vertical, el nombre de un sonido o la ruta de una imagen en los datos, **cuando** recompila el sitio, **entonces** el cambio se refleja sin editar componentes.
2. **Dado** que Edward cambia un color o una duración en los tokens, **cuando** recompila, **entonces** el cambio se refleja en todo el sitio.

---

### Casos límite

- Si la imagen del personaje no carga, el menú sigue siendo utilizable y se muestra un espacio vacío con el nombre accesible del personaje.
- Con una conexión lenta, el menú y las opciones aparecen antes que el movimiento en reposo, que empieza a cargarse en la primera interacción o 8 s después de cargar la página, con el navegador en reposo (tope de unos 2 s), y sin bloquear nada.
- Con el ahorro de datos activado, no se descarga el video de movimiento en reposo.
- Si el navegador no admite video con transparencia, Oguri se muestra como imagen fija.
- Una transición interrumpida en cualquier punto deja a Oguri en su posición final y no en una pose intermedia.
- Cambiar de idioma durante una transición no deja textos a medias; si el cambio de idioma remonta la escena, el personaje puede volver a entrar, sin errores, y la preferencia de sonido se conserva.
- Un navegador con el audio bloqueado hasta una interacción no muestra errores y el sonido funciona después de la primera interacción.
- El texto sobre el panel blanco y sobre el degradado mantiene el contraste AA en cualquier punto del degradado y en cualquier ancho.
- Con el contenido de una pantalla muy largo, el panel crece o se desplaza sin que el personaje se superponga al texto ni la cabecera lo tape.
- Con zoom del 200 % o fuente grande, el menú sigue siendo utilizable y sin desplazamiento horizontal.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El menú principal MUST mostrar un fondo en degradado de cian a azul profundo, un panel blanco inclinado con un título vertical y las cinco opciones inclinadas, con la activa en blanco y con borde rojo.
- **FR-002**: El título vertical del panel y los textos nuevos MUST salir de datos bilingües, no de los componentes.
- **FR-003**: El menú MUST mostrar a Oguri como imagen principal sin que cubra ninguna opción en 390, 768 y 1280 px. En móvil, Oguri MUST ir detrás de las opciones, recortada por el borde derecho y con menos opacidad (como máximo 0.5), sin ocupar espacio del diseño; las opciones MUST ir encima y ocupar todo el ancho disponible (menos la banda del título vertical, que queda visible a la izquierda).
- **FR-004**: Oguri MUST entrar con una animación breve al mostrar el menú, y el menú MUST ser utilizable sin esperar a que termine.
- **FR-005**: El movimiento en reposo de Oguri MUST empezar a cargarse bajo demanda (en la primera interacción del visitante o, sin ella, 8 s después de cargar la página) y con el navegador en reposo (tope de unos 2 s), MUST NOT bloquear la carga inicial ni competir con el contenido y MUST tener una imagen fija como alternativa.
- **FR-006**: El movimiento en reposo MUST NOT cargarse ni reproducirse con movimiento reducido (del sistema o del sitio) ni con el ahorro de datos activado; tampoco se descarga ni se reproduce en las pantallas de lectura (solo en el menú, donde Oguri es la protagonista).
- **FR-007**: La transición entre pantallas MUST incluir a Oguri entrando desde la derecha, rotada, durante la entrada escalonada, reutilizando los tiempos y las curvas de la fase 2 y sin salirse del rango de 500 a 800 ms.
- **FR-008**: La transición MUST seguir siendo interrumpible: un clic o una tecla lleva al destino de inmediato con Oguri en su posición final.
- **FR-009**: Al volver al menú, Oguri MUST quedar en su posición del menú y la opción de la pantalla anterior MUST quedar resaltada.
- **FR-010**: El movimiento MUST limitarse a `transform` y `opacity`, y MUST respetar el movimiento reducido: sin barridos ni desplazamiento del personaje, solo cambios de opacidad cortos.
- **FR-011**: El sonido MUST estar desactivado por defecto y MUST NOT descargar ningún archivo de audio hasta que el visitante lo active.
- **FR-012**: System MUST ofrecer un interruptor de sonido operable con teclado, con su estado anunciado a los lectores de pantalla y recordado entre visitas.
- **FR-013**: Con el sonido activado, el sitio MUST reproducir un sonido por acción: mover la opción (cursor), confirmar, cancelar, abrir una pantalla, cerrar o volver, y, una sola vez al activar el sonido, subida de nivel.
- **FR-014**: Las cinco pantallas internas MUST compartir un marco con el mismo fondo, una cabecera con el nombre de la pantalla, un panel para el contenido y la posición de pantalla de Oguri, sin ocultar ni dificultar la lectura de su contenido. En escritorio y tableta, Oguri MUST ir a la derecha, grande y fuera del panel; en móvil, detrás del panel, recortada y atenuada (opacidad máxima 0.5).
- **FR-015**: El contenido de las pantallas MUST mantener contraste AA sobre el fondo y MUST seguir siendo operable con teclado, con toque y con lector de pantalla. El indicador de foco MUST verse con un contraste de al menos 3:1 sobre cualquier superficie del sitio (blanca, cian o marina).
- **FR-016**: El personaje decorativo MUST ocultarse a los lectores de pantalla cuando no aporte información, y MUST tener una descripción cuando sí la aporte.
- **FR-017**: El sitio MUST NOT tener desplazamiento horizontal en 390, 768 y 1280 px.
- **FR-018**: El sitio MUST mantener visible el aviso de que no está afiliado a los propietarios de las franquicias que lo inspiran, y MUST tener identidad propia sin copiar el diseño del juego.
- **FR-019**: Los colores, el degradado, el ángulo de inclinación y las duraciones nuevas MUST definirse como tokens en un único lugar.
- **FR-020**: Las rutas y la navegación de la fase 2 (`/es`, `/en`, teclado, L/R, toque, deslizamiento, anuncio de ruta y foco) MUST seguir funcionando sin cambios de comportamiento.

### Entidades clave *(incluir si la funcionalidad involucra datos)*

- **Recurso del personaje**: imagen principal, imagen de reposo, video de reposo y descripción accesible bilingüe de Oguri; la posición, la escala y la rotación del personaje en el menú y en cada pantalla.
- **Efecto de sonido**: identificador (cursor, confirmar, cancelar, abrir, cerrar, subida de nivel), archivo y acción a la que responde.
- **Preferencia de sonido**: estado activado o desactivado, recordado entre visitas y modificable solo por el visitante.
- **Marco de pantalla**: fondo, cabecera con el nombre de la pantalla y posición del personaje, comunes a las cinco pantallas.
- **Título del panel**: texto vertical bilingüe del menú.

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: A 390, 768 y 1280 px de ancho, las cinco opciones del menú se ven completas y sin ser cubiertas por el personaje, y no hay desplazamiento horizontal.
- **SC-002**: El menú y sus opciones son utilizables a los 5 s de cargar la página, sin esperar al personaje ni al movimiento en reposo.
- **SC-003**: La carga inicial del menú, sin audio ni video, no supera 350 KiB transferidos.
- **SC-004**: La transición con el personaje dura entre 500 y 800 ms y un clic o una tecla la interrumpe en menos de 200 ms.
- **SC-005**: Con el sonido desactivado, la visita completa no descarga ningún archivo de audio.
- **SC-006**: La puntuación de accesibilidad móvil es 100 y el rendimiento móvil se mantiene en el nivel de la fase 2 (85 o más en local; 90 o más en la dirección pública), sin violaciones de accesibilidad automáticas.
- **SC-007**: Con movimiento reducido activado, el 100 % de las transiciones y animaciones se reducen a cambios de opacidad cortos y no se descarga el video de reposo.
- **SC-008**: Edward compara el menú y el barrido con la referencia visual y con el video, tramo por tramo, y confirma que reproducen el estilo y la secuencia sin hallazgos abiertos de la revisión de animaciones.
- **SC-009**: Las pruebas automáticas existentes (unitarias y E2E en 390, 768 y 1280 px) y las nuevas de esta fase pasan sin regresiones.
- **SC-010**: El cambio de un texto, un color, una duración o una ruta de imagen se aplica editando solo datos o tokens.

## Supuestos

- El título vertical del panel es "PORTFOLIO", como en la versión anterior, y se puede cambiar en los datos.
- Con una sola pose de Oguri disponible, el personaje cambia de posición, escala y rotación en cada pantalla, no de pose; más poses llegan en la fase 6.
- El idle de Oguri empieza a cargarse en la primera interacción o 8 s después de cargar la página, con el navegador en reposo (tope de unos 2 s); es el video con transparencia de la versión anterior, ya incluido en el repositorio; el retrato es el WebP optimizado.
- La preferencia de sonido se guarda en el navegador del visitante, sin cuentas ni servidores.
- El sonido de subida de nivel suena una sola vez, al activar el sonido, como confirmación.
- El interruptor de sonido vive en System; la pantalla System completa (contacto y demás ajustes) llega en la fase 7.
- Las cinco pantallas conservan el contenido provisional de la fase 2 hasta las fases 4 a 7; esta fase solo les da marco y estilo.
- El arte de Oguri es de terceros y se publica con el aviso de no afiliación, sin fines comerciales, por decisión de Edward.
- Se verifican Chromium y Firefox; WebKit/Safari y un dispositivo real siguen pendientes de verificación manual.
- Depende de la fase 2 fusionada en `main` (motor de transición, tokens, pruebas y accesibilidad).
