"use client";

// Menú principal: lista de enlaces reales (Enter, clic y toque funcionan sin JavaScript).
// La opción activa va resaltada en rojo y blanco y recibe el foco al moverse con el teclado;
// el título de fondo es decorativo.
import { useEffect, useRef } from "react";
import Link from "next/link";
import type { MouseEvent } from "react";
import type { Lang, SceneId } from "../../content/types.ts";
import { nextIndex, shouldIgnoreKey } from "../../lib/motion/navigation.ts";
import { useScene } from "../scene/SceneShell.tsx";

export interface MenuItem {
  id: SceneId;
  name: string;
}

interface MainMenuProps {
  lang: Lang;
  /** Nombre accesible del menú, ya traducido. */
  label: string;
  options: MenuItem[];
}

const MENU_KEYS = ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"];

export function MainMenu({ lang, label, options }: MainMenuProps) {
  const { activeMenuId, setActiveMenuId, navigate } = useScene();
  const activeIndex = Math.max(0, options.findIndex((option) => option.id === activeMenuId));
  const links = useRef<(HTMLAnchorElement | null)[]>([]);

  // Teclado: flechas, Inicio y Fin mueven la opción activa; Enter abre la activa si el foco no está
  // ya en un control (en un enlace, Enter funciona de forma nativa).
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      if (
        shouldIgnoreKey({
          ctrlKey: event.ctrlKey,
          altKey: event.altKey,
          metaKey: event.metaKey,
          targetTag: target?.tagName,
          isContentEditable: target?.isContentEditable,
        })
      ) {
        return;
      }

      if (MENU_KEYS.includes(event.key)) {
        event.preventDefault();
        const index = nextIndex(activeIndex, event.key, options.length);
        setActiveMenuId(options[index].id);
        links.current[index]?.focus();
        return;
      }

      if (event.key === "Enter" && !event.repeat) {
        const focused = document.activeElement as HTMLElement | null;
        if (focused && focused !== document.body && focused.closest("a, button, input, select, textarea, summary")) return;
        event.preventDefault();
        navigate(`/${lang}/${options[activeIndex].id}`);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, lang, navigate, options, setActiveMenuId]);

  function onLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    // Los clics con modificadores conservan el comportamiento nativo (abrir en otra pestaña).
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(href);
  }

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
          const href = `/${lang}/${option.id}`;
          return (
            <li key={option.id} data-stagger className={isActive ? "-skew-x-6" : "-skew-x-6 pl-6"}>
              <Link
                href={href}
                ref={(element) => {
                  links.current[index] = element;
                }}
                aria-current={isActive ? "true" : undefined}
                onClick={(event) => onLinkClick(event, href)}
                onPointerEnter={() => setActiveMenuId(option.id)}
                onFocus={() => setActiveMenuId(option.id)}
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
