import { Children } from "react";
import type { ReactNode } from "react";
import type { Lang, SceneId } from "../../content/types.ts";
import { screenName } from "../../lib/scene/titles.ts";

interface ScreenFrameProps {
  lang: Lang;
  sceneId: SceneId;
  children: ReactNode;
}

// Marco de una pantalla: un único <h1> con el nombre de la opción y cada bloque marcado con
// `data-stagger` para la entrada escalonada. El diseño final de cada pantalla llega en las fases 3 a 6.
export function ScreenFrame({ lang, sceneId, children }: ScreenFrameProps) {
  return (
    <main
      id="content"
      data-scene={sceneId}
      className="mx-auto w-full max-w-3xl flex-1 space-y-10 px-4 pb-32 pt-10"
    >
      <h1 tabIndex={-1} data-stagger className="font-display text-5xl uppercase outline-none sm:text-6xl">
        {screenName(sceneId, lang)}
      </h1>
      {Children.toArray(children).map((block, index) => (
        <div key={index} data-stagger>
          {block}
        </div>
      ))}
    </main>
  );
}
