import type { Localized } from "./types.ts";

// Textos de interfaz (no son contenido de portafolio). Los componentes solo leen claves de aquí.
export const uiText = {
  siteTitle: {
    es: "Edward Negrete — Portafolio",
    en: "Edward Negrete — Portfolio",
  },
  siteDescription: {
    es: "Portafolio de Edward Negrete: quién soy, mi stack y mis proyectos.",
    en: "Edward Negrete's portfolio: who I am, my stack and my projects.",
  },
  skipToContent: { es: "Saltar al contenido", en: "Skip to content" },
  switchLanguage: { es: "Cambiar a inglés", en: "Switch to Spanish" },
  sectionProfile: { es: "Quién soy", en: "About me" },
  sectionStack: { es: "Stack", en: "Stack" },
  sectionProjects: { es: "Proyectos", en: "Projects" },
  sectionCharacters: { es: "Social Link", en: "Social Link" },
  sectionContact: { es: "Contacto", en: "Contact" },
  provisional: { es: "Provisional", en: "Provisional" },
  level: { es: "Nivel", en: "Level" },
  rank: { es: "Rango", en: "Rank" },
  arcana: { es: "Arcano", en: "Arcana" },
  technologies: { es: "Tecnologías", en: "Technologies" },
  statusPlanning: { es: "En planeación", en: "Planning" },
  statusInProgress: { es: "En desarrollo", en: "In progress" },
  statusCompleted: { es: "Terminado", en: "Completed" },
  linkRepository: { es: "Repositorio", en: "Repository" },
  linkDemo: { es: "Demo", en: "Demo" },
  contactGithub: { es: "GitHub", en: "GitHub" },
  contactEmail: { es: "Correo", en: "Email" },
  contactLinkedin: { es: "LinkedIn", en: "LinkedIn" },
  contactCv: { es: "Descargar CV", en: "Download CV" },
  notFoundTitle: { es: "Página no encontrada", en: "Page not found" },
  notFoundBack: { es: "Volver al inicio", en: "Back to home" },
  nonAffiliation: {
    es: "Proyecto de aprendizaje sin fines comerciales. No está afiliado a los propietarios de las franquicias que inspiran su estilo y sus personajes.",
    en: "A learning project with no commercial purpose. It is not affiliated with the owners of the franchises that inspire its style and characters.",
  },
} satisfies Record<string, Localized>;

export type UiTextKey = keyof typeof uiText;
