import type { Lang } from "../content/types.ts";
import { t } from "../lib/i18n/t.ts";

// Aviso de no afiliación a las franquicias que inspiran el sitio (Principio V, FR-019).
export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="border-t border-cyan/30 px-4 py-6 text-sm">
      <p className="mx-auto max-w-3xl">{t("nonAffiliation", lang)}</p>
    </footer>
  );
}
