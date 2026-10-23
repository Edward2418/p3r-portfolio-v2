import type { Lang } from "../content/types.ts";
import { t } from "../lib/i18n/t.ts";

interface ProvisionalBadgeProps {
  lang: Lang;
  /** Si no es `true`, no se muestra nada (FR-012). */
  provisional?: boolean;
  /** Versión pequeña para espacios reducidos (por ejemplo, dentro de los círculos del stack). */
  compact?: boolean;
}

export function ProvisionalBadge({ lang, provisional, compact = false }: ProvisionalBadgeProps) {
  if (provisional !== true) return null;
  const size = compact ? "px-1 text-[0.65rem] leading-4" : "px-1.5 py-0.5 text-xs";
  return (
    <span className={`inline-block rounded-sm border border-cyan align-middle font-semibold uppercase tracking-wide text-cyan ${size}`}>
      {t("provisional", lang)}
    </span>
  );
}
