import { profile } from "../content/profile.ts";
import type { Lang } from "../content/types.ts";
import { t } from "../lib/i18n/t.ts";
import { SplashController } from "./SplashController.tsx";

// Splash: capa a pantalla completa que se pinta en el servidor sobre el menú, así que el HTML del
// menú ya está en el documento debajo. Se cierra sola con una animación CSS (sin necesitar
// JavaScript) y antes con cualquier tecla, clic o toque. Es decorativa: no atrapa el foco.
export function Splash({ lang }: { lang: Lang }) {
  return (
    <>
      <div
        data-splash-layer
        aria-hidden="true"
        className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-bg px-4 text-center"
      >
        <p className="text-sm uppercase tracking-widest text-cyan">{t("splashTitle", lang)}</p>
        <p className="font-display text-6xl uppercase sm:text-8xl">{profile.name}</p>
      </div>
      <SplashController />
    </>
  );
}
