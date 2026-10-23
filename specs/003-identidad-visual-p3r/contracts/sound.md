# Contrato: sonido

**Especificación**: [../spec.md](../spec.md) | **Modelo de datos**: [../data-model.md](../data-model.md) | **Investigación**: [../research.md](../research.md) (D4)

## Preferencia

- `localStorage`, clave `sound`: `on` u `off`. Por defecto y ante cualquier error: `off`.
- Solo la cambia el visitante con el interruptor de System; no se activa por otras vías.

## Carga bajo demanda

| Situación | Qué se pide |
|---|---|
| Primera visita, sonido `off` | Nada. Ningún archivo de `/audio/` |
| El visitante activa el sonido | Los seis MP3 (≈ 76 KiB), en ese momento |
| Visita posterior con `on` guardado | Nada hasta la primera interacción (tecla, clic o toque); luego los seis MP3 |
| El visitante lo desactiva | No se piden más; los ya cargados no suenan |

## Mapa de acción a sonido (`src/lib/audio/events.ts`)

| Acción | Sonido |
|---|---|
| Mover la opción activa del menú (teclado o puntero) | `cursor` |
| Cambiar de pantalla con L/R, flechas, RePág o AvPág | `cursor` |
| Enter, clic o Confirmar sobre una opción | `confirm` (al instante) |
| Entrada de la pantalla abierta desde el menú | `open` (al empezar la entrada) |
| Esc, Atrás o botón Atrás | `cancel` (al instante) |
| Entrada del menú al volver | `close` (al empezar la entrada) |
| Activar el sonido | `levelup` (una sola vez, por la propia activación) |

Reglas:

- Con movimiento reducido el sonido sigue el mismo mapa (son independientes); `open` y `close` suenan al cambiar de pantalla aunque no haya barrido.
- Una interrupción de la transición no repite ni corta los sonidos ya emitidos.
- Los sonidos solapados no se cortan entre sí (se reinicia `currentTime` del nodo o se clona).
- `play()` puede ser rechazado por la política del navegador: se ignora sin mensajes; la primera interacción lo desbloquea.
- Las repeticiones de una tecla mantenida no encadenan `cursor` más de una vez cada 80 ms.

## Interruptor (`SoundToggle`, en System)

- Botón con `aria-pressed`, nombre accesible traducido y texto de estado visible.
- Operable con teclado (Enter y Espacio) y con toque; mínimo de 44 px de alto.
- Anuncia el cambio de estado; no depende del movimiento.
- Al activarlo reproduce `levelup` una vez.
