// Tipografías del sitio (decisión D9): Anton para títulos e Inter para texto.
// `next/font` las descarga en la compilación y las sirve desde el propio dominio.
import { Anton, Inter } from "next/font/google";

export const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-anton",
});

export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
