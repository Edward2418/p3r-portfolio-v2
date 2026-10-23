import type { MenuOption } from "./types.ts";

// Opciones del menú principal. El orden del arreglo es el orden del menú, de las pestañas L y R
// y de la navegación por teclado: reordenar o renombrar una opción se hace solo aquí.
export const menu: MenuOption[] = [
  {
    id: "profile",
    name: { es: "Quién soy", en: "About me" },
    description: {
      es: "Presentación, formación y trayectoria.",
      en: "Introduction, education and background.",
    },
  },
  {
    id: "stack",
    name: { es: "Stack", en: "Stack" },
    description: {
      es: "Tecnologías agrupadas por categoría y nivel.",
      en: "Technologies grouped by category and level.",
    },
  },
  {
    id: "projects",
    name: { es: "Proyectos", en: "Projects" },
    description: {
      es: "Fichas de proyectos con tecnologías y enlaces.",
      en: "Project cards with technologies and links.",
    },
  },
  {
    id: "social-link",
    name: { es: "Social Link", en: "Social Link" },
    description: {
      es: "Personajes e intereses.",
      en: "Characters and interests.",
    },
  },
  {
    id: "system",
    name: { es: "System", en: "System" },
    description: {
      es: "Contacto y avisos.",
      en: "Contact and notices.",
    },
  },
];
