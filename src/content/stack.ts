import type { StackCategory } from "./types.ts";

// Niveles de ejemplo (1 a 5): Edward los confirma antes de quitar `provisional`.
export const stack: StackCategory[] = [
  {
    id: "frontend",
    name: { es: "Frontend", en: "Frontend" },
    technologies: [
      { id: "nextjs", name: "Next.js", level: 3, provisional: true },
      { id: "react", name: "React", level: 3, provisional: true },
      { id: "typescript", name: "TypeScript", level: 3, provisional: true },
      { id: "tailwindcss", name: "Tailwind CSS", level: 3, provisional: true },
    ],
  },
  {
    id: "backend",
    name: { es: "Backend", en: "Backend" },
    technologies: [{ id: "nodejs", name: "Node.js", level: 2, provisional: true }],
  },
  {
    id: "data-tools",
    name: { es: "Bases de datos y herramientas", en: "Databases and tools" },
    technologies: [
      { id: "git", name: "Git", level: 3, provisional: true },
      { id: "playwright", name: "Playwright", level: 2, provisional: true },
      { id: "vercel", name: "Vercel", level: 2, provisional: true },
    ],
  },
];
