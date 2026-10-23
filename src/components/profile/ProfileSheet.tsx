import { profile } from "../../content/profile.ts";
import type { Lang } from "../../content/types.ts";
import { localize } from "../../lib/i18n/localize.ts";
import { t } from "../../lib/i18n/t.ts";
import { ProvisionalBadge } from "../ProvisionalBadge.tsx";

// Ficha del personaje de "Quién soy" (specs/004-quien-soy-y-stack/contracts/profile-screen.md): nombre,
// titular, especialidad, una lista de definición con institución y semestre, y la presentación. Es un
// componente de servidor sin estado: la estructura (sección, encabezado y lista de definición) es la que
// leen los lectores de pantalla. Todo el texto sale de los datos y de `ui-text.ts`.
export function ProfileSheet({ lang }: { lang: Lang }) {
  const facts = [
    { term: t("profileInstitution", lang), value: localize(profile.institution, lang) },
    { term: t("profileSemester", lang), value: localize(profile.semester, lang) },
  ];

  return (
    <section aria-labelledby="profile-sheet-title" className="space-y-4">
      <h2 id="profile-sheet-title" className="font-display text-4xl uppercase leading-none sm:text-5xl">
        {profile.name}
      </h2>
      <p data-headline className="text-lg">
        {localize(profile.headline, lang)} <ProvisionalBadge lang={lang} provisional={profile.provisional} />
      </p>
      <p className="font-semibold text-cyan">{localize(profile.specialty, lang)}</p>
      <dl className="grid gap-3 border-y border-cyan/40 py-3 sm:grid-cols-2">
        {facts.map((fact) => (
          <div key={fact.term}>
            <dt className="text-sm uppercase tracking-wide text-cyan">{fact.term}</dt>
            <dd className="font-semibold">{fact.value}</dd>
          </div>
        ))}
      </dl>
      <p className="max-w-prose">{localize(profile.summary, lang)}</p>
    </section>
  );
}
