// Capa decorativa de la transición de escena: panel de barrido, contorno hexagonal que se contrae y
// anillo del cierre. Es `aria-hidden` y no recibe punteros; el controlador (transition.ts) la anima.
export function TransitionLayer() {
  return (
    <div
      data-transition-layer
      data-phase="idle"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      <div data-wipe className="absolute inset-y-0 -left-[60%] w-[220%] bg-wipe" />
      <div data-outline className="absolute inset-0 m-auto size-[70vmin] text-text">
        <svg viewBox="0 0 100 100" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.2">
          <polygon points="50,2 94,26 94,74 50,98 6,74 6,26" />
        </svg>
      </div>
      <div data-circle className="absolute inset-0 m-auto size-[220vmax] rounded-full border-[6px] border-text" />
    </div>
  );
}
