import type { Lang } from "../../content/types.ts";
import { t } from "../../lib/i18n/t.ts";

// Marcador provisional del personaje (hilo conductor): una silueta en SVG, sin imágenes (FR-023).
// El arte real llega en las fases 3 y 5. `data-character` lo usa la animación de entrada.
export function CharacterSlot({ lang }: { lang: Lang }) {
  return (
    <div
      data-character
      aria-hidden="true"
      title={t("characterLabel", lang)}
      className="pointer-events-none mx-auto w-40 text-cyan sm:w-56 md:w-72"
    >
      <svg viewBox="0 0 200 260" role="presentation" className="h-auto w-full" fill="currentColor">
        <ellipse cx="100" cy="70" rx="48" ry="56" />
        <path d="M20 260c0-62 36-96 80-96s80 34 80 96z" />
      </svg>
    </div>
  );
}
