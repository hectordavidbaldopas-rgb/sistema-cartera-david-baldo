// Plafón de hierro negro con tres lámparas, como los reflectores del banner de
// marca. Va fijo en el borde superior de la pantalla, por encima del header, en
// todas las páginas (layout raíz): queda quieto mientras se scrollea y cada
// lámpara tira su haz de luz vertical hacia abajo.
const LAMPS = ["20%", "50%", "80%"];

function Lamp() {
  return (
    <svg width="36" height="32" viewBox="0 0 34 30" aria-hidden>
      <defs>
        <linearGradient id="lamp-iron" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#05070c" />
          <stop offset="0.45" stopColor="#5b616d" />
          <stop offset="1" stopColor="#05070c" />
        </linearGradient>
        <radialGradient id="lamp-bulb" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#f3f6ff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#dce6ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Brazo que sostiene la lámpara */}
      <rect x="15.5" y="0" width="3" height="8" fill="#0b0e14" />
      {/* Pantalla de hierro (trapecio) */}
      <path d="M 10 8 L 24 8 L 30 22 L 4 22 Z" fill="url(#lamp-iron)" />
      <rect x="4" y="21" width="26" height="2" rx="1" fill="#1c2029" />
      {/* Lámpara encendida asomando por abajo */}
      <ellipse cx="17" cy="24" rx="12" ry="6" fill="url(#lamp-bulb)" />
    </svg>
  );
}

export default function StageLights() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-30 h-[520px]">
      {/* "Techo" donde cuelga el plafón: franja navy de 40px (el body deja ese
          espacio arriba, ver globals.css) para que las lámparas no tapen el header */}
      <div className="bg-app-texture absolute inset-x-0 top-0 h-10 bg-fixed" />
      {/* Barra de hierro negro, pegada al borde de arriba */}
      <div
        className="absolute left-[12%] right-[12%] top-0 h-[7px] rounded-b-full shadow-[0_3px_6px_rgba(0,0,0,0.6)]"
        style={{ background: "linear-gradient(180deg, #7a808c 0%, #2a2e37 35%, #0b0d12 70%, #000 100%)" }}
      />
      {LAMPS.map((left) => (
        <div key={left}>
          {/* Haz de luz vertical: el blur va en el contenedor (después del recorte)
              para que los bordes del haz queden difuminados y no rectos */}
          <div className="absolute top-[26px] h-[480px] w-[220px] -translate-x-1/2 blur-[14px]" style={{ left }}>
            <div
              className="h-full w-full"
              style={{
                clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)",
                background: "linear-gradient(180deg, rgba(225, 235, 255, 0.22) 0%, rgba(225, 235, 255, 0.07) 45%, rgba(225, 235, 255, 0) 100%)",
              }}
            />
          </div>
          <div className="absolute top-[5px] -translate-x-1/2" style={{ left }}>
            <Lamp />
          </div>
        </div>
      ))}
    </div>
  );
}
