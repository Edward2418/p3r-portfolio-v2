import type { Lang } from "../content/types.ts";
import { t } from "../lib/i18n/t.ts";

// Aviso de no afiliación a las franquicias que inspiran el sitio (Principio V, FR-019).
export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="border-t border-cyan/30 pb-32 pt-6 text-sm">
      <p className="mx-auto max-w-3xl px-4">{t("nonAffiliation", lang)}</p>
    </footer>
  );
}
