// Pieza de texto que anima el recorrido por la oficina (components/office-journey).
// Solo marca el HTML; el movimiento lo calcula el recorrido según el scroll.

// Título que entra línea por línea, cada una subiendo desde atrás de una
// "ranura" (el contenedor recorta lo que asoma por abajo).
export function Lines({ lines }: { lines: React.ReactNode[] }) {
  return (
    <>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.12em] -mb-[0.12em]">
          <span data-fx-line className="block will-change-transform">
            {line}
          </span>
        </span>
      ))}
    </>
  );
}
