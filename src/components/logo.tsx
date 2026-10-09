import Image from "next/image";

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo-baldo-mark.png"
      alt="Baldo Seguros"
      width={327}
      height={440}
      style={{ height: size, width: "auto" }}
      className={className}
      priority
    />
  );
}

export function LogoFull({ width = 220, className = "" }: { width?: number; className?: string }) {
  return (
    <Image
      src="/logo-baldo.png"
      alt="Baldo Seguros"
      width={1000}
      height={274}
      style={{ width, height: "auto" }}
      className={className}
      priority
    />
  );
}

// Versión vertical: la B arriba y "BALDO SEGUROS" abajo (se usa en el footer).
export function LogoStacked({ width = 160, className = "" }: { width?: number; className?: string }) {
  return (
    <Image
      src="/logo-baldo-vertical.png"
      alt="Baldo Seguros"
      width={600}
      height={570}
      style={{ width, height: "auto" }}
      className={className}
    />
  );
}
