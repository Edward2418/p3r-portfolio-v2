// Qué se muestra de la trayectoria (specs/004-quien-soy-y-stack/data-model.md). Función pura, sin DOM ni JSX.
import type { TrajectoryEntry } from "../../content/types.ts";

/** Sin hitos, la sección de trayectoria no se muestra (ni queda un encabezado vacío). */
export function hasTrajectory(entries: TrajectoryEntry[]): boolean {
  return entries.length > 0;
}
