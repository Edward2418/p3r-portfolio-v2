import { profile } from "../../content/profile.ts";
import type { Lang } from "../../content/types.ts";
import { localize } from "../../lib/i18n/localize.ts";
import { t } from "../../lib/i18n/t.ts";
import { ProvisionalBadge } from "../ProvisionalBadge.tsx";

export function ProfileSection({ lang }: { lang: Lang }) {
  return (
    <section aria-labelledby="profile-title" id="profile" className="space-y-3">
      <p className="text-sm uppercase tracking-widest text-cyan">{t("sectionProfile", lang)}</p>
      <h1 id="profile-title" className="font-display text-5xl uppercase leading-none sm:text-6xl">
        {profile.name}
      </h1>
      <p className="text-lg">
        {localize(profile.headline, lang)} <ProvisionalBadge lang={lang} provisional={profile.provisional} />
      </p>
      <p className="max-w-prose">{localize(profile.summary, lang)}</p>
    </section>
  );
}
