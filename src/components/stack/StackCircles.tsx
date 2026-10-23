import { stack, stackCenterLabel } from "../../content/stack.ts";
import type { Lang } from "../../content/types.ts";
import { localize } from "../../lib/i18n/localize.ts";
import { t } from "../../lib/i18n/t.ts";
import { provisionalScope, showCenterLabel, visibleCategories } from "../../lib/stack/layout.ts";
import { ProvisionalBadge } from "../ProvisionalBadge.tsx";

// Stack en tres círculos solapados (specs/004-quien-soy-y-stack/contracts/stack-circles.md). Es un solo
// DOM: cada categoría es una sección con su encabezado y su lista, y el CSS le da forma circular; los
// lectores de pantalla leen "Full-Stack, Frontend: …" sin una copia aparte. Cada tecnología ocupa una
// línea: el nombre y, a la derecha, "n/5" con cinco puntos decorativos; el texto "Nivel: " solo se lee
// con lector de pantalla y una leyenda visible aclara la escala. La marca "Provisional" va una vez en el
// encabezado de la categoría si todas sus tecnologías son provisionales (poco espacio en los círculos).
// Componente de servidor sin estado.
const LEVELS = [1, 2, 3, 4, 5] as const;

export function StackCircles({ lang }: { lang: Lang }) {
  const categories = visibleCategories(stack);
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="stack-title" className="space-y-3">
      <h2 id="stack-title" className="font-display text-3xl uppercase">
        {t("sectionStack", lang)}
      </h2>
      <p data-stack-legend className="stack-legend">
        {t("stackLevelLegend", lang)}
      </p>
      <div data-stack-venn className="stack-venn">
        {showCenterLabel(stack) ? (
          <p data-stack-center className="stack-center">
            {localize(stackCenterLabel, lang)}
          </p>
        ) : null}
        {categories.map((category) => {
          const scope = provisionalScope(category);
          return (
            <section key={category.id} data-circle={category.id} aria-labelledby={`stack-${category.id}`} className="stack-circle">
              <h3 id={`stack-${category.id}`} className="stack-circle-title">
                {localize(category.name, lang)}{" "}
                <ProvisionalBadge lang={lang} provisional={scope === "category"} compact />
              </h3>
              <ul className="stack-list">
                {category.technologies.map((tech) => (
                  <li key={tech.id} className="stack-tech">
                    <span className="inline-flex items-center gap-1">
                      <span data-tech-name className="font-semibold">
                        {tech.name}
                      </span>
                      <ProvisionalBadge lang={lang} provisional={scope === "technologies" && tech.provisional === true} compact />
                    </span>
                    <span className="stack-tech-meta">
                      <span className="sr-only">{t("level", lang)}: </span>
                      <span>{tech.level}/5</span>
                      <span data-pips aria-hidden="true" className="stack-pips">
                        {LEVELS.map((level) => (
                          <span key={level} data-pip data-filled={level <= tech.level ? "true" : "false"} className="stack-pip" />
                        ))}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </section>
  );
}
