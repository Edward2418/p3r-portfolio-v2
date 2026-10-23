"use client";

// Menú principal: lista de enlaces reales (Enter, clic y toque funcionan sin JavaScript).
// La opción activa va resaltada en rojo y blanco; el título de fondo es decorativo.
import { useState } from "react";
import Link from "next/link";
import type { Lang, SceneId } from "../../content/types.ts";

export interface MenuItem {
  id: SceneId;
  name: string;
  description: string;
}

interface MainMenuProps {
  lang: Lang;
  /** Nombre accesible del menú, ya traducido. */
  label: string;
  options: MenuItem[];
  /** Pantalla de la que se vuelve (se resalta); en una carga directa es la primera. */
  initialActiveId?: SceneId;
}

export function MainMenu({ lang, label, options, initialActiveId }: MainMenuProps) {
  const initialIndex = Math.max(0, options.findIndex((option) => option.id === initialActiveId));
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  return (
    <nav aria-label={label} className="relative">
      <p
        aria-hidden="true"
        data-title={options[activeIndex]?.name}
        className="pointer-events-none absolute -top-6 left-0 -z-10 w-full overflow-hidden whitespace-nowrap font-display text-[22vw] uppercase leading-none text-cyan before:opacity-10 before:content-[attr(data-title)] md:text-[9rem]"
      />
      <ul className="flex flex-col gap-2">
        {options.map((option, index) => {
          const isActive = index === activeIndex;
          return (
            <li key={option.id} data-stagger className={isActive ? "-skew-x-6" : "-skew-x-6 pl-6"}>
              <Link
                href={`/${lang}/${option.id}`}
                aria-current={isActive ? "true" : undefined}
                onPointerEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                className={
                  isActive
                    ? "block bg-red-fill px-5 py-3 font-display text-3xl uppercase tracking-wide text-text sm:text-4xl"
                    : "block border-l-4 border-cyan px-5 py-3 font-display text-3xl uppercase tracking-wide text-text sm:text-4xl"
                }
              >
                {option.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
