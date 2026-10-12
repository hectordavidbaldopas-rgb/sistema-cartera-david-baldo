import Image from "next/image";
import LogoFx from "@/components/logo-fx";

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <LogoFx mark={{ left: 0, top: 0, width: 100, height: 100 }} className={className}>
      <Image
        src="/logo-baldo-mark.png"
        alt="Baldo Seguros"
        width={327}
        height={440}
        style={{ height: size, width: "auto" }}
        className="logo-white block"
        priority
      />
    </LogoFx>
  );
}

export function LogoFull({ width = 220, className = "" }: { width?: number; className?: string }) {
  return (
    <LogoFx mark={{ left: 0, top: 1.1, width: 20.2, height: 98.9 }} className={className}>
      <Image
        src="/logo-baldo.png"
        alt="Baldo Seguros"
        width={1000}
        height={274}
        style={{ width, height: "auto" }}
        className="logo-white block"
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
      mark={{ left: 29, top: 0, width: 43.3, height: 61.4 }}
      className={className}
      autoPlay={autoPlay}
      playOnView={playOnView}
    >
      <Image
        src="/logo-baldo-vertical.png"
        alt="Baldo Seguros"
        width={600}
        height={570}
        style={{ width, height: "auto" }}
        className="logo-white block"
        priority={autoPlay}
      />
    </LogoFx>
  );
}
