import { trajectory } from "../../content/trajectory.ts";
import type { Lang, TrajectoryKind } from "../../content/types.ts";
import { localize } from "../../lib/i18n/localize.ts";
import { t } from "../../lib/i18n/t.ts";
import { hasTrajectory } from "../../lib/profile/trajectory.ts";
import { ProvisionalBadge } from "../ProvisionalBadge.tsx";

// Trayectoria de "Quién soy" (specs/004-quien-soy-y-stack/contracts/profile-screen.md): una lista ordenada
// con un hito por elemento. El hito actual y la meta futura llevan una etiqueta de texto visible y un borde
// distinto (la meta, punteado): el estado nunca depende solo del estilo. Componente de servidor sin estado.
const BORDER: Record<TrajectoryKind, string> = {
  formation: "border-solid border-cyan/60",
  progress: "border-solid border-cyan/60",
  current: "border-solid border-red",
  goal: "border-dashed border-cyan",
};

export function Trajectory({ lang }: { lang: Lang }) {
  if (!hasTrajectory(trajectory)) return null;

  return (
    <section aria-labelledby="trajectory-title" className="space-y-4">
      <h2 id="trajectory-title" className="font-display text-3xl uppercase">
        {t("sectionTrajectory", lang)}
      </h2>
      <ol className="space-y-5">
        {trajectory.map((entry) => (
          <li key={entry.id} data-kind={entry.kind} className={`border-l-4 pl-4 ${BORDER[entry.kind]}`}>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-display text-xl uppercase text-cyan">{localize(entry.period, lang)}</span>
              {entry.kind === "current" ? (
                <span className="bg-red-fill px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-text">
                  {t("trajectoryCurrent", lang)}
                </span>
              ) : null}
              {entry.kind === "goal" ? (
                <span className="border border-cyan px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-cyan">
                  {t("trajectoryGoal", lang)}
                </span>
              ) : null}
              <ProvisionalBadge lang={lang} provisional={entry.provisional} />
            </p>
            <p className="font-semibold">{localize(entry.title, lang)}</p>
            {entry.description ? <p className="max-w-prose opacity-90">{localize(entry.description, lang)}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
