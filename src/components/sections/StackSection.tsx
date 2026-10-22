import { stack } from "../../content/stack.ts";
import type { Lang } from "../../content/types.ts";
import { localize } from "../../lib/i18n/localize.ts";
import { t } from "../../lib/i18n/t.ts";
import { ProvisionalBadge } from "../ProvisionalBadge.tsx";

export function StackSection({ lang }: { lang: Lang }) {
  return (
    <section aria-labelledby="stack-title" id="stack" className="space-y-4">
      <h2 id="stack-title" className="font-display text-3xl uppercase">
        {t("sectionStack", lang)}
      </h2>
      <div className="grid gap-6 sm:grid-cols-3">
        {stack.map((category) => (
          <div key={category.id} className="space-y-2">
            <h3 className="text-lg font-semibold text-cyan">{localize(category.name, lang)}</h3>
            <ul className="space-y-1">
              {category.technologies.map((tech) => (
                <li key={tech.id} className="flex flex-wrap items-center gap-x-2">
                  <span>{tech.name}</span>
                  <span className="text-sm opacity-80">
                    {t("level", lang)}: {tech.level}/5
                  </span>
                  <ProvisionalBadge lang={lang} provisional={tech.provisional} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
