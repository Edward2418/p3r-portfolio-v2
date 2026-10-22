import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailwind CSS 4 se procesa con el cargador de Turbopack que trae la plantilla.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
