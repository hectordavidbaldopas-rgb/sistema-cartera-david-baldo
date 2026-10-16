import Image from "next/image";
import LogoFx from "@/components/logo-fx";

// Logos de marca en public/marca/ (versiones blanca y azul de cada uno): acá se
// usan los blancos porque van sobre el fondo navy. Los azules quedan para
// fondos claros. `mark` es el recuadro de la B dentro de cada imagen (en %).

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <LogoFx mark={{ left: 0, top: 0, width: 100, height: 100 }} className={className}>
      <Image
        src="/marca/baldo-b-blanco.webp"
        alt="Baldo Seguros"
        width={663}
        height={905}
        style={{ height: size, width: "auto" }}
        className="block"
        priority
      />
    </LogoFx>
  );
}

export function LogoFull({ width = 220, className = "" }: { width?: number; className?: string }) {
  return (
    <LogoFx mark={{ left: 0, top: 0, width: 25.5, height: 100 }} className={className}>
      <Image
        src="/marca/baldo-horizontal-blanco.webp"
        alt="Baldo Seguros"
        width={1993}
        height={721}
        style={{ width, height: "auto" }}
        className="block"
        priority
      />
    </LogoFx>
  );
}

// Versión vertical: la B arriba y "BALDO SEGUROS" abajo (se usa en el footer).
export function LogoStacked({
  width = 160,
  className = "",
  autoPlay = false,
  playOnView = false,
}: {
  width?: number | string;
  className?: string;
  autoPlay?: boolean;
  playOnView?: boolean;
}) {
  return (
    <LogoFx
      mark={{ left: 27.33, top: 0, width: 46.05, height: 62.95 }}
      className={className}
      autoPlay={autoPlay}
      playOnView={playOnView}
    >
      <Image
        src="/marca/baldo-vertical-blanco-v2.webp"
        alt="Baldo Seguros"
        width={1950}
        height={1954}
        style={{ width, height: "auto" }}
        className="block"
        priority={autoPlay}
      />
    </LogoFx>
  );
}
