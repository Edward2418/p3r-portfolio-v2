import type { Lang } from "../../content/types.ts";
import { t } from "../../lib/i18n/t.ts";

// Fondo de la escena: degradado de cian a azul profundo, panel blanco inclinado y título vertical.
// Es decorativo (`aria-hidden`), estático y no recibe punteros; su tamaño y posición dependen de la
// vista (`data-view` de SceneShell) y se definen en globals.css (contracts/scene-layout.md).
export function SceneBackdrop({ lang }: { lang: Lang }) {
  return (
    <div data-backdrop aria-hidden="true">
      <div data-panel />
      <p data-panel-title>{t("panelTitle", lang)}</p>
    </div>
  );
}
