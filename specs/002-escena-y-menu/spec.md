# Especificación de la funcionalidad: Fase 2 — Escena y menú

**Rama de la funcionalidad**: `002-escena-y-menu`

**Creado**: 2026-10-22

**Estado**: Borrador

**Entrada**: Descripción del usuario: "Usa la descripción de docs/sprints/fase-2-escena-y-menu.md"

## Aclaraciones

### Sesión 2026-10-22

- Q: Si alguien abre un enlace directo a una pantalla, ¿debe ver primero el splash? → A: No. El splash solo se muestra al entrar por la raíz del sitio (`/`, `/es` o `/en`) en la primera visita de la sesión; un enlace directo a una pantalla la abre sin splash.
- Q: ¿Qué nombres definitivos tienen las cinco opciones del menú y sus direcciones? → A: Español: Quién soy, Stack, Proyectos, Social Link, System. Inglés: About me, Stack, Projects, Social Link, System. Direcciones: `profile`, `stack`, `projects`, `social-link`, `system`.
- Q: En el móvil, ¿además de tocar, se debe poder deslizar en horizontal para pasar de pantalla? → A: Sí. Toque más deslizamiento horizontal; las pestañas L/R siempre visibles y pulsables hacen lo mismo. El deslizamiento solo cuenta si es claramente horizontal y nunca interfiere con el desplazamiento vertical.
- Revisión de análisis (`/speckit-analyze`, 2026-10-22), decisiones confirmadas por Edward: cualquier primera carga de documento cuenta como visita para el splash (A1); si el destino no llega a tiempo, la pantalla permanece cubierta hasta 1.5 s y luego se muestra sin escalonado, y los 500 a 800 ms se exigen en transiciones completas con el destino precargado (A2, I4); con movimiento reducido el splash se omite (A3); al volver al menú se resalta la opción de la pantalla anterior (U1); las opciones del menú no llevan marca de provisional (U2).
- Q: ¿Dónde está el control de movimiento reducido mientras no exista la pantalla System completa? → A: Un interruptor pequeño y siempre visible en el encabezado, junto al selector de idioma, con nombre accesible y estado anunciado.

## Escenarios de usuario y pruebas *(obligatorio)*

### Historia de usuario 1 - Ver un splash corto que no estorba (Prioridad: P2)

Como visitante, quiero ver un splash corto que pueda omitir con cualquier tecla o clic, y que no se repita en la misma sesión, para entrar al sitio sin esperas ni repeticiones.

**Por qué esta prioridad**: da la primera impresión del estilo, pero el sitio funciona sin él; por eso no puede bloquear el acceso al contenido.

**Prueba independiente**: abrir el sitio como visitante nuevo, comprobar que el splash aparece y se omite con una tecla o un clic; recargar y comprobar que no reaparece en la misma sesión.

**Escenarios de aceptación**:

1. **Dado** un visitante que abre el sitio por primera vez en la sesión, **cuando** carga la página, **entonces** ve el splash y, si no hace nada, pasa solo al menú principal dentro del tiempo máximo definido.
2. **Dado** que el splash está visible, **cuando** el visitante pulsa cualquier tecla o hace clic o toque, **entonces** el splash se cierra de inmediato y aparece el menú.
3. **Dado** un visitante que ya vio u omitió el splash en esta sesión, **cuando** recarga la página o vuelve al inicio, **entonces** no se muestra de nuevo.
4. **Dado** un visitante con movimiento reducido, **cuando** carga el sitio, **entonces** el splash se omite.
5. **Dado** un visitante que abre un enlace directo a una pantalla, **cuando** carga la página, **entonces** ve la pantalla de inmediato, sin splash.

---

### Historia de usuario 2 - Ver el menú principal (Prioridad: P1)

Como visitante, quiero ver el menú principal con las cinco opciones (Quién soy, Stack, Proyectos, Social Link y System), con la opción activa resaltada, para saber dónde estoy y qué puedo explorar.

**Por qué esta prioridad**: es la puerta de entrada al contenido y la base de todo el movimiento de la fase.

**Prueba independiente**: abrir el menú y comprobar que muestra las cinco opciones en orden, con una activa resaltada, un título de fondo, un marcador del personaje y los textos en el idioma activo.

**Escenarios de aceptación**:

1. **Dado** el menú principal, **cuando** se muestra, **entonces** aparecen las cinco opciones en el orden definido, con la activa resaltada (rojo y blanco) y las demás inclinadas.
2. **Dado** un visitante en `/es` o en `/en`, **cuando** ve el menú, **entonces** todos los textos están en el idioma activo.
3. **Dado** el menú, **cuando** se muestra, **entonces** hay un marcador del personaje a la izquierda y un título de fondo recortado, como en la referencia.
4. **Dado** el menú, **cuando** se revisa con un lector de pantalla, **entonces** se anuncia como una lista de opciones con la activa indicada.

---

### Historia de usuario 3 - Navegar con teclado, L/R y toque (Prioridad: P1)

Como visitante, quiero moverme por el menú y entre pantallas con las pestañas L/R, el teclado (flechas, Enter, Esc, Home y End) y el toque o el clic, con la misma fluidez en escritorio y móvil, para navegar sin depender de un dispositivo.

**Por qué esta prioridad**: sin una navegación completa y accesible el menú no cumple su propósito ni el principio de accesibilidad.

**Prueba independiente**: recorrer las cinco opciones solo con teclado, solo con clic y solo con toques, entrar a una pantalla y volver al menú.

**Escenarios de aceptación**:

1. **Dado** el menú, **cuando** el visitante usa las flechas, **entonces** cambia la opción activa; con Home va a la primera y con End a la última.
2. **Dado** una opción activa, **cuando** pulsa Enter, hace clic o toca la opción, **entonces** se abre su pantalla.
3. **Dado** una pantalla abierta, **cuando** pulsa Esc o el botón Atrás, **entonces** vuelve al menú.
4. **Dado** una pantalla abierta, **cuando** usa las pestañas L/R, **entonces** pasa a la pantalla anterior o siguiente en el orden del menú.
5. **Dado** un móvil, **cuando** el visitante toca las opciones y los botones o desliza horizontalmente, **entonces** obtiene el mismo resultado que con el teclado.
6. **Dado** un móvil, **cuando** el visitante desliza en vertical para leer el contenido, **entonces** la pantalla no cambia, y las pestañas L/R visibles permiten pasar de pantalla sin deslizar.

---

### Historia de usuario 4 - Transiciones fieles al juego (Prioridad: P1)

Como visitante, quiero que el cambio entre menú y pantallas use las transiciones del juego (barrido diagonal, entrada escalonada y cierre con círculo) en 500 a 800 ms, para sentir continuidad sin cansarme.

**Por qué esta prioridad**: es el requisito central de movimiento del proyecto y lo que la v1 no logró.

**Prueba independiente**: abrir una pantalla desde el menú y comparar la secuencia con el video de referencia por tramos de tiempo; medir la duración total.

**Escenarios de aceptación**:

1. **Dado** el menú, **cuando** el visitante abre una pantalla, **entonces** la transición muestra, en orden, la salida con barrido diagonal, la entrada escalonada de las fichas con el personaje, una pausa breve y el cierre con círculo.
2. **Dado** cualquier cambio de pantalla, **cuando** se mide, **entonces** la transición completa dura entre 500 y 800 ms.
3. **Dado** un móvil de gama media, **cuando** se reproduce la transición, **entonces** se mantiene fluida a 60 fotogramas por segundo, sin tirones.
4. **Dado** la secuencia de referencia (de 70.3 a 71.7 s del video), **cuando** Edward la compara con la implementada por tramos, **entonces** cada tramo está presente en el mismo orden y con la misma intención de movimiento.

---

### Historia de usuario 5 - Saltarse la transición (Prioridad: P1)

Como visitante con prisa, quiero que un clic o una tecla durante una transición me lleve de inmediato al destino, para no esperar a que termine el movimiento.

**Por qué esta prioridad**: evita el fracaso de que un reclutador con prisa se desespere por animaciones lentas.

**Prueba independiente**: iniciar una transición y pulsar una tecla o hacer clic a mitad; comprobar que aparece el destino sin quedarse en un estado intermedio.

**Escenarios de aceptación**:

1. **Dado** una transición en curso, **cuando** el visitante hace clic o pulsa una tecla, **entonces** se muestra el destino de inmediato.
2. **Dado** varias interrupciones seguidas, **cuando** el visitante cambia de pantalla muchas veces, **entonces** el sitio termina siempre en la pantalla elegida y nunca queda entre dos.
3. **Dado** una transición interrumpida, **cuando** llega al destino, **entonces** el contenido es legible y el foco queda en un punto lógico.

---

### Historia de usuario 6 - Respetar el movimiento reducido (Prioridad: P1)

Como visitante sensible al movimiento, quiero que el sitio respete mi preferencia de movimiento reducido y me deje activarla también desde el propio sitio, para navegar sin animaciones que me molesten.

**Por qué esta prioridad**: es un requisito de accesibilidad de la constitución, no una mejora opcional.

**Prueba independiente**: activar la preferencia en el sistema y, por separado, en el sitio; navegar por el menú y las pantallas y comprobar que no hay barridos ni desplazamientos.

**Escenarios de aceptación**:

1. **Dado** un visitante con la preferencia de movimiento reducido en su sistema, **cuando** navega, **entonces** los cambios son por opacidad corta o instantáneos, sin barridos ni desplazamientos.
2. **Dado** un visitante sin esa preferencia, **cuando** activa la opción del sitio, **entonces** obtiene el mismo comportamiento y se recuerda en sus siguientes visitas.
3. **Dado** el movimiento reducido activo, **cuando** el visitante navega, **entonces** el contenido y las acciones disponibles son los mismos que con movimiento.

---

### Historia de usuario 7 - Ver la guía y los botones contextuales (Prioridad: P2)

Como visitante, quiero ver siempre la guía contextual y los botones Confirmar y Atrás abajo a la derecha, como en el juego, para saber qué acción está disponible.

**Por qué esta prioridad**: orienta al visitante y refuerza la fidelidad con el juego, pero no bloquea el acceso al contenido.

**Prueba independiente**: recorrer el menú y las pantallas comprobando que la guía y los botones siguen visibles y cambian según la acción disponible.

**Escenarios de aceptación**:

1. **Dado** cualquier pantalla o el menú, **cuando** se muestra, **entonces** la guía y los botones Confirmar y Atrás están visibles abajo a la derecha, en el idioma activo.
2. **Dado** el menú, **cuando** cambia la opción activa, **entonces** la guía muestra la descripción de esa opción.
3. **Dado** el menú principal, **cuando** se muestra, **entonces** el botón Atrás no ofrece una acción inexistente (aparece deshabilitado u oculto de forma coherente).

---

### Historia de usuario 8 - Cambiar opciones y tiempos sin tocar componentes (Prioridad: P3)

Como Edward, quiero que las opciones del menú, sus textos y su orden vivan en datos tipados bilingües y que los tiempos y curvas salgan de los tokens, para cambiarlos sin tocar los componentes.

**Por qué esta prioridad**: protege el mantenimiento y la coherencia de movimiento en las fases siguientes.

**Prueba independiente**: reordenar o renombrar una opción solo en los datos y cambiar una duración solo en los tokens; comprobar que el sitio lo refleja sin modificar componentes.

**Escenarios de aceptación**:

1. **Dado** los datos del menú, **cuando** se cambia el orden o el nombre de una opción, **entonces** el menú lo refleja sin otros cambios.
2. **Dado** un campo de las opciones sin traducción a uno de los dos idiomas, **cuando** se valida el contenido, **entonces** el problema se detecta antes de publicar.
3. **Dado** un token de duración o curva, **cuando** se cambia en su único lugar de definición, **entonces** la transición lo refleja sin otros cambios.

---

### Casos límite

- El visitante recarga la página en mitad de una transición o del splash.
- El visitante pulsa muchas veces seguidas o mantiene pulsada una flecha.
- El visitante cambia de idioma mientras ocurre una transición.
- El visitante activa o desactiva el movimiento reducido con la página ya abierta.
- Un visitante entra directamente a una pantalla (por un enlace compartido): la ve sin splash, puede volver al menú con Esc o con el botón Atrás, y al volver al menú tampoco ve el splash en esa sesión.
- El destino de una navegación tarda en llegar (red lenta o ruta sin precargar): la pantalla permanece cubierta hasta que llegue, con un máximo de 1.5 s, y después se muestra sin entrada escalonada.
- El visitante usa el botón Atrás o Adelante del navegador.
- La pantalla es muy pequeña o cambia la orientación del móvil: el menú y los botones deben seguir visibles y sin desplazamiento horizontal.
- El dispositivo es lento o el navegador no soporta alguna capacidad de movimiento: debe haber una alternativa que conserve el contenido y la navegación.
- El visitante toca dos veces de forma rápida o mezcla teclado y toque.
- Un texto es mucho más largo en uno de los idiomas y no debe desbordar el menú.
- El visitante bloquea el almacenamiento del navegador: el splash puede repetirse y el movimiento reducido del sitio no se recuerda, pero nada se rompe.

## Requisitos *(obligatorio)*

### Requisitos funcionales

- **FR-001**: El sistema DEBE mostrar un splash solo a quien entra por la raíz del sitio (`/`, `/es` o `/en`) por primera vez en la sesión, y NO DEBE volver a mostrarlo en esa sesión (al recargar o al volver al inicio). Un enlace directo a una pantalla (por ejemplo `/es/projects`) abre la pantalla sin splash. Cualquier primera carga de documento de la sesión cuenta como visita: si la primera página cargada es una pantalla, el splash no se mostrará al volver al menú en esa sesión. El splash solo se muestra en una carga completa de la raíz, nunca en una navegación interna.
- **FR-002**: El splash DEBE poder omitirse con cualquier tecla, clic o toque, y DEBE cerrarse solo en un máximo de 1.5 s, pasando solo al menú.
- **FR-003**: El splash NO DEBE retrasar el acceso al contenido: el contenido esencial DEBE ser visible a los 5 s de cargar el menú.
- **FR-004**: El sistema DEBE mostrar un menú principal con cinco opciones en este orden: Quién soy, Stack, Proyectos, Social Link y System, con la opción activa resaltada, un título de fondo recortado y un marcador del personaje a la izquierda.
- **FR-005**: Los nombres de las cinco opciones DEBEN existir en español e inglés: Quién soy / About me, Stack / Stack, Proyectos / Projects, Social Link / Social Link y System / System.
- **FR-006**: El sistema DEBE permitir cambiar la opción activa con las flechas, ir a la primera con Home y a la última con End, y abrir la activa con Enter, clic o toque. Al volver al menú desde una pantalla, el menú resalta la opción de esa pantalla.
- **FR-007**: El sistema DEBE permitir volver al menú con Esc o con el botón Atrás, y pasar a la pantalla anterior o siguiente con las pestañas L/R.
- **FR-008**: En dispositivos táctiles, el sistema DEBE ofrecer toque sobre las opciones y los botones, y deslizamiento horizontal para pasar de pantalla, con el mismo resultado que el teclado. Las pestañas L/R DEBEN estar siempre visibles y ser pulsables como alternativa al deslizamiento. El deslizamiento solo cuenta si es claramente horizontal y NO DEBE interferir con el desplazamiento vertical.
- **FR-009**: Cada opción del menú DEBE abrir su pantalla en esta fase, mostrando el contenido que hoy tiene la página de verificación de la fase 1 repartido así: Quién soy con el perfil, Stack con el stack, Proyectos con el proyecto, Social Link con los personajes y System con el contacto y el aviso de no afiliación. La página de verificación de la fase 1 se reemplaza por el menú y sus pantallas, de modo que el visitante no pierde ningún contenido hoy visible; el diseño final de cada pantalla llega en las fases 3 a 6.
- **FR-010**: Cada pantalla DEBE tener su propia dirección bajo `/es` y `/en` (por ejemplo `/es/stack` y `/en/stack`), de modo que un enlace compartido abra la pantalla y el idioma indicados y el botón Atrás del navegador funcione. Las direcciones son `profile`, `stack`, `projects`, `social-link` y `system`, iguales en ambos idiomas.
- **FR-011**: El cambio entre menú y pantallas DEBE mostrar la secuencia de la referencia: salida con barrido diagonal, entrada escalonada de las fichas con el personaje, una pausa breve, cierre con círculo y aparición del destino.
- **FR-012**: La transición completa DEBE durar entre 500 y 800 ms. Si el destino aún no está listo, la pantalla DEBE permanecer cubierta hasta que llegue (máximo 1.5 s) y después mostrarlo sin entrada escalonada, igual que en una interrupción.
- **FR-013**: El sistema DEBE permitir interrumpir una transición con un clic, un toque o una tecla, mostrando el destino de inmediato y sin dejar un estado intermedio, también con interrupciones repetidas.
- **FR-014**: Con la preferencia de movimiento reducido del sistema o la del sitio, el sistema DEBE sustituir los barridos y desplazamientos por cambios de opacidad cortos o instantáneos, sin perder contenido ni acciones.
- **FR-015**: El sistema DEBE ofrecer, dentro del sitio, un interruptor siempre visible en el encabezado, junto al selector de idioma, para activar el movimiento reducido; DEBE tener nombre accesible traducido, anunciar su estado (activado o desactivado), ser operable con teclado y recordar la elección entre visitas.
- **FR-016**: El sistema DEBE mostrar siempre, abajo a la derecha, la guía contextual y los botones Confirmar y Atrás, en el idioma activo, reflejando la acción disponible.
- **FR-017**: Las opciones del menú (identificador, nombre, descripción para la guía, orden y destino) DEBEN estar en datos tipados bilingües, y los componentes NO DEBEN contener textos; los textos nuevos de interfaz DEBEN vivir en los textos de interfaz existentes.
- **FR-018**: El sistema DEBE detectar antes de publicar los campos de las opciones sin traducción a alguno de los dos idiomas.
- **FR-019**: Las duraciones por tramo y las curvas de la transición DEBEN definirse en un único lugar (tokens de diseño) y reutilizarse en todo el sitio.
- **FR-020**: El cambio de pantalla DEBE anunciarse a los lectores de pantalla, y el foco DEBE colocarse en un punto lógico de la pantalla destino, también cuando la transición se interrumpe.
- **FR-021**: El menú y las pantallas DEBEN ser operables con teclado, con foco visible, orden de tabulación lógico, contraste de texto AA y sin desplazamiento horizontal en 390, 768 y 1280 px de ancho.
- **FR-022**: Un visitante nuevo DEBE poder llegar a Quién soy, Stack y Proyectos en 3 interacciones o menos desde la primera pantalla.
- **FR-023**: El sistema NO DEBE cargar audio, video ni arte nuevo en esta fase; el personaje es un marcador de posición.
- **FR-024**: Las rutas `/es` y `/en`, la redirección desde `/`, el selector de idioma y la cookie `lang` DEBEN seguir funcionando sin cambios para el visitante.
- **FR-025**: Si una capacidad de movimiento no está disponible en el navegador, el sistema DEBE ofrecer una alternativa que conserve el contenido y la navegación.

### Entidades clave

- **Opción de menú**: una de las cinco entradas del menú; identificador, nombre y descripción bilingües, orden y pantalla de destino.
- **Pantalla**: destino de una opción (Quién soy, Stack, Proyectos, Social Link o System); en esta fase muestra el contenido definido en FR-009.
- **Transición**: secuencia de tramos (salida con barrido, entrada escalonada, pausa, cierre con círculo y aparición del destino) con duración total de 500 a 800 ms y variante reducida.
- **Estado del splash**: indica si ya se vio u omitió en la sesión actual.
- **Preferencia de movimiento**: movimiento completo o reducido, tomada del sistema o elegida en el sitio y recordada entre visitas.
- **Guía contextual**: texto y botones (Confirmar y Atrás) que reflejan la acción disponible en cada pantalla.
- **Marcador del personaje**: elemento provisional en el lugar donde irá el personaje (hilo conductor).

## Criterios de éxito *(obligatorio)*

### Resultados medibles

- **SC-001**: El 100 % de los visitantes puede omitir el splash con una tecla, un clic o un toque, y el splash no reaparece en la misma sesión.
- **SC-002**: Un visitante nuevo llega a Quién soy, Stack y Proyectos en 3 interacciones o menos desde la primera pantalla.
- **SC-003**: El contenido esencial es visible a los 5 s de cargar el menú, con el splash omitido o sin omitir.
- **SC-004**: El 100 % de las transiciones completas (no interrumpidas) con el destino precargado dura entre 500 y 800 ms.
- **SC-005**: Al interrumpir una transición, el destino aparece en menos de 100 ms, y en el 100 % de las pruebas con interrupciones repetidas el sitio termina en la pantalla elegida.
- **SC-006**: La transición se mantiene a 60 fotogramas por segundo en un móvil de gama media, sin tirones perceptibles.
- **SC-007**: Con movimiento reducido (del sistema o del sitio), hay 0 barridos y 0 desplazamientos en el 100 % de los cambios de pantalla.
- **SC-008**: Edward confirma que el 100 % de los tramos del video de referencia están presentes y en orden en la transición, y la revisión de movimiento no deja hallazgos abiertos.
- **SC-009**: El 100 % de las acciones del menú (cambiar opción, abrir, volver y pasar de pantalla) es posible solo con teclado y solo con toque.
- **SC-010**: Reordenar o renombrar una opción del menú y cambiar una duración requiere modificar 0 componentes.
- **SC-011**: No hay desplazamiento horizontal en 390, 768 y 1280 px, y todos los textos visibles cambian al alternar el idioma.
- **SC-012**: La carga inicial del menú pesa 350 KiB o menos, y la puntuación móvil es de al menos 90 en rendimiento y 100 en accesibilidad, medida antes y después de cerrar el splash.
- **SC-013**: Todas las verificaciones automáticas (estilo de código, compilación, pruebas unitarias y de extremo a extremo en 390, 768 y 1280 px) pasan antes de publicar.

## Supuestos

- Decisiones confirmadas por Edward el 2026-10-22: el splash dura como máximo 1.5 s, cada opción del menú muestra el contenido de la página de verificación de la fase 1 repartido por pantalla (que se reemplaza) y cada pantalla tiene su propia dirección bajo `/es` y `/en`.
- Los visitantes usan escritorio o móvil con un navegador moderno; no hay cuentas ni inicio de sesión.
- "Una vez por sesión" significa una vez por sesión de navegación (pestaña); al cerrar la pestaña, el splash puede volver a mostrarse.
- El marcador del personaje es una silueta o forma provisional; el arte real llega en las fases 3 y 5.
- El interruptor de movimiento reducido del encabezado se traslada a la pantalla System en la fase 6 sin cambiar su comportamiento.
- El reparto del tiempo de 500 a 800 ms entre los tramos se define a partir de la medición del video de referencia durante la planificación.
- El video de referencia y los cuadros de los tramos de 70.3 a 71.7 s los aporta Edward desde su carpeta de recursos, fuera del repositorio.
- La técnica de animación (CSS puro, View Transitions o una librería) se decide en `/speckit-plan`, tras comprobar la compatibilidad entre navegadores y justificar cualquier dependencia nueva.
- Se heredan las restricciones técnicas de `docs/sprints/fase-2-escena-y-menu.md` (sección 10) y de la constitución v1.0.0; la fase 1 (`specs/001-base-y-datos/`) es el punto de partida.
- Quedan fuera de alcance: el contenido y diseño final de las pantallas, arte nuevo, audio, contacto y ajustes completos de System, SEO avanzado, 404 localizado, `hreflang` absoluto, cursor personalizado, Timeline como sección y dominio propio.
