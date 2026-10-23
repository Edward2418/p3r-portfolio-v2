import type { TrajectoryEntry } from "./types.ts";

// Formación y trayectoria breve de "Quién soy" (lo que antes era el Timeline de la v1). El orden del
// arreglo es el orden cronológico en pantalla; el hito `goal` es siempre el último y no lleva año.
// Borrador provisional (specs/004-quien-soy-y-stack/data-model.md): Edward confirma cada hito, y las
// traducciones al inglés las propone el asistente, antes de quitar `provisional`.
export const trajectory: TrajectoryEntry[] = [
  {
    id: "degree-start",
    period: { es: "2023", en: "2023" },
    title: { es: "Inicio de carrera", en: "Start of the degree" },
    description: {
      es: "Comienzo de Ingeniería en Sistemas Computacionales: primeras materias de programación, matemáticas y fundamentos de sistemas.",
      en: "Start of the Computer Systems Engineering degree: first courses in programming, mathematics and systems fundamentals.",
    },
    kind: "formation",
    provisional: true,
  },
  {
    id: "semesters-3-4",
    period: { es: "2024", en: "2024" },
    title: { es: "3.º y 4.º semestre", en: "3rd and 4th semester" },
    description: {
      es: "Programación orientada a objetos, fundamentos de bases de datos, desarrollo de aplicaciones móviles e ingeniería de software.",
      en: "Object-oriented programming, database fundamentals, mobile app development and software engineering.",
    },
    kind: "progress",
    provisional: true,
  },
  {
    id: "semesters-5-6",
    period: { es: "2025", en: "2025" },
    title: { es: "5.º y 6.º semestre", en: "5th and 6th semester" },
    description: {
      es: "Taller de sistemas operativos, redes, lenguajes y autómatas, UX/UI y administración de bases de datos.",
      en: "Operating systems workshop, networking, languages and automata, UX/UI and database administration.",
    },
    kind: "progress",
    provisional: true,
  },
  {
    id: "current-semester",
    period: { es: "Hoy", en: "Today" },
    title: { es: "Semestre actual", en: "Current semester" },
    description: {
      es: "Especialidad en desarrollo Full-Stack y videojuegos. Construyo este portafolio y refuerzo mis conocimientos de HTML, CSS, JavaScript, Java, SQL y Git.",
      en: "Specialization in Full-Stack and game development. I'm building this portfolio and strengthening my knowledge of HTML, CSS, JavaScript, Java, SQL and Git.",
    },
    kind: "current",
    provisional: true,
  },
  {
    id: "graduation",
    period: { es: "Futuro", en: "Upcoming" },
    title: { es: "Titulación", en: "Graduation" },
    description: {
      es: "Titularme como Ingeniero en Sistemas Computacionales con experiencia real en Full-Stack, bases de datos y videojuegos.",
      en: "Graduate as a Computer Systems Engineer with real experience in Full-Stack, databases and game development.",
    },
    kind: "goal",
    provisional: true,
  },
];
