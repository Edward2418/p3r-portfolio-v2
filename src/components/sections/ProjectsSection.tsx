import { projects } from "../../content/projects.ts";
import { stack } from "../../content/stack.ts";
import type { Lang, ProjectStatus } from "../../content/types.ts";
import type { UiTextKey } from "../../content/ui-text.ts";
import { localize } from "../../lib/i18n/localize.ts";
import { t } from "../../lib/i18n/t.ts";
import { ProvisionalBadge } from "../ProvisionalBadge.tsx";

// Nombre de cada tecnología por id, para resolver las referencias de los proyectos.
const technologyNames = new Map(
  stack.flatMap((category) => category.technologies.map((tech) => [tech.id, tech.name] as const)),
);

const statusKeys: Record<ProjectStatus, UiTextKey> = {
  planning: "statusPlanning",
  "in-progress": "statusInProgress",
  completed: "statusCompleted",
};

export function ProjectsSection({ lang }: { lang: Lang }) {
  return (
    <section aria-labelledby="projects-title" id="projects" className="space-y-4">
      <h2 id="projects-title" className="font-display text-3xl uppercase">
        {t("sectionProjects", lang)}
      </h2>
      {projects.map((project) => {
        const links = [
          { key: "linkRepository" as const, href: project.links?.repository },
          { key: "linkDemo" as const, href: project.links?.demo },
        ].filter((link) => link.href);
        const names = project.technologies
          .map((id) => technologyNames.get(id))
          .filter((name): name is string => name !== undefined);

        return (
          <article key={project.id} className="space-y-2 border-l-2 border-cyan pl-4">
            <h3 className="text-xl font-semibold">{localize(project.title, lang)}</h3>
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <span>{t(statusKeys[project.status], lang)}</span>
              <ProvisionalBadge lang={lang} provisional={project.provisional} />
            </p>
            <p>{localize(project.summary, lang)}</p>
            <p className="max-w-prose opacity-90">{localize(project.description, lang)}</p>
            <p className="text-sm">
              <span className="text-cyan">{t("technologies", lang)}:</span> {names.join(", ")}
            </p>
            {links.length > 0 ? (
              <ul className="flex flex-wrap gap-4">
                {links.map((link) => (
                  <li key={link.key}>
                    <a className="text-cyan underline underline-offset-4" href={link.href}>
                      {t(link.key, lang)}
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
