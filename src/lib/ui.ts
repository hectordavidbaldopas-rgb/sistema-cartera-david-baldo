export const inputClass =
  "w-full rounded-lg border border-gold-500/40 bg-navy-950/60 px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/40 focus:border-gold-400 focus:ring-2 focus:ring-gold-400/20";
export const labelClass = "mb-1 block text-sm font-medium text-white/90";

// Efecto "tecla": al pasar el mouse cambia sutilmente de tono, al hacer
// clic se hunde un poco (translate + menos sombra) como un botón físico.
// Todos los botones de la app parten de una de estas clases para que el
// comportamiento sea consistente en toda la página.
const pressEffect =
  "active:translate-y-px active:shadow-none disabled:active:translate-y-0";

export const primaryButtonClass =
  `rounded-full bg-[image:var(--gradient-gold)] px-5 py-2.5 text-sm font-semibold text-navy-950 shadow-sm transition duration-150 hover:brightness-105 active:brightness-95 ${pressEffect} disabled:opacity-60 disabled:hover:brightness-100`;
export const secondaryButtonClass =
  `rounded-full border border-gold-500/40 px-5 py-2.5 text-sm font-medium text-gold-300 transition duration-150 hover:border-gold-400 hover:bg-gold-500/10 active:bg-gold-500/20 ${pressEffect}`;
export const dangerButtonClass =
  `rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-150 hover:bg-red-700 active:bg-red-800 ${pressEffect} disabled:opacity-60`;
export const dangerOutlineButtonClass =
  `rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition duration-150 hover:bg-red-50 active:bg-red-100 ${pressEffect}`;
export const whatsappButtonClass =
  `inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition duration-150 hover:bg-green-700 active:bg-green-800 ${pressEffect} disabled:opacity-60`;

// Para links de navegación que antes eran texto subrayado y ahora tienen
// que verse y comportarse como un botón (mismo look que secondaryButtonClass
// pero pensado para ir en fila/grilla de accesos).
export const navButtonClass =
  `inline-flex items-center gap-1 rounded-full border border-gold-500/40 px-4 py-2 text-sm font-medium text-gold-300 transition duration-150 hover:border-gold-400 hover:bg-gold-500/10 active:bg-gold-500/20 ${pressEffect}`;

// Para tarjetas/filas clickeables más grandes (accesos rápidos, listas de
// vendedores/clientes) — el hundimiento es más sutil para no verse raro en
// un elemento grande.
export const tileLinkClass =
  "transition duration-150 active:translate-y-px active:shadow-none active:brightness-95";

export const cardClass = "rounded-2xl border border-gold-500/30 bg-navy-900 p-5 shadow-sm";
