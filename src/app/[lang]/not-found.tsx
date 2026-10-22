import { lang as getLang } from "next/root-params";
import { isLang } from "../../lib/i18n/config.ts";
import { DEFAULT_LANG } from "../../lib/i18n/config.ts";
import { t } from "../../lib/i18n/t.ts";

export default async function NotFound() {
  const current = await getLang();
  const lang = isLang(current) ? current : DEFAULT_LANG;

  return (
    <main id="content" className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-10">
      <h1 className="font-display text-5xl uppercase">{t("notFoundTitle", lang)}</h1>
      <a className="text-cyan underline underline-offset-4" href={`/${lang}`}>
        {t("notFoundBack", lang)}
      </a>
    </main>
  );
}
