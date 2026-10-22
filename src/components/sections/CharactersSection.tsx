import { characters } from "../../content/characters.ts";
import type { Lang } from "../../content/types.ts";
import { localize } from "../../lib/i18n/localize.ts";
import { t } from "../../lib/i18n/t.ts";
import { ProvisionalBadge } from "../ProvisionalBadge.tsx";

export function CharactersSection({ lang }: { lang: Lang }) {
  return (
    <section aria-labelledby="characters-title" id="characters" className="space-y-4">
      <h2 id="characters-title" className="font-display text-3xl uppercase">
        {t("sectionCharacters", lang)}
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {characters.map((character) => (
          <li key={character.id} className="space-y-1 border border-cyan/40 p-3">
            <h3 className="text-lg font-semibold">{character.name}</h3>
            <p className="text-sm">
              {t("arcana", lang)}: {localize(character.arcana, lang)} · {t("rank", lang)}: {character.rank}/10
            </p>
            <p>{localize(character.shortText, lang)}</p>
            <ProvisionalBadge lang={lang} provisional={character.provisional} />
          </li>
        ))}
      </ul>
    </section>
  );
}
