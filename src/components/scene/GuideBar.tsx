"use client";

// Guía contextual y botones, siempre visibles abajo a la derecha: pestañas L y R (en las pantallas),
// Atrás y Confirmar. Atrás está deshabilitado en el menú, Confirmar en las pantallas, y L o R en los
// extremos del orden del menú. El texto de la guía es la descripción de la opción activa en el menú.
import { neighbors } from "../../lib/motion/navigation.ts";
import { useSound } from "../audio/SoundProvider.tsx";
import { useScene } from "./SceneShell.tsx";

const buttonClass =
  "inline-flex min-h-11 min-w-11 items-center justify-center border border-cyan bg-navy px-3 font-display text-lg uppercase text-cyan transition-transform duration-(--duration-fast) ease-(--ease-out) active:scale-[0.97] hover:bg-cyan hover:text-bg disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-cyan";

export function GuideBar() {
  const { lang, scenes, labels, sceneId, activeMenuId, navigate, go } = useScene();
  const { play } = useSound();
  const inMenu = sceneId === null;
  const { prev, next } = sceneId ? neighbors(scenes, sceneId) : { prev: null, next: null };
  const hint = inMenu
    ? scenes.find((scene) => scene.id === activeMenuId)?.description
    : labels.guideScreenHint;

  return (
    <aside
      data-guide
      aria-label={labels.guideLabel}
      className="fixed bottom-4 right-4 z-30 flex max-w-[calc(100vw-2rem)] flex-col items-end gap-2"
    >
      <p className="border border-cyan/40 bg-bg px-3 py-2 text-sm">{hint}</p>
      <div className="flex flex-wrap justify-end gap-2">
        {inMenu ? null : (
          <>
            <button type="button" aria-label={`${labels.tabPreviousShort} — ${labels.tabPrevious}`} disabled={!prev} onClick={() => go("prev")} className={buttonClass}>
              {labels.tabPreviousShort}
            </button>
            <button type="button" aria-label={`${labels.tabNextShort} — ${labels.tabNext}`} disabled={!next} onClick={() => go("next")} className={buttonClass}>
              {labels.tabNextShort}
            </button>
          </>
        )}
        <button type="button" disabled={inMenu} onClick={() => go("menu")} className={buttonClass}>
          {labels.back}
        </button>
        <button
          type="button"
          disabled={!inMenu}
          onClick={() => {
            play("confirm");
            navigate(`/${lang}/${activeMenuId}`);
          }}
          className={buttonClass}
        >
          {labels.confirm}
        </button>
      </div>
    </aside>
  );
}
