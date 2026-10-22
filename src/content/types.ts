// Tipos del contenido del portafolio (ver specs/001-base-y-datos/data-model.md).
// Los textos traducibles usan `Localized`: si falta un idioma, el compilador falla (FR-011).

/** Idiomas soportados por el sitio. */
export type Lang = "es" | "en";

/** Texto con ambos idiomas obligatorios y no vacíos. */
export type Localized = { es: string; en: string };

/** Marca para contenido de ejemplo que Edward aún no confirma (FR-012). */
export interface Provisionable {
  provisional?: boolean;
}

export interface Profile extends Provisionable {
  /** Nombre completo de Edward; no se traduce. */
  name: string;
  headline: Localized;
  summary: Localized;
}

export type StackCategoryId = "frontend" | "backend" | "data-tools";

export interface Technology extends Provisionable {
  /** Único en todo el stack. */
  id: string;
  /** Nombre propio de la tecnología; no se traduce. */
  name: string;
  /** Escala de nivel de 1 a 5. */
  level: 1 | 2 | 3 | 4 | 5;
}

export interface StackCategory {
  /** Exactamente tres categorías, únicas. */
  id: StackCategoryId;
  name: Localized;
  /** Al menos una tecnología. */
  technologies: Technology[];
}

export type ProjectStatus = "planning" | "in-progress" | "completed";

export interface Screenshot {
  src: string;
  /** Texto alternativo obligatorio por accesibilidad. */
  alt: Localized;
}

export interface ProjectLinks {
  repository?: string;
  demo?: string;
}

export interface Project extends Provisionable {
  /** Único; en minúsculas con guiones. */
  id: string;
  title: Localized;
  summary: Localized;
  description: Localized;
  /** IDs de tecnologías existentes en el stack. */
  technologies: string[];
  status: ProjectStatus;
  /** Un enlace ausente no se muestra (FR-009). */
  links?: ProjectLinks;
  screenshots?: Screenshot[];
}

export interface Character extends Provisionable {
  /** Único. */
  id: string;
  name: string;
  arcana: Localized;
  /** Rango de 1 a 10. */
  rank: number;
  shortText: Localized;
}

export interface Contact {
  github: string;
  email?: string;
  linkedin?: string;
  cv?: string;
}
