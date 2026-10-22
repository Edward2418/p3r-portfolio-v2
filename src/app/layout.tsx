// Diseño raíz provisional: lo reemplaza `src/app/[lang]/layout.tsx` en la historia 1.
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
