import type { SoundEffect } from "./types.ts";

// Efectos de sonido de la interfaz. El audio está silenciado por defecto y estos archivos solo se
// descargan cuando el visitante activa el sonido (specs/003-identidad-visual-p3r/contracts/sound.md).
export const sounds: SoundEffect[] = [
  { id: "cursor", src: "/audio/cursor.mp3" },
  { id: "confirm", src: "/audio/confirm.mp3" },
  { id: "cancel", src: "/audio/cancel.mp3" },
  { id: "open", src: "/audio/open.mp3" },
  { id: "close", src: "/audio/close.mp3" },
  { id: "levelup", src: "/audio/levelup.mp3" },
];
