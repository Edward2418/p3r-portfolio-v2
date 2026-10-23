import { Children } from "react";
import type { ReactNode } from "react";
import type { Lang, SceneId } from "../../content/types.ts";
import { screenName } from "../../lib/scene/titles.ts";

interface ScreenFrameProps {
  lang: Lang;
  sceneId: SceneId;
  children: ReactNode;
}

// Marco de una pantalla: un panel azul marino con un único <h1> (nombre de la opción, con barra roja) y
// cada bloque marcado con `data-stagger` para la entrada escalonada. Desde 1024 px el panel se queda a
// la izquierda y deja el lado derecho a Oguri (globals.css). El contenido real de cada pantalla llega en
// las fases 4 a 7.
export function ScreenFrame({ lang, sceneId, children }: ScreenFrameProps) {
  return (
    <main
      id="content"
      data-scene={sceneId}
      className="relative z-10 mx-auto my-6 w-full max-w-3xl space-y-10 bg-navy px-6 pb-10 pt-8"
    >
      <h1 tabIndex={-1} data-stagger className="border-l-[10px] border-red pl-4 font-display text-5xl uppercase outline-none sm:text-6xl">
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
