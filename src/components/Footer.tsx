import type { Lang } from "../content/types.ts";
import { t } from "../lib/i18n/t.ts";

// Aviso de no afiliación a las franquicias que inspiran el sitio (Principio V, FR-019). Lleva una
// ficha de azul marino propia: el texto no se puede garantizar legible directamente sobre el degradado.
export function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="relative z-10 mt-auto px-4 pb-32 pt-6 text-sm">
      <p className="mx-auto max-w-3xl bg-navy px-4 py-3">{t("nonAffiliation", lang)}</p>
    </footer>
  );
}
