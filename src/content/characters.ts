import type { Character } from "./types.ts";

// Personajes de Social Link del contexto maestro. Arcano, rango y texto son de ejemplo:
// Edward los confirma antes de quitar `provisional`. Sin arte en esta fase.
export const characters: Character[] = [
  {
    id: "leon-s-kennedy",
    name: "Leon S. Kennedy",
    arcana: { es: "Justicia", en: "Justice" },
    rank: 3,
    shortText: { es: "Texto de ejemplo.", en: "Sample text." },
    provisional: true,
  },
  {
    id: "resident-evil",
    name: "Resident Evil",
    arcana: { es: "Torre", en: "Tower" },
    rank: 5,
    shortText: { es: "Texto de ejemplo.", en: "Sample text." },
    provisional: true,
  },
  {
    id: "persona-3-reload",
    name: "Persona 3 Reload",
    arcana: { es: "Muerte", en: "Death" },
    rank: 7,
    shortText: { es: "Texto de ejemplo.", en: "Sample text." },
    provisional: true,
  },
  {
    id: "super-mario-galaxy",
    name: "Super Mario Galaxy",
    arcana: { es: "Estrella", en: "Star" },
    rank: 4,
    shortText: { es: "Texto de ejemplo.", en: "Sample text." },
    provisional: true,
  },
];
