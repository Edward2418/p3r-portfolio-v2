import type { Project } from "./types.ts";

// Para agregar un proyecto basta con añadir un objeto a esta lista.
// El texto de este proyecto es un borrador: Edward lo confirma antes de quitar `provisional`.
export const projects: Project[] = [
  {
    id: "p3r-portfolio-v2",
    title: {
      es: "Portafolio P3R v2",
      en: "P3R Portfolio v2",
    },
    summary: {
      es: "Portafolio personal con la estética del menú de Persona 3 Reload, rehecho con desarrollo guiado por especificación.",
      en: "Personal portfolio styled after the Persona 3 Reload menu, rebuilt with spec-driven development.",
    },
    description: {
      es: "La primera versión se construyó con una IA y sin metodología previa, lo que causó mucho retrabajo visual. La versión 2 parte de una especificación, se construye por fases y toma el movimiento del menú del juego como referencia.",
      en: "The first version was built with an AI and no prior methodology, which caused a lot of visual rework. Version 2 starts from a specification, is built in phases and uses the game's menu motion as its reference.",
    },
    technologies: ["nextjs", "react", "typescript", "tailwindcss", "playwright", "vercel"],
    status: "in-progress",
    links: {
      repository: "https://github.com/Edward2418/p3r-portfolio-v2",
    },
    provisional: true,
  },
];
