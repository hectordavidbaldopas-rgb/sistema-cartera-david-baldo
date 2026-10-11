"use client";

import { useRef } from "react";

// Envoltorio con el efecto del logo (ver .logo-fx en globals.css): gira sobre
// su eje acercándose y alejándose, mientras un brillo dorado con un destello
// sube en diagonal recorriendo solo la B. `mark` es el recuadro de la B dentro
// de cada PNG (en %, medido sobre la imagen); ahí va el brillo, con la B sola
// (logo-baldo-mark.png) como máscara para que no se vea en el fondo ni sobre
// "BALDO SEGUROS".
//
// Se dispara al pasar el mouse, al hacer clic o al tocarlo en el celular, y
// una vez que arranca se completa entero aunque el mouse se vaya; recién al
// terminar se puede volver a disparar.
export type Box = { left: number; top: number; width: number; height: number };

export default function LogoFx({
  mark,
  className,
  round = false,
  children,
}: {
  mark: Box;
  className: string;
  // round: para fotos circulares (equipo): el brillo cubre el círculo, sin máscara de la B
  round?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const play = () => {
    const el = ref.current;
    if (!el || el.classList.contains("is-playing")) return;
    el.classList.add("is-playing");
  };
  const done = (e: React.AnimationEvent) => {
    // El brillo dura lo mismo que el giro y corre siempre (aun con "reducir movimiento")
    if (e.animationName === "logo-shine") ref.current?.classList.remove("is-playing");
  };

  // Si quien lo usa ya decide el display (p. ej. "hidden sm:block"), se respeta.
  const display = /(^|\s)(hidden|block|flex|inline|inline-block|inline-flex)(\s|$)/.test(className) ? "" : "inline-block";
  return (
    <span
      ref={ref}
      className={`logo-fx ${display} ${className}`}
      onPointerEnter={play}
      onPointerDown={play}
      onAnimationEnd={done}
    >
      <span className="logo-fx-inner">
        {children}
        <span
          aria-hidden
          className={`logo-fx-mark ${round ? "overflow-hidden rounded-full" : ""}`}
          style={{ left: `${mark.left}%`, top: `${mark.top}%`, width: `${mark.width}%`, height: `${mark.height}%` }}
        >
          <span className={`logo-fx-shine ${round ? "logo-fx-shine--plain" : ""}`} />
          {/* Destello: un punto de luz que sube junto con el brillo */}
          <span className="logo-fx-spark" />
        </span>
      </span>
    </span>
  );
}
