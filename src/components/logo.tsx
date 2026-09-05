import Image from "next/image";

export function LogoMark({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/logo-mark.png"
      alt="David Baldo Seguros"
      width={333}
      height={330}
      style={{ width: size, height: "auto" }}
      className={className}
      priority
    />
  );
}

export function LogoFull({ width = 220, className = "" }: { width?: number; className?: string }) {
  return (
    <Image
      src="/logo-db.png"
      alt="David Baldo Seguros"
      width={857}
      height={525}
      style={{ width, height: "auto" }}
      className={className}
      priority
    />
  );
}
