import { profile } from "../../content/profile.ts";
import type { Lang } from "../../content/types.ts";
import { localize } from "../../lib/i18n/localize.ts";
import { ProvisionalBadge } from "../ProvisionalBadge.tsx";

export function ProfileSection({ lang }: { lang: Lang }) {
  return (
    <section aria-labelledby="profile-title" id="profile" className="space-y-3">
      <h2 id="profile-title" className="font-display text-4xl uppercase leading-none sm:text-5xl">
        {profile.name}
      </h2>
      <p className="text-lg">
        {localize(profile.headline, lang)} <ProvisionalBadge lang={lang} provisional={profile.provisional} />
      </p>
      <p className="max-w-prose">{localize(profile.summary, lang)}</p>
    </section>
  );
}
