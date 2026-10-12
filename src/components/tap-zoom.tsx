"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Contenedor con el efecto de "hover" también al tocarlo en el celular: un
// toque lo activa (data-on="true", usable con data-[on=true]: y
// group-data-[on=true]:), otro toque o tocar afuera lo apaga.
export default function TapZoom({ className, children, ...rest }: { className?: string; children: ReactNode; "data-fx"?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!on) return;
    const off = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOn(false);
    };
    document.addEventListener("pointerdown", off);
    return () => document.removeEventListener("pointerdown", off);
  }, [on]);

  return (
    <div ref={ref} data-on={on} onClick={() => setOn((v) => !v)} className={className} {...rest}>
      {children}
    </div>
  );
}
