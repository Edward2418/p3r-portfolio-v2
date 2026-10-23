"use client";

// Interruptor de sonido de System. Anuncia su estado con aria-pressed y lo muestra en texto; es un
// botón (Enter y Espacio) de al menos 44 px de alto y no depende del movimiento. Al activarlo suena
// `levelup` una sola vez como confirmación. El sonido está desactivado por defecto.
import { useSound } from "./SoundProvider.tsx";

interface SoundToggleProps {
  /** Nombre accesible, ya traducido. */
  label: string;
  onText: string;
  offText: string;
  /** Nota breve: el audio se descarga solo al activarlo. */
  hint: string;
}

export function SoundToggle({ label, onText, offText, hint }: SoundToggleProps) {
  const { enabled, setEnabled, play } = useSound();

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    if (next) play("enable");
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        aria-pressed={enabled}
        aria-describedby="sound-hint"
        onClick={toggle}
        className="inline-flex min-h-11 items-center gap-2 border border-cyan bg-navy px-4 text-cyan transition-transform duration-(--duration-fast) ease-(--ease-out) active:scale-[0.97] hover:bg-cyan hover:text-bg"
      >
        {label}
        <span aria-hidden="true" className="text-xs font-semibold uppercase">
          {enabled ? onText : offText}
        </span>
      </button>
      <p id="sound-hint" className="text-sm opacity-80">
        {hint}
      </p>
    </div>
  );
}
