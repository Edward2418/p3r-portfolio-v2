"use client";

// Menú principal: lista de enlaces reales (Enter, clic y toque funcionan sin JavaScript).
// Cada opción es una ficha inclinada (token `--angle-skew`): las inactivas en azul marino con texto
// cian, la activa en blanco con borde rojo. La activa recibe el foco al moverse con el teclado.
import { useEffect, useRef } from "react";
import Link from "next/link";
import type { MouseEvent } from "react";
import type { Lang, SceneId } from "../../content/types.ts";
import { nextIndex, shouldIgnoreKey } from "../../lib/motion/navigation.ts";
import { useSound } from "../audio/SoundProvider.tsx";
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

const chipClass =
  "block min-h-11 px-5 py-3 font-display text-3xl uppercase tracking-wide sm:text-4xl";
const activeClass = `${chipClass} border-[3px] border-red bg-panel text-on-panel`;
const inactiveClass = `${chipClass} border-[3px] border-transparent border-l-cyan bg-navy text-cyan`;

export function MainMenu({ lang, label, options }: MainMenuProps) {
  const { activeMenuId, setActiveMenuId, navigate } = useScene();
  const { play } = useSound();
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
        if (index !== activeIndex) play("move");
        setActiveMenuId(options[index].id);
        links.current[index]?.focus();
        return;
      }

      if (event.key === "Enter" && !event.repeat) {
        const focused = document.activeElement as HTMLElement | null;
        if (focused && focused !== document.body && focused.closest("a, button, input, select, textarea, summary")) return;
        event.preventDefault();
        play("confirm");
        navigate(`/${lang}/${options[activeIndex].id}`);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeIndex, lang, navigate, options, play, setActiveMenuId]);

  function onLinkClick(event: MouseEvent<HTMLAnchorElement>, href: string) {
    // Los clics con modificadores conservan el comportamiento nativo (abrir en otra pestaña).
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    play("confirm");
    navigate(href);
  }

  return (
    <nav aria-label={label} className="relative">
      <ul className="flex flex-col gap-2">
        {options.map((option, index) => {
          const isActive = index === activeIndex;
          const href = `/${lang}/${option.id}`;
          return (
            <li key={option.id} data-stagger className={isActive ? "" : "pl-6"}>
              <Link
                href={href}
                data-menu-item
                ref={(element) => {
                  links.current[index] = element;
                }}
                aria-current={isActive ? "true" : undefined}
                onClick={(event) => onLinkClick(event, href)}
                onPointerEnter={(event) => {
                  // El cursor suena solo con el ratón: con el tacto, tocar ya es confirmar.
                  if (event.pointerType === "mouse" && option.id !== activeMenuId) play("move");
                  setActiveMenuId(option.id);
                }}
                onFocus={() => setActiveMenuId(option.id)}
                className={isActive ? activeClass : inactiveClass}
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
