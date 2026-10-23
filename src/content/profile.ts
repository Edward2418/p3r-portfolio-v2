import type { Profile } from "./types.ts";

// Borrador provisional (specs/004-quien-soy-y-stack/data-model.md): Edward redacta o confirma el texto
// real, la institución y el semestre antes de quitar `provisional`. No se publican el apellido completo
// ni el año de titulación.
export const profile: Profile = {
  name: "Edward Negrete",
  headline: {
    es: "Estudiante de Ingeniería en Sistemas Computacionales",
    en: "Computer Systems Engineering student",
  },
  summary: {
    es: "Soy estudiante de Ingeniería en Sistemas Computacionales y me especializo en desarrollo Full-Stack y videojuegos. Me gusta construir cosas que funcionen bien y se vean bien. Este portafolio es mi proyecto más reciente: lo estoy rehaciendo por fases, con especificaciones, para mostrar cómo trabajo.",
    en: "I'm a Computer Systems Engineering student specializing in Full-Stack and game development. I like building things that work well and look good. This portfolio is my most recent project: I'm rebuilding it in phases, with specifications, to show how I work.",
  },
  specialty: {
    es: "Desarrollo Full-Stack y videojuegos",
    en: "Full-Stack and game development",
  },
  institution: {
    es: "TecNM · Instituto Tecnológico Superior de Huauchinango",
    en: "TecNM · Instituto Tecnológico Superior de Huauchinango",
  },
  // Valor de la v1, no confirmado: Edward da el semestre exacto antes de cerrar la fase.
  semester: { es: "7.º semestre", en: "7th semester" },
  provisional: true,
};
