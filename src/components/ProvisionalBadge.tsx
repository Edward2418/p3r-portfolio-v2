import type { Lang } from "../content/types.ts";
import { t } from "../lib/i18n/t.ts";

interface ProvisionalBadgeProps {
  lang: Lang;
  /** Si no es `true`, no se muestra nada (FR-012). */
  provisional?: boolean;
}

export function ProvisionalBadge({ lang, provisional }: ProvisionalBadgeProps) {
  if (provisional !== true) return null;
  return (
    <span className="inline-block rounded-sm border border-cyan px-1.5 py-0.5 align-middle text-xs font-semibold uppercase tracking-wide text-cyan">
      {t("provisional", lang)}
    </span>
  );
}
