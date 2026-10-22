import type { Profile } from "./types.ts";

// Perfil de ejemplo: Edward redacta o confirma el texto real antes de quitar `provisional`.
export const profile: Profile = {
  name: "Edward Negrete",
  headline: {
    es: "Estudiante de Ingeniería en Sistemas Computacionales",
    en: "Computer Systems Engineering student",
  },
  summary: {
    es: "Texto de ejemplo: aquí irá la presentación que Edward redacte.",
    en: "Sample text: Edward's own introduction will go here.",
  },
  provisional: true,
};
