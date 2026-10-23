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
  /** Nombre público de Edward ("Edward Negrete", sin el apellido completo); no se traduce. */
  name: string;
  headline: Localized;
  summary: Localized;
  /** Especialidad, por ejemplo "Desarrollo Full-Stack y videojuegos". */
  specialty: Localized;
  /** Institución, por ejemplo "TecNM · Instituto Tecnológico Superior de Huauchinango". */
  institution: Localized;
  /** Semestre actual como texto editable, por ejemplo "7.º semestre". */
  semester: Localized;
}

/** Tipo de hito de la trayectoria; `goal` es el hito futuro. */
export type TrajectoryKind = "formation" | "progress" | "current" | "goal";

/** Hito de la formación y la trayectoria breve de "Quién soy" (lo que antes era el Timeline de la v1). */
export interface TrajectoryEntry extends Provisionable {
  /** Único. */
  id: string;
  /** Periodo en texto ("2023", "Hoy", "Futuro"); el hito `goal` no incluye año. */
  period: Localized;
  title: Localized;
  description?: Localized;
  kind: TrajectoryKind;
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

/** Identificador de pantalla; también es su dirección bajo `/es` y `/en`. */
export type SceneId = "profile" | "stack" | "projects" | "social-link" | "system";

/** Modo efectivo de movimiento: reducido si el sistema o el sitio lo piden. */
export type MotionMode = "full" | "reduced";

/** Efecto de sonido de la interfaz. */
export type SoundId = "cursor" | "confirm" | "cancel" | "open" | "close" | "levelup";

/** Preferencia de sonido del visitante; por defecto `off`. */
export type SoundPreference = "on" | "off";

/** Vista de la escena: el menú principal o una de las pantallas internas. */
export type ViewKind = "menu" | "screen";

/** Recurso del personaje: imagen fija (primer cuadro del idle) y video con transparencia. */
export interface CharacterAsset {
  poster: { src: string; width: number; height: number };
  idle: { src: string; type: string };
  /** Descripción accesible; el arte es decorativo y se oculta a los lectores de pantalla. */
  alt: Localized;
}

/** Efecto de sonido: identificador único y archivo en `public/audio/`. */
export interface SoundEffect {
  id: SoundId;
  /** Ruta pública con la forma `/audio/<id>.mp3`. */
  src: string;
}

/** Opción del menú principal; el orden del arreglo `menu` es el orden del menú y de las pestañas. */
export interface MenuOption {
  /** Único; coincide con la dirección de la pantalla. */
  id: SceneId;
  name: Localized;
  /** Texto de la guía contextual cuando la opción está activa. */
  description: Localized;
}
