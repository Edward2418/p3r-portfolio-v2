import type { CharacterAsset } from "./types.ts";

// Oguri Cap, hilo conductor del sitio. La imagen fija es el primer cuadro del idle (mismo encuadre
// que el video), así no hay salto al pasar de una a otro. Hay un único personaje en esta fase; más
// poses o personajes llegan agregando datos (fase 6).
export const character: CharacterAsset = {
  poster: { src: "/img/oguri/idle-poster.webp", width: 540, height: 960 },
  idle: { src: "/img/oguri/idle.webm", type: 'video/webm; codecs="vp9"' },
  alt: {
    es: "Oguri Cap, inclinada hacia delante con el puño en alto y una sonrisa",
    en: "Oguri Cap, leaning forward with a raised fist and a smile",
  },
};
